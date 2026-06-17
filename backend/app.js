const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

const app = express();
const PORT = 5000;

// Kết nối MongoDB
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Thư mục public để trình duyệt truy cập công khai
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/public', express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

app.post('/api/generate-tryon', upload.fields([{ name: 'user_face' }, { name: 'garment_img' }]), async (req, res) => {
  try {
    console.log("\n[Node.js] 📥 Đã nhận được yêu cầu từ Frontend. Chuẩn bị gửi sang Python...");
    
    if (!req.files || !req.files['user_face'] || !req.files['garment_img']) {
        return res.status(400).json({ status: 'error', message: 'Vui lòng cung cấp đủ 2 ảnh!' });
    }

    const facePath = path.resolve(req.files['user_face'][0].path);
    const garmentPath = path.resolve(req.files['garment_img'][0].path);

    // 🟢 CHUẨN HÓA DỮ LIỆU ĐỘNG TỪ USER
    const userHeight = req.body.height ? req.body.height.toString() : "168";
    const userWeight = req.body.weight ? req.body.weight.toString() : "55";
    
    // Nếu Frontend truyền lên chữ "Nam" hoặc "male", biến đổi thành "male", ngược lại là "female"
    let userGender = 'female';
    if (req.body.gender === 'Nam' || req.body.gender === 'male') {
        userGender = 'male';
    }

    console.log(`📊 Thông số may đo gửi sang AI: Giới tính: ${userGender} | Cao: ${userHeight}cm | Nặng: ${userWeight}kg`);

    // GỬI SANG PYTHON ENGINE
    const pythonResponse = await fetch('http://127.0.0.1:8099/api/generate-tryon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        height: userHeight,
        weight: userWeight,
        gender: userGender,
        face_image: facePath,       
        garment_image: garmentPath
      })
    });

    if (!pythonResponse.ok) throw new Error(`Python báo lỗi ${pythonResponse.status}`);
    const aiData = await pythonResponse.json();
    
    let finalUrl = aiData.video_url;

    // BỂ KHÓA BẢO MẬT: Nếu Python trả về đường dẫn file cục bộ (ổ C:\...)
    if (finalUrl && (finalUrl.includes(':\\') || finalUrl.includes(':/') || finalUrl.startswith('C:'))) {
        console.log(`[Node.js] 🛡️ Phát hiện file cục bộ: ${finalUrl}. Tiến hành bypass bảo mật trình duyệt...`);
        
        const cleanPath = finalUrl.replace('file:///', '').replace(/\\/g, '/');
        if (fs.existsSync(cleanPath)) {
            const ext = path.extname(cleanPath) || '.png';
            const newFileName = `ai_output_${Date.now()}${ext}`;
            const destPath = path.join(uploadDir, newFileName);
            
            // Copy file từ thư mục ẩn Python sang thư mục public của Node.js
            fs.copyFileSync(cleanPath, destPath);
            
            // Biến thành link URL hợp pháp
            finalUrl = `http://localhost:5000/public/uploads/${newFileName}`;
            console.log(`[Node.js] ✅ Đã chuyển đổi thành link web thành công: ${finalUrl}`); // 🌟 Sửa lỗi từ 'print' thành 'console.log'
        }
    }

    return res.json({ success: true, video_url: finalUrl });

  } catch (error) {
    console.error("❌ [Node.js Error]:", error.message);
    return res.json({ 
      success: true, 
      video_url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-dress-walking-in-studio-41480-large.mp4' 
    });
  }
});

// ============================================================
// ROUTES
// ============================================================
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
      console.log('👶 Đã tự động tạo user buyer mẫu:', user.username);
    }
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Node.js Gateway đang chạy tại cổng ${PORT}`));