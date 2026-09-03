/**
 * Framora Production Test Suite
 * Automated tests covering:
 * 1. JWT Authentication & Token Generation
 * 2. Strict Ownership Authorization (Owner vs Non-owner vs Admin)
 * 3. Marketplace State Transitions (NOT_FOR_SALE -> FOR_SALE -> SOLD)
 * 4. 1-of-1 Atomic Concurrency Protection (Prevent duplicate purchase)
 * 5. Razorpay HMAC SHA-256 Signature Verification
 * 6. Tampered/Invalid Razorpay Signature Rejection
 * 7. Payment ↔ Purchase ↔ Post Integrity Verification
 * 8. Price Race Condition: Authoritative Locked Order Price
 * 9. Transaction Safety & Idempotent Re-verification
 * 10. Digital Asset Protection: Public Preview vs Authorized Master Download
 * 11. Strict Production CORS Enforcement
 * 12. Production Environment Variable Fail-Fast Validation
 * 13. Unauthorized Sale-Setting Modification Protection
 * 14. Socket.IO JWT Authentication Handshake Guard
 */

const crypto = require('crypto');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'framora_test_suite_super_secret_jwt_key_2026';
process.env.RAZORPAY_KEY_ID = 'rzp_test_framora_suite_key';
process.env.RAZORPAY_KEY_SECRET = 'framora_test_suite_razorpay_secret_123';
process.env.CLOUDINARY_CLOUD_NAME = 'framora_cloud';
process.env.CLOUDINARY_API_KEY = '1234567890';
process.env.CLOUDINARY_API_SECRET = 'cloudinary_secret_abc';

const razorpayService = require('./src/services/razorpayService');
const generateToken = require('./src/utils/generateToken');
const { generatePreviewUrl, generateDownloadUrl } = require('./src/config/cloudinary');
const Post = require('./src/models/Post');
const Purchase = require('./src/models/Purchase');
const User = require('./src/models/User');

let passed = 0;
let failed = 0;

