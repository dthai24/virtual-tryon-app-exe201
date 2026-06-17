const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Tên người dùng là bắt buộc'],
      trim: true,
      minlength: [3, 'Tên người dùng phải có ít nhất 3 ký tự'],
      maxlength: [50, 'Tên người dùng không được vượt quá 50 ký tự'],
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: ['buyer', 'shop_owner', 'admin'],
        message: 'Role phải là buyer, shop_owner hoặc admin',
      },
      default: 'buyer',
    },
    credits: {
      type: Number,
      default: 3,
      min: [0, 'Credits không được âm'],
    },
  },
  {
    timestamps: true,
  }
);

// Không cần index email thủ công vì unique: true đã tự động tạo index
module.exports = mongoose.model('User', userSchema);
