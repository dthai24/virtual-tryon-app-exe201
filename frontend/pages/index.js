import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { apiUrl } from '../lib/api';

// Nạp động component Viewer3D để tránh lỗi SSR
const Viewer3D = dynamic(() => import('../components/Viewer3D'), {
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
    // male/unisex
    if (height < 162 && weight < 55) return 'S';
    if (height >= 180 || weight >= 80) return 'XXL';
    if (weight >= 72 || height >= 175) return 'XL';
    if (weight >= 63 || height >= 168) return 'L';
    return 'M';
  }
}

export default function Home() {
  const router = useRouter();

  // ============================================================
  // STATE HỆ THỐNG & USER
  // ============================================================
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null); // Sản phẩm đang xem chi tiết

  // Lịch sử Buyer
  const [tryonHistory, setTryonHistory] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [activeProfileTab, setActiveProfileTab] = useState('tryon'); // tryon | orders
  const [showProfileModal, setShowProfileModal] = useState(false);

  // State phục vụ Nạp xu ngân hàng thật
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState({ coins: 12, vnd: 100000 });
  const [checkingPayment, setCheckingPayment] = useState(false);

  // State phục vụ Giỏ hàng (Cart)
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({ name: '', phone: '', address: '' });
  const [checkoutResult, setCheckoutResult] = useState(null);

  // State phục vụ Form AI Try-on
  const [showTryonForm, setShowTryonForm] = useState(false);
  const [faceFile, setFaceFile] = useState(null);
  const [facePreview, setFacePreview] = useState(null);
  const [height, setHeight] = useState(168);
  const [weight, setWeight] = useState(55);
  const [gender, setGender] = useState('female');
  const [selectedSize, setSelectedSize] = useState('M');
  const [aiAction, setAiAction] = useState(null); // image | video
  
  // State nhận kết quả AI
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiResultUrl, setAiResultUrl] = useState(null);
  const [aiImageUrl, setAiImageUrl] = useState(null);
  const [aiHistoryId, setAiHistoryId] = useState(null);
  const [aiError, setAiError] = useState(null);

  // ============================================================
  // LOAD DỮ LIỆU ĐẦU VÀO
  // ============================================================
  useEffect(() => {
    // 1. Kiểm tra trạng thái đăng nhập từ localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Đồng bộ thông tin mới từ backend (như Credits)
      fetchUserCredits(parsedUser._id);
      fetchBuyerHistory(parsedUser._id);
      fetchBuyerOrders(parsedUser._id);
    }

    // 2. Tải giỏ hàng từ localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // 3. Lấy danh sách sản phẩm từ MongoDB
    fetchProductsList();
  }, []);

  // Lấy danh sách sản phẩm
  const fetchProductsList = () => {
    setLoadingProducts(true);
    fetch(apiUrl('/api/products'))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new TypeError("Dữ liệu sản phẩm không hợp lệ!");
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setProducts(data.data);
        }
        setLoadingProducts(false);
      })
      .catch((err) => {
        console.error('Lỗi tải sản phẩm:', err.message);
        setLoadingProducts(false);
      });
  };

  // Đồng bộ credits từ backend
  const fetchUserCredits = (userId) => {
    fetch(apiUrl('/api/user/test'))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new TypeError("Dữ liệu credits không hợp lệ!");
        }
        return res.json();
      })
      .then(data => {
        if (data.success && data.user && data.user._id === userId) {
          setUser(prev => {
            const updated = { ...prev, credits: data.user.credits };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
          });
        }
      })
      .catch(err => console.error('Lỗi đồng bộ credits:', err.message));
  };

  // Lấy lịch sử thử đồ
  const fetchBuyerHistory = (userId) => {
    fetch(apiUrl(`/api/tryon/history/${userId}`))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new TypeError("Dữ liệu lịch sử thử đồ không hợp lệ!");
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setTryonHistory(data.data);
        }
      })
      .catch(err => console.error('Lỗi tải lịch sử thử đồ:', err.message));
  };

  // Lấy lịch sử đơn hàng
  const fetchBuyerOrders = (userId) => {
    fetch(apiUrl(`/api/orders/buyer/${userId}`))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new TypeError("Dữ liệu lịch sử mua hàng không hợp lệ!");
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setOrderHistory(data.data);
        }
      })
      .catch(err => console.error('Lỗi tải lịch sử mua hàng:', err.message));
  };

  // ============================================================
  // XỬ LÝ ĐĂNG XUẤT
  // ============================================================
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setTryonHistory([]);
    setOrderHistory([]);
    setCart([]);
    localStorage.removeItem('cart');
    router.push('/');
  };

  // ============================================================
  // XỬ LÝ GIỎ HÀNG (SHOPPING CART)
  // ============================================================
  const addToCart = (product, size) => {
    if (!user) {
      alert('Vui lòng đăng nhập với vai trò Người mua để thêm sản phẩm vào giỏ hàng!');
      router.push('/login');
      return;
    }
    
    const itemSize = size || 'M';
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product_id === product._id && item.size === itemSize);
      let newCart;
      if (existingItem) {
        newCart = prevCart.map(item =>
          (item.product_id === product._id && item.size === itemSize) ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newCart = [...prevCart, {
          product_id: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          size: itemSize,
          shop_id: product.shop_id?._id || product.shop_id,
          shop_name: product.shop_id?.name || 'SmartFit Store',
          image: product.garment_image_public_url
        }];
      }
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });

    alert(`Đã thêm "${product.name}" (Size ${itemSize}) vào giỏ hàng!`);
  };

  const updateCartQuantity = (productId, size, amount) => {
    setCart(prevCart => {
      const newCart = prevCart.map(item => {
        if (item.product_id === productId && item.size === size) {
          const newQty = item.quantity + amount;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  // Đặt hàng (Checkout)
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      alert('Vui lòng nhập đầy đủ thông tin nhận hàng!');
      return;
    }

    setCheckoutResult(null);

    // Group sản phẩm trong giỏ hàng theo Shop để tạo các đơn hàng riêng biệt
    const itemsByShop = {};
    cart.forEach(item => {
      if (!itemsByShop[item.shop_id]) {
        itemsByShop[item.shop_id] = [];
      }
      itemsByShop[item.shop_id].push({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size || 'M'
      });
    });

    try {
      let hasError = false;
      
      // Tạo từng đơn hàng cho mỗi shop
      for (const shopId of Object.keys(itemsByShop)) {
        const shopItems = itemsByShop[shopId];
        const totalAmount = shopItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const response = await fetch(apiUrl('/api/orders/create'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyer_id: user._id,
            shop_id: shopId,
            items: shopItems,
            total_amount: totalAmount,
            shipping_info: shippingInfo
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          hasError = true;
          break;
        }
      }

      if (!hasError) {
        setCheckoutResult({ type: 'success', message: 'Đặt hàng thành công! Đơn hàng đã được gửi đến các shop.' });
        setCart([]);
        localStorage.removeItem('cart');
        fetchBuyerOrders(user._id); // Reload đơn hàng
        // Tự động đóng modal sau 2 giây
        setTimeout(() => {
          setShowCartModal(false);
          setCheckoutResult(null);
          setShippingInfo({ name: '', phone: '', address: '' });
        }, 2000);
      } else {
        setCheckoutResult({ type: 'error', message: 'Có lỗi xảy ra trong quá trình xử lý đặt hàng.' });
      }
    } catch (err) {
      setCheckoutResult({ type: 'error', message: 'Lỗi kết nối tới Server: ' + err.message });
    }
  };

  // ============================================================
  // XỬ LÝ LỰA CHỌN & CHẠY DEMO CHO KHÁCH GUEST
  // ============================================================
  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    setShowTryonForm(false);
    setFaceFile(null);
    setFacePreview(null);
    setAiResultUrl(null);
    setAiImageUrl(null);
    setAiHistoryId(null);
    setAiError(null);
    setSelectedSize(getRecommendedSize(gender, height, weight));
  };

  const handleGenderChange = (newGender) => {
    setGender(newGender);
    setSelectedSize(getRecommendedSize(newGender, height, weight));
  };

  const handleHeightChange = (newHeight) => {
    setHeight(newHeight);
    setSelectedSize(getRecommendedSize(gender, newHeight, weight));
  };

  const handleWeightChange = (newWeight) => {
    setWeight(newWeight);
    setSelectedSize(getRecommendedSize(gender, height, newWeight));
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
  };

  const handleFaceFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaceFile(file);
      setFacePreview(URL.createObjectURL(file));
    }
  };

  // Khách bấm xem Demo Catwalk có sẵn
  const handlePlayDemoVideo = () => {
    setAiResultUrl('https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-dress-walking-in-studio-41480-large.mp4');
  };

  // ============================================================
  // GỬI YÊU CẦU XỬ LÝ AI TRY-ON (DÀNH CHO BUYER)
  // ============================================================
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
        
        // Reload lịch sử thử đồ
        fetchBuyerHistory(user._id);
        if (data.data.video_error) {
          setAiError(data.data.video_error);
        }
      } else {
        if (response.status === 413) {
          setAiError('Ảnh tải lên quá lớn. Vui lòng chọn ảnh nhỏ hơn 15MB.');
          return;
        }
        setAiError(data.message || 'Xử lý AI thất bại. Vui lòng kiểm tra lại!');
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
        fetchBuyerHistory(user._id);
      } else {
        setAiError(data.message || 'Dựng video catwalk thất bại. Vui lòng thử lại!');
      }
    } catch (err) {
      setAiError('Lỗi kết nối tới Server Gateway: ' + err.message);
    } finally {
      setLoadingAI(false);
      setAiAction(null);
    }
  };

  // ============================================================
  // NẠP TIỀN THẬT LẤY XU AI (VIETQR SIMULATION)
  // ============================================================
  const handleOpenRecharge = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để nạp xu AI!');
      return;
    }
    setSelectedPackage({ coins: 12, vnd: 100000 }); // Mặc định gói phổ biến
    setShowRechargeModal(true);
  };

  const handleConfirmRecharge = async () => {
    if (!user || !selectedPackage) return;
    setCheckingPayment(true);

    const initialCredits = user.credits;
    let attempts = 0;
    const maxAttempts = 6; // Kiểm tra 6 lần, mỗi lần cách nhau 3 giây (tổng 18 giây)

    const checkInterval = setInterval(async () => {
      attempts++;
      try {
        const response = await fetch(apiUrl(`/api/tryon/check-recharge/${user._id}`));
        const data = await response.json();

        if (response.ok && data.success) {
          if (data.credits > initialCredits) {
            clearInterval(checkInterval);
            const addedCoins = data.credits - initialCredits;
            const updatedUser = { ...user, credits: data.credits };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            alert(`🎉 Giao dịch thành công ngân hàng thực tế!\nHệ thống đã phát hiện biến động số dư tăng từ tài khoản ngân hàng của bạn và tự động cộng thêm ${addedCoins} xu AI.`);
            setShowRechargeModal(false);
            setCheckingPayment(false);
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            alert(`⏳ Hệ thống ngân hàng chưa hoàn thành giao dịch.\nNếu bạn đã chuyển tiền thành công, vui lòng chờ 1-2 phút để tiền vào tài khoản và nhấn nút "Tôi đã chuyển khoản thành công" để đối soát lại nhé!`);
            setCheckingPayment(false);
          }
        } else {
          if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            alert('Có lỗi xảy ra khi đối soát giao dịch ngân hàng. Vui lòng thử lại sau.');
            setCheckingPayment(false);
          }
        }
      } catch (err) {
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          alert('Lỗi kết nối tới hệ thống ngân hàng đối soát: ' + err.message);
          setCheckingPayment(false);
        }
      }
    }, 3000);
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      <Head>
        <title>SmartFit — Sàn TMĐT B2B2C Tích Hợp AI Try-on</title>
      </Head>

      <div className="min-h-screen bg-gray-50 pb-20" style={{ fontFamily: "'Inter', sans-serif" }}>
        
        {/* ===== TOP NAVBAR ===== */}
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-[1200px] mx-auto px-6 h-[70px] flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff4081] to-[#ff80ab] flex items-center justify-center shadow-md shadow-[#ff4081]/20">
                <span className="text-white text-lg font-black" style={{ fontFamily: "'Montserrat', sans-serif" }}>S</span>
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wider text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>SMART FIT</h1>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">B2B2C AI Platform</p>
              </div>
            </div>

            {/* Right Menu: Guest vs Logged User */}
            <div className="flex items-center gap-4">
              
              {user ? (
                <>
                  {/* Nếu là Seller thì hiển thị nút đi tới Dashboard */}
                  {user.role === 'shop_owner' && (
                    <button
                      onClick={() => router.push('/shop/dashboard')}
                      className="px-4 py-2 bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded-xl text-xs font-bold shadow-md shadow-[#ee4d2d]/15 transition-all cursor-pointer"
                    >
                      🏪 Kênh Người Bán
                    </button>
                  )}

                  {/* Giỏ hàng */}
                  {user.role === 'buyer' && (
                    <button
                      onClick={() => setShowCartModal(true)}
                      className="relative p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm transition-colors cursor-pointer mr-2"
                    >
                      🛒
                      {totalCartItems > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-[#ff4081] text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                          {totalCartItems}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Thông tin Buyer & Xu */}
                  <div 
                    onClick={() => {
                      if (user.role === 'buyer') {
                        setShowProfileModal(true);
                      }
                    }}
                    className={`flex items-center gap-4 bg-gray-50 border border-gray-100 px-4 py-1.5 rounded-xl ${
                      user.role === 'buyer' ? 'cursor-pointer hover:bg-gray-100 hover:border-gray-200 transition-all' : ''
                    }`}
                    title={user.role === 'buyer' ? "Xem hồ sơ & lịch sử" : ""}
                  >
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-700 flex items-center gap-1">
                        {user.username}
                        {user.role === 'buyer' && <span className="text-[10px]">👤</span>}
                      </p>
                      <p className="text-[9px] text-[#ff4081] font-bold uppercase tracking-wider">
                        {user.role === 'buyer' ? 'Người Mua' : 'Người Bán'}
                      </p>
                    </div>
                    {user.role === 'buyer' && (
                      <>
                        <div className="h-8 w-[1px] bg-gray-200"></div>
                        <div className="text-center flex items-center gap-2">
                          <div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Xu AI</p>
                            <span className="text-xs font-black text-gray-800">🪙 {user.credits}</span>
                          </div>
                          <button
                            onClick={handleOpenRecharge}
                            className="w-5 h-5 bg-[#ff4081] text-white text-[10px] rounded-full flex items-center justify-center font-bold hover:bg-[#ff80ab] active:scale-[0.9] transition-all cursor-pointer"
                            title="Nạp tiền thật lấy xu AI"
                          >
                            +
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Đăng xuất */}
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-400 hover:text-red-500 font-bold cursor-pointer transition-colors"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                // Nút đăng nhập dành cho Guest
                <button
                  onClick={() => router.push('/login')}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#ff4081] to-[#ff80ab] text-white rounded-xl text-xs font-bold shadow-md shadow-[#ff4081]/15 hover:shadow-lg transition-all cursor-pointer"
                >
                   Đăng nhập 
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ===== BANNER CHÀO MỪNG ===== */}
        <section className="bg-gradient-to-r from-[#ff4081]/10 to-[#ff80ab]/5 py-12 border-b border-gray-100">
          <div className="max-w-[1200px] mx-auto px-6 text-center md:text-left md:flex items-center justify-between">
            <div>
              <span className="bg-[#ff4081]/10 text-[#ff4081] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Ứng dụng Mua Sắm Thế Hệ Mới
              </span>
              <h2 className="text-3xl font-black text-gray-800 mt-4 leading-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Thử Đồ Ảo AI & Catwalk Video
              </h2>
              <p className="text-gray-500 text-xs mt-2 max-w-[620px] leading-relaxed">
                Đột phá trải nghiệm TMĐT. Khách hàng có thể tự do ghép khuôn mặt của mình vào sản phẩm thời trang và dựng mô phỏng video Catwalk di chuyển thực tế theo đúng may đo cơ thể!
              </p>
            </div>
            
            <div className="mt-6 md:mt-0 flex gap-3 justify-center">
             
              <button 
                onClick={() => {
                  const element = document.getElementById('catalog');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 bg-gradient-to-r from-[#ff4081] to-[#ff80ab] text-white rounded-xl text-xs font-bold shadow-md shadow-[#ff4081]/25 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
              >
                ✨ Mua sắm & Thử đồ ngay
              </button>
            </div>
          </div>
        </section>

        {/* ===== DANH SÁCH SẢN PHẨM GRID ===== */}
        <main id="catalog" className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <span className="w-1.5 h-6 bg-[#ff4081] rounded-full"></span>
              Sản phẩm Gợi ý hôm nay
            </h3>
            <span className="text-[11px] text-gray-400 font-semibold bg-white border border-gray-200 px-2.5 py-1 rounded-lg">
              Tích hợp AI Virtual Try-on
            </span>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-xl p-4">
                  <div className="bg-gray-100 w-full h-[220px] rounded-lg"></div>
                  <div className="h-4 bg-gray-100 w-3/4 rounded mt-4"></div>
                  <div className="h-3 bg-gray-100 w-1/2 rounded mt-2"></div>
                  <div className="h-8 bg-gray-100 w-full rounded mt-4"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
              <span className="text-4xl">🛍️</span>
              <p className="text-sm font-semibold text-gray-400 mt-3">Chưa có sản phẩm nào được đăng bán.</p>
              <p className="text-xs text-gray-300 mt-1">Vui lòng đăng nhập với tài khoản Seller để đăng sản phẩm đầu tiên của bạn.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="relative pt-[120%] bg-gray-50 overflow-hidden">
                    <img
                      src={product.garment_image_public_url}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-gray-900/10 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-md text-gray-700 capitalize">
                      {product.category === 'female' ? 'Thời trang Nữ' : product.category === 'male' ? 'Thời trang Nam' : 'Unisex'}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[#ff4081] tracking-wider uppercase mb-1 truncate">
                        🏪 {product.shop_id?.name || 'SmartFit Store'}
                      </p>
                      <h4 className="text-xs font-bold text-gray-700 line-clamp-2 min-h-[32px] mb-2">
                        {product.name}
                      </h4>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-[10px] font-bold text-gray-400">₫</span>
                        <span className="text-sm font-black text-gray-800">
                          {product.price.toLocaleString('vi-VN')}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenDetail(product)}
                        className="w-full py-2.5 bg-gray-50 group-hover:bg-[#ff4081] border border-gray-200 group-hover:border-transparent text-[11px] font-bold text-gray-600 group-hover:text-white rounded-xl shadow-sm transition-all duration-300 cursor-pointer text-center"
                      >
                        Chi tiết & Thử đồ AI
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* ===== MODAL CHI TIẾT SẢN PHẨM & AI TRY-ON ===== */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-[850px] max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              
              {/* Nút đóng */}
              <button
                onClick={handleCloseDetail}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer transition-colors z-10"
              >
                ✕
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                
                {/* CỘT TRÁI: THÔNG TIN SẢN PHẨM VÀ AI VIEWPORT */}
                <div className="p-8 border-r border-gray-100">
                  
                  {/* Nếu đã có kết quả AI */}
                  {aiResultUrl ? (
                    <div className="mb-4 [&>p:nth-of-type(2)]:hidden">
                      <p className="text-[10px] font-bold text-[#ff4081] uppercase tracking-wider mb-2">
                        {/\.(mp4|webm|ogg)(\?|$)/i.test(aiResultUrl) ? 'Kết quả video catwalk' : 'Kết quả ảnh thử đồ AI'}
                      </p>
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
                              : 'bg-gradient-to-r from-[#ff4081] to-[#ff80ab] text-white shadow-md shadow-[#ff4081]/15 hover:shadow-lg'
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
                    // Hiển thị ảnh trang phục
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

                  {/* Thông tin chữ */}
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

                {/* CỘT PHẢI: INTERACTIVE AI TRY-ON FORM HOẶC BLUR BANNER CHO GUEST */}
                <div className="p-8 bg-gray-50/50 flex flex-col justify-between min-h-[450px]">
                  
                  {!user ? (
                    // Trải nghiệm Guest: KHÓA BẰNG BANNER YÊU CẦU ĐĂNG NHẬP
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
                          className="w-full py-3.5 bg-gradient-to-r from-[#ff4081] to-[#ff80ab] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
                        >
                          🚪 ĐĂNG NHẬP ĐỂ TỰ THỬ ĐỒ
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Trải nghiệm Buyer: CHẠY HỆ THỐNG TRY-ON AI
                    <>
                      {!showTryonForm ? (
                        // Lời kêu gọi Thử đồ AI
                        <div className="flex-1 flex flex-col justify-center items-center text-center py-12">
                          <span className="text-5xl animate-bounce">🔮</span>
                          <h4 className="text-base font-bold text-gray-800 mt-4">Tự ghép mặt bằng AI</h4>
                          <p className="text-[0px] text-gray-400 max-w-[280px] mt-2 leading-relaxed">
                            <span className="text-xs">Tạo ảnh thử đồ nhanh, có thể bật thêm video catwalk trong bước tiếp theo.</span>
                            Mất khoảng 15 giây để mô phỏng hình ảnh bạn mặc sản phẩm này catwalk.
                          </p>
                          
                          {/* Cảnh báo credit */}
                          {user.credits <= 0 && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl max-w-[280px]">
                              <p className="text-[10px] text-red-600 font-semibold leading-relaxed">
                                ⚠️ Bạn đã hết Credit. Hãy bấm vào nút nạp xu 🪙 trên thanh menu để thử đồ!
                              </p>
                            </div>
                          )}

                          <button
                            disabled={user.credits <= 0}
                            onClick={() => setShowTryonForm(true)}
                            className={`w-full max-w-[280px] mt-6 py-3.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                              user.credits <= 0
                                ? 'bg-gray-300 shadow-none cursor-not-allowed'
                                : 'bg-gradient-to-r from-[#ff4081] to-[#ff80ab] shadow-[#ff4081]/25 hover:shadow-xl active:scale-[0.98]'
                            }`}
                          >
                            ⚡ BẮT ĐẦU GHÉP MẶT AI
                            <span className="bg-white/20 text-[10px] px-1.5 py-0.2 rounded">-1 🪙</span>
                          </button>
                        </div>
                      ) : (
                        // Form khai báo chỉ số AI
                        <form onSubmit={(e) => e.preventDefault()} className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-gray-800 mb-5 pb-2 border-b border-gray-200/60 flex items-center gap-2">
                              <span className="w-1 h-4 bg-[#ff4081] rounded-full"></span>
                              Thông số may đo AI
                            </h4>

                            {/* Chọn ảnh mặt */}
                            <div className="mb-4">
                              <span className="text-[10px] font-bold text-gray-500 uppercase block mb-2">1. Upload ảnh chân dung của bạn *</span>
                              {!facePreview ? (
                                <label
                                  htmlFor="face-upload"
                                  className="flex flex-col items-center justify-center w-full h-[100px] border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#ff4081] hover:bg-[#ff4081]/5 transition-all"
                                >
                                  <span className="text-xl">📸</span>
                                  <span className="text-[10px] text-gray-400 mt-1 font-semibold">Chọn hình chân dung sáng rõ mặt</span>
                                  <input
                                    id="face-upload"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleFaceFileChange}
                                    className="hidden"
                                  />
                                </label>
                              ) : (
                                <div className="relative w-[80px] h-[80px] border border-gray-200 rounded-xl overflow-hidden group">
                                  <img src={facePreview} alt="Preview mặt" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => { setFaceFile(null); setFacePreview(null); }}
                                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-[10px] cursor-pointer hover:bg-red-500"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Chọn Giới Tính */}
                            <div className="mb-4">
                              <span className="text-[10px] font-bold text-gray-500 uppercase block mb-2">2. Giới tính của người mẫu</span>
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleGenderChange('female')}
                                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                    gender === 'female'
                                      ? 'border-[#ff4081] bg-[#ff4081]/5 text-[#ff4081]'
                                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                  }`}
                                >
                                  👩 Nữ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleGenderChange('male')}
                                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                    gender === 'male'
                                      ? 'border-[#ff4081] bg-[#ff4081]/5 text-[#ff4081]'
                                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                  }`}
                                >
                                  👨 Nam
                                </button>
                              </div>
                            </div>

                            {/* Chiều cao */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">3. Chiều cao mẫu</span>
                                <span className="text-xs font-bold text-[#ff4081]">{height} cm</span>
                              </div>
                              <input
                                type="range"
                                min="140"
                                max="200"
                                value={height}
                                onChange={(e) => handleHeightChange(Number(e.target.value))}
                                className="w-full accent-[#ff4081] h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>

                            {/* Cân nặng */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">4. Cân nặng mẫu</span>
                                <span className="text-xs font-bold text-[#ff4081]">{weight} kg</span>
                              </div>
                              <input
                                type="range"
                                min="40"
                                max="100"
                                value={weight}
                                onChange={(e) => handleWeightChange(Number(e.target.value))}
                                className="w-full accent-[#ff4081] h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>

                            {/* Gợi ý size áo */}
                            <div className="mb-4 p-3 bg-gradient-to-r from-[#ff4081]/10 to-[#ff80ab]/5 border border-[#ff4081]/20 rounded-xl">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">📏 Gợi ý size áo của bạn</span>
                                <span className="text-xs font-black text-[#ff4081] bg-white px-2.5 py-1 rounded-lg shadow-sm border border-[#ff4081]/25">
                                  Size {getRecommendedSize(gender, height, weight)}
                                </span>
                              </div>
                              <p className="text-[9px] text-gray-400 mt-1 leading-normal">
                                Hệ thống tự động gợi ý dựa trên giới tính ({gender === 'female' ? 'Nữ' : 'Nam'}), chiều cao ({height}cm) và cân nặng ({weight}kg).
                              </p>
                            </div>
                          </div>

                          {/* Thông báo lỗi AI */}
                          {aiError && (
                            <div className="my-2 p-2 bg-red-50 border border-red-100 rounded-lg text-[9px] text-red-600 font-semibold leading-relaxed">
                              ⚠️ {aiError}
                            </div>
                          )}

                          <div className="flex gap-2 mt-4">
                            <button
                              type="button"
                              disabled={loadingAI}
                              onClick={() => setShowTryonForm(false)}
                              className={`px-3 py-2.5 bg-white border border-gray-200 text-gray-500 hover:border-gray-300 rounded-xl text-xs font-bold transition-all ${
                                loadingAI
                                  ? 'cursor-not-allowed opacity-60'
                                  : 'cursor-pointer'
                              }`}
                            >
                              Quay lại
                            </button>
                            <button
                              type="button"
                              disabled={loadingAI}
                              onClick={handleStartAI}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-md ${
                                loadingAI
                                  ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                  : 'bg-gradient-to-r from-[#ff4081] to-[#ff80ab] shadow-[#ff4081]/15 hover:shadow-lg active:scale-[0.98] cursor-pointer'
                              }`}
                            >
                              {loadingAI && aiAction === 'image' ? 'Đang tạo ảnh thử đồ...' : 'Tạo ảnh thử đồ'}
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}

                  {/* BOTTOM ACTION: BUY / ADD TO CART */}
                  <div className="mt-6 pt-4 border-t border-gray-200/60 space-y-4">
                    {/* Chọn kích cỡ (Size) */}
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Chọn kích cỡ áo</span>
                      <div className="flex gap-2">
                        {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSize(sz)}
                            className={`w-10 h-10 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              selectedSize === sz
                                ? 'border-[#ff4081] bg-[#ff4081] text-white shadow-md'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(selectedProduct, selectedSize)}
                      className="w-full py-3 bg-[#ff4081] hover:bg-[#ff80ab] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      🛒 THÊM VÀO GIỎ HÀNG
                    </button>
                  </div>

                </div>

              </div>

            </div>
          </div>
        )}

        {/* ===== MODAL GIỎ HÀNG & THANH TOÁN ===== */}
        {showCartModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-[650px] shadow-2xl p-8 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              
              {/* Nút đóng */}
              <button
                onClick={() => setShowCartModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>

              <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <span>🛒</span> Giỏ hàng của bạn
              </h3>

              {checkoutResult && (
                <div className={`p-4 rounded-xl border mb-6 text-xs font-bold ${
                  checkoutResult.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {checkoutResult.message}
                </div>
              )}

              {cart.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 font-bold">
                  Giỏ hàng của bạn đang trống.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Danh sách sản phẩm trong giỏ */}
                  <div className="divide-y divide-gray-100 max-h-[200px] overflow-y-auto pr-2">
                    {cart.map(item => (
                      <div key={`${item.product_id}-${item.size}`} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-gray-50 overflow-hidden border border-gray-100 p-0.5 flex-shrink-0">
                            <img src={item.image} alt="Product" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-800 line-clamp-1 max-w-[220px]">{item.name}</h4>
                            <span className="text-[10px] text-gray-400 block font-semibold">
                              Shop: {item.shop_name} | Size: <span className="text-[#ff4081] font-bold">{item.size}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Bộ tăng giảm */}
                          <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1">
                            <button
                              onClick={() => updateCartQuantity(item.product_id, item.size, -1)}
                              className="text-gray-500 hover:text-gray-900 font-bold px-1.5 cursor-pointer text-xs"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold px-2 text-gray-700">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product_id, item.size, 1)}
                              className="text-gray-500 hover:text-gray-900 font-bold px-1.5 cursor-pointer text-xs"
                            >
                              +
                            </button>
                          </div>
                          
                          <span className="text-xs font-black text-gray-800 w-[80px] text-right">
                            {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tổng kết tiền */}
                  <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
                    <span className="text-xs text-gray-400 font-bold uppercase">Tổng giá trị đơn hàng:</span>
                    <span className="text-lg font-black text-[#ff4081]">
                      {totalCartPrice.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>

                  {/* FORM ĐIỀN THÔNG TIN GIAO HÀNG */}
                  <form onSubmit={handleCheckout} className="border-t border-gray-100 pt-6 space-y-4">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Thông tin giao hàng</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Tên người nhận *</label>
                        <input
                          type="text"
                          required
                          value={shippingInfo.name}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nguyễn Văn A"
                          className="w-full h-[38px] px-3 bg-gray-50 border border-gray-200 focus:border-[#ff4081] rounded-lg text-xs text-gray-800 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Số điện thoại *</label>
                        <input
                          type="tel"
                          required
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="09xxxxxxxx"
                          className="w-full h-[38px] px-3 bg-gray-50 border border-gray-200 focus:border-[#ff4081] rounded-lg text-xs text-gray-800 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Địa chỉ nhận hàng *</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Số nhà, đường, phường, quận, thành phố"
                        className="w-full h-[38px] px-3 bg-gray-50 border border-gray-200 focus:border-[#ff4081] rounded-lg text-xs text-gray-800 outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 mt-2 bg-[#ff4081] hover:bg-[#ff80ab] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      🚀 XÁC NHẬN ĐẶT HÀNG
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
        {/* ===== MODAL HỒ SƠ & LỊCH SỬ BUYER ===== */}
        {showProfileModal && user && user.role === 'buyer' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-[850px] shadow-2xl p-8 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              
              {/* Nút đóng */}
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ff4081] to-[#ff80ab] flex items-center justify-center text-white text-xl font-bold">
                  👤
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {user.username}
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold">{user.email} • {user.credits} xu AI 🪙</p>
                </div>
                <button
                  onClick={handleOpenRecharge}
                  className="ml-auto px-4 py-2 bg-gradient-to-r from-[#ff4081] to-[#ff80ab] text-white text-xs rounded-xl font-bold hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
                >
                  🪙 Nạp thêm xu
                </button>
              </div>

              {/* Giao diện Tab */}
              <div className="flex border-b border-gray-100 pb-4 mb-6">
                <button
                  onClick={() => setActiveProfileTab('tryon')}
                  className={`px-6 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeProfileTab === 'tryon' ? 'bg-[#ff4081] text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  🔮 Lịch sử thử đồ AI ({tryonHistory.length})
                </button>
                <button
                  onClick={() => setActiveProfileTab('orders')}
                  className={`ml-3 px-6 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeProfileTab === 'orders' ? 'bg-[#ff4081] text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  📦 Đơn hàng của bạn ({orderHistory.length})
                </button>
              </div>

              {/* TAB 1: LỊCH SỬ THỬ ĐỒ AI */}
              {activeProfileTab === 'tryon' && (
                tryonHistory.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center font-medium">Bạn chưa thử đồ AI lần nào.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {tryonHistory.map((item) => (
                      <div 
                        key={item._id} 
                        onClick={() => {
                          setSelectedProduct(item.product_id);
                          setAiResultUrl(item.result_image_url || item.result_video_url);
                          setShowProfileModal(false); // Close profile modal to focus on product detail AI viewer
                        }}
                        className="bg-gray-50 border border-gray-100 rounded-xl p-3 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between"
                      >
                        <div className="relative pt-[120%] rounded-lg overflow-hidden bg-white mb-2">
                          <img src={item.user_face_url} alt="Face" className="absolute inset-0 w-full h-full object-cover" />
                          <span className="absolute bottom-1 right-1 bg-black/60 text-[8px] text-white font-bold px-1 py-0.2 rounded">
                            Xem AI ▶
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-700 truncate">{item.product_id?.name || 'Sản phẩm thử đồ'}</p>
                        <span className="text-[9px] text-[#ff4081] mt-1 font-semibold block">
                          May đo: {item.measurements?.height}cm | {item.measurements?.weight}kg
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* TAB 2: ĐƠN HÀNG CỦA BẠN */}
              {activeProfileTab === 'orders' && (
                orderHistory.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center font-medium">Bạn chưa đặt đơn hàng nào.</p>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {orderHistory.map((order) => {
                      const orderDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      });
                      return (
                        <div key={order._id} className="bg-gray-50 border border-gray-100 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-gray-800">Cửa hàng: {order.shop_id?.name}</span>
                              <span className="text-[10px] text-gray-400">| Ngày đặt: {orderDate}</span>
                            </div>
                            
                            {/* Danh sách items */}
                            <div className="mt-2 space-y-1">
                              {order.items.map((item, index) => (
                                <p key={index} className="text-xs text-gray-600">
                                  • <span className="font-bold">x{item.quantity}</span> {item.name} {item.size && <span className="text-gray-500 font-semibold bg-gray-100 px-1 py-0.5 rounded text-[10px] ml-1">Size {item.size}</span>} ({item.price.toLocaleString('vi-VN')} ₫)
                                </p>
                              ))}
                            </div>
                            
                            <p className="text-[10px] text-gray-400 mt-2">Địa chỉ giao: {order.shipping_info?.address}</p>
                          </div>
                          
                          <div className="text-right flex flex-col items-end gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.8 rounded ${
                              order.status === 'pending' && 'bg-yellow-50 text-yellow-600' ||
                              order.status === 'shipping' && 'bg-blue-50 text-blue-600' ||
                              order.status === 'delivered' && 'bg-green-50 text-green-600' ||
                              order.status === 'cancelled' && 'bg-red-50 text-red-600'
                            }`}>
                              {order.status === 'pending' && '⏳ Đang chờ duyệt'}
                              {order.status === 'shipping' && '🚚 Đang giao hàng'}
                              {order.status === 'delivered' && '✅ Đã giao hàng'}
                              {order.status === 'cancelled' && '❌ Đã hủy đơn'}
                            </span>
                            <span className="text-sm font-black text-gray-800">
                              Tổng cộng: {order.total_amount.toLocaleString('vi-VN')} ₫
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

            </div>
          </div>
        )}

        {/* ===== MODAL NẠP XU (TIỀN THẬT - VIETQR) ===== */}
        {showRechargeModal && user && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-[550px] shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
              
              {/* Nút đóng */}
              <button
                onClick={() => setShowRechargeModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
                disabled={checkingPayment}
              >
                ✕
              </button>

              <div className="text-center mb-6">
                <span className="text-3xl">🪙</span>
                <h3 className="text-lg font-black text-gray-800 mt-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  NẠP XU AI THỬ ĐỒ
                </h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Sử dụng tài khoản ngân hàng thực tế để quét QR nạp xu</p>
              </div>

              {/* Lựa chọn gói */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { coins: 5, vnd: 50000, label: 'Gói Cơ Bản', promo: null },
                  { coins: 12, vnd: 100000, label: 'Gói Phổ Biến', promo: 'Tặng 2 xu' },
                  { coins: 30, vnd: 200000, label: 'Gói VIP', promo: 'Tặng 10 xu' }
                ].map((pkg, idx) => (
                  <div
                    key={idx}
                    onClick={() => !checkingPayment && setSelectedPackage(pkg)}
                    className={`border-2 rounded-xl p-3 text-center cursor-pointer transition-all ${
                      selectedPackage?.coins === pkg.coins
                        ? 'border-[#ff4081] bg-[#ff4081]/5 shadow-sm'
                        : 'border-gray-100 hover:border-gray-200'
                    } ${checkingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {pkg.promo && (
                      <span className="bg-[#ff4081] text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider block mb-1">
                        {pkg.promo}
                      </span>
                    )}
                    <h4 className="text-xs font-bold text-gray-400 block uppercase tracking-wider">{pkg.label}</h4>
                    <span className="text-lg font-black text-gray-800 block mt-1">{pkg.coins} Xu</span>
                    <span className="text-[10px] text-gray-500 font-bold block mt-0.5">{pkg.vnd.toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </div>

              {/* Thông tin chuyển khoản & QR code */}
              {selectedPackage && (
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  
                  {/* Mã QR VietQR */}
                  <div className="text-center">
                    <img
                      src={`https://img.vietqr.io/image/mb-70724012004-compact2.png?amount=${selectedPackage.vnd}&addInfo=NAPXU%20${user._id.substring(user._id.length - 6).toUpperCase()}&accountName=CAP%20DUY%20THAI`}
                      className="mx-auto w-[180px] h-[180px] rounded-xl border border-gray-100 shadow-sm bg-white p-2"
                      alt="VietQR Chuyển Khoản"
                    />
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1 block">Quét QR để chuyển khoản nhanh</span>
                  </div>

                  {/* Thông tin chữ */}
                  <div className="text-xs space-y-2 text-gray-600">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Ngân hàng</span>
                      <span className="font-extrabold text-gray-800">MB Bank (Ngân hàng Quân Đội)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Số tài khoản</span>
                      <span className="font-extrabold text-gray-800">70724012004</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Chủ tài khoản</span>
                      <span className="font-extrabold text-gray-800">CAP DUY THAI</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Số tiền</span>
                      <span className="font-black text-[#ff4081]">{selectedPackage.vnd.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Nội dung chuyển khoản</span>
                      <span className="font-black text-gray-800 bg-yellow-100 px-2 py-0.5 rounded text-[11px] border border-yellow-200">
                        NAPXU {user._id.substring(user._id.length - 6).toUpperCase()}
                      </span>
                    </div>
                  </div>

                </div>
              )}

              {/* Nút hành động */}
              <div className="space-y-2">
                <button
                  onClick={handleConfirmRecharge}
                  disabled={checkingPayment || !selectedPackage}
                  className="w-full py-3 bg-gradient-to-r from-[#ff4081] to-[#ff80ab] text-white text-xs rounded-xl font-bold hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang đối soát giao dịch ngân hàng...
                    </>
                  ) : (
                    'Tôi đã chuyển khoản thành công'
                  )}
                </button>
                <p className="text-[9px] text-gray-400 text-center font-medium">
                  * Hệ thống sẽ tự động đối soát sao kê ngân hàng sau khi bạn nhấn xác nhận.
                </p>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}
