/**
 * Environment Variable Validator
 * Validates critical environment configuration during backend startup.
 */

const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const missing = [];
  const warnings = [];

  // 1. JWT Secret (Critical)
  if (!process.env.JWT_SECRET) {
    if (isProduction) {
      missing.push('JWT_SECRET');
    } else {
      warnings.push('JWT_SECRET is not set in development. Please configure it in backend/.env');
    }
  }

  // 2. MongoDB URI (Critical)
  if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
    if (isProduction) {
      missing.push('MONGODB_URI (or MONGO_URI)');
    } else {
      warnings.push('MONGODB_URI is not set. In-memory or local fallback will be attempted.');
    }
  }

  // 3. Client URL for CORS
  if (!process.env.CLIENT_URL) {
    if (isProduction) {
      missing.push('CLIENT_URL');
    } else {
      warnings.push('CLIENT_URL not set in development (defaults to localhost:5173).');
    }
  }

  // 4. Razorpay Credentials
  if (!process.env.RAZORPAY_KEY_ID) {
    if (isProduction) {
      missing.push('RAZORPAY_KEY_ID');
    } else {
      warnings.push('RAZORPAY_KEY_ID not set.');
    }
  }
  if (!process.env.RAZORPAY_KEY_SECRET) {
    if (isProduction) {
      missing.push('RAZORPAY_KEY_SECRET');
    } else {
      warnings.push('RAZORPAY_KEY_SECRET not set.');
    }
  }

  // 5. Cloudinary Credentials
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    if (isProduction) {
      missing.push('CLOUDINARY_CLOUD_NAME');
    } else {
      warnings.push('CLOUDINARY_CLOUD_NAME not set.');
    }
  }
  if (!process.env.CLOUDINARY_API_KEY) {
    if (isProduction) {
      missing.push('CLOUDINARY_API_KEY');
    } else {
      warnings.push('CLOUDINARY_API_KEY not set.');
    }
  }
  if (!process.env.CLOUDINARY_API_SECRET) {
    if (isProduction) {
      missing.push('CLOUDINARY_API_SECRET');
    } else {
      warnings.push('CLOUDINARY_API_SECRET not set.');
    }
  }

  // If in production and required production variables are missing, fail fast
  if (isProduction && missing.length > 0) {
    console.error('❌ [FATAL CONFIG ERROR] Missing required production environment variables:');
    missing.forEach((varName) => console.error(`   - ${varName}`));
    console.error('Please configure these environment variables before starting the production server.\n');
    process.exit(1);
  }

  // Print non-fatal startup warnings in non-test modes
  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn('⚠️  [Environment Configuration Warnings]:');
    warnings.forEach((w) => console.warn(`   - ${w}`));
  }
};

module.exports = { validateEnv };
