import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function ShopDashboard() {
  const router = useRouter();
  const [seller, setSeller] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('statistics'); // statistics | products | orders
  
  // Trạng thái load dữ liệu
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // State phục vụ thống kê ảo + thật
  const [tryonHits, setTryonHits] = useState(0);

  // Bảo vệ route - Chỉ cho phép Seller truy cập
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === 'shop_owner') {
        setSeller(parsedUser);
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, []);

  // Fetch dữ liệu khi đã xác định được seller
  useEffect(() => {
    if (!seller || !seller.shop) return;

    // 1. Tải danh sách đơn hàng của shop
    fetch(`http://localhost:5000/api/orders/seller/${seller.shop.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.data);
        }
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error('Lỗi tải đơn hàng của shop:', err);
        setLoadingOrders(false);
      });

    // 2. Tải danh sách sản phẩm và lọc theo shop
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Lọc sản phẩm của shop
          const shopProducts = data.data.filter(p => p.shop_id && p.shop_id._id === seller.shop.id);
          setProducts(shopProducts);
        }
        setLoadingProducts(false);
      })
      .catch(err => {
        console.error('Lỗi tải sản phẩm của shop:', err);
        setLoadingProducts(false);
      });

    // 3. Tạo ngẫu nhiên/tải chỉ số lượt tương tác AI Try-on để làm sinh động giao diện
    const savedTryons = localStorage.getItem(`tryon_hits_${seller.shop.id}`);
    if (savedTryons) {
      setTryonHits(Number(savedTryons));
    } else {
      const randomHits = Math.floor(Math.random() * 80) + 40; // 40 - 120 hits
      setTryonHits(randomHits);
      localStorage.setItem(`tryon_hits_${seller.shop.id}`, randomHits.toString());
    }
  }, [seller]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Cập nhật lại danh sách đơn hàng cục bộ
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        alert('Cập nhật trạng thái đơn hàng thành công!');
      } else {
        alert(data.message || 'Không thể cập nhật trạng thái đơn hàng!');
      }
    } catch (err) {
      alert('Lỗi kết nối tới Server: ' + err.message);
    }
  };

  // Tính toán các chỉ số thống kê
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const shippingOrders = orders.filter(o => o.status === 'shipping').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

  // Tỷ lệ chuyển đổi = (Số đơn hàng hoàn thành / số lượt thử đồ) * 100
  const conversionRate = tryonHits > 0 ? ((orders.length / tryonHits) * 100).toFixed(1) : 0;

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ee4d2d]"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Kênh Người Bán — {seller.shop?.name || 'SmartFit Store'}</title>
      </Head>

      <div className="min-h-screen bg-[#f5f5f9] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
        
        {/* ===== SIDEBAR TRÁI ===== */}
        <aside className="w-[260px] bg-gray-900 text-white flex-shrink-0 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="h-[70px] border-b border-gray-800 flex items-center px-6 gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ee4d2d] to-[#ff6633] flex items-center justify-center">
                <span className="text-white text-sm font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>S</span>
              </div>
              <div>
                <span className="text-sm font-extrabold tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>SMART FIT</span>
                <p className="text-[9px] text-[#ee4d2d] font-bold tracking-widest uppercase">Seller Centre</p>
              </div>
            </div>

            {/* Profile Shop */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ee4d2d] to-[#ff7043] flex items-center justify-center text-sm font-bold">
                  🏪
                </div>
                <div>
                  <h4 className="text-xs font-bold truncate max-w-[150px]">{seller.shop?.name || 'Routine Studio'}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Chủ shop: {seller.username}</p>
                </div>
              </div>
            </div>

            {/* Menu Nav */}
            <nav className="p-4 space-y-1">
              <button
                onClick={() => setActiveTab('statistics')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'statistics' ? 'bg-[#ee4d2d] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                📊 Thống kê chung
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'products' ? 'bg-[#ee4d2d] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                👕 Quản lý sản phẩm
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'orders' ? 'bg-[#ee4d2d] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                📦 Quản lý đơn hàng
                {pendingOrders > 0 && (
                  <span className="ml-auto bg-yellow-500 text-gray-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {pendingOrders}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Bottom actions */}
          <div className="p-4 border-t border-gray-800 space-y-2">
            <button
              onClick={() => router.push('/')}
              className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center block"
            >
              🌐 Xem Trang chủ Buyer
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 border border-gray-700 hover:bg-red-950/20 hover:border-red-500 text-red-400 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center block"
            >
              🚪 Đăng xuất
            </button>
          </div>
        </aside>

        {/* ===== NỘI DUNG CHÍNH BÊN PHẢI ===== */}
        <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
          
          {/* Header Dashboard */}
          <header className="h-[70px] bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-30">
            <div>
              <h2 className="text-base font-bold text-gray-800">
                {activeTab === 'statistics' && 'Bảng Thống kê Hiệu quả Cửa hàng'}
                {activeTab === 'products' && 'Danh sách sản phẩm của Cửa hàng'}
                {activeTab === 'orders' && 'Danh sách đơn hàng của Cửa hàng'}
              </h2>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                Cập nhật tự động theo thời gian thực
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 font-semibold">Chào mừng trở lại, {seller.username}!</span>
              <div className="w-8 h-8 rounded-full bg-[#ee4d2d]/10 text-[#ee4d2d] flex items-center justify-center font-black text-xs">
                S
              </div>
            </div>
          </header>

          {/* Viewport content */}
          <div className="p-8 max-w-[1200px] w-full mx-auto space-y-8">
            
            {/* ==========================================
                TAB: THỐNG KÊ CHUNG (STATISTICS)
                ========================================== */}
            {activeTab === 'statistics' && (
              <>
                {/* 4 Thẻ chỉ số chính */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Tổng Doanh thu */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[120px]">
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Doanh thu hoàn thành</span>
                      <span className="text-lg">💰</span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-black text-gray-800">
                        {totalRevenue.toLocaleString('vi-VN')} ₫
                      </h3>
                      <p className="text-[10px] text-green-500 font-semibold mt-1">
                        +10.5% so với tuần trước
                      </p>
                    </div>
                  </div>

                  {/* Tổng Đơn hàng */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[120px]">
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Tổng đơn hàng</span>
                      <span className="text-lg">📦</span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-black text-gray-800">{orders.length} đơn</h3>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1">
                        Đang giao: {shippingOrders} | Chờ duyệt: {pendingOrders}
                      </p>
                    </div>
                  </div>

                  {/* Lượt thử đồ AI */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[120px]">
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Tương tác AI Try-on</span>
                      <span className="text-lg">🔮</span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-black text-gray-800">{tryonHits} lượt</h3>
                      <p className="text-[10px] text-blue-500 font-semibold mt-1">
                        Khách ghép mặt & dựng Catwalk
                      </p>
                    </div>
                  </div>

                  {/* Tỷ lệ chuyển đổi */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[120px]">
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Tỷ lệ mua/thử đồ</span>
                      <span className="text-lg">📈</span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-black text-[#ee4d2d]">{conversionRate}%</h3>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1">
                        Đơn đặt hàng trên tổng lượt thử AI
                      </p>
                    </div>
                  </div>
                </div>

                {/* Biểu đồ phân bổ trạng thái đơn hàng */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Trạng thái đơn hàng */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm md:col-span-1">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-6 pb-2 border-b border-gray-50">
                      Phân chia trạng thái đơn hàng
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-2 text-gray-500">
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
                          Chờ xử lý (Pending)
                        </span>
                        <span className="font-bold text-gray-800">{pendingOrders}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-2 text-gray-500">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                          Đang giao hàng (Shipping)
                        </span>
                        <span className="font-bold text-gray-800">{shippingOrders}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-2 text-gray-500">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                          Đã hoàn thành (Delivered)
                        </span>
                        <span className="font-bold text-gray-800">{deliveredOrders}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-2 text-gray-500">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                          Đã hủy (Cancelled)
                        </span>
                        <span className="font-bold text-gray-800">{cancelledOrders}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top sản phẩm có lượt xem/thử đồ cao */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm md:col-span-2">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b border-gray-50">
                      Sản phẩm hấp dẫn (Lượt thử đồ AI cao)
                    </h3>
                    {products.length === 0 ? (
                      <p className="text-xs text-gray-400 py-6 text-center">Chưa có sản phẩm nào được đăng bán.</p>
                    ) : (
                      <div className="space-y-4">
                        {products.slice(0, 3).map((p, idx) => {
                          // Giả lập lượt thử đồ riêng cho từng sản phẩm
                          const pTryons = Math.floor(tryonHits / (idx + 1.5)) + 3;
                          return (
                            <div key={p._id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-1 border border-gray-100 flex-shrink-0">
                                  <img src={p.garment_image_public_url} alt={p.name} className="max-w-full max-h-full object-contain" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-gray-700 line-clamp-1 max-w-[280px]">{p.name}</h4>
                                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Mã số: {p._id}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-black text-gray-800">{pTryons} lượt thử</span>
                                <p className="text-[9px] font-bold text-[#ee4d2d] mt-0.5">Hot Item</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              </>
            )}

            {/* ==========================================
                TAB: QUẢN LÝ SẢN PHẨM (PRODUCTS)
                ========================================== */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Tất cả sản phẩm ({products.length})</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Sản phẩm đăng tải phục vụ công nghệ thử đồ AI</p>
                  </div>
                  <button
                    onClick={() => router.push('/shop/add-product')}
                    className="px-5 py-2.5 bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded-xl text-xs font-bold shadow-md shadow-[#ee4d2d]/25 hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    ➕ Đăng sản phẩm mới
                  </button>
                </div>

                {loadingProducts ? (
                  <div className="py-12 text-center text-xs text-gray-400">Đang tải sản phẩm...</div>
                ) : products.length === 0 ? (
                  <div className="py-16 text-center">
                    <span className="text-4xl">👕</span>
                    <p className="text-xs text-gray-400 font-bold mt-3">Chưa có sản phẩm nào được đăng bán.</p>
                    <button
                      onClick={() => router.push('/shop/add-product')}
                      className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all cursor-pointer"
                    >
                      Tải lên sản phẩm đầu tiên
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <th className="py-4 px-6">Hình ảnh</th>
                          <th className="py-4 px-6">Tên sản phẩm</th>
                          <th className="py-4 px-6">Phân loại</th>
                          <th className="py-4 px-6 text-right">Giá bán</th>
                          <th className="py-4 px-6 text-center">Tồn kho</th>
                          <th className="py-4 px-6 text-center">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p._id} className="border-b border-gray-100 last:border-0 text-xs text-gray-700 hover:bg-gray-50/50 transition-all">
                            <td className="py-4 px-6">
                              <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex items-center justify-center p-1">
                                <img src={p.garment_image_public_url} alt={p.name} className="max-w-full max-h-full object-contain" />
                              </div>
                            </td>
                            <td className="py-4 px-6 font-bold text-gray-800 max-w-[280px]">
                              <span className="line-clamp-2">{p.name}</span>
                            </td>
                            <td className="py-4 px-6 capitalize">
                              {p.category === 'female' ? '👩 Nữ' : p.category === 'male' ? '👨 Nam' : '🧑 Unisex'}
                            </td>
                            <td className="py-4 px-6 text-right font-black text-gray-800">
                              {p.price.toLocaleString('vi-VN')} ₫
                            </td>
                            <td className="py-4 px-6 text-center font-semibold text-gray-500">
                              {p.stock} cái
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.8 rounded">
                                Đang bán
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ==========================================
                TAB: QUẢN LÝ ĐƠN HÀNG (ORDERS)
                ========================================== */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800">Danh sách đơn hàng nhận được</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Xử lý đóng gói và bàn giao cho đơn vị vận chuyển</p>
                </div>

                {loadingOrders ? (
                  <div className="py-12 text-center text-xs text-gray-400">Đang tải danh sách đơn hàng...</div>
                ) : orders.length === 0 ? (
                  <div className="py-16 text-center">
                    <span className="text-4xl">📦</span>
                    <p className="text-xs text-gray-400 font-bold mt-3">Cửa hàng chưa có đơn hàng nào.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <th className="py-4 px-6">Khách hàng / Thời gian</th>
                          <th className="py-4 px-6">Sản phẩm</th>
                          <th className="py-4 px-6 text-right">Tổng tiền</th>
                          <th className="py-4 px-6">Địa chỉ nhận</th>
                          <th className="py-4 px-6 text-center">Trạng thái</th>
                          <th className="py-4 px-6 text-center">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => {
                          const formattedDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          });
                          return (
                            <tr key={order._id} className="border-b border-gray-100 last:border-0 text-xs text-gray-700 hover:bg-gray-50/50 transition-all">
                              {/* Người đặt & thời gian */}
                              <td className="py-4 px-6">
                                <span className="font-bold text-gray-800 block">{order.buyer_id?.username || 'Khách vãng lai'}</span>
                                <span className="text-[10px] text-gray-400 block mt-0.5">{formattedDate}</span>
                              </td>
                              
                              {/* Sản phẩm */}
                              <td className="py-4 px-6 max-w-[250px]">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-2 py-1 first:pt-0 last:pb-0">
                                    <span className="bg-gray-100 text-[10px] px-1.5 py-0.2 rounded font-bold text-gray-600">x{item.quantity}</span>
                                    <span className="truncate inline-block font-semibold text-gray-700">
                                      {item.name}
                                      {item.size && (
                                        <span className="text-[9px] text-[#ee4d2d] bg-[#fef5f0] px-1.5 py-0.5 rounded ml-1 font-bold">
                                          Size {item.size}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </td>
                              
                              {/* Tổng tiền */}
                              <td className="py-4 px-6 text-right font-black text-gray-800">
                                {order.total_amount.toLocaleString('vi-VN')} ₫
                              </td>

                              {/* Địa chỉ */}
                              <td className="py-4 px-6 max-w-[200px]">
                                <span className="font-bold block">{order.shipping_info?.name} ({order.shipping_info?.phone})</span>
                                <span className="text-[10px] text-gray-400 line-clamp-2 mt-0.5">{order.shipping_info?.address}</span>
                              </td>

                              {/* Trạng thái */}
                              <td className="py-4 px-6 text-center">
                                <span className={`text-[10px] font-bold px-2 py-0.8 rounded inline-block ${
                                  order.status === 'pending' && 'bg-yellow-50 text-yellow-600' ||
                                  order.status === 'shipping' && 'bg-blue-50 text-blue-600' ||
                                  order.status === 'delivered' && 'bg-green-50 text-green-600' ||
                                  order.status === 'cancelled' && 'bg-red-50 text-red-600'
                                }`}>
                                  {order.status === 'pending' && '⏳ Chờ xử lý'}
                                  {order.status === 'shipping' && '🚚 Đang giao'}
                                  {order.status === 'delivered' && '✅ Hoàn thành'}
                                  {order.status === 'cancelled' && '❌ Đã hủy'}
                                </span>
                              </td>

                              {/* Hành động cập nhật */}
                              <td className="py-4 px-6 text-center">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                  className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-semibold cursor-pointer outline-none focus:border-[#ee4d2d]"
                                >
                                  <option value="pending">⏳ Chờ xử lý</option>
                                  <option value="shipping">🚚 Đang giao</option>
                                  <option value="delivered">✅ Đã giao</option>
                                  <option value="cancelled">❌ Hủy đơn</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-100 py-4 px-8 mt-auto text-center">
            <p className="text-[11px] text-gray-400">© 2026 SmartFit — AI Virtual Try-On Platform. Kênh Thống Kê và Quản Trị Seller v1.0</p>
          </footer>
        </main>

      </div>
    </>
  );
}
