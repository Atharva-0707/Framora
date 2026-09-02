const Razorpay = require('razorpay');
const crypto = require('crypto');

/**
 * Check if Razorpay keys are configured in environment
 */
const isRazorpayConfigured = () => {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET
  );
};

/**
 * Get configured Razorpay SDK instance
 */
const getRazorpayInstance = () => {
  if (!isRazorpayConfigured()) {
    throw new Error('Razorpay keys (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not configured.');
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

/**
 * Create a new Razorpay Order
 * @param {object} params
 * @param {number} params.amount Amount in main currency units (e.g. 1499 for ₹1499)
 * @param {string} params.currency Currency code (default: 'INR')
 * @param {string} params.receipt Unique internal receipt ID
 * @param {object} params.notes Additional metadata notes
 * @returns {Promise<{ id: string, amount: number, currency: string, receipt: string }>}
 */
const createOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  const amountInSmallestUnit = Math.round(Number(amount) * 100);

  if (amountInSmallestUnit < 100) {
    throw new Error('Order amount must be at least ₹1.00 (100 paise)');
  }

  // If valid credentials are provided, use Razorpay SDK
  if (isRazorpayConfigured()) {
    const instance = getRazorpayInstance();
    const orderOptions = {
      amount: amountInSmallestUnit,
      currency: currency.toUpperCase(),
      receipt: receipt ? String(receipt).substring(0, 40) : `rcpt_${Date.now()}`,
      notes: {
        platform: 'Framora Photography Platform',
        ...notes,
      },
    };

    const order = await instance.orders.create(orderOptions);
    return order;
  }

  // Safe fallback mock order if keys are pending in development environment
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      '[Razorpay Notice] RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are not set in backend/.env. Using development test stub order.'
    );
    return {
      id: `order_dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      entity: 'order',
      amount: amountInSmallestUnit,
      amount_paid: 0,
      amount_due: amountInSmallestUnit,
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}`,
      status: 'created',
      notes,
    };
  }

  throw new Error('Razorpay payment gateway is not configured.');
};

/**
 * Verify Razorpay payment signature using server-side HMAC SHA-256
 * @param {object} params
 * @param {string} params.orderId Razorpay Order ID
 * @param {string} params.paymentId Razorpay Payment ID
 * @param {string} params.signature Razorpay Signature hex from client
 * @returns {boolean}
 */
const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;

  // In dev test stub mode if no secret is set
  if (!secret) {
    if (process.env.NODE_ENV !== 'production' && (orderId.startsWith('order_dev_') || signature.startsWith('sig_dev_'))) {
      return true;
    }
    return false;
  }

  const text = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(text)
    .digest('hex');

  try {
    const generatedBuffer = Buffer.from(generatedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');
    if (generatedBuffer.length !== signatureBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(generatedBuffer, signatureBuffer);
  } catch {
    return generatedSignature === signature;
  }
};

module.exports = {
  isRazorpayConfigured,
  getRazorpayInstance,
  createOrder,
  verifyPaymentSignature,
};