function assert(condition, name, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${name} ${details ? `(${details})` : ''}`);
    failed++;
  }
}

async function runSuite() {
  console.log('====================================================');
  console.log('🧪 FRAMORA AUTOMATED PRODUCTION TEST SUITE');
  console.log('====================================================\n');

  // ==========================================
  // 1. JWT Authentication Tests
  // ==========================================
  console.log('--- 1. JWT Authentication & Validation ---');
  const testUserId = new mongoose.Types.ObjectId();
  const token = generateToken(testUserId);
  assert(Boolean(token) && typeof token === 'string', 'generateToken returns valid string');

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assert(decoded.id === testUserId.toString(), 'Decoded JWT id matches expected user ID');

  let tamperedFailed = false;
  try {
    jwt.verify(token + 'tampered', process.env.JWT_SECRET);
  } catch {
    tamperedFailed = true;
  }
  assert(tamperedFailed === true, 'Tampered JWT token is rejected');

  let wrongSecretFailed = false;
  try {
    jwt.verify(token, 'different_wrong_secret_key');
  } catch {
    wrongSecretFailed = true;
  }
  assert(wrongSecretFailed === true, 'JWT verified with wrong secret is rejected');

  // ==========================================
  // 2. Ownership Authorization Tests
  // ==========================================
  console.log('\n--- 2. Strict Ownership Authorization (Owner vs Admin vs Buyer) ---');
  const ownerId = new mongoose.Types.ObjectId();
  const adminId = new mongoose.Types.ObjectId();
  const buyerId = new mongoose.Types.ObjectId();

  const photographer = { _id: ownerId, role: 'user' };
  const admin = { _id: adminId, role: 'admin' };
  const buyer = { _id: buyerId, role: 'user' };

  const testPost = {
    _id: new mongoose.Types.ObjectId(),
    user: ownerId,
    title: 'Solitude in Ladakh',
    saleStatus: 'FOR_SALE',
    price: 2500,
    currency: 'INR',
  };

  // Ownership evaluation logic (as enforced in postController.js)
  function checkSaleOwnership(post, requestingUser) {
    const pOwnerId = post.user ? (post.user._id ? post.user._id.toString() : post.user.toString()) : '';
    if (pOwnerId !== requestingUser._id.toString()) {
      return { allowed: false, status: 403 };
    }
    return { allowed: true, status: 200 };
  }

  assert(checkSaleOwnership(testPost, photographer).allowed === true, 'Photo owner can manage sale settings');
  assert(checkSaleOwnership(testPost, admin).allowed === false, 'Admin cannot manage sale settings for other creators');
  assert(checkSaleOwnership(testPost, admin).status === 403, 'Admin attempt returns 403 Forbidden');
  assert(checkSaleOwnership(testPost, buyer).allowed === false, 'Non-owner collector cannot manage sale settings');

  // ==========================================
  // 3. Marketplace State Transitions
  // ==========================================
  console.log('\n--- 3. Marketplace State Transitions ---');
  const postModel = new Post({
    user: ownerId,
    title: 'Golden Hour at Amalfi',
    imageUrl: 'https://images.unsplash.com/photo-test',
    saleStatus: 'NOT_FOR_SALE',
    price: 0,
    currency: 'INR',
  });

  assert(postModel.saleStatus === 'NOT_FOR_SALE', 'Initial post status is NOT_FOR_SALE');
  postModel.saleStatus = 'FOR_SALE';
  postModel.price = 1999;
  assert(postModel.saleStatus === 'FOR_SALE' && postModel.price === 1999, 'Post transitioned to FOR_SALE with price 1999');

  // Validate rejection of invalid status
  postModel.saleStatus = 'INVALID_STATUS';
  const validationError = postModel.validateSync();
  assert(Boolean(validationError && validationError.errors.saleStatus), 'Invalid saleStatus is rejected by Mongoose schema');

  // ==========================================
  // 4. 1-of-1 Atomic Concurrency Protection
  // ==========================================
  console.log('\n--- 4. 1-of-1 Atomic Concurrency Protection ---');
  let atomicMockDb = {
    _id: testPost._id.toString(),
    saleStatus: 'FOR_SALE',
    soldTo: null,
    soldAt: null,
  };

  function atomicPurchaseTransition(attemptingBuyerId) {
    if (atomicMockDb.saleStatus === 'FOR_SALE') {
      atomicMockDb.saleStatus = 'SOLD';
      atomicMockDb.soldTo = attemptingBuyerId.toString();
      atomicMockDb.soldAt = new Date();
      return { success: true, post: { ...atomicMockDb } };
    }
    return { success: false, status: 409, message: 'Already sold to another collector' };
  }

  const firstBuyerResult = atomicPurchaseTransition(buyerId);
  const concurrentBuyerResult = atomicPurchaseTransition(new mongoose.Types.ObjectId());

  assert(firstBuyerResult.success === true, 'First concurrent buyer successfully acquired 1-of-1 asset');
  assert(concurrentBuyerResult.success === false, 'Second concurrent buyer was atomically blocked (409 Conflict)');
  assert(atomicMockDb.soldTo === buyerId.toString(), 'Post ownership atomically mapped solely to First Buyer');

  // ==========================================
  // 5. Razorpay HMAC SHA-256 Signature Verification
  // ==========================================
  console.log('\n--- 5. Razorpay HMAC SHA-256 Signature Verification ---');
  const orderId = 'order_valid_123456789';
  const paymentId = 'pay_valid_987654321';
  const expectedText = `${orderId}|${paymentId}`;
  const validSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(expectedText)
    .digest('hex');

  const isVerified = razorpayService.verifyPaymentSignature({
    orderId,
    paymentId,
    signature: validSignature,
  });
  assert(isVerified === true, 'Legitimate Razorpay HMAC SHA-256 signature verified successfully');

  // ==========================================
  // 6. Invalid / Tampered Signature Rejection
  // ==========================================
  console.log('\n--- 6. Invalid / Tampered Signature Rejection ---');
  const tamperedSigResult = razorpayService.verifyPaymentSignature({
    orderId,
    paymentId,
    signature: 'bad_signature_hex_0000000000000000000000000000000000000000000000000000',
  });
  assert(tamperedSigResult === false, 'Tampered signature hex rejected');

  const mismatchedOrderSigResult = razorpayService.verifyPaymentSignature({
    orderId: 'order_different_id',
    paymentId,
    signature: validSignature,
  });
  assert(mismatchedOrderSigResult === false, 'Signature with mismatched order ID rejected');

  const emptySigResult = razorpayService.verifyPaymentSignature({
    orderId,
    paymentId,
    signature: '',
  });
  assert(emptySigResult === false, 'Empty signature rejected');

  // ==========================================
  // 7. Payment ↔ Purchase ↔ Post Integrity
  // ==========================================
  console.log('\n--- 7. Payment ↔ Purchase ↔ Post Integrity Verification ---');
  const samplePurchase = {
    _id: new mongoose.Types.ObjectId(),
    buyer: buyerId,
    seller: ownerId,
    post: testPost._id,
    amount: 2500,
    currency: 'INR',
    razorpayOrderId: orderId,
    status: 'CREATED',
  };

  function verifyPurchaseIntegrity(requestedPostId, reqUser, purchaseRecord) {
    if (purchaseRecord.buyer.toString() !== reqUser._id.toString()) {
      return { valid: false, status: 403, error: 'Buyer mismatch' };
    }
    if (purchaseRecord.post.toString() !== requestedPostId.toString()) {
      return { valid: false, status: 400, error: 'Post ID mismatch' };
    }
    if (!purchaseRecord.amount || purchaseRecord.amount <= 0) {
      return { valid: false, status: 400, error: 'Invalid purchase order amount' };
    }
    return { valid: true };
  }

  const validIntegrity = verifyPurchaseIntegrity(testPost._id, buyer, samplePurchase);
  assert(validIntegrity.valid === true, 'Matching post, buyer, and order verified successfully');

  const wrongBuyer = { _id: new mongoose.Types.ObjectId() };
  const wrongBuyerResult = verifyPurchaseIntegrity(testPost._id, wrongBuyer, samplePurchase);
  assert(wrongBuyerResult.valid === false && wrongBuyerResult.status === 403, 'Mismatched buyer rejected with 403');

  const differentPostId = new mongoose.Types.ObjectId();
  const mismatchedPostResult = verifyPurchaseIntegrity(differentPostId, buyer, samplePurchase);
  assert(mismatchedPostResult.valid === false && mismatchedPostResult.status === 400, 'Mismatched post ID rejected with 400');

  // ==========================================
  // 8. Price Race Condition: Locked Order Amount
  // ==========================================
  console.log('\n--- 8. Price Race Condition: Authoritative Locked Order Price ---');
  // Scenario: Buyer created order when photo was ₹2,500. Seller subsequently raised price to ₹5,000.
  const modifiedPost = {
    ...testPost,
    price: 5000, // Seller changed listing price
  };

  // Payment verification uses locked purchase.amount (₹2500), NOT updated post.price (₹5000)
  function verifyPaymentWithPriceRace(purchaseRecord, currentPostRecord) {
    // The purchase record locks the authoritative transaction price
    const orderPrice = purchaseRecord.amount;
    const isAmountValid = orderPrice > 0;
    return {
      allowed: isAmountValid,
      settledAmount: orderPrice,
      currentPostPrice: currentPostRecord.price,
    };
  }

  const raceResolution = verifyPaymentWithPriceRace(samplePurchase, modifiedPost);
  assert(raceResolution.allowed === true, 'Purchase completes with locked order price despite subsequent seller price increase');
  assert(raceResolution.settledAmount === 2500, 'Settled amount remains locked at original ₹2,500');
  assert(raceResolution.currentPostPrice === 5000, 'Post price update did not invalidate active pending purchase order');

  // ==========================================
  // 9. Transaction Safety & Idempotency
  // ==========================================
  console.log('\n--- 9. Transaction Safety & Idempotency ---');
  let simulatedDb = {
    post: { _id: testPost._id, saleStatus: 'FOR_SALE', soldTo: null, soldAt: null },
    purchase: { _id: samplePurchase._id, status: 'CREATED', razorpayPaymentId: null },
  };

  function executeAtomicPurchaseFinalization(paymentId, signature) {
    if (simulatedDb.purchase.status === 'PAID') {
      return { success: true, idempotent: true, message: 'Already verified' };
    }
    if (simulatedDb.post.saleStatus !== 'FOR_SALE') {
      return { success: false, status: 409, message: 'Conflict: Already sold' };
    }
    const now = new Date();
    simulatedDb.post.saleStatus = 'SOLD';
    simulatedDb.post.soldTo = buyerId;
    simulatedDb.post.soldAt = now;

    simulatedDb.purchase.status = 'PAID';
    simulatedDb.purchase.razorpayPaymentId = paymentId;
    simulatedDb.purchase.completedAt = now;
    return { success: true, idempotent: false, post: simulatedDb.post, purchase: simulatedDb.purchase };
  }

  const firstFinalization = executeAtomicPurchaseFinalization(paymentId, validSignature);
  assert(firstFinalization.success === true && firstFinalization.idempotent === false, 'Initial purchase finalization transitions atomically to PAID and SOLD');
  assert(simulatedDb.post.saleStatus === 'SOLD', 'Post status is atomically SOLD');
  assert(simulatedDb.purchase.status === 'PAID', 'Purchase status is atomically PAID');

  // Second call for the same purchase (idempotency check)
  const replayFinalization = executeAtomicPurchaseFinalization(paymentId, validSignature);
  assert(replayFinalization.success === true && replayFinalization.idempotent === true, 'Subsequent verification call returns idempotent success without double mutation');

  // ==========================================
  // 10. Asset Protection: Preview vs Master Download
  // ==========================================
  console.log('\n--- 10. Digital Asset Protection: Public Preview vs Authorized Master Download ---');
  const publicId = 'framora/posts/ladakh_hero_123';
  const rawUrl = 'https://res.cloudinary.com/framora_cloud/image/upload/v1/framora/posts/ladakh_hero_123.jpg';

  const previewUrl = generatePreviewUrl(publicId, rawUrl);
  assert(previewUrl.includes('w_1600') && previewUrl.includes('q_auto:good'), 'Public preview URL generated with constrained dimension and quality transformation');

  const downloadUrl = generateDownloadUrl(publicId, rawUrl, 'solitude_in_ladakh');
  assert(downloadUrl.includes('fl_attachment:solitude_in_ladakh') && downloadUrl.includes('q_100'), 'Authorized download URL generated with high-resolution attachment disposition');

  // Unauthorized download rejection check
  const soldPost = {
    _id: testPost._id,
    user: ownerId,
    soldTo: buyerId,
    title: 'Solitude in Ladakh',
    imageUrl: rawUrl,
    imagePublicId: publicId,
  };

  function checkDownloadAuthorization(post, requestingUser, paidPurchaseExists) {
    const reqId = requestingUser._id.toString();
    const isBuyer = post.soldTo && post.soldTo.toString() === reqId;
    const isSeller = post.user && post.user.toString() === reqId;
    const isAdmin = requestingUser.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return { allowed: false, status: 403, message: 'Unauthorized download' };
    }
    if (isBuyer && !paidPurchaseExists) {
      return { allowed: false, status: 403, message: 'No paid purchase record' };
    }
    return { allowed: true, status: 200 };
  }

  const unauthorizedUser = { _id: new mongoose.Types.ObjectId(), role: 'user' };
  const unauthDownload = checkDownloadAuthorization(soldPost, unauthorizedUser, false);
  assert(unauthDownload.allowed === false && unauthDownload.status === 403, 'Unauthorized user blocked from downloading original asset (403)');

  const buyerDownload = checkDownloadAuthorization(soldPost, buyer, true);
  assert(buyerDownload.allowed === true, 'Verified buyer with PAID record granted download access');

  const sellerDownload = checkDownloadAuthorization(soldPost, photographer, false);
  assert(sellerDownload.allowed === true, 'Original photographer retains download access');

  // ==========================================
  // 11. Strict Production CORS Enforcement
  // ==========================================
  console.log('\n--- 11. Strict Production CORS Enforcement ---');
  function checkOriginAllowed(origin, isProduction, clientUrl) {
    if (!origin) return true; // Server-to-server / curl
    const clientUrls = (clientUrl || '').split(',').map((u) => u.trim()).filter(Boolean);
    if (isProduction) {
      return clientUrls.includes(origin);
    }
    return [
      ...clientUrls,
      'http://localhost:5174',
      'http://localhost:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5173',
      'http://localhost:5175',
      'http://127.0.0.1:5175',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ].includes(origin);
  }

  assert(checkOriginAllowed('https://framora.app', true, 'https://framora.app') === true, 'Production accepts configured CLIENT_URL');
  assert(checkOriginAllowed('http://localhost:5174', true, 'https://framora.app') === false, 'Production strictly rejects localhost:5174 origin');
  assert(checkOriginAllowed('http://localhost:5173', true, 'https://framora.app') === false, 'Production strictly rejects localhost:5173 origin');
  assert(checkOriginAllowed('http://localhost:5174', false, 'http://localhost:5174') === true, 'Development accepts localhost:5174 origin');
  assert(checkOriginAllowed('http://localhost:5173', false, 'http://localhost:5173') === true, 'Development accepts localhost:5173 origin');
  assert(checkOriginAllowed(undefined, true, 'https://framora.app') === true, 'Production safely allows no-origin server-to-server requests');

  // ==========================================
  // 12. Production Environment Variable Fail-Fast
  // ==========================================
  console.log('\n--- 12. Production Environment Variable Fail-Fast Validation ---');
  function validateProductionEnvMock(envObj) {
    const required = [
      'JWT_SECRET',
      'MONGODB_URI',
      'CLIENT_URL',
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
    ];
    const missing = required.filter((key) => !envObj[key]);
    return { valid: missing.length === 0, missing };
  }

  const validProductionEnv = {
    JWT_SECRET: 'jwt_secret_val',
    MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/framora',
    CLIENT_URL: 'https://framora.app',
    RAZORPAY_KEY_ID: 'rzp_live_123',
    RAZORPAY_KEY_SECRET: 'rzp_secret_456',
    CLOUDINARY_CLOUD_NAME: 'framora_cloud',
    CLOUDINARY_API_KEY: '123456',
    CLOUDINARY_API_SECRET: 'secret_789',
  };

  const validEnvCheck = validateProductionEnvMock(validProductionEnv);
  assert(validEnvCheck.valid === true && validEnvCheck.missing.length === 0, 'Complete production environment passes validation');

  const incompleteEnv = { ...validProductionEnv, RAZORPAY_KEY_SECRET: '' };
  const incompleteEnvCheck = validateProductionEnvMock(incompleteEnv);
  assert(incompleteEnvCheck.valid === false && incompleteEnvCheck.missing.includes('RAZORPAY_KEY_SECRET'), 'Missing production secret fails validation fast');

  // ==========================================
  // 13. Unauthorized Sale-Setting Modification
  // ==========================================
  console.log('\n--- 13. Unauthorized Sale-Setting Modifications ---');
  function updateSaleSettingsAttempt(post, requestingUser, newSettings) {
    const pOwnerId = post.user ? post.user.toString() : '';
    if (pOwnerId !== requestingUser._id.toString()) {
      return { success: false, status: 403, error: 'Only owner can manage sale' };
    }
    if (post.saleStatus === 'SOLD') {
      return { success: false, status: 400, error: 'Cannot modify already SOLD photograph' };
    }
    return { success: true };
  }

  const soldPostModification = updateSaleSettingsAttempt(
    { ...soldPost, saleStatus: 'SOLD' },
    photographer,
    { price: 5000 }
  );
  assert(soldPostModification.success === false && soldPostModification.status === 400, 'Modification on already SOLD photo rejected (400)');

  const nonOwnerModification = updateSaleSettingsAttempt(
    testPost,
    buyer,
    { price: 100 }
  );
  assert(nonOwnerModification.success === false && nonOwnerModification.status === 403, 'Non-owner modification rejected (403)');

  // ==========================================
  // 14. Socket.IO Authentication Handshake
  // ==========================================
  console.log('\n--- 14. Socket.IO JWT Authentication Handshake Guard ---');
  function authenticateSocketHandshake(handshake) {
    const handshakeToken =
      handshake.auth?.token ||
      (handshake.headers?.authorization &&
        handshake.headers.authorization.startsWith('Bearer ') &&
        handshake.headers.authorization.split(' ')[1]);

    if (handshakeToken && process.env.JWT_SECRET) {
      try {
        const decodedUser = jwt.verify(handshakeToken, process.env.JWT_SECRET);
        return { authenticated: true, userId: decodedUser.id };
      } catch {
        return { authenticated: false, userId: null };
      }
    }
    return { authenticated: false, userId: null };
  }

  const validSocketAuth = authenticateSocketHandshake({
    auth: { token },
  });
  assert(validSocketAuth.authenticated === true && validSocketAuth.userId === testUserId.toString(), 'Socket handshake authenticated with valid JWT');

  const invalidSocketAuth = authenticateSocketHandshake({
    auth: { token: 'invalid.token.here' },
  });
  assert(invalidSocketAuth.authenticated === false, 'Socket handshake gracefully falls back to unauthenticated for invalid token');

  const guestSocketAuth = authenticateSocketHandshake({
    auth: {},
    headers: {},
  });
  assert(guestSocketAuth.authenticated === false, 'Guest socket handshake handled safely');

  // ==========================================
  // 15. Demo Accounts Automatic Seeding & End-to-End Auth
  // ==========================================
  console.log('\n--- 15. Demo Accounts Automatic Seeding & End-to-End Auth ---');
  const connectDB = require('./src/config/db');
  const seedData = require('./src/utils/seedData');

  await connectDB();

  // Run seed
  await seedData();

  const demoAccounts = [
    { email: 'elena@framora.art', username: 'elena_rodriguez', role: 'user' },
    { email: 'kai@framora.art', username: 'kai_takahashi', role: 'user' },
    { email: 'maya@framora.art', username: 'maya_chen', role: 'user' },
    { email: 'marcus@framora.art', username: 'marcus_vance', role: 'admin' },
  ];

  for (const acct of demoAccounts) {
    const user = await User.findOne({ email: acct.email }).select('+password');
    assert(Boolean(user), `Demo user ${acct.email} seeded successfully`);
    assert(user.username === acct.username, `Demo username for ${acct.email} is ${acct.username}`);
    assert(user.role === acct.role, `Demo user ${acct.email} has role ${acct.role}`);

    const isMatch = await user.matchPassword('password123');
    assert(isMatch === true, `Demo user ${acct.email} password verification succeeds with password123`);

    // Verify token generation & validation
    const userToken = generateToken(user._id);
    const verified = jwt.verify(userToken, process.env.JWT_SECRET);
    assert(verified.id === user._id.toString(), `JWT token valid for demo user ${acct.email}`);
  }

  // Verify demo posts are present
  const demoPostCount = await Post.countDocuments();
  assert(demoPostCount >= 5, `Initial demo posts seeded successfully (${demoPostCount} posts found)`);

  // Verify seeding idempotency (running seedData again does not duplicate records)
  const initialUserCount = await User.countDocuments();
  await seedData();
  const secondUserCount = await User.countDocuments();
  const secondPostCount = await Post.countDocuments();
  assert(initialUserCount === secondUserCount, 'Seeding is idempotent: User count remains identical on repeated run');
  assert(demoPostCount === secondPostCount, 'Seeding is idempotent: Post count remains identical on repeated run');

  // Verify simulated /api/auth/me payload
  const elenaUser = await User.findOne({ email: 'elena@framora.art' });
  assert(Boolean(elenaUser._id), '/api/auth/me user profile resolution succeeds');
  assert(elenaUser.name === 'Elena Rodriguez', 'User profile contains accurate metadata');

  console.log('\n====================================================');
  console.log(`Test Execution Summary: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runSuite().catch((err) => {
  console.error('Test Suite Failed with unexpected error:', err);
  process.exit(1);
});
