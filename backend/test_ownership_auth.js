/**
 * test_ownership_auth.js
 * Tests the strict post ownership authorization logic used in updatePostSaleSettings.
 * Validates that admin role does NOT bypass ownership, and that only the actual
 * photo owner can manage sale settings.
 */

const mongoose = require('mongoose');

async function runOwnershipTests() {
  console.log('🔐 Framora Marketplace Ownership Authorization Tests\n');

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

  // --- Simulate the exact ownership check in postController.js updatePostSaleSettings ---
  function canManageSale(post, requestingUser) {
    const ownerId = post.user
      ? post.user._id
        ? post.user._id.toString()
        : post.user.toString()
      : '';
    // NEW strict logic: only owner, never admin bypass
    if (ownerId !== requestingUser._id.toString()) {
      return { allowed: false, status: 403, message: 'Only the owner of this photograph can manage its sale.' };
    }
    return { allowed: true };
  }

  const elenaId = new mongoose.Types.ObjectId();
  const marcusId = new mongoose.Types.ObjectId();
  const kaiId = new mongoose.Types.ObjectId();

  const elenaPost = { user: elenaId, title: "Elena's Photo" };
  const marcusPost = { user: marcusId, title: "Marcus's Photo" };

  const elena = { _id: elenaId, username: 'elena_r', role: 'user' };
  const marcus = { _id: marcusId, username: 'marcus_vance', role: 'admin' }; // admin
  const kai = { _id: kaiId, username: 'kai_lens', role: 'user' };

  console.log('--- 1. Owner → Own Photo ---');
  assert(canManageSale(elenaPost, elena).allowed === true, 'Elena can manage her own photo');
  assert(canManageSale(marcusPost, marcus).allowed === true, 'Marcus (admin) can manage his own photo');

  console.log('\n--- 2. Admin ≠ Owner of Every Photo ---');
  const marcusOnElena = canManageSale(elenaPost, marcus);
  assert(marcusOnElena.allowed === false, 'Marcus (admin) CANNOT manage Elena\'s photo');
  assert(marcusOnElena.status === 403, 'Returns 403 Forbidden for admin on non-owned photo');
  assert(
    marcusOnElena.message === 'Only the owner of this photograph can manage its sale.',
    'Returns correct 403 message'
  );

  console.log('\n--- 3. Non-Owner Regular User ---');
  const kaiOnElena = canManageSale(elenaPost, kai);
  assert(kaiOnElena.allowed === false, 'Kai CANNOT manage Elena\'s photo');
  assert(kaiOnElena.status === 403, 'Returns 403 for non-owner');

  const elenaOnMarcus = canManageSale(marcusPost, elena);
  assert(elenaOnMarcus.allowed === false, 'Elena CANNOT manage Marcus\'s photo');
  assert(elenaOnMarcus.status === 403, 'Returns 403 for Elena on Marcus\'s photo');

  console.log('\n--- 4. ID Tampering Simulation ---');
  // Attacker provides a different postId in URL but the DB returns Elena's post
  const attackerReqUser = { _id: marcusId, role: 'admin' };
  const targetPost = { user: elenaId }; // retrieved from DB with Elena's ID
  const tamperResult = canManageSale(targetPost, attackerReqUser);
  assert(tamperResult.allowed === false, 'ID tampering (Marcus on Elena post) blocked with 403');

  console.log('\n--- 5. ObjectId vs String Comparison Safety ---');
  // Ensure string-ified comparison doesn't accidentally equate different IDs
  const fakeStringId = marcusId.toString() + 'x'; // tampered string
  const fakeUser = { _id: fakeStringId, role: 'user' };
  const fakeResult = canManageSale(elenaPost, fakeUser);
  assert(fakeResult.allowed === false, 'Tampered string ID does not match real owner');

  // Ensure a valid matching string ID works
  const stringMatchUser = { _id: elenaId.toString(), role: 'user' };
  assert(canManageSale(elenaPost, stringMatchUser).allowed === true, 'String-ified matching ID still works');

  console.log(`\n========================================`);
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runOwnershipTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
