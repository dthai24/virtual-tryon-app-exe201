const express = require('express');
const User = require('../models/User');
const Shop = require('../models/Shop');

const router = express.Router();

// 1. Lấy danh sách tài khoản test nhanh
router.get('/test-accounts', async (req, res) => {
  try {
    // Đảm bảo tồn tại ít nhất 1 Buyer test
    let buyer = await User.findOne({ role: 'buyer', email: 'test_buyer@smartfit.vn' });
    if (!buyer) {
      buyer = await User.create({
        username: 'Khách hàng thử nghiệm',
        email: 'test_buyer@smartfit.vn',
        password: 'defaultpassword123',
        role: 'buyer',
        credits: 5,
      });
    }

    // Đảm bảo tồn tại ít nhất 1 Shop và Seller test
    let seller = await User.findOne({ role: 'shop_owner', email: 'owner_routine@smartfit.vn' });
    let shop;
    if (!seller) {
      seller = await User.create({
        username: 'Routine Owner',
        email: 'owner_routine@smartfit.vn',
        password: 'defaultpassword123',
        role: 'shop_owner',
      });
    }
    
    shop = await Shop.findOne({ owner_id: seller._id });
    if (!shop) {
      shop = await Shop.create({
        owner_id: seller._id,
        name: 'Routine Studio',
        logo: '',
        description: 'Thời trang nam nữ cao cấp hiện đại',
        status: 'active'
      });
    }

    return res.status(200).json({
      success: true,
      accounts: {
        buyer: {
          email: buyer.email,
          password: 'defaultpassword123',
          role: buyer.role,
          username: buyer.username,
        },
        seller: {
          email: seller.email,
          password: 'defaultpassword123',
          role: seller.role,
          username: seller.username,
          shop_name: shop.name,
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Đăng ký tài khoản mới
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, shop_name } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đủ thông tin!' });
    }

    // Kiểm tra email trùng lặp
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email này đã được đăng ký!' });
    }

    // Tạo User mới
    const newUser = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password, // Lưu dạng text thường để thuận tiện chạy thử nghiệm local
      role,
      credits: role === 'buyer' ? 3 : 0, // Mặc định buyer có 3 credits ban đầu
    });

    // Nếu vai trò là shop_owner thì tạo thêm Shop tương ứng
    if (role === 'shop_owner') {
      const finalShopName = shop_name ? shop_name.trim() : `Shop của ${username}`;
      await Shop.create({
        owner_id: newUser._id,
        name: finalShopName,
        status: 'active',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        credits: newUser.credits,
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền email và mật khẩu!' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Tài khoản không tồn tại!' });
    }

    // So sánh mật khẩu trực tiếp
    if (user.password !== password) {
      return res.status(400).json({ success: false, message: 'Mật khẩu không chính xác!' });
    }

    // Nếu là shop_owner, đính kèm thông tin shop
    let shopData = null;
    if (user.role === 'shop_owner') {
      const shop = await Shop.findOne({ owner_id: user._id });
      if (shop) {
        shopData = {
          id: shop._id,
          name: shop.name,
          tier: shop.tier,
          subscription_expires_at: shop.subscription_expires_at,
        };
      } else {
        // Tự động tạo shop nếu chưa có
        const newShop = await Shop.create({
          owner_id: user._id,
          name: `Shop của ${user.username}`,
          status: 'active',
        });
        shopData = {
          id: newShop._id,
          name: newShop.name,
          tier: newShop.tier,
          subscription_expires_at: newShop.subscription_expires_at,
        };
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        credits: user.credits,
        shop: shopData,
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// API: POST /api/auth/shop/upgrade — Nâng cấp/Gia hạn gói Shop
// ============================================================
router.post('/shop/upgrade', async (req, res) => {
  try {
    const { shop_id, tier } = req.body;
    if (!shop_id || !['free', 'pro', 'premium'].includes(tier)) {
      return res.status(400).json({ success: false, message: 'Thông tin nâng cấp không hợp lệ!' });
    }

    const shop = await Shop.findById(shop_id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cửa hàng!' });
    }

    // Nâng cấp gói
    shop.tier = tier;
    
    // Cộng thêm 30 ngày sử dụng
    const currentExpiry = shop.subscription_expires_at && new Date(shop.subscription_expires_at) > new Date()
      ? new Date(shop.subscription_expires_at)
      : new Date();
      
    shop.subscription_expires_at = new Date(currentExpiry.getTime() + 30 * 24 * 60 * 60 * 1000);
    await shop.save();

    return res.status(200).json({
      success: true,
      message: `Nâng cấp/Gia hạn thành công gói ${tier.toUpperCase()}!`,
      shop: {
        id: shop._id,
        name: shop.name,
        tier: shop.tier,
        subscription_expires_at: shop.subscription_expires_at
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// API: GET /api/auth/shop/:id — Lấy chi tiết Shop
// ============================================================
router.get('/shop/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cửa hàng!' });
    }
    return res.status(200).json({
      success: true,
      data: shop
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
