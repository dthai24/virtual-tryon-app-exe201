const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    buyer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer là bắt buộc'],
    },
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: [true, 'Shop là bắt buộc'],
    },
    items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Số lượng tối thiểu là 1'],
        },
        price: {
          type: Number,
          required: true,
          min: [0, 'Giá không được âm'],
        },
        size: {
          type: String,
          required: false,
          default: 'M'
        },
      },
    ],
    total_amount: {
      type: Number,
      required: true,
      min: [0, 'Tổng tiền không được âm'],
    },
    shipping_info: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'shipping', 'delivered', 'cancelled'],
        message: 'Trạng thái đơn hàng không hợp lệ',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Tối ưu hóa truy vấn đơn hàng theo người mua và shop
orderSchema.index({ buyer_id: 1, createdAt: -1 });
orderSchema.index({ shop_id: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
