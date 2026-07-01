import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { apiUrl } from '../../lib/api';

// Nạp động component Viewer3D để tránh lỗi SSR
const Viewer3D = dynamic(() => import('../../components/Viewer3D'), {
  ssr: false, 
  loading: () => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900/50 rounded-xl border border-gray-800 min-h-[300px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff4081]"></div>
      <p className="text-xs text-gray-400 mt-2 font-medium">Đang khởi tạo khung hình AI...</p>
    </div>
  )
});

function getRecommendedSize(gender, height, weight) {
  if (gender === 'female') {
    if (height < 152 && weight < 45) return 'S';
    if (height >= 170 || weight >= 65) return 'XXL';
    if (weight >= 57 || height >= 165) return 'XL';
    if (weight >= 50 || height >= 158) return 'L';
    return 'M';
  } else {
    if (height < 162 && weight < 55) return 'S';
    if (height >= 180 || weight >= 80) return 'XXL';
    if (weight >= 72 || height >= 175) return 'XL';
    if (weight >= 63 || height >= 168) return 'L';
    return 'M';
  }
}

export default function ShopProfile() {
  const router = useRouter();
  const { id } = router.query;

  // Trạng thái cửa hàng và sản phẩm
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingShop, setLoadingShop] = useState(true);
  const [shopError, setShopError] = useState(null);

  // Người dùng & Giỏ hàng
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart | 2: Shipping | 3: QR Pay
  const [shippingInfo, setShippingInfo] = useState({ name: '', phone: '', address: '' });
  const [createdOrder, setCreatedOrder] = useState(null);

  // Tìm kiếm & bộ lọc sản phẩm trong Shop
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Nạp xu
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(50000);
  const [rechargeQrUrl, setRechargeQrUrl] = useState(null);
  const [isCheckingRecharge, setIsCheckingRecharge] = useState(false);
  const [rechargeMemo, setRechargeMemo] = useState('');

  // Chi tiết sản phẩm & Thử đồ AI
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showTryonForm, setShowTryonForm] = useState(false);
  const [faceFile, setFaceFile] = useState(null);
  const [facePreview, setFacePreview] = useState(null);
  const [height, setHeight] = useState('165');
  const [weight, setWeight] = useState('55');
  const [gender, setGender] = useState('female');
  const [size, setSize] = useState('M');

  // Trạng thái xử lý AI
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiAction, setAiAction] = useState(null); // 'image' | 'video'
  const [aiImageUrl, setAiImageUrl] = useState(null);
  const [aiHistoryId, setAiHistoryId] = useState(null);
  const [aiResultUrl, setAiResultUrl] = useState(null);
  const [aiError, setAiError] = useState(null);

  // Theo dõi shop & chat ảo
  const [isFollowing, setIsFollowing] = useState(false);

  // ============================================================
  // LOAD DỮ LIỆU ĐẦU VÀO
  // ============================================================
  useEffect(() => {
    // 1. Kiểm tra trạng thái đăng nhập
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 2. Load giỏ hàng từ localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Fetch thông tin Shop và sản phẩm của Shop khi có ID
  useEffect(() => {
    if (!id) return;
    setLoadingShop(true);
    setShopError(null);

    // Tải thông tin shop
    fetch(apiUrl(`/api/auth/shop/${id}`))
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setShop(data.data);
        } else {
          setShopError(data.message || 'Không thể tìm thấy thông tin cửa hàng.');
        }
        setLoadingShop(false);
      })
      .catch(err => {
        setShopError('Lỗi kết nối máy chủ: ' + err.message);
        setLoadingShop(false);
      });

    // Tải danh sách toàn bộ sản phẩm và lọc
    fetch(apiUrl('/api/products'))
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const shopProds = data.data.filter(p => p.shop_id && p.shop_id._id === id);
          setProducts(shopProds);
        }
      })
      .catch(err => console.error('Lỗi tải sản phẩm:', err));
  }, [id]);

  // Đồng bộ kích thước gợi ý khi chiều cao / cân nặng thay đổi
  useEffect(() => {
    const recommended = getRecommendedSize(gender, Number(height), Number(weight));
    setSize(recommended);
  }, [height, weight, gender]);

  // Lọc sản phẩm
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(shopSearchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || product.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // ============================================================
  // QUẢN LÝ GIỎ HÀNG & MUA HÀNG
  // ============================================================
  const updateCartAndStorage = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleAddToCart = (product) => {
    const existingIndex = cart.findIndex((item) => item.product_id === product._id && item.size === size);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      updateCartAndStorage(newCart);
    } else {
      const newCart = [
        ...cart,
        {
          product_id: product._id,
          name: product.name,
          price: product.price,
          image: product.garment_image_public_url,
          size: size,
          quantity: 1,
          shop_id: product.shop_id?._id,
          shop_name: product.shop_id?.name || 'SmartFit Store',
        },
      ];
      updateCartAndStorage(newCart);
    }
    alert(`Đã thêm 1 "${product.name}" (Size ${size}) vào giỏ hàng!`);
  };

  const handleRemoveFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    updateCartAndStorage(newCart);
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Tạo đơn hàng thanh toán
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để tiến hành đặt đơn hàng!');
      router.push('/login');
      return;
    }
    if (cart.length === 0) return;

    try {
      const firstItem = cart[0];
      const orderData = {
        buyer_id: user._id,
        shop_id: firstItem.shop_id || id,
        items: cart.map(item => ({
          product_id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size
        })),
        total_amount: totalCartAmount,
        shipping_info: shippingInfo
      };

      const response = await fetch(apiUrl('/api/orders/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setCreatedOrder(data.data);
        setCheckoutStep(3); // Bước 3: Show QR quét thanh toán
        updateCartAndStorage([]); // Clear giỏ hàng sau khi đặt thành công
      } else {
        alert(data.message || 'Không thể tạo đơn hàng, vui lòng thử lại!');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ khi tạo đơn hàng: ' + err.message);
    }
  };

  // ============================================================
  // NẠP XU AI (RECHARGE) CÓ CHECK TỰ ĐỘNG
  // ============================================================
  const handleGenerateRechargeQR = () => {
    if (!user) {
      alert('Vui lòng đăng nhập trước khi nạp xu!');
      router.push('/login');
      return;
    }
    const shortUserId = user._id.slice(-6).toUpperCase();
    const memo = `NAPXU ${shortUserId}`;
    setRechargeMemo(memo);

    const qr = `https://api.vietqr.io/image/970422-70724012004-compact2.png?amount=${rechargeAmount}&addInfo=${encodeURIComponent(memo)}&accountName=CAP%20DUY%2520THAI`;
    setRechargeQrUrl(qr);
    setIsCheckingRecharge(true);
  };

  useEffect(() => {
    let checkInterval;
    if (isCheckingRecharge && user) {
      checkInterval = setInterval(async () => {
        try {
          const response = await fetch(apiUrl(`/api/tryon/check-recharge/${user._id}`));
          const data = await response.json();
          if (response.ok && data.success) {
            // Nhận diện giao dịch mới thành công
            const newCredits = data.remaining_credits;
            const updatedUser = { ...user, credits: newCredits };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            alert(`🎉 Chúc mừng! Hệ thống đã nhận được khoản chuyển khoản của bạn. Đã nạp thành công xu mới. Số dư hiện tại: ${newCredits} Xu AI.`);
            
            setIsCheckingRecharge(false);
            setRechargeQrUrl(null);
            setShowRechargeModal(false);
          }
        } catch (err) {
          console.error('Lỗi khi kiểm tra nạp tiền:', err);
        }
      }, 5000); // Check mỗi 5 giây
    }
    return () => clearInterval(checkInterval);
  }, [isCheckingRecharge, user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  // ============================================================
  // XỬ LÝ AI TRY-ON CỦA PDP MODAL
  // ============================================================
  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    setAiResultUrl(null);
    setAiImageUrl(null);
    setAiError(null);
    setShowTryonForm(false);
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
    setAiResultUrl(null);
    setAiImageUrl(null);
    setAiError(null);
    setShowTryonForm(false);
  };

  const handleFaceFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaceFile(file);
      setFacePreview(URL.createObjectURL(file));
    }
  };

  const handleStartAI = async () => {
    if (!faceFile) {
      alert('Vui lòng chọn ảnh khuôn mặt của bạn trước khi thử đồ!');
      return;
    }
    if (!user) {
      alert('Vui lòng đăng nhập để thực hiện tính năng này!');
      router.push('/login');
      return;
    }

    setLoadingAI(true);
    setAiAction('image');
    setAiError(null);
    setAiResultUrl(null);
    setAiImageUrl(null);
    setAiHistoryId(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('user_id', user._id);
      formDataToSend.append('product_id', selectedProduct._id);
      formDataToSend.append('user_face', faceFile);
      formDataToSend.append('height', height);
      formDataToSend.append('weight', weight);
      formDataToSend.append('gender', gender);

      const response = await fetch(apiUrl('/api/tryon/generate'), {
        method: 'POST',
        body: formDataToSend,
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : { success: false, message: await response.text() };

      if (response.ok && data.success) {
        setAiImageUrl(data.data.result_image_url);
        setAiHistoryId(data.data.history_id);
        setAiResultUrl(data.data.result_image_url);
        
        // Cập nhật số credit của user
        const updatedUser = { ...user, credits: data.data.remaining_credits };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        if (data.data.video_error) {
          setAiError(data.data.video_error);
        }
      } else {
        if (response.status === 413) {
          setAiError('Ảnh quá lớn. Vui lòng chọn ảnh khuôn mặt nhỏ hơn 15MB.');
          return;
        }
        setAiError(data.message || 'Xử lý AI thất bại. Vui lòng thử lại!');
      }
    } catch (err) {
      setAiError('Lỗi kết nối tới Server Gateway: ' + err.message);
    } finally {
      setLoadingAI(false);
      setAiAction(null);
    }
  };

  const handleGenerateVideoFromCurrentImage = async () => {
    if (!user || !aiImageUrl || !aiHistoryId) {
      setAiError('Bạn cần tạo ảnh thử đồ trước khi dựng video catwalk.');
      return;
    }

    setLoadingAI(true);
    setAiAction('video');
    setAiError(null);

    try {
      const response = await fetch(apiUrl('/api/tryon/video'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user._id,
          history_id: aiHistoryId,
          image_url: aiImageUrl,
          video_duration: '5',
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : { success: false, message: await response.text() };

      if (response.ok && data.success) {
        setAiResultUrl(data.data.result_video_url);
      } else {
        setAiError(data.message || 'Tạo video catwalk thất bại.');
      }
    } catch (err) {
      setAiError('Lỗi kết nối dựng video: ' + err.message);
    } finally {
      setLoadingAI(false);
      setAiAction(null);
    }
  };

  if (loadingShop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4081]"></div>
        <p className="text-xs text-gray-500 mt-4 font-bold">Đang tải hồ sơ cửa hàng...</p>
      </div>
    );
  }

  if (shopError || !shop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] p-6 text-center space-y-4">
        <span className="text-5xl">🏪</span>
        <h2 className="text-base font-bold text-gray-700">Lỗi tải trang Cửa Hàng</h2>
        <p className="text-xs text-gray-400 max-w-[320px]">{shopError || 'Không tìm thấy cửa hàng được yêu cầu.'}</p>
        <button
          onClick={() => router.push('/')}
          className="px-5 py-2.5 bg-[#ff4081] text-white font-bold text-xs rounded-xl shadow cursor-pointer"
        >
          Quay lại Trang chủ
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{shop.name} — Cửa Hàng Thời Trang AI | SmartFit</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Montserrat:wght@700;900&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-[#f5f5f5] pb-20 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
        
        {/* ===== HEADER GLOBAL ===== */}
        <header className="bg-gradient-to-b from-[#ff4081] to-[#ff80ab] text-white shadow-md sticky top-0 z-40">
          <div className="max-w-[1200px] mx-auto px-4 py-1.5 flex items-center justify-between text-[11px] border-b border-white/10 opacity-90">
            <div className="flex items-center gap-3">
              <span className="hover:text-white/80 cursor-pointer" onClick={() => router.push('/')}>Kênh Người Bán</span>
              <span className="w-[1px] h-3 bg-white/20"></span>
              <span className="hover:text-white/80 cursor-pointer">Tải ứng dụng</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="hover:text-white/80 cursor-pointer">🔔 Thông báo</span>
              <span className="hover:text-white/80 cursor-pointer" onClick={() => router.push('/')}>🏠 Trang chủ SmartFit</span>
              
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-yellow-250">👑 {user.username}</span>
                </div>
              ) : (
                <span className="hover:text-white/80 cursor-pointer font-bold" onClick={() => router.push('/login')}>Đăng nhập</span>
              )}
            </div>
          </div>

          <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between gap-6">
            
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => router.push('/')}>
              <svg className="w-9 h-9 text-white fill-current" viewBox="0 0 24 24">
                <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
              </svg>
              <div>
                <h1 className="text-xl font-black tracking-tighter text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  SmartFit
                </h1>
                <p className="text-[9px] text-yellow-100 font-extrabold uppercase tracking-widest leading-none">AI SHOPPING</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-[750px]">
              <div className="bg-white p-1 rounded-md shadow-sm flex items-center border-2 border-white focus-within:border-gray-300">
                <input
                  type="text"
                  placeholder={`Tìm kiếm sản phẩm bên trong shop ${shop.name}...`}
                  value={shopSearchQuery}
                  onChange={(e) => setShopSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-gray-800 focus:outline-none placeholder-gray-400 font-medium"
                />
                <button className="bg-[#ff4081] hover:bg-[#ff80ab] text-white px-6 py-2 rounded-md font-bold text-xs cursor-pointer flex items-center gap-1 transition-all">
                  🔍 Tìm
                </button>
              </div>
            </div>

            {/* Cart & Nạp xu */}
            <div className="flex items-center gap-6 shrink-0">
              {(!user || user.role === 'buyer') && (
                <button
                  onClick={() => setShowCartModal(true)}
                  className="relative p-2 text-white hover:text-yellow-100 transition-colors cursor-pointer"
                >
                  <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                  {totalCartItems > 0 && (
                    <span className="absolute -top-1 -right-2 bg-yellow-400 text-[#ff4081] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#ff4081] shadow">
                      {totalCartItems}
                    </span>
                  )}
                </button>
              )}

              {user && (
                <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-white leading-tight">{user.username}</p>
                    {user.role === 'buyer' && (
                      <p className="text-[9px] text-yellow-200 font-extrabold uppercase">🪙 {user.credits} Xu AI</p>
                    )}
                  </div>
                  
                  {user.role === 'buyer' && (
                    <button
                      onClick={() => setShowRechargeModal(true)}
                      className="w-5 h-5 bg-yellow-400 hover:bg-yellow-300 text-[#ff4081] text-[11px] rounded-full flex items-center justify-center font-black shadow transition-all cursor-pointer"
                      title="Nạp xu AI"
                    >
                      +
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="text-[10px] text-white/75 hover:text-white font-bold cursor-pointer"
                  >
                    Thoát
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ===== HỒ SƠ CỬA HÀNG (SHOP PROFILE SECTION) ===== */}
        <section className="max-w-[1200px] mx-auto px-4 mt-6">
          <div className="bg-gradient-to-r from-[#ff4081] to-[#ff80ab] p-6 rounded-2xl shadow-sm text-white">
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-8">
              
              {/* Bên trái: Avatar + Tên + Nút tương tác */}
              <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
                <div className="w-16 h-16 rounded-full bg-white text-[#ff4081] flex items-center justify-center text-3xl font-black shadow border-2 border-white/40 shrink-0">
                  🏪
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h2 className="text-lg font-black tracking-tight truncate" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {shop.name}
                  </h2>
                  <p className="text-[10px] text-white/80 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse"></span>
                    Vừa mới online 1 phút trước
                  </p>
                  
                  <div className="flex items-center gap-2 pt-1.5">
                    <button
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all active:scale-[0.98] cursor-pointer ${
                        isFollowing
                          ? 'bg-white/20 border border-white/30 text-white'
                          : 'bg-white text-[#ff4081] hover:bg-yellow-50 shadow'
                      }`}
                    >
                      {isFollowing ? '✓ Đang Theo Dõi' : '＋ Theo Dõi'}
                    </button>
                    <button
                      onClick={() => alert('Hộp thoại chat riêng với Shop đang được bảo trì!')}
                      className="px-4 py-1.5 bg-transparent border border-white/30 hover:bg-white/10 text-white rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer"
                    >
                      💬 Chat Ngay
                    </button>
                  </div>
                </div>
              </div>

              {/* Dải phân cách dọc */}
              <div className="hidden md:block h-16 w-[1px] bg-white/15"></div>

              {/* Bên phải: Chỉ số thống kê */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-xs font-semibold w-full flex-1 max-w-[650px]">
                <div className="space-y-1">
                  <span className="text-[10px] text-white/70 block">👕 Sản phẩm đăng bán</span>
                  <strong className="text-sm font-black">{products.length} mẫu quần áo</strong>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-white/70 block">⭐ Đánh giá cửa hàng</span>
                  <strong className="text-sm font-black">4.9 / 5.0 (98 lượt)</strong>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-white/70 block">💬 Tỷ lệ phản hồi</span>
                  <strong className="text-sm font-black">100% (Trong vài phút)</strong>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-white/70 block">📅 Thời gian tham gia</span>
                  <strong className="text-sm font-black">3 tháng trước</strong>
                </div>
                <div className="space-y-1 col-span-2">
                  <span className="text-[10px] text-white/70 block">📝 Mô tả cửa hàng</span>
                  <p className="text-[10px] font-medium text-white/80 line-clamp-2 leading-relaxed">
                    {shop.description || 'Chuyên cung cấp quần áo thời trang thiết kế nam nữ đón đầu xu hướng. Tích hợp thử đồ AI siêu thực để bạn tự chọn kích cỡ phù hợp.'}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ===== DANH MỤC SẢN PHẨM ===== */}
        <main className="max-w-[1200px] mx-auto px-4 mt-8">
          
          {/* Tabs */}
          <div className="bg-white border-b-2 border-[#ff4081] flex items-center justify-between mb-6 shadow-sm rounded-t-lg">
            <div className="flex">
              {[
                { id: 'all', label: 'TẤT CẢ SẢN PHẨM' },
                { id: 'male', label: 'THỜI TRANG NAM' },
                { id: 'female', label: 'THỜI TRANG NỮ' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategoryFilter(tab.id)}
                  className={`px-6 py-4 text-xs font-bold transition-all cursor-pointer border-b-4 ${
                    selectedCategoryFilter === tab.id
                      ? 'border-[#ff4081] text-[#ff4081] bg-[#fff0f5]'
                      : 'border-transparent text-gray-600 hover:text-[#ff4081]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="px-6 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {shopSearchQuery ? `Bộ lọc: "${shopSearchQuery}"` : `Tổng: ${filteredProducts.length} sản phẩm`}
            </div>
          </div>

          {/* Grid hiển thị sản phẩm của Shop */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-100 rounded-xl shadow-sm">
              <span className="text-5xl">🛍️</span>
              <p className="text-sm font-bold text-gray-400 mt-4">Cửa hàng không có sản phẩm nào phù hợp.</p>
              <p className="text-xs text-gray-300 mt-1.5">Vui lòng thay đổi từ khóa tìm kiếm hoặc đổi tab phân loại.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {filteredProducts.map((product) => {
                const finalPrice = product.is_flash_sale && product.flash_sale_price > 0 ? product.flash_sale_price : product.price;
                const discount = Math.round(((product.price - finalPrice) / product.price) * 100);
                
                return (
                  <div
                    key={product._id}
                    onClick={() => handleOpenDetail(product)}
                    className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative"
                  >
                    
                    {/* Ảnh */}
                    <div className="relative pt-[100%] bg-gray-50 overflow-hidden">
                      <img
                        src={product.garment_image_public_url}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      <span className="absolute top-2 left-2 bg-[#ff4081] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                        Mall
                      </span>
                      {discount > 0 && (
                        <span className="absolute top-2 right-2 bg-yellow-400 text-red-650 text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                          -{discount}%
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 min-h-[32px] leading-tight group-hover:text-[#ff4081] transition-colors">
                          {product.name}
                        </h4>
                      </div>

                      <div className="border-t border-gray-50 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#ff4081]">
                            ₫{finalPrice.toLocaleString('vi-VN')}
                          </span>
                          <span className="text-[9px] text-gray-400 font-bold shrink-0">
                            Đã bán {product.sales || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </main>

        {/* ===== MODAL CHI TIẾT SẢN PHẨM & AI TRY-ON ===== */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-[850px] max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              
              <button
                onClick={handleCloseDetail}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer transition-colors z-10 font-bold"
              >
                ✕
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                
                {/* CỘT TRÁI */}
                <div className="p-8 border-r border-gray-100">
                  {aiResultUrl ? (
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-[#ff4081] uppercase tracking-wider mb-2">🎬 KẾT QUẢ THỬ ĐỒ AI CATWALK</p>
                      <div className="w-full aspect-[9/16] max-h-[380px] bg-black rounded-xl overflow-hidden flex shadow-inner">
                        <Viewer3D videoUrl={aiResultUrl} loading={false} />
                      </div>
                      {!/\.(mp4|webm|ogg)(\?|$)/i.test(aiResultUrl) && (
                        <button
                          onClick={handleGenerateVideoFromCurrentImage}
                          disabled={loadingAI}
                          className={`w-full mt-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            loadingAI
                              ? 'bg-gray-300 text-white cursor-not-allowed'
                              : 'bg-gradient-to-r from-[#ff4081] to-[#ff80ab] text-white shadow-md shadow-[#ff4081]/15'
                          }`}
                        >
                          {loadingAI && aiAction === 'video' ? 'Đang dựng video...' : 'Dựng video catwalk từ ảnh này'}
                        </button>
                      )}
                      <button
                        onClick={() => setAiResultUrl(null)}
                        className="w-full mt-3 py-2 border border-[#ff4081] text-[#ff4081] hover:bg-[#ff4081]/5 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        🔄 Thử đồ lại bằng ảnh khác
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="w-full aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 p-6">
                        <img
                          src={selectedProduct.garment_image_public_url}
                          alt={selectedProduct.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  <span className="text-[9px] font-bold text-[#ff4081] bg-[#ff4081]/10 px-2 py-0.5 rounded-md">
                    🏪 {selectedProduct.shop_id?.name || 'SmartFit Store'}
                  </span>
                  <h3 className="text-base font-bold text-gray-800 mt-2 line-clamp-2">{selectedProduct.name}</h3>
                  <div className="text-sm font-black text-[#ff4081] mt-1.5">
                    Giá: {selectedProduct.price.toLocaleString('vi-VN')} ₫
                  </div>
                  {selectedProduct.description && (
                    <p className="text-xs text-gray-400 mt-3 leading-relaxed border-t border-gray-100 pt-3 max-h-[100px] overflow-y-auto">
                      {selectedProduct.description}
                    </p>
                  )}
                </div>

                {/* CỘT PHẢI */}
                <div className="p-8 bg-gray-50/50 flex flex-col justify-between min-h-[450px]">
                  {!user ? (
                    <div className="flex-1 flex flex-col justify-center items-center text-center py-6 relative">
                      <span className="text-5xl animate-bounce">🔮</span>
                      <h4 className="text-base font-bold text-gray-800 mt-4">Trải nghiệm Virtual Try-On</h4>
                      <p className="text-xs text-gray-400 max-w-[280px] mt-2 leading-relaxed">
                        Bạn có thể xem video Demo có sẵn, hoặc đăng nhập vai trò Buyer để tự động ghép mặt của bạn.
                      </p>

                      <div className="w-full mt-6 space-y-3">
                        <button
                          onClick={handlePlayDemoVideo}
                          className="w-full py-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                        >
                          ▶ XEM VIDEO DEMO THỬ ĐỒ
                        </button>
                        <button
                          onClick={() => router.push('/login')}
                          className="w-full py-3.5 bg-gradient-to-r from-[#ff4081] to-[#ff80ab] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                        >
                          🚪 ĐĂNG NHẬP ĐỂ TỰ THỬ ĐỒ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {!showTryonForm ? (
                        <div className="flex-1 flex flex-col justify-center items-center text-center py-12">
                          <span className="text-5xl animate-bounce">🔮</span>
                          <h4 className="text-base font-bold text-gray-800 mt-4">Tự ghép mặt bằng AI</h4>
                          <p className="text-xs text-gray-400 max-w-[280px] mt-2 leading-relaxed">
                            Tải ảnh chụp chính diện khuôn mặt của bạn để AI tự động ghép vào bộ trang phục này.
                          </p>
                          
                          <div className="w-full mt-6 space-y-3">
                            <button
                              onClick={() => setShowTryonForm(true)}
                              className="w-full py-3.5 bg-[#ff4081] text-white rounded-xl text-xs font-bold hover:bg-pink-600 shadow cursor-pointer transition-all active:scale-[0.98]"
                            >
                              🔮 BẮT ĐẦU THỬ ĐỒ BẰNG AI
                            </button>
                            <button
                              onClick={() => handleAddToCart(selectedProduct)}
                              className="w-full py-3 bg-white border border-[#ff4081] text-[#ff4081] rounded-xl text-xs font-bold hover:bg-pink-50/50 cursor-pointer transition-all active:scale-[0.98]"
                            >
                              🛒 THÊM VÀO GIỎ HÀNG
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                              <h4 className="text-xs font-bold text-gray-800 uppercase">Cấu hình tham số cơ thể</h4>
                              <button onClick={() => setShowTryonForm(false)} className="text-[10px] text-gray-450 hover:text-gray-600 font-bold">Quay lại</button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-gray-450 uppercase block mb-1">Chiều cao (cm)</label>
                                <input
                                  type="number"
                                  value={height}
                                  onChange={e => setHeight(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-450 uppercase block mb-1">Cân nặng (kg)</label>
                                <input
                                  type="number"
                                  value={weight}
                                  onChange={e => setWeight(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-gray-450 uppercase block mb-1">Giới tính cơ thể</label>
                                <select
                                  value={gender}
                                  onChange={e => setGender(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-750 outline-none"
                                >
                                  <option value="female">👩 Thân Nữ</option>
                                  <option value="male">👨 Thân Nam</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-450 uppercase block mb-1">Kích cỡ đặt mua</label>
                                <select
                                  value={size}
                                  onChange={e => setSize(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-750 outline-none"
                                >
                                  <option value="S">Size S (Gợi ý)</option>
                                  <option value="M">Size M</option>
                                  <option value="L">Size L</option>
                                  <option value="XL">Size XL</option>
                                  <option value="XXL">Size XXL</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-450 uppercase block mb-1.5">Ảnh khuôn mặt của bạn</label>
                              <div className="flex items-center gap-3">
                                {facePreview ? (
                                  <img src={facePreview} className="w-12 h-12 rounded-xl object-cover border border-gray-200" alt="" />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xs">📷</div>
                                )}
                                <label className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer block transition-colors">
                                  Tải ảnh lên
                                  <input type="file" accept="image/*" onChange={handleFaceFileChange} className="hidden" />
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3 pt-6 border-t border-gray-100">
                            {aiError && (
                              <div className="p-3 bg-red-50 text-red-500 text-[10px] rounded-lg leading-relaxed font-medium">
                                ⚠️ Lỗi: {aiError}
                              </div>
                            )}

                            <button
                              onClick={handleStartAI}
                              disabled={loadingAI}
                              className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                                loadingAI ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-[#ff4081] hover:bg-pink-600 shadow-[#ff4081]/15'
                              }`}
                            >
                              {loadingAI ? '🔮 ĐANG KHỞI TẠO MẪU AI...' : '🔮 BẮT ĐẦU THỬ ĐỒ AI (TIÊU TỐN 1 XU)'}
                            </button>
                            <p className="text-[9px] text-gray-400 font-semibold text-center uppercase tracking-wide">Thời gian xử lý dự kiến khoảng 15-20 giây</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ===== MODAL GIỎ HÀNG ===== */}
        {showCartModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#fff0f5]">
                <h3 className="text-sm font-bold text-gray-800">🛒 GIỎ HÀNG CỦA BẠN</h3>
                <button onClick={() => { setShowCartModal(false); setCheckoutStep(1); }} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
              </div>

              {checkoutStep === 1 && (
                <div className="p-6 flex flex-col justify-between min-h-[300px]">
                  {cart.length === 0 ? (
                    <div className="text-center py-12 space-y-3 flex-1 flex flex-col justify-center">
                      <span className="text-4xl">🛒</span>
                      <p className="text-xs text-gray-400 font-bold">Giỏ hàng đang trống.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex gap-3 justify-between items-center border-b border-gray-50 pb-3 last:border-0">
                          <img src={item.image} className="w-10 h-10 object-contain rounded border bg-gray-50" alt="" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-gray-800 truncate">{item.name}</h4>
                            <p className="text-[10px] text-gray-400 font-medium">Size: {item.size} x {item.quantity}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-[#ff4081] block">₫{(item.price * item.quantity).toLocaleString()}</span>
                            <button onClick={() => handleRemoveFromCart(idx)} className="text-[9px] text-red-500 font-bold hover:underline mt-0.5">Xóa</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-gray-150 pt-4 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs text-gray-500 font-bold">Tổng thanh toán:</span>
                      <span className="text-sm font-black text-[#ff4081]">₫{totalCartAmount.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => cart.length > 0 && setCheckoutStep(2)}
                      disabled={cart.length === 0}
                      className="w-full py-3 bg-[#ff4081] text-white font-bold text-xs rounded-xl hover:bg-pink-600 disabled:opacity-50 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      TIẾP TỤC ĐẶT HÀNG
                    </button>
                  </div>
                </div>
              )}

              {checkoutStep === 2 && (
                <form onSubmit={handleCheckout} className="p-6 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-450 uppercase block mb-1">Tên người nhận</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.name}
                      onChange={e => setShippingInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-450 uppercase block mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.phone}
                      onChange={e => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-450 uppercase block mb-1">Địa chỉ giao hàng</label>
                    <textarea
                      required
                      rows={2}
                      value={shippingInfo.address}
                      onChange={e => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-150">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(1)}
                      className="flex-1 py-2.5 border border-gray-250 text-gray-500 font-bold rounded-xl text-xs"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#ff4081] text-white font-bold rounded-xl text-xs hover:bg-pink-600 transition-all cursor-pointer"
                    >
                      XÁC NHẬN MUA
                    </button>
                  </div>
                </form>
              )}

              {checkoutStep === 3 && createdOrder && (
                <div className="p-6 text-center space-y-4">
                  <span className="text-4xl">🎉</span>
                  <h4 className="text-sm font-bold text-gray-800">Đặt hàng thành công!</h4>
                  <p className="text-[10px] text-gray-450 font-medium">Vui lòng quét mã QR thanh toán để đơn hàng được duyệt giao sớm nhất.</p>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                    <img
                      src={`https://api.vietqr.io/image/970422-70724012004-compact2.png?amount=${createdOrder.total_amount}&addInfo=ORDER%20${createdOrder._id.slice(-6).toUpperCase()}&accountName=CAP%20DUY%2520THAI`}
                      className="w-40 h-40 mx-auto rounded border"
                      alt=""
                    />
                    <div className="text-[10px] text-gray-500 font-semibold space-y-1">
                      <p>Ngân hàng: MB Bank</p>
                      <p>Tổng tiền: <strong className="text-red-500 text-xs">₫{createdOrder.total_amount.toLocaleString()}</strong></p>
                      <p>Nội dung CK: <strong className="text-pink-600">ORDER {createdOrder._id.slice(-6).toUpperCase()}</strong></p>
                    </div>
                  </div>

                  <button
                    onClick={() => { setShowCartModal(false); setCheckoutStep(1); }}
                    className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all cursor-pointer"
                  >
                    HOÀN TẤT
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ===== MODAL NẠP XU AI ===== */}
        {showRechargeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-[420px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#fff0f5]">
                <h3 className="text-sm font-bold text-gray-800">🪙 NẠP XU THỬ ĐỒ AI</h3>
                <button onClick={() => { setShowRechargeModal(false); setRechargeQrUrl(null); setIsCheckingRecharge(false); }} className="text-gray-400 hover:text-gray-650 font-bold">✕</button>
              </div>

              <div className="p-6 space-y-4">
                {!rechargeQrUrl ? (
                  <div className="space-y-4">
                    <p className="text-[11px] text-gray-455 leading-relaxed font-semibold">Tỷ lệ quy đổi: <strong className="text-[#ff4081]">10.000 đ = 1 Lượt thử đồ AI (1 xu)</strong>. Hãy chọn số tiền nạp bên dưới:</p>
                    <select
                      value={rechargeAmount}
                      onChange={e => setRechargeAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#ff4081] transition-all cursor-pointer"
                    >
                      <option value="10000">10.000 đ (1 Xu AI)</option>
                      <option value="50000">50.000 đ (5 Xu AI)</option>
                      <option value="100000">100.000 đ (10 Xu AI)</option>
                      <option value="200000">200.000 đ (20 Xu AI)</option>
                    </select>

                    <button
                      onClick={handleGenerateRechargeQR}
                      className="w-full py-3 bg-[#ff4081] text-white font-bold text-xs rounded-xl hover:bg-pink-600 transition-all cursor-pointer shadow active:scale-[0.98]"
                    >
                      TẠO MÃ THANH TOÁN
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-4 animate-in fade-in duration-200">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">QUÉT QR BẰNG APP NGÂN HÀNG ĐỂ CHUYỂN KHOẢN</p>
                    
                    <img src={rechargeQrUrl} className="w-44 h-44 mx-auto rounded-lg border p-1 bg-white shadow-sm" alt="" />
                    
                    <div className="text-[10px] text-gray-500 font-semibold text-left bg-gray-50 p-3 rounded-lg space-y-1">
                      <p>Ngân hàng: <strong className="text-gray-700">MB Bank (Ngân hàng Quân Đội)</strong></p>
                      <p>Số tài khoản: <strong className="text-gray-700">70724012004</strong></p>
                      <p>Chủ tài khoản: <strong className="text-gray-700">CAP DUY THAI</strong></p>
                      <p>Nội dung CK: <strong className="text-pink-600">{rechargeMemo}</strong></p>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#ff4081] font-bold">
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-t-transparent border-[#ff4081] animate-spin"></span>
                      Đang đợi bạn chuyển tiền để tự động cộng xu...
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}
