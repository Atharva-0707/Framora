import api from './api';

export const purchaseService = {
  /**
   * Create Razorpay purchase order
   * @param {string} postId 
   */
  async createOrder(postId) {
    const response = await api.post(`/purchases/${postId}/create-order`);
    return response.data;
  },

  /**
   * Verify Razorpay payment signature
   * @param {string} postId 
   * @param {object} paymentData { razorpay_order_id, razorpay_payment_id, razorpay_signature }
   */
  async verifyPayment(postId, paymentData) {
    const response = await api.post(`/purchases/${postId}/verify`, paymentData);
    return response.data;
  },

  /**
   * Get current user's purchased photos
   */
  async getMyPurchases() {
    const response = await api.get('/purchases/me');
    return response.data;
  },

  /**
   * Get photographer's sales history & revenue
   */
  async getMySales() {
    const response = await api.get('/purchases/sales');
    return response.data;
  },

  /**
   * Get authorized high-resolution download URL
   * @param {string} postId 
   */
  async getDownloadAccess(postId) {
    const response = await api.get(`/purchases/download/${postId}`);
    return response.data;
  },

  /**
   * Update photo sale settings (Price, Status, License)
   * @param {string} postId 
   * @param {object} saleData { saleStatus, price, currency, licenseInfo }
   */
  async updatePostSaleSettings(postId, saleData) {
    const response = await api.put(`/posts/${postId}/sale`, saleData);
    return response.data;
  },
};

export default purchaseService;
