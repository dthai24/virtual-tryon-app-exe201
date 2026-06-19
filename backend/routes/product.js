const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const User = require('../models/User');
const { productImagePublicUrl, publicUploadUrl } = require('../utils/publicUrl');

const router = express.Router();

// ============================================================
// CẤU HÌNH MULTER — Lưu file ảnh vào thư mục cục bộ
// ============================================================
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'products');

// Đảm bảo thư mục tồn tại khi server khởi động
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const uniqueName = Date.now() + '-' + safeName;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ============================================================
// API: GET /api/products — Lấy danh sách toàn bộ sản phẩm
// ============================================================
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: 'available' })
      .populate('shop_id', 'name logo')
      .sort({ createdAt: -1 });

    // Chuyển đổi garment_image_url thành public HTTP url nếu là path cục bộ
    const processedProducts = products.map((prod) => {
      const imageUrl = productImagePublicUrl(prod.garment_image_url);
      return {
        ...prod.toObject(),
        garment_image_public_url: imageUrl,
      };
    });

    return res.status(200).json({
      success: true,
      count: processedProducts.length,
      data: processedProducts,
    });
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách sản phẩm:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tải sản phẩm: ' + error.message,
    });
  }
});

// ============================================================
// API: POST /api/products/add — Chủ shop đăng sản phẩm mới
// ============================================================
router.post('/add', upload.single('garment_image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ảnh trang phục để upload!',
      });
    }

    const { shop_name, name, price, description, category } = req.body;

    if (!shop_name || !name || !price || !category) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: shop_name, name, price, category!',
      });
    }

    // 1. Tự động xử lý shop_name -> Tìm shop_id
    let shop = await Shop.findOne({ name: { $regex: new RegExp(`^${shop_name.trim()}$`, 'i') } });
    
    if (!shop) {
      console.log(`🏪 Shop "${shop_name}" chưa tồn tại. Tiến hành khởi tạo tự động...`);
      
      // Tạo User chủ shop ảo
      const uniqueSuffix = Date.now();
      const safeUsername = shop_name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      const tempUser = await User.create({
        username: `owner_${safeUsername}`,
        email: `owner_${safeUsername}_${uniqueSuffix}@smartfit.vn`,
        password: 'defaultpassword123',
        role: 'shop_owner',
      });

      // Tạo Shop tương ứng
      shop = await Shop.create({
        owner_id: tempUser._id,
        name: shop_name.trim(),
        status: 'active',
      });
      
      console.log(`✅ Khởi tạo thành công Shop "${shop_name}" (ID: ${shop._id})`);
    }

    // 2. Tạo đường dẫn file ảnh
    const absoluteImagePath = path.resolve(req.file.path).replace(/\\/g, '/');
    const publicUrl = publicUploadUrl('products', req.file.filename);

    // 3. Lưu vào MongoDB Product
    const newProduct = await Product.create({
      shop_id: shop._id,
      name: name.trim(),
      price: Number(price),
      description: description || '',
      garment_image_url: absoluteImagePath,
      category: category,
      stock: req.body.stock ? Number(req.body.stock) : 10,
      status: 'available',
    });

    console.log(`✅ Sản phẩm "${name}" đã được đăng thành công cho shop "${shop.name}"!`);

    return res.status(201).json({
      success: true,
      message: `Đăng sản phẩm "${name}" thành công vào shop "${shop.name}"!`,
      data: {
        product: newProduct,
        shop: {
          id: shop._id,
          name: shop.name
        },
        image_local_path: absoluteImagePath,
        image_public_url: publicUrl,
      },
    });

  } catch (error) {
    console.error('❌ Lỗi khi đăng sản phẩm:', error.message);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng sản phẩm: ' + error.message,
    });
  }
});

module.exports = router;
