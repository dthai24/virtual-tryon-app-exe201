const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Product = require('../models/Product');
const TryonHistory = require('../models/TryonHistory');
const CreditTransaction = require('../models/CreditTransaction');

const router = express.Router();

// ============================================================
// CẤU HÌNH MULTER — Lưu ảnh khuôn mặt người dùng
// ============================================================
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'faces');

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
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận định dạng ảnh JPEG, PNG, WebP'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB cho ảnh mặt
});

// ============================================================
// HÀM NỀN: Sinh video bất đồng bộ — chạy ngầm sau khi trả ảnh
// ============================================================
async function runVideoGenerationInBackground(historyId, imageUrl, height, weight, gender) {
  console.log(`\n🎬 [Background] Bắt đầu sinh video cho lịch sử ID: ${historyId}`);
  
  try {
    // Cập nhật trạng thái đang xử lý video
    await TryonHistory.findByIdAndUpdate(historyId, {
      video_status: 'processing',
      status: 'processing_video',
    });

    const pythonResponse = await fetch('http://127.0.0.1:8099/api/generate-tryon-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        height: height.toString(),
        weight: weight.toString(),
        gender: gender,
      }),
    });

    if (!pythonResponse.ok) {
      throw new Error(`Python video server lỗi: ${pythonResponse.status}`);
    }

    const videoData = await pythonResponse.json();
    const videoUrl = videoData.video_url;

    if (!videoUrl) {
      throw new Error('Python không trả về video_url');
    }

    // Cập nhật lịch sử với video thành công
    await TryonHistory.findByIdAndUpdate(historyId, {
      result_video_url: videoUrl,
      video_status: 'ready',
      status: 'video_ready',
    });

    console.log(`✅ [Background] Video sẵn sàng cho history ID ${historyId}: ${videoUrl}`);

  } catch (err) {
    console.error(`❌ [Background] Lỗi sinh video cho history ID ${historyId}:`, err.message);
    // Đánh dấu thất bại nhưng ảnh tĩnh vẫn còn — không xóa ảnh
    await TryonHistory.findByIdAndUpdate(historyId, {
      video_status: 'failed',
      status: 'image_ready', // Vẫn còn ảnh tĩnh dùng được
    });
  }
}

// ============================================================
// API: POST /api/tryon/generate — Bước 1: Trả ảnh tĩnh NGAY
// ============================================================
router.post('/generate', upload.single('user_face'), async (req, res) => {
  try {
    // 1. Kiểm tra file mặt tải lên
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp hình ảnh khuôn mặt của bạn!',
      });
    }

    const { user_id, product_id, height, weight, gender } = req.body;

    // Validate đầu vào
    if (!user_id || !product_id || !height || !weight || !gender) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: user_id, product_id, height, weight, gender!',
      });
    }

    // 2. Bước A: Kiểm tra thông tin người dùng & số dư Credit
    const user = await User.findById(user_id);
    if (!user) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tài khoản người dùng!',
      });
    }

    if (user.credits <= 0) {
      fs.unlinkSync(req.file.path);
      return res.status(402).json({
        success: false,
        message: 'Tài khoản của bạn đã hết credit. Vui lòng nạp thêm gói để tiếp tục sử dụng dịch vụ AI Try-on!',
        credits: user.credits,
      });
    }

    // 3. Bước B: Kiểm tra sản phẩm & lấy đường dẫn ảnh áo cục bộ
    const product = await Product.findById(product_id);
    if (!product) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm trang phục này không còn tồn tại trên hệ thống!',
      });
    }

    // 4. Bước C: Gọi Python AI — CHỈ tạo ảnh tĩnh (nhanh)
    const faceLocalPath = path.resolve(req.file.path).replace(/\\/g, '/');
    const garmentLocalPath = product.garment_image_url;

    console.log(`\n🤖 [Backend Gateway] Khởi chạy AI Try-on BƯỚC 1 (Ảnh tĩnh):`);
    console.log(`- User: ${user.username} (Credits hiện tại: ${user.credits})`);
    console.log(`- Product: ${product.name}`);
    console.log(`- File mặt: ${faceLocalPath}`);
    console.log(`- File áo: ${garmentLocalPath}`);
    console.log(`- May đo: Cao ${height}cm, Nặng ${weight}kg, Giới tính: ${gender}`);

    let resultImageUrl = '';

    try {
      const pythonResponse = await fetch('http://127.0.0.1:8099/api/generate-tryon-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          height: height.toString(),
          weight: weight.toString(),
          gender: gender,
          face_image: faceLocalPath,
          garment_image: garmentLocalPath,
        }),
      });

      if (!pythonResponse.ok) {
        throw new Error(`Python image server phản hồi lỗi code: ${pythonResponse.status}`);
      }

      const aiData = await pythonResponse.json();
      resultImageUrl = aiData.image_url;

      if (!resultImageUrl) {
        throw new Error('Python server trả về image_url rỗng');
      }

      console.log(`✅ [Backend Gateway] Nhận ảnh tĩnh từ Python: ${resultImageUrl}`);

    } catch (aiError) {
      console.error('❌ [AI Image Service Error]:', aiError.message);
      // Nếu sập: trả lỗi rõ ràng thay vì ảnh/video giả
      fs.unlinkSync(req.file.path);
      return res.status(503).json({
        success: false,
        message: 'Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau!',
      });
    }

    // 5. Bước D: Trừ credit người dùng & Ghi nhận lịch sử với trạng thái "image_ready"
    user.credits -= 1;
    await user.save();

    await CreditTransaction.create({
      user_id: user._id,
      amount: -1,
      type: 'usage_deduction',
      description: `Sử dụng 1 credit để thử đồ ảo AI cho sản phẩm: "${product.name}"`,
    });

    const userFacePublicUrl = `http://localhost:5000/public/uploads/faces/${req.file.filename}`;
    const newHistory = await TryonHistory.create({
      user_id: user._id,
      product_id: product._id,
      user_face_url: userFacePublicUrl,
      result_image_url: resultImageUrl,
      result_video_url: '',
      status: 'image_ready',
      video_status: 'pending',
      measurements: {
        height: Number(height),
        weight: Number(weight),
        gender: gender,
      },
    });

    console.log(`💾 Đã lưu lịch sử thử đồ ID: ${newHistory._id} (Ảnh sẵn sàng, Video đang chờ...)`);
    console.log(`📉 Đã khấu trừ 1 credit của user: "${user.username}". Số credit còn lại: ${user.credits}`);

    // 6. Bước E: Trả kết quả ẢNH TĨNH về Frontend NGAY — KHÔNG đợi video
    res.status(200).json({
      success: true,
      message: 'Ảnh thử đồ AI sẵn sàng! Video catwalk đang được tạo ở nền...',
      data: {
        result_image_url: resultImageUrl,
        result_video_url: '',
        video_status: 'pending',
        remaining_credits: user.credits,
        history_id: newHistory._id,
      },
    });

    // 7. Bước F: Kích hoạt sinh video ở nền (KHÔNG await — chạy độc lập)
    runVideoGenerationInBackground(
      newHistory._id,
      resultImageUrl,
      height,
      weight,
      gender
    );
    // Hàm trên chạy ngầm, không block response đã trả về ở trên

  } catch (error) {
    console.error('❌ [API /api/tryon/generate Error]:', error.message);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: 'Có lỗi hệ thống xảy ra: ' + error.message,
    });
  }
});

