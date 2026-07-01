const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Product = require('../models/Product');
const TryonHistory = require('../models/TryonHistory');
const CreditTransaction = require('../models/CreditTransaction');
const { generateCatwalkVideo, generateVirtualTryOn } = require('../services/falTryon');
const { productImagePublicUrl, publicUploadUrl } = require('../utils/publicUrl');

const router = express.Router();
const MAX_FACE_IMAGE_SIZE_MB = 15;

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
    cb(new Error('Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FACE_IMAGE_SIZE_MB * 1024 * 1024 },
});

function uploadUserFace(req, res, next) {
  upload.single('user_face')(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: `Ảnh chân dung quá lớn. Vui lòng chọn ảnh nhỏ hơn ${MAX_FACE_IMAGE_SIZE_MB}MB.`,
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Không thể upload ảnh chân dung.',
    });
  });
}

router.post('/generate', uploadUserFace, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp hình ảnh khuôn mặt của bạn!',
      });
    }

    const { user_id, product_id, height, weight, gender } = req.body;

    if (!user_id || !product_id || !height || !weight || !gender) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: user_id, product_id, height, weight, gender!',
      });
    }

    const user = await User.findById(user_id);
    if (!user) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản người dùng!',
      });
    }

    if (user.credits <= 0) {
      fs.unlinkSync(req.file.path);
      return res.status(402).json({
        success: false,
        message: 'Tài khoản của bạn đã hết credit. Vui lòng nạp thêm để tiếp tục dùng AI Try-on!',
        credits: user.credits,
      });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm này không còn tồn tại trên hệ thống!',
      });
    }

    const faceLocalPath = path.resolve(req.file.path).replace(/\\/g, '/');
    const garmentLocalPath = product.garment_image_url;

    console.log('\n[Backend] Generating fal virtual try-on image only');
    console.log(`- User: ${user.username} (credits: ${user.credits})`);
    console.log(`- Product: ${product.name}`);
    console.log(`- Face image: ${faceLocalPath}`);
    console.log(`- Garment image: ${garmentLocalPath}`);

    let falResult;
    try {
      falResult = await generateVirtualTryOn({
        personImage: faceLocalPath,
        clothingImage: garmentLocalPath,
      });
      console.log(`[Backend] fal result ready (${falResult.model}, ${falResult.requestId}): ${falResult.imageUrl}`);
    } catch (aiError) {
      console.error('[fal try-on error]', aiError.message);
      fs.unlinkSync(req.file.path);
      return res.status(503).json({
        success: false,
        message: aiError.message.includes('FAL_KEY')
          ? 'Backend chưa cấu hình FAL_KEY. Hãy thêm fal API key vào môi trường backend rồi khởi động lại server.'
          : `Dịch vụ fal AI tạm thời không khả dụng: ${aiError.message}`,
      });
    }

    user.credits -= 1;
    await user.save();

    await CreditTransaction.create({
      user_id: user._id,
      amount: -1,
      type: 'usage_deduction',
      description: `Sử dụng 1 credit để thử đồ AI cho sản phẩm: "${product.name}"`,
    });

    const userFacePublicUrl = publicUploadUrl('faces', req.file.filename);
    const newHistory = await TryonHistory.create({
      user_id: user._id,
      product_id: product._id,
      user_face_url: userFacePublicUrl,
      result_image_url: falResult.imageUrl,
      result_video_url: '',
      status: 'image_ready',
      video_status: 'pending',
      measurements: {
        height: Number(height),
        weight: Number(weight),
        gender,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Ảnh thử đồ AI từ fal đã sẵn sàng!',
      data: {
        result_image_url: falResult.imageUrl,
        result_video_url: '',
        video_status: 'pending',
        remaining_credits: user.credits,
        history_id: newHistory._id,
        fal_request_id: falResult.requestId,
        fal_model: falResult.model,
      },
    });
  } catch (error) {
    console.error('[API /api/tryon/generate error]', error.message);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: 'Có lỗi hệ thống xảy ra: ' + error.message,
    });
  }
});

