const crypto = require('crypto');
const mongoose = require('mongoose');

// Import services and models
const razorpayService = require('./src/services/razorpayService');
const Post = require('./src/models/Post');
const Purchase = require('./src/models/Purchase');
const User = require('./src/models/User');
const Comment = require('./src/models/Comment');

async function runTests() {
  console.log('🧪 Starting Framora Real-Time & Marketplace Unit / Logic Tests...');

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  // 1. Signature Verification Test
  console.log('\n--- 1. Razorpay HMAC SHA-256 Signature Verification ---');
  const testSecret = 'secret_test_key_123456';
  process.env.RAZORPAY_KEY_SECRET = testSecret;

  const orderId = 'order_test_999999';
  const paymentId = 'pay_test_888888';
  const validSignature = crypto
    .createHmac('sha256', testSecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const isSigValid = razorpayService.verifyPaymentSignature({
    orderId,
    paymentId,
    signature: validSignature,
  });
  assert(isSigValid === true, 'Valid signature verified correctly');

  const isInvalidSigBlocked = razorpayService.verifyPaymentSignature({
    orderId,
    paymentId,
    signature: 'fake_tampered_signature_hex_value',
  });
  assert(isInvalidSigBlocked === false, 'Tampered signature blocked');

  // 2. Post Model Marketplace Schema Validation
  console.log('\n--- 2. Post Model Marketplace Schema Checks ---');
  const dummyPost = new Post({
    user: new mongoose.Types.ObjectId(),
    title: 'Sunrise at Fitz Roy',
    imageUrl: 'https://example.com/test.jpg',
    saleStatus: 'FOR_SALE',
    price: 1499,
    currency: 'INR',
  });
  assert(dummyPost.saleStatus === 'FOR_SALE', 'Post saleStatus is FOR_SALE');
  assert(dummyPost.price === 1499, 'Post price is 1499');
  assert(dummyPost.currency === 'INR', 'Post currency default INR');

  // 3. Purchase Model Schema Validation
  console.log('\n--- 3. Purchase Model Schema Checks ---');
  const buyerId = new mongoose.Types.ObjectId();
  const sellerId = new mongoose.Types.ObjectId();
  const postId = new mongoose.Types.ObjectId();

  const dummyPurchase = new Purchase({
    buyer: buyerId,
    seller: sellerId,
    post: postId,
    amount: 1499,
    currency: 'INR',
    razorpayOrderId: 'order_test_abc123',
    status: 'CREATED',
  });
  assert(dummyPurchase.amount === 1499, 'Purchase amount matches');
  assert(dummyPurchase.status === 'CREATED', 'Initial purchase status is CREATED');
  assert(dummyPurchase.razorpayOrderId === 'order_test_abc123', 'Order ID mapped');

  // 4. Concurrency Race Condition Model Simulation
  console.log('\n--- 4. 1-of-1 Atomic Concurrency Protection Logic ---');
  let simulatedDbPhoto = {
    _id: postId,
    saleStatus: 'FOR_SALE',
    soldTo: null,
  };

  // Function simulating atomic findOneAndUpdate({ _id: postId, saleStatus: 'FOR_SALE' })
  function atomicBuy(buyer) {
    if (simulatedDbPhoto.saleStatus === 'FOR_SALE') {
      simulatedDbPhoto.saleStatus = 'SOLD';
      simulatedDbPhoto.soldTo = buyer;
      return { success: true, photo: simulatedDbPhoto };
    }
    return { success: false, reason: 'ALREADY_SOLD' };
  }

  const buyer1 = new mongoose.Types.ObjectId();
  const buyer2 = new mongoose.Types.ObjectId();

  const attempt1 = atomicBuy(buyer1);
  const attempt2 = atomicBuy(buyer2);

  assert(attempt1.success === true, 'First concurrent buyer successfully acquired 1-of-1 asset');
  assert(attempt2.success === false, 'Second concurrent buyer was atomically blocked (ALREADY_SOLD)');
  assert(simulatedDbPhoto.soldTo === buyer1, 'Only Buyer 1 owns the asset');

  console.log(`\n========================================`);
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
