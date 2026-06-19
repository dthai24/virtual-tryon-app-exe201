const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { productImagePublicUrl } = require('../utils/publicUrl');

const router = express.Router();

// 1. Tạo đơn hàng mới
router.post('/create', async (req, res) => {
  try {
    const { buyer_id, shop_id, items, total_amount, shipping_info } = req.body;

    if (!buyer_id || !shop_id || !items || !items.length || !total_amount || !shipping_info) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin đặt hàng bắt buộc!' });
    }

    // Tạo Order mới
    const newOrder = await Order.create({
      buyer_id,
      shop_id,
      items,
      total_amount,
      shipping_info,
      status: 'pending',
    });

    // Cập nhật tồn kho (stock) của các sản phẩm tương ứng
    for (const item of items) {
      try {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { stock: -item.quantity }
        });
      } catch (err) {
        console.error('Không thể cập nhật tồn kho cho sản phẩm:', item.product_id, err.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      order: newOrder,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Lấy đơn hàng của người mua (Buyer)
router.get('/buyer/:buyer_id', async (req, res) => {
  try {
    const orders = await Order.find({ buyer_id: req.params.buyer_id })
      .populate('items.product_id', 'name garment_image_url')
      .populate('shop_id', 'name')
      .sort({ createdAt: -1 });

    // Định dạng lại các đường dẫn ảnh cục bộ thành URL hợp pháp
    const processedOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.map(item => {
        if (item.product_id && item.product_id.garment_image_url) {
          item.product_id.garment_image_url = productImagePublicUrl(item.product_id.garment_image_url);
        }
        return item;
      });
      return orderObj;
    });

    return res.status(200).json({
      success: true,
      data: processedOrders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Lấy đơn hàng của người bán (Seller)
router.get('/seller/:shop_id', async (req, res) => {
  try {
    const orders = await Order.find({ shop_id: req.params.shop_id })
      .populate('items.product_id', 'name garment_image_url')
      .populate('buyer_id', 'username email')
      .sort({ createdAt: -1 });

    // Định dạng lại các đường dẫn ảnh cục bộ thành URL hợp pháp
    const processedOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.map(item => {
        if (item.product_id && item.product_id.garment_image_url) {
          item.product_id.garment_image_url = productImagePublicUrl(item.product_id.garment_image_url);
        }
        return item;
      });
      return orderObj;
    });

    return res.status(200).json({
      success: true,
      data: processedOrders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Cập nhật trạng thái đơn hàng (Dành cho Seller)
router.put('/:order_id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatus = ['pending', 'shipping', 'delivered', 'cancelled'];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái đơn hàng không hợp lệ!' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.order_id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công!',
      order,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
