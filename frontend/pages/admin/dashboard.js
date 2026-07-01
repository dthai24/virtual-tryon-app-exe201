import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { apiUrl } from '../../lib/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview | users | products | transactions | tryons

  // Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [tryons, setTryons] = useState([]);

  // Modal States
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newCredits, setNewCredits] = useState(0);
  const [creditReason, setCreditReason] = useState('');
  const [savingCredits, setSavingCredits] = useState(false);

  // Check login and fetch data
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang quản trị!');
      router.push('/');
      return;
    }
    setAdmin(parsedUser);
    fetchData(parsedUser._id);
  }, []);

  const fetchData = async (adminId) => {
    setLoading(true);
    try {
      const authQuery = `?admin_id=${adminId}`;
      
      // 1. Fetch Stats
      const statsRes = await fetch(apiUrl(`/api/admin/stats${authQuery}`));
      const statsData = await statsRes.json();
      if (statsRes.ok && statsData.success) {
        setStats(statsData.stats);
      }

      // 2. Fetch Users
      const usersRes = await fetch(apiUrl(`/api/admin/users${authQuery}`));
      const usersData = await usersRes.json();
      if (usersRes.ok && usersData.success) {
        setUsers(usersData.users);
      }

      // 3. Fetch Products
      const productsRes = await fetch(apiUrl(`/api/admin/products${authQuery}`));
      const productsData = await productsRes.json();
      if (productsRes.ok && productsData.success) {
        setProducts(productsData.products);
      }

      // 4. Fetch Transactions
      const transRes = await fetch(apiUrl(`/api/admin/transactions${authQuery}`));
      const transData = await transRes.json();
      if (transRes.ok && transData.success) {
        setTransactions(transData.transactions);
      }

      // 5. Fetch Tryons
      const tryonsRes = await fetch(apiUrl(`/api/admin/tryons${authQuery}`));
      const tryonsData = await tryonsRes.json();
      if (tryonsRes.ok && tryonsData.success) {
        setTryons(tryonsData.tryons);
      }

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreditModal = (user) => {
    setSelectedUser(user);
    setNewCredits(user.credits);
    setCreditReason('Tặng xu cho khách hàng trải nghiệm');
    setShowCreditModal(true);
  };

  const handleSaveCredits = async () => {
    if (!selectedUser || !admin) return;
    setSavingCredits(true);
    try {
      const response = await fetch(apiUrl(`/api/admin/users/${selectedUser._id}/credits?admin_id=${admin._id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credits: Number(newCredits),
          reason: creditReason
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert('Cập nhật số xu thành công!');
        setShowCreditModal(false);
        // Refresh data
        fetchData(admin._id);
      } else {
        alert(data.message || 'Lỗi khi cập nhật xu!');
      }
    } catch (error) {
      alert('Không thể kết nối đến server: ' + error.message);
    } finally {
      setSavingCredits(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading && !admin) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff4081] mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500 font-semibold">Đang tải dữ liệu quản trị...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Quản Trị Hệ Thống - SmartFit</title>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800;900&family=Outfit:wght@400;600;800&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col font-sans" style={{ fontFamily: "'Outfit', sans-serif" }}>
        
        {/* HEADER BAR */}
        <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black bg-gradient-to-r from-[#ff4081] to-[#ff80ab] bg-clip-text text-transparent" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              SMARTFIT ADMIN
            </span>
            <span className="text-[10px] bg-red-100 text-red-600 font-bold uppercase px-2 py-0.5 rounded">Hệ thống</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-700">Administrator: {admin?.username}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase">{admin?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 text-xs rounded-xl font-bold cursor-pointer transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        <div className="flex flex-1">
          {/* SIDEBAR */}
          <aside className="w-64 bg-white border-r border-gray-100 p-4 space-y-2 hidden md:block">
            {[
              { id: 'overview', label: '📊 Tổng quan', desc: 'Thống kê & đo lường' },
              { id: 'users', label: '👥 Người dùng', desc: 'Xem danh sách & sửa xu' },
              { id: 'products', label: '🛍️ Sản phẩm', desc: 'Sản phẩm toàn hệ thống' },
              { id: 'transactions', label: '🪙 Giao dịch xu', desc: 'Lịch sử nạp & tiêu xu' },
              { id: 'tryons', label: '🔮 Thử đồ AI', desc: 'Lịch sử ảnh/video AI' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#ff4081] to-[#ff80ab] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-xs font-bold block">{tab.label}</span>
                <span className={`text-[9px] font-medium block mt-0.5 ${activeTab === tab.id ? 'text-white/80' : 'text-gray-400'}`}>
                  {tab.desc}
                </span>
              </button>
            ))}
            
            <div className="pt-6 border-t border-gray-100 mt-6 text-center">
              <button
                onClick={() => router.push('/')}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-xl font-bold transition-all cursor-pointer"
              >
                🏠 Xem giao diện Web Shop
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 p-6 overflow-y-auto">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h2 className="text-lg font-black text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>📊 Bảng thống kê hệ thống</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Tổng số tài khoản', val: stats?.totalUsers || 0, color: 'from-[#ff4081] to-[#ff80ab]' },
                    { label: 'Sản phẩm bày bán', val: stats?.totalProducts || 0, color: 'from-blue-500 to-indigo-500' },
                    { label: 'Số lượt thử đồ AI', val: stats?.totalTryons || 0, color: 'from-purple-500 to-pink-500' },
                    { label: 'Xu thực tế đã nạp', val: `🪙 ${stats?.totalCoinsPurchased || 0}`, color: 'from-yellow-500 to-amber-500' }
                  ].map((card, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">{card.label}</span>
                      <span className={`text-2xl font-black bg-gradient-to-r ${card.color} bg-clip-text text-transparent block mt-2`}>
                        {card.val}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Substats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">👥 Phân bố người dùng</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-semibold">Khách mua hàng (Buyers)</span>
                        <span className="font-extrabold text-gray-800">{stats?.totalBuyers || 0} tài khoản</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full">
                        <div
                          className="bg-[#ff4081] h-2 rounded-full"
                          style={{ width: `${(stats?.totalBuyers / (stats?.totalUsers || 1)) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-semibold">Chủ cửa hàng (Sellers)</span>
                        <span className="font-extrabold text-gray-800">{stats?.totalSellers || 0} cửa hàng</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${(stats?.totalSellers / (stats?.totalUsers || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">💡 Hỗ trợ & Vận hành</h3>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        Hệ thống đối soát PayOS VietQR Pro đã được kết nối. Khi khách hàng quét QR thanh toán đúng nội dung 
                        chuyển khoản, số xu của khách hàng sẽ được cộng tự động ngay lập tức tại Tab "Người dùng".
                      </p>
                    </div>
                    <div className="mt-4 text-[10px] text-gray-400 font-bold uppercase">
                      Phiên bản: 1.2.0 • Hoạt động ổn định
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: USERS */}
            {activeTab === 'users' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h2 className="text-lg font-black text-gray-800 font-sans" style={{ fontFamily: "'Montserrat', sans-serif" }}>👥 Quản lý người dùng</h2>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-100">
                          <th className="py-4 px-6">Tên</th>
                          <th className="py-4 px-6">Email</th>
                          <th className="py-4 px-6">Vai trò</th>
                          <th className="py-4 px-6">Số xu</th>
                          <th className="py-4 px-6 text-center">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-6 font-semibold text-gray-800">{u.username}</td>
                            <td className="py-4 px-6 font-semibold">{u.email}</td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                u.role === 'admin' ? 'bg-red-50 text-red-600' :
                                u.role === 'shop_owner' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {u.role === 'admin' ? 'Quản trị' : u.role === 'shop_owner' ? 'Cửa hàng' : 'Khách mua'}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-bold text-gray-800">🪙 {u.credits} xu</td>
                            <td className="py-4 px-6 text-center">
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => handleOpenCreditModal(u)}
                                  className="px-3 py-1 bg-[#ff4081] text-white rounded-lg font-bold hover:bg-[#ff80ab] cursor-pointer transition-all active:scale-[0.95]"
                                >
                                  Sửa xu
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PRODUCTS */}
            {activeTab === 'products' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h2 className="text-lg font-black text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>🛍️ Sản phẩm trên toàn hệ thống</h2>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-100">
                          <th className="py-4 px-6">Ảnh</th>
                          <th className="py-4 px-6">Tên sản phẩm</th>
                          <th className="py-4 px-6">Giá</th>
                          <th className="py-4 px-6">Danh mục</th>
                          <th className="py-4 px-6">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-gray-400">Không có sản phẩm nào.</td>
                          </tr>
                        ) : (
                          products.map((p) => (
                            <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-3 px-6">
                                <img
                                  src={p.image.startsWith('http') ? p.image : apiUrl(`/public/uploads/${p.image.split('/').pop()}`)}
                                  className="w-10 h-10 object-cover rounded-lg border border-gray-100 shadow-sm"
                                  alt=""
                                />
                              </td>
                              <td className="py-3 px-6 font-semibold text-gray-800">{p.name}</td>
                              <td className="py-3 px-6 font-bold text-[#ff4081]">{p.price.toLocaleString('vi-VN')} đ</td>
                              <td className="py-3 px-6 font-medium uppercase tracking-wider text-[10px] text-gray-400">{p.category}</td>
                              <td className="py-3 px-6">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  p.status === 'available' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                  {p.status === 'available' ? 'Đang bán' : 'Đã ẩn'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: TRANSACTIONS */}
            {activeTab === 'transactions' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h2 className="text-lg font-black text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>🪙 Lịch sử giao dịch xu hệ thống</h2>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-100">
                          <th className="py-4 px-6">Người dùng</th>
                          <th className="py-4 px-6">Số lượng xu</th>
                          <th className="py-4 px-6">Loại GD</th>
                          <th className="py-4 px-6">Chi tiết / Nội dung</th>
                          <th className="py-4 px-6">Ngày giao dịch</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
                        {transactions.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-gray-400">Chưa có giao dịch xu nào phát sinh.</td>
                          </tr>
                        ) : (
                          transactions.map((t) => (
                            <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-4 px-6">
                                <p className="font-semibold text-gray-800">{t.user_id?.username || 'Đã xóa user'}</p>
                                <p className="text-[10px] text-gray-400 font-medium">{t.user_id?.email}</p>
                              </td>
                              <td className={`py-4 px-6 font-extrabold ${t.type === 'usage_deduction' ? 'text-red-500' : 'text-green-500'}`}>
                                {t.type === 'usage_deduction' ? '-' : '+'}{t.amount} xu
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  t.type === 'purchase' ? 'bg-green-50 text-green-600' :
                                  t.type === 'bonus' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                                }`}>
                                  {t.type === 'purchase' ? 'Nạp tiền thật' : t.type === 'bonus' ? 'Admin tặng' : 'Trừ xu thử đồ'}
                                </span>
                              </td>
                              <td className="py-4 px-6 font-medium text-gray-500 max-w-[280px] truncate" title={t.description}>
                                {t.description}
                              </td>
                              <td className="py-4 px-6 font-semibold text-gray-400">
                                {new Date(t.createdAt).toLocaleString('vi-VN')}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: TRYONS */}
            {activeTab === 'tryons' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h2 className="text-lg font-black text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>🔮 Lịch sử chạy AI thử đồ hệ thống</h2>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-100">
                          <th className="py-4 px-6">Khách hàng</th>
                          <th className="py-4 px-6">Ảnh mặt</th>
                          <th className="py-4 px-6">Ảnh quần áo</th>
                          <th className="py-4 px-6">Loại AI</th>
                          <th className="py-4 px-6">Thời gian</th>
                          <th className="py-4 px-6 text-center">Kết quả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
                        {tryons.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="py-8 text-center text-gray-400">Chưa có lượt chạy AI nào.</td>
                          </tr>
                        ) : (
                          tryons.map((ty) => (
                            <tr key={ty._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-4 px-6">
                                <p className="font-semibold text-gray-800">{ty.user_id?.username || 'Khách vãng lai'}</p>
                                <p className="text-[10px] text-gray-400 font-medium">{ty.user_id?.email}</p>
                              </td>
                              <td className="py-3 px-6">
                                <img
                                  src={ty.face_img.startsWith('http') ? ty.face_img : apiUrl(`/public/uploads/${ty.face_img.split('/').pop()}`)}
                                  className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                                  alt=""
                                />
                              </td>
                              <td className="py-3 px-6">
                                <img
                                  src={ty.garment_img.startsWith('http') ? ty.garment_img : apiUrl(`/public/uploads/${ty.garment_img.split('/').pop()}`)}
                                  className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                                  alt=""
                                />
                              </td>
                              <td className="py-3 px-6">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  ty.type === 'video' ? 'bg-purple-50 text-purple-600' : 'bg-pink-50 text-pink-600'
                                }`}>
                                  {ty.type === 'video' ? '🎬 Video' : '🖼️ Ảnh'}
                                </span>
                              </td>
                              <td className="py-3 px-6 font-semibold text-gray-400">
                                {new Date(ty.createdAt).toLocaleString('vi-VN')}
                              </td>
                              <td className="py-3 px-6 text-center">
                                {ty.result_url ? (
                                  <a
                                    href={ty.result_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-colors font-bold text-[10px]"
                                  >
                                    Xem File
                                  </a>
                                ) : (
                                  <span className="text-yellow-600 font-bold text-[10px]">⏳ Đang xử lý</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>

        {/* MODAL SỬA XU */}
        {showCreditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-[450px] shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
              
              {/* Nút đóng */}
              <button
                onClick={() => setShowCreditModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
                disabled={savingCredits}
              >
                ✕
              </button>

              <div className="mb-4">
                <h3 className="text-base font-black text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  🔧 ĐIỀU CHỈNH XU CỦA KHÁCH
                </h3>
                <p className="text-xs text-gray-400 mt-1">Thay đổi số lượng xu của tài khoản: <strong className="text-gray-600">{selectedUser.username}</strong></p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Số xu hiện tại</label>
                  <span className="text-sm font-extrabold text-gray-800 bg-gray-50 px-3 py-2 rounded-xl block border border-gray-100">
                    🪙 {selectedUser.credits} xu
                  </span>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Nhập số xu mới</label>
                  <input
                    type="number"
                    min="0"
                    value={newCredits}
                    onChange={(e) => setNewCredits(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-sm font-extrabold text-gray-800 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff4081]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Lý do điều chỉnh (Sẽ lưu lịch sử)</label>
                  <input
                    type="text"
                    value={creditReason}
                    onChange={(e) => setCreditReason(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-700 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff4081]"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowCreditModal(false)}
                  disabled={savingCredits}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSaveCredits}
                  disabled={savingCredits}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#ff4081] to-[#ff80ab] text-white rounded-xl text-xs font-bold hover:shadow-md cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {savingCredits ? 'Đang lưu...' : 'Xác nhận lưu'}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}
