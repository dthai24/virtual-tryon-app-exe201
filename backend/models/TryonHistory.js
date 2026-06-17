const mongoose = require('mongoose');

const tryonHistorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User là bắt buộc'],
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Sản phẩm là bắt buộc'],
    },
    user_face_url: {
      type: String,
      required: [true, 'Link ảnh mặt người dùng là bắt buộc'],
    },
    // Ảnh tĩnh trả về ngay từ bước 1 (IDM-VTON)
    result_image_url: {
      type: String,
      default: '',
    },
    // Video catwalk được tạo bất đồng bộ ở bước 2 (Luma)
    result_video_url: {
      type: String,
      default: '',
    },
    // Trạng thái tổng thể của lần thử đồ
    status: {
      type: String,
      enum: ['processing_image', 'image_ready', 'processing_video', 'video_ready', 'failed'],
      default: 'processing_image',
    },
    // Trạng thái riêng của bước tạo video
    video_status: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'failed'],
      default: 'pending',
    },
    measurements: {
      height: {
        type: Number,
        required: [true, 'Chiều cao là bắt buộc'],
        min: [100, 'Chiều cao tối thiểu 100cm'],
        max: [250, 'Chiều cao tối đa 250cm'],
      },
      weight: {
        type: Number,
        required: [true, 'Cân nặng là bắt buộc'],
        min: [20, 'Cân nặng tối thiểu 20kg'],
        max: [200, 'Cân nặng tối đa 200kg'],
      },
      gender: {
        type: String,
        enum: {
          values: ['male', 'female'],
          message: 'Giới tính phải là male hoặc female',
        },
        required: [true, 'Giới tính là bắt buộc'],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index tối ưu tra cứu lịch sử thử đồ theo user và sản phẩm
tryonHistorySchema.index({ user_id: 1, createdAt: -1 });
tryonHistorySchema.index({ product_id: 1 });

module.exports = mongoose.model('TryonHistory', tryonHistorySchema);