router.post('/video', async (req, res) => {
  try {
    const { user_id, history_id, image_url, video_duration } = req.body;

    if (!user_id || !history_id || !image_url) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: user_id, history_id, image_url!',
      });
    }

    const history = await TryonHistory.findOne({
      _id: history_id,
      user_id,
    });

    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch sử thử đồ tương ứng!',
      });
    }

    if (history.result_video_url) {
      return res.status(200).json({
        success: true,
        message: 'Video catwalk đã sẵn sàng.',
        data: {
          result_image_url: history.result_image_url,
          result_video_url: history.result_video_url,
          video_status: history.video_status || 'ready',
          history_id: history._id,
        },
      });
    }

    if (history.result_image_url !== image_url) {
      return res.status(400).json({
        success: false,
        message: 'Ảnh đầu vào không khớp với lịch sử thử đồ đã lưu!',
      });
    }

    await TryonHistory.findByIdAndUpdate(history._id, {
      status: 'processing_video',
      video_status: 'processing',
    });

    console.log('\n[Backend] Generating fal catwalk video only');
    console.log(`- History: ${history._id}`);
    console.log(`- Image: ${image_url}`);

    const falVideoResult = await generateCatwalkVideo({
      imageUrl: image_url,
      duration: video_duration || '5',
    });

    console.log(`[Backend] fal video ready (${falVideoResult.model}, ${falVideoResult.requestId}): ${falVideoResult.videoUrl}`);

    const updatedHistory = await TryonHistory.findByIdAndUpdate(
      history._id,
      {
        result_video_url: falVideoResult.videoUrl,
        status: 'video_ready',
        video_status: 'ready',
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Video catwalk từ fal đã sẵn sàng!',
      data: {
        result_image_url: updatedHistory.result_image_url,
        result_video_url: updatedHistory.result_video_url,
        video_status: updatedHistory.video_status,
        history_id: updatedHistory._id,
        fal_video_request_id: falVideoResult.requestId,
        fal_video_model: falVideoResult.model,
      },
    });
  } catch (error) {
    console.error('[API /api/tryon/video error]', error.message);

    if (req.body?.history_id) {
      await TryonHistory.findByIdAndUpdate(req.body.history_id, {
        status: 'image_ready',
        video_status: 'failed',
      }).catch(() => {});
    }

    return res.status(503).json({
      success: false,
      message: error.message.includes('FAL_KEY')
        ? 'Backend chưa cấu hình FAL_KEY cho video.'
        : `Không thể dựng video catwalk: ${error.message}`,
    });
  }
});

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

router.get('/history/:user_id', async (req, res) => {
  try {
    const history = await TryonHistory.find({ user_id: req.params.user_id })
      .populate('product_id', 'name price garment_image_url')
      .sort({ createdAt: -1 });

    const processedHistory = history.map((item) => {
      const itemObj = item.toObject();
      if (itemObj.product_id && itemObj.product_id.garment_image_url) {
        itemObj.product_id.garment_image_url = productImagePublicUrl(itemObj.product_id.garment_image_url);
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
// API: POST /api/tryon/recharge — Nạp xu qua chuyển khoản ngân hàng thật
// ============================================================
router.post('/recharge', async (req, res) => {
  try {
    const { user_id, coins, vnd } = req.body;
    if (!user_id) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin user_id!' });
    }

    const coinAmount = Number(coins) || 5;
    const moneyAmount = Number(vnd) || 50000;

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản!' });
    }

    // Tăng credit của người dùng
    user.credits += coinAmount;
    await user.save();

    // Ghi nhận lịch sử giao dịch nạp tiền thật
    await CreditTransaction.create({
      user_id: user._id,
      amount: coinAmount,
      type: 'purchase',
      description: `Nạp ${coinAmount} xu qua chuyển khoản ngân hàng thực tế (Trị giá ${moneyAmount.toLocaleString('vi-VN')}đ)`,
    });

    return res.status(200).json({
      success: true,
      message: `Nạp thành công! Đã cộng thêm ${coinAmount} xu vào tài khoản.`,
      credits: user.credits,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
