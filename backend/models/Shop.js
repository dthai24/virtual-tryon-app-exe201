const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Chủ shop là bắt buộc'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Tên cửa hàng là bắt buộc'],
      trim: true,
      maxlength: [100, 'Tên cửa hàng không được vượt quá 100 ký tự'],
    },
    logo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Mô tả không được vượt quá 1000 ký tự'],
    },
    cover_image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive'],
        message: 'Trạng thái shop phải là active hoặc inactive',
      },
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Chỉ cần index cho status (owner_id đã tự động được index do unique: true)
shopSchema.index({ status: 1 });

module.exports = mongoose.model('Shop', shopSchema);
