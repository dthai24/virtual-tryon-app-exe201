const express = require('express');
require('dotenv').config();
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const { generateVirtualTryOn } = require('./services/falTryon');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/public', express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Endpoint cũ được giữ để tương thích; luồng chính dùng /api/tryon/generate.
app.post('/api/generate-tryon', upload.fields([{ name: 'user_face' }, { name: 'garment_img' }]), async (req, res) => {
  try {
    if (!req.files || !req.files.user_face || !req.files.garment_img) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đủ ảnh!' });
    }

    const facePath = path.resolve(req.files.user_face[0].path).replace(/\\/g, '/');
    const garmentPath = path.resolve(req.files.garment_img[0].path).replace(/\\/g, '/');
    const falResult = await generateVirtualTryOn({
      personImage: facePath,
      clothingImage: garmentPath,
    });

    return res.json({
      success: true,
      image_url: falResult.imageUrl,
      video_url: falResult.imageUrl,
      fal_request_id: falResult.requestId,
      fal_model: falResult.model,
    });
  } catch (error) {
    console.error('[POST /api/generate-tryon]', error.message);
    return res.status(error.message.includes('FAL_KEY') ? 503 : 500).json({
      success: false,
      message: error.message.includes('FAL_KEY')
        ? 'Hệ thống đang xảy ra lỗi, vui lòng thử lại sau vài phút. Nếu lỗi vẫn tiếp diễn, vui lòng liên hệ với bộ phận hỗ trợ.'
        : error.message,
    });
  }
});

const productRoutes = require('./routes/product');
const tryonRoutes = require('./routes/tryon');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order');

app.use('/api/products', productRoutes);
app.use('/api/tryon', tryonRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/user/test', async (req, res) => {
  try {
    const User = require('./models/User');
    let user = await User.findOne({ role: 'buyer' });
    if (!user) {
      user = await User.create({
        username: 'Khách hàng thử nghiệm',
        email: 'test_buyer@smartfit.vn',
        password: 'defaultpassword123',
        role: 'buyer',
        credits: 5,
      });
      console.log('Đã tạo tài khoản buyer mẫu:', user.username);
    }
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => console.log(`Node.js Gateway đang chạy tại cổng ${PORT}`));
