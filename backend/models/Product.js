const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: [true, 'Shop là bắt buộc'],
    },
    name: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true,
      maxlength: [200, 'Tên sản phẩm không được vượt quá 200 ký tự'],
    },
    price: {
      type: Number,
      required: [true, 'Giá sản phẩm là bắt buộc'],
      min: [0, 'Giá không được âm'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Mô tả sản phẩm không được vượt quá 2000 ký tự'],
    },
    garment_image_url: {
      type: String,
      required: [true, 'Link ảnh trang phục là bắt buộc'],
    },
    category: {
      type: String,
      enum: {
        values: ['male', 'female', 'unisex'],
        message: 'Danh mục phải là male, female hoặc unisex',
      },
      required: [true, 'Danh mục sản phẩm là bắt buộc'],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng tồn kho không được âm'],
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'out_of_stock', 'hidden'],
        message: 'Trạng thái phải là available, out_of_stock hoặc hidden',
      },
      default: 'available',
    },
    is_flash_sale: {
      type: Boolean,
      default: false,
    },
    flash_sale_price: {
      type: Number,
      default: 0,
      min: [0, 'Giá Flash Sale không được âm'],
    },
  },
  {
    timestamps: true,
  }
);

// Index tối ưu truy vấn sản phẩm theo shop, danh mục và trạng thái
productSchema.index({ shop_id: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
