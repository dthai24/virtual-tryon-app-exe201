const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User là bắt buộc'],
    },
    amount: {
      type: Number,
      required: [true, 'Số lượng credit là bắt buộc'],
    },
    type: {
      type: String,
      enum: {
        values: ['bonus', 'purchase', 'usage_deduction'],
        message: 'Loại giao dịch phải là bonus, purchase hoặc usage_deduction',
      },
      required: [true, 'Loại giao dịch là bắt buộc'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Mô tả không được vượt quá 500 ký tự'],
    },
  },
  {
    timestamps: true,
  }
);

// Index tối ưu tra cứu lịch sử giao dịch theo user
creditTransactionSchema.index({ user_id: 1, createdAt: -1 });
creditTransactionSchema.index({ type: 1 });

module.exports = mongoose.model('CreditTransaction', creditTransactionSchema);
