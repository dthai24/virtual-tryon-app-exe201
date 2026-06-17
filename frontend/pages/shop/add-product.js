import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function ShopAddProduct() {
  const router = useRouter();
  const [seller, setSeller] = useState(null);

  // ============================================================
  // STATE QUẢN LÝ FORM
  // ============================================================
  const [formData, setFormData] = useState({
    shop_name: '',
    name: '',
    price: '',
    description: '',
    category: 'female',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === 'shop_owner') {
        setSeller(parsedUser);
        setFormData(prev => ({ ...prev, shop_name: parsedUser.shop?.name || '' }));
      } else {
        router.push('/');
      }
    } else {
      router.push('/login');
    }
  }, []);

  const [garmentFile, setGarmentFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // { type: 'success' | 'error', message: '' }

  // ============================================================
  // XỬ LÝ THAY ĐỔI INPUT
  // ============================================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGarmentFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setGarmentFile(null);
    setImagePreview(null);
  };

  // ============================================================
  // GỬI FORM LÊN BACKEND
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitResult(null);

    // Validate phía client
    if (!formData.shop_name.trim()) {
      setSubmitResult({ type: 'error', message: 'Vui lòng nhập tên cửa hàng!' });
      return;
    }
    if (!formData.name.trim()) {
      setSubmitResult({ type: 'error', message: 'Vui lòng nhập tên sản phẩm!' });
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setSubmitResult({ type: 'error', message: 'Vui lòng nhập giá hợp lệ!' });
      return;
    }
    if (!garmentFile) {
      setSubmitResult({ type: 'error', message: 'Vui lòng chọn ảnh trang phục!' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Đóng gói FormData gồm cả text + file ảnh
      const payload = new FormData();
      payload.append('shop_name', formData.shop_name.trim());
      payload.append('name', formData.name.trim());
      payload.append('price', formData.price);
      payload.append('description', formData.description.trim());
      payload.append('category', formData.category);
      payload.append('garment_image', garmentFile);

      const response = await fetch('http://localhost:5000/api/products/add', {
        method: 'POST',
        body: payload,
      });

      const data = await response.json();

      if (data.success) {
        setSubmitResult({
          type: 'success',
          message: data.message || 'Đăng sản phẩm thành công!',
        });
        // Reset form sau khi thành công (giữ lại shop_name để đăng sản phẩm tiếp theo dễ dàng)
        setFormData({ shop_name: formData.shop_name, name: '', price: '', description: '', category: 'female' });
        setGarmentFile(null);
        setImagePreview(null);
      } else {
        setSubmitResult({
          type: 'error',
          message: data.message || 'Đăng sản phẩm thất bại!',
        });
      }
    } catch (error) {
      setSubmitResult({
        type: 'error',
        message: 'Lỗi kết nối server: ' + error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // GIAO DIỆN — PHONG CÁCH KÊNH NGƯỜI BÁN SHOPEE
  // ============================================================
  return (
    <>
      <Head>
        <title>Kênh Người Bán — Thêm sản phẩm mới</title>
      </Head>

      <div className="min-h-screen bg-[#f6f6f6]" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* ===== TOP NAVIGATION BAR ===== */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ee4d2d] to-[#ff6633] flex items-center justify-center">
                <span className="text-white text-sm font-bold">S</span>
              </div>
              <span className="text-lg font-bold text-[#333]">Kênh Người Bán</span>
              <span className="text-xs text-gray-400 ml-1">SmartFit</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">🏪 Shop Dashboard</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ee4d2d] to-[#ff7043] flex items-center justify-center">
                <span className="text-white text-xs font-semibold">👤</span>
              </div>
            </div>
          </div>
        </header>

        {/* ===== MAIN CONTENT ===== */}
        <main className="max-w-[1200px] mx-auto px-6 py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <span onClick={() => router.push('/shop/dashboard')} className="hover:text-[#ee4d2d] cursor-pointer transition-colors">Quản lý sản phẩm</span>
            <span>/</span>
            <span className="text-[#333] font-medium">Thêm sản phẩm mới</span>
          </div>

          {/* Page Title */}
          <h1 className="text-2xl font-bold text-[#333] mb-6">Thêm sản phẩm mới</h1>

          {/* ===== THÔNG BÁO KẾT QUẢ ===== */}
          {submitResult && (
            <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 transition-all duration-300 ${
              submitResult.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <span className="text-xl">{submitResult.type === 'success' ? '✅' : '❌'}</span>
              <span className="text-sm font-medium">{submitResult.message}</span>
              <button
                onClick={() => setSubmitResult(null)}
                className="ml-auto text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* ===== CARD 1: THÔNG TIN CƠ BẢN ===== */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-6">
              <h2 className="text-lg font-bold text-[#333] mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#ee4d2d] rounded-full inline-block"></span>
                Thông tin cơ bản
              </h2>

              {/* Tên cửa hàng */}
              <div className="flex items-start mb-6">
                <label className="w-[160px] text-sm text-gray-500 pt-2.5 text-right pr-6 flex-shrink-0">
                  Tên cửa hàng <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    name="shop_name"
                    value={formData.shop_name}
                    onChange={handleInputChange}
                    disabled={true}
                    placeholder="VD: Coolmate, Routine, Biluxury..."
                    className="w-full max-w-[500px] h-[40px] px-3 border border-gray-300 bg-gray-50 disabled:bg-gray-100 rounded-lg text-sm text-[#333] outline-none transition-all duration-200 focus:border-[#ee4d2d] focus:ring-2 focus:ring-[#ee4d2d]/10 placeholder:text-gray-300"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Liên kết tự động với cửa hàng của bạn</p>
                </div>
              </div>

              {/* Tên sản phẩm */}
              <div className="flex items-start mb-6">
                <label className="w-[160px] text-sm text-gray-500 pt-2.5 text-right pr-6 flex-shrink-0">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="VD: Áo Khoác Blazer Nữ Hàn Quốc Cao Cấp"
                    maxLength={200}
                    className="w-full max-w-[500px] h-[40px] px-3 border border-gray-300 rounded-lg text-sm text-[#333] outline-none transition-all duration-200 focus:border-[#ee4d2d] focus:ring-2 focus:ring-[#ee4d2d]/10 placeholder:text-gray-300"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">{formData.name.length}/200 ký tự</p>
                </div>
              </div>

              {/* Danh mục */}
              <div className="flex items-start mb-6">
                <label className="w-[160px] text-sm text-gray-500 pt-2.5 text-right pr-6 flex-shrink-0">
                  Ngành hàng <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full max-w-[500px] h-[40px] px-3 border border-gray-300 rounded-lg text-sm text-[#333] outline-none bg-white cursor-pointer transition-all duration-200 focus:border-[#ee4d2d] focus:ring-2 focus:ring-[#ee4d2d]/10"
                  >
                    <option value="female">👩 Thời trang Nữ</option>
                    <option value="male">👨 Thời trang Nam</option>
                    <option value="unisex">🧑 Unisex</option>
                  </select>
                </div>
              </div>

              {/* Mô tả */}
              <div className="flex items-start mb-2">
                <label className="w-[160px] text-sm text-gray-500 pt-2.5 text-right pr-6 flex-shrink-0">
                  Mô tả sản phẩm
                </label>
                <div className="flex-1">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Nhập mô tả chi tiết về chất liệu, kiểu dáng, kích thước..."
                    rows={5}
                    maxLength={2000}
                    className="w-full max-w-[500px] px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-[#333] outline-none resize-none transition-all duration-200 focus:border-[#ee4d2d] focus:ring-2 focus:ring-[#ee4d2d]/10 placeholder:text-gray-300"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">{formData.description.length}/2000 ký tự</p>
                </div>
              </div>
            </div>

            {/* ===== CARD 2: GIÁ BÁN ===== */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-6">
              <h2 className="text-lg font-bold text-[#333] mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#ee4d2d] rounded-full inline-block"></span>
                Giá bán
              </h2>

              <div className="flex items-start">
                <label className="w-[160px] text-sm text-gray-500 pt-2.5 text-right pr-6 flex-shrink-0">
                  Giá (₫) <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  <div className="relative max-w-[500px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₫</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className="w-full h-[40px] pl-8 pr-3 border border-gray-300 rounded-lg text-sm text-[#333] outline-none transition-all duration-200 focus:border-[#ee4d2d] focus:ring-2 focus:ring-[#ee4d2d]/10 placeholder:text-gray-300"
                    />
                  </div>
                  {formData.price && Number(formData.price) > 0 && (
                    <p className="text-xs text-[#ee4d2d] mt-1.5 font-medium">
                      {Number(formData.price).toLocaleString('vi-VN')} ₫
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ===== CARD 3: HÌNH ẢNH TRANG PHỤC ===== */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-6">
              <h2 className="text-lg font-bold text-[#333] mb-2 pb-4 border-b border-gray-100 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#ee4d2d] rounded-full inline-block"></span>
                Hình ảnh trang phục
              </h2>
              <p className="text-xs text-gray-400 mb-6">
                Ảnh trang phục gốc sạch nền (nền trắng hoặc trong suốt) — phục vụ cho AI Virtual Try-on.
                Định dạng: JPG, PNG, WebP. Tối đa 10MB.
              </p>

              <div className="flex items-start">
                <label className="w-[160px] text-sm text-gray-500 pt-2.5 text-right pr-6 flex-shrink-0">
                  Ảnh trang phục <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  {!imagePreview ? (
                    <label
                      htmlFor="garment-upload"
                      className="flex flex-col items-center justify-center w-[180px] h-[180px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-all duration-200 hover:border-[#ee4d2d] hover:bg-[#fef5f0] group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#fef5f0] flex items-center justify-center mb-2 group-hover:bg-[#ee4d2d]/10 transition-colors">
                        <svg className="w-5 h-5 text-[#ee4d2d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-[#ee4d2d] transition-colors">Thêm hình ảnh</span>
                      <span className="text-[10px] text-gray-300 mt-1">(1 ảnh duy nhất)</span>
                      <input
                        id="garment-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative w-[180px] h-[180px] border border-gray-200 rounded-lg overflow-hidden group">
                      <img
                        src={imagePreview}
                        alt="Preview trang phục"
                        className="w-full h-full object-contain bg-gray-50"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={removeImage}
                          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <span className="text-red-500 text-sm font-bold">✕</span>
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                        <p className="text-[10px] text-white truncate">{garmentFile?.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ===== NÚT GỬI ===== */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex items-center justify-end gap-4 sticky bottom-0 z-40">
              <button
                type="button"
                onClick={() => router.push('/shop/dashboard')}
                className="h-[40px] px-8 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Quay lại Dashboard
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`h-[40px] px-8 rounded-lg text-sm font-bold text-white transition-all duration-200 cursor-pointer ${
                  isSubmitting
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-[#ee4d2d] hover:bg-[#d73211] shadow-md hover:shadow-lg active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang lưu...
                  </span>
                ) : (
                  'Lưu & Đăng bán'
                )}
              </button>
            </div>

          </form>
        </main>

        {/* ===== FOOTER ===== */}
        <footer className="bg-white border-t border-gray-100 mt-10">
          <div className="max-w-[1200px] mx-auto px-6 py-4 text-center">
            <p className="text-xs text-gray-400">© 2026 SmartFit — AI Virtual Try-On Platform. Kênh Người Bán v1.0</p>
          </div>
        </footer>
      </div>
    </>
  );
}
