const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const CreditTransaction = require('../models/CreditTransaction');
const TryonHistory = require('../models/TryonHistory');

// Helper middleware to check admin role
const isAdmin = async (req, res, next) => {
  try {
    const { admin_id } = req.query; // Check admin ID passed in query for simplicity in this EXE setup
    if (!admin_id) {
      return res.status(401).json({ success: false, message: 'Yêu cầu quyền admin!' });
    }
    const adminUser = await User.findById(admin_id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập admin!' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// API: GET /api/admin/stats — Thống kê tổng quan hệ thống
// ============================================================
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const totalSellers = await User.countDocuments({ role: 'shop_owner' });
    const totalProducts = await Product.countDocuments();
    const totalTryons = await TryonHistory.countDocuments();
    
    // Tổng số giao dịch nạp tiền
    const transactions = await CreditTransaction.find({ type: 'purchase' });
    const totalCoinsPurchased = transactions.reduce((sum, t) => sum + t.amount, 0);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalBuyers,
        totalSellers,
        totalProducts,
        totalTryons,
        totalCoinsPurchased
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// API: GET /api/admin/users — Danh sách người dùng
// ============================================================
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// API: PUT /api/admin/users/:id/credits — Cập nhật xu của người dùng
// ============================================================
router.put('/users/:id/credits', isAdmin, async (req, res) => {
  try {
    const { credits, reason } = req.body;
    if (credits === undefined || credits < 0) {
      return res.status(400).json({ success: false, message: 'Số xu không hợp lệ!' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
    }

    const diff = credits - user.credits;
    user.credits = credits;
    await user.save();

    // Ghi nhận lịch sử điều chỉnh xu bởi Admin
    if (diff !== 0) {
      await CreditTransaction.create({
        user_id: user._id,
        amount: Math.abs(diff),
        type: diff > 0 ? 'bonus' : 'usage_deduction',
        description: `Admin thay đổi xu. Lý do: ${reason || 'Không có lý do'} (Thay đổi: ${diff > 0 ? '+' : ''}${diff} xu)`,
      });
    }

    return res.status(200).json({ success: true, message: 'Cập nhật xu thành công!', user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// API: GET /api/admin/products — Danh sách sản phẩm của toàn hệ thống
// ============================================================
router.get('/products', isAdmin, async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// API: GET /api/admin/transactions — Lịch sử giao dịch xu
// ============================================================
router.get('/transactions', isAdmin, async (req, res) => {
  try {
    const transactions = await CreditTransaction.find({})
      .populate('user_id', 'username email')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, transactions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// API: GET /api/admin/tryons — Lịch sử thử đồ AI toàn hệ thống
// ============================================================
router.get('/tryons', isAdmin, async (req, res) => {
  try {
    const tryons = await TryonHistory.find({})
      .populate('user_id', 'username email')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, tryons });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
