import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  
  // State quản lý chuyển đổi giữa tab Đăng nhập và Đăng ký
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // State lưu trữ thông tin Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('buyer');
  const [shopName, setShopName] = useState('');

  // Hàm điều hướng sau khi xác thực thành công
  const handleAuthSuccess = (userObj) => {
    localStorage.setItem('user', JSON.stringify(userObj));
    setTimeout(() => {
      if (userObj.role === 'shop_owner') {
        router.push('/shop/dashboard');
      } else {
        router.push('/');
      }
    }, 1000);
  };

  // 1. XỬ LÝ ĐĂNG NHẬP THỦ CÔNG
  const handleFormLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Vui lòng điền đủ email và mật khẩu!');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage('Đăng nhập thành công!');
        handleAuthSuccess(data.user);
      } else {
        setErrorMessage(data.message || 'Đăng nhập thất bại!');
      }
    } catch (err) {
      setErrorMessage('Lỗi kết nối tới Server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. XỬ LÝ ĐĂNG KÝ THỦ CÔNG
  const handleFormRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setErrorMessage('Vui lòng điền đủ thông tin đăng ký!');
      return;
    }
    if (role === 'shop_owner' && !shopName) {
      setErrorMessage('Vui lòng nhập tên Cửa hàng/Thương hiệu!');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
          shop_name: role === 'shop_owner' ? shopName : undefined,
        }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage('Đăng ký tài khoản thành công!');
        handleAuthSuccess(data.user);
      } else {
        setErrorMessage(data.message || 'Đăng ký thất bại!');
      }
    } catch (err) {
      setErrorMessage('Lỗi kết nối tới Server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset thông điệp phản hồi khi đổi qua lại giữa các tab
  const switchTab = (isLogin) => {
    setIsLoginTab(isLogin);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <>
      <Head>
        <title>Đăng nhập SmartFit — Trải nghiệm Virtual Try-On</title>
      </Head>

      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center p-6"
        style={{ 
          fontFamily: "'Inter', sans-serif",
          backgroundImage: "linear-gradient(rgba(18, 18, 20, 0.85), rgba(18, 18, 20, 0.85)), url('/images/backgroundd.png')" 
        }}
      >
        {/* LOGO */}
        <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff4081] to-[#ff80ab] flex items-center justify-center shadow-lg shadow-[#ff4081]/20">
            <span className="text-white text-xl font-black" style={{ fontFamily: "'Montserrat', sans-serif" }}>S</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>SMART FIT</h1>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">B2B2C AI Platform</p>
          </div>
        </div>

        {/* CONTAINER CHÍNH */}
        <div className="w-full max-w-[950px] grid grid-cols-1 md:grid-cols-2 bg-[#1e1e24]/80 backdrop-blur-md border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* CỘT 1: THÔNG ĐIỆP BRANDING / QUOTES */}
          <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-gray-800 bg-black/20 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#ff4081] bg-[#ff4081]/10 px-3 py-1 rounded-full uppercase">
                Trải nghiệm tương lai
              </span>
              <h2 className="text-2xl font-black text-white mt-6 leading-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Cá nhân hóa <br /> phong cách thời trang <br /> của riêng bạn.
              </h2>
              <p className="text-sm text-gray-400 mt-6 leading-relaxed border-l-2 border-[#ff4081] pl-4 italic">
                "Công nghệ không thay thế thời trang, nó giúp bạn nhìn thấy phiên bản hoàn hảo nhất của chính mình trước khi quyết định sở hữu."
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#121216]/50 rounded-2xl border border-white/5">
                  <div className="text-2xl mb-2">⚡</div>
                  <h4 className="text-xs font-bold text-white mb-1">AI Catwalk</h4>
                  <p className="text-[10px] text-gray-500">Mô phỏng hình thể thực tế</p>
                </div>
                <div className="p-4 bg-[#121216]/50 rounded-2xl border border-white/5">
                  <div className="text-2xl mb-2">👗</div>
                  <h4 className="text-xs font-bold text-white mb-1">Thử đồ ảo</h4>
                  <p className="text-[10px] text-gray-500">Thử mọi outfit trong 3s</p>
                </div>
              </div>
              <div className="text-[10px] text-gray-500">
                Được cung cấp bởi công nghệ AI thế hệ mới nhất. <br/>
                SmartFit © 2026. All Rights Reserved.
              </div>
            </div>
          </div>

          {/* CỘT 2: KHU VỰC CHỨA CÁC FORM TÁCH BIỆT */}
          <div className="p-8 md:p-10 flex flex-col justify-center">
            {/* Nút bấm chuyển Tab */}
            <div className="flex bg-[#121216] p-1 rounded-xl mb-6">
              <button 
                type="button"
                onClick={() => switchTab(true)} 
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${isLoginTab ? 'bg-[#ff4081] text-white' : 'text-gray-400'}`}
              >
                Đăng nhập
              </button>
              <button 
                type="button"
                onClick={() => switchTab(false)} 
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${!isLoginTab ? 'bg-[#ff4081] text-white' : 'text-gray-400'}`}
              >
                Đăng ký
              </button>
            </div>

            {/* Khối hiển thị thông báo Alert */}
            {errorMessage && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl mb-4">⚠️ {errorMessage}</div>}
            {successMessage && <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl mb-4">✅ {successMessage}</div>}

            {/* FORM ĐĂNG NHẬP RIÊNG BIỆT */}
            {isLoginTab && (
              <form onSubmit={handleFormLogin} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Địa chỉ Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="email@example.com"
                    className="w-full h-[42px] px-3.5 bg-[#121216] border border-gray-800 rounded-xl text-sm text-white focus:border-[#ff4081] outline-none transition-colors" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Mật khẩu</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="w-full h-[42px] px-3.5 bg-[#121216] border border-gray-800 rounded-xl text-sm text-white focus:border-[#ff4081] outline-none transition-colors" 
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-3 mt-4 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP HỆ THỐNG'}
                </button>
              </form>
            )}

            {/* FORM ĐĂNG KÝ RIÊNG BIỆT */}
            {!isLoginTab && (
              <form onSubmit={handleFormRegister} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Họ và Tên</label>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Nguyễn Văn A"
                    className="w-full h-[40px] px-3.5 bg-[#121216] border border-gray-800 rounded-xl text-sm text-white focus:border-[#ff4081] outline-none transition-colors" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Địa chỉ Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="email@example.com"
                    className="w-full h-[40px] px-3.5 bg-[#121216] border border-gray-800 rounded-xl text-sm text-white focus:border-[#ff4081] outline-none transition-colors" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Mật khẩu</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full h-[40px] px-3.5 bg-[#121216] border border-gray-800 rounded-xl text-sm text-white focus:border-[#ff4081] outline-none transition-colors" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Vai trò tài khoản</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)} 
                    className="w-full h-[40px] px-3 bg-[#121216] border border-gray-800 rounded-xl text-sm text-white outline-none cursor-pointer"
                  >
                    <option value="buyer">🛒 Khách mua hàng (Buyer)</option>
                    <option value="shop_owner">🏪 Chủ shop kinh doanh (Seller)</option>
                  </select>
                </div>

                {role === 'shop_owner' && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Tên Cửa hàng / Thương hiệu</label>
                    <input 
                      type="text" 
                      value={shopName} 
                      onChange={(e) => setShopName(e.target.value)} 
                      placeholder="VD: Routine, Coolmate..."
                      className="w-full h-[40px] px-3.5 bg-[#121216] border border-gray-800 rounded-xl text-sm text-white focus:border-[#ff4081] outline-none transition-colors" 
                      required 
                    />
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-3 mt-4 bg-[#ff4081] hover:bg-[#ff80ab] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  {loading ? 'Đang tạo tài khoản...' : 'TẠO TÀI KHOẢN MỚI'}
                </button>
              </form>
            )}

            {/* Nút quay lại */}
            <button 
              onClick={() => router.push('/')} 
              className="text-center text-xs text-gray-500 hover:text-gray-300 mt-6 underline transition-colors"
            >
              Quay lại trang chủ
            </button>
          </div>

        </div>
      </div>
    </>
  );
}