// ============================================================
// API: GET /api/tryon/status/:history_id — Polling trạng thái video
// Frontend gọi định kỳ để kiểm tra video đã xong chưa
// ============================================================
router.get('/status/:history_id', async (req, res) => {
  try {
    const history = await TryonHistory.findById(req.params.history_id)
      .select('status video_status result_image_url result_video_url');

    if (!history) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch sử thử đồ!' });
    }

    return res.status(200).json({
      success: true,
      data: {
        status: history.status,
        video_status: history.video_status,
        result_image_url: history.result_image_url,
        result_video_url: history.result_video_url,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// API: GET /api/tryon/history/:user_id — Lấy lịch sử thử đồ
// ============================================================
router.get('/history/:user_id', async (req, res) => {
  try {
    const history = await TryonHistory.find({ user_id: req.params.user_id })
      .populate('product_id', 'name price garment_image_url')
      .sort({ createdAt: -1 });

    // Định dạng lại các đường dẫn ảnh cục bộ thành URL hợp pháp
    const processedHistory = history.map(item => {
      const itemObj = item.toObject();
      if (itemObj.product_id && itemObj.product_id.garment_image_url) {
        let imageUrl = itemObj.product_id.garment_image_url;
        if (imageUrl && (imageUrl.includes(':/') || imageUrl.includes(':\\') || imageUrl.startsWith('/') || imageUrl.match(/^[a-zA-Z]:/))) {
          const filename = path.basename(imageUrl);
          itemObj.product_id.garment_image_url = `http://localhost:5000/public/uploads/products/${filename}`;
        }
      }
      return itemObj;
    });

    return res.status(200).json({
      success: true,
      data: processedHistory,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// API: POST /api/tryon/recharge — Nạp thêm credit giả lập (+5 xu)
// ============================================================
router.post('/recharge', async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin user_id!' });
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản!' });
    }

    // Tăng credit
    user.credits += 5;
    await user.save();

    // Ghi nhận lịch sử giao dịch
    await CreditTransaction.create({
      user_id: user._id,
      amount: 5,
      type: 'purchase',
      description: 'Nạp thêm 5 credit qua cổng giả lập để tiếp tục thử đồ AI',
    });

    return res.status(200).json({
      success: true,
      message: 'Nạp credit thành công! Đã cộng thêm 5 xu.',
      credits: user.credits,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
