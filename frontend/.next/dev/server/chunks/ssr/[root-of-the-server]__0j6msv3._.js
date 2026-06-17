module.exports = [
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/react-dom [external] (react-dom, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react-dom", () => require("react-dom"));

module.exports = mod;
}),
"[project]/pages/shop/dashboard.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ShopDashboard
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/head.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
;
;
;
;
function ShopDashboard() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [seller, setSeller] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [orders, setOrders] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('statistics'); // statistics | products | orders
    // Trạng thái load dữ liệu
    const [loadingOrders, setLoadingOrders] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true);
    const [loadingProducts, setLoadingProducts] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true);
    // State phục vụ thống kê ảo + thật
    const [tryonHits, setTryonHits] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    // Bảo vệ route - Chỉ cho phép Seller truy cập
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
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
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (!seller || !seller.shop) return;
        // 1. Tải danh sách đơn hàng của shop
        fetch(`http://localhost:5000/api/orders/seller/${seller.shop.id}`).then((res)=>res.json()).then((data)=>{
            if (data.success) {
                setOrders(data.data);
            }
            setLoadingOrders(false);
        }).catch((err)=>{
            console.error('Lỗi tải đơn hàng của shop:', err);
            setLoadingOrders(false);
        });
        // 2. Tải danh sách sản phẩm và lọc theo shop
        fetch('http://localhost:5000/api/products').then((res)=>res.json()).then((data)=>{
            if (data.success) {
                // Lọc sản phẩm của shop
                const shopProducts = data.data.filter((p)=>p.shop_id && p.shop_id._id === seller.shop.id);
                setProducts(shopProducts);
            }
            setLoadingProducts(false);
        }).catch((err)=>{
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
    }, [
        seller
    ]);
    const handleLogout = ()=>{
        localStorage.removeItem('user');
        router.push('/login');
    };
    // Cập nhật trạng thái đơn hàng
    const handleUpdateOrderStatus = async (orderId, newStatus)=>{
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: newStatus
                })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                // Cập nhật lại danh sách đơn hàng cục bộ
                setOrders((prev)=>prev.map((o)=>o._id === orderId ? {
                            ...o,
                            status: newStatus
                        } : o));
                alert('Cập nhật trạng thái đơn hàng thành công!');
            } else {
                alert(data.message || 'Không thể cập nhật trạng thái đơn hàng!');
            }
        } catch (err) {
            alert('Lỗi kết nối tới Server: ' + err.message);
        }
    };
    // Tính toán các chỉ số thống kê
    const totalRevenue = orders.filter((o)=>o.status === 'delivered').reduce((sum, o)=>sum + o.total_amount, 0);
    const pendingOrders = orders.filter((o)=>o.status === 'pending').length;
    const shippingOrders = orders.filter((o)=>o.status === 'shipping').length;
    const deliveredOrders = orders.filter((o)=>o.status === 'delivered').length;
    const cancelledOrders = orders.filter((o)=>o.status === 'cancelled').length;
    // Tỷ lệ chuyển đổi = (Số đơn hàng hoàn thành / số lượt thử đồ) * 100
    const conversionRate = tryonHits > 0 ? (orders.length / tryonHits * 100).toFixed(1) : 0;
    if (!seller) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gray-50 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "animate-spin rounded-full h-10 w-10 border-b-2 border-[#ee4d2d]"
            }, void 0, false, {
                fileName: "[project]/pages/shop/dashboard.js",
                lineNumber: 121,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/pages/shop/dashboard.js",
            lineNumber: 120,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("title", {
                    children: [
                        "Kênh Người Bán — ",
                        seller.shop?.name || 'SmartFit Store'
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/shop/dashboard.js",
                    lineNumber: 129,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/shop/dashboard.js",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "min-h-screen bg-[#f5f5f9] flex",
                style: {
                    fontFamily: "'Inter', sans-serif"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("aside", {
                        className: "w-[260px] bg-gray-900 text-white flex-shrink-0 flex flex-col justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "h-[70px] border-b border-gray-800 flex items-center px-6 gap-2.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "w-8 h-8 rounded-lg bg-gradient-to-br from-[#ee4d2d] to-[#ff6633] flex items-center justify-center",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    className: "text-white text-sm font-bold",
                                                    style: {
                                                        fontFamily: "'Montserrat', sans-serif"
                                                    },
                                                    children: "S"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/shop/dashboard.js",
                                                    lineNumber: 140,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 139,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-extrabold tracking-wider",
                                                        style: {
                                                            fontFamily: "'Montserrat', sans-serif"
                                                        },
                                                        children: "SMART FIT"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 143,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        className: "text-[9px] text-[#ee4d2d] font-bold tracking-widest uppercase",
                                                        children: "Seller Centre"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 144,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 142,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/shop/dashboard.js",
                                        lineNumber: 138,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "p-6 border-b border-gray-800",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "w-10 h-10 rounded-full bg-gradient-to-br from-[#ee4d2d] to-[#ff7043] flex items-center justify-center text-sm font-bold",
                                                    children: "🏪"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/shop/dashboard.js",
                                                    lineNumber: 151,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h4", {
                                                            className: "text-xs font-bold truncate max-w-[150px]",
                                                            children: seller.shop?.name || 'Routine Studio'
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                            lineNumber: 155,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                            className: "text-[10px] text-gray-400 mt-0.5",
                                                            children: [
                                                                "Chủ shop: ",
                                                                seller.username
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                            lineNumber: 156,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/pages/shop/dashboard.js",
                                                    lineNumber: 154,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/shop/dashboard.js",
                                            lineNumber: 150,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/pages/shop/dashboard.js",
                                        lineNumber: 149,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("nav", {
                                        className: "p-4 space-y-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setActiveTab('statistics'),
                                                className: `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'statistics' ? 'bg-[#ee4d2d] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`,
                                                children: "📊 Thống kê chung"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 163,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setActiveTab('products'),
                                                className: `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'products' ? 'bg-[#ee4d2d] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`,
                                                children: "👕 Quản lý sản phẩm"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 171,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setActiveTab('orders'),
                                                className: `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'orders' ? 'bg-[#ee4d2d] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`,
                                                children: [
                                                    "📦 Quản lý đơn hàng",
                                                    pendingOrders > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        className: "ml-auto bg-yellow-500 text-gray-900 text-[10px] px-2 py-0.5 rounded-full font-bold",
                                                        children: pendingOrders
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 187,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 179,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/shop/dashboard.js",
                                        lineNumber: 162,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/shop/dashboard.js",
                                lineNumber: 136,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "p-4 border-t border-gray-800 space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        onClick: ()=>router.push('/'),
                                        className: "w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center block",
                                        children: "🌐 Xem Trang chủ Buyer"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/shop/dashboard.js",
                                        lineNumber: 197,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        onClick: handleLogout,
                                        className: "w-full py-2.5 border border-gray-700 hover:bg-red-950/20 hover:border-red-500 text-red-400 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center block",
                                        children: "🚪 Đăng xuất"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/shop/dashboard.js",
                                        lineNumber: 203,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/shop/dashboard.js",
                                lineNumber: 196,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/shop/dashboard.js",
                        lineNumber: 135,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("main", {
                        className: "flex-1 flex flex-col min-h-screen overflow-y-auto",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("header", {
                                className: "h-[70px] bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-30",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                                className: "text-base font-bold text-gray-800",
                                                children: [
                                                    activeTab === 'statistics' && 'Bảng Thống kê Hiệu quả Cửa hàng',
                                                    activeTab === 'products' && 'Danh sách sản phẩm của Cửa hàng',
                                                    activeTab === 'orders' && 'Danh sách đơn hàng của Cửa hàng'
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 218,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] text-gray-400 font-semibold mt-0.5",
                                                children: "Cập nhật tự động theo thời gian thực"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 223,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/shop/dashboard.js",
                                        lineNumber: 217,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-gray-500 font-semibold",
                                                children: [
                                                    "Chào mừng trở lại, ",
                                                    seller.username,
                                                    "!"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 228,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "w-8 h-8 rounded-full bg-[#ee4d2d]/10 text-[#ee4d2d] flex items-center justify-center font-black text-xs",
                                                children: "S"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 229,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/shop/dashboard.js",
                                        lineNumber: 227,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/shop/dashboard.js",
                                lineNumber: 216,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "p-8 max-w-[1200px] w-full mx-auto space-y-8",
                                children: [
                                    activeTab === 'statistics' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 md:grid-cols-4 gap-6",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[120px]",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                className: "flex justify-between items-center text-gray-400",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        className: "text-[10px] font-bold uppercase tracking-wider",
                                                                        children: "Doanh thu hoàn thành"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 248,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        className: "text-lg",
                                                                        children: "💰"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 249,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                lineNumber: 247,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                className: "mt-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                                        className: "text-2xl font-black text-gray-800",
                                                                        children: [
                                                                            totalRevenue.toLocaleString('vi-VN'),
                                                                            " ₫"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 252,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                        className: "text-[10px] text-green-500 font-semibold mt-1",
                                                                        children: "+10.5% so với tuần trước"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 255,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                lineNumber: 251,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 246,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[120px]",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                className: "flex justify-between items-center text-gray-400",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        className: "text-[10px] font-bold uppercase tracking-wider",
                                                                        children: "Tổng đơn hàng"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 264,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        className: "text-lg",
                                                                        children: "📦"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 265,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                lineNumber: 263,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                className: "mt-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                                        className: "text-2xl font-black text-gray-800",
                                                                        children: [
                                                                            orders.length,
                                                                            " đơn"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 268,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                        className: "text-[10px] text-gray-400 font-semibold mt-1",
                                                                        children: [
                                                                            "Đang giao: ",
                                                                            shippingOrders,
                                                                            " | Chờ duyệt: ",
                                                                            pendingOrders
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 269,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                lineNumber: 267,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 262,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[120px]",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                className: "flex justify-between items-center text-gray-400",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        className: "text-[10px] font-bold uppercase tracking-wider",
                                                                        children: "Tương tác AI Try-on"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 278,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        className: "text-lg",
                                                                        children: "🔮"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 279,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                lineNumber: 277,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                className: "mt-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                                        className: "text-2xl font-black text-gray-800",
                                                                        children: [
                                                                            tryonHits,
                                                                            " lượt"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 282,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                        className: "text-[10px] text-blue-500 font-semibold mt-1",
                                                                        children: "Khách ghép mặt & dựng Catwalk"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 283,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                lineNumber: 281,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 276,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[120px]",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                className: "flex justify-between items-center text-gray-400",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        className: "text-[10px] font-bold uppercase tracking-wider",
                                                                        children: "Tỷ lệ mua/thử đồ"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 292,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        className: "text-lg",
                                                                        children: "📈"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 293,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                lineNumber: 291,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                className: "mt-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                                        className: "text-2xl font-black text-[#ee4d2d]",
                                                                        children: [
                                                                            conversionRate,
                                                                            "%"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 296,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                        className: "text-[10px] text-gray-400 font-semibold mt-1",
                                                                        children: "Đơn đặt hàng trên tổng lượt thử AI"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 297,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                lineNumber: 295,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 290,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 244,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 md:grid-cols-3 gap-6",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "bg-white rounded-2xl border border-gray-100 p-6 shadow-sm md:col-span-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                                className: "text-xs font-bold text-gray-800 uppercase tracking-wider mb-6 pb-2 border-b border-gray-50",
                                                                children: "Phân chia trạng thái đơn hàng"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                lineNumber: 309,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                className: "space-y-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        className: "flex justify-between items-center text-xs",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                className: "flex items-center gap-2 text-gray-500",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                        className: "w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                                        lineNumber: 315,
                                                                                        columnNumber: 27
                                                                                    }, this),
                                                                                    "Chờ xử lý (Pending)"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                                lineNumber: 314,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                className: "font-bold text-gray-800",
                                                                                children: pendingOrders
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                                lineNumber: 318,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 313,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        className: "flex justify-between items-center text-xs",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                className: "flex items-center gap-2 text-gray-500",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                        className: "w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                                        lineNumber: 322,
                                                                                        columnNumber: 27
                                                                                    }, this),
                                                                                    "Đang giao hàng (Shipping)"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                                lineNumber: 321,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                className: "font-bold text-gray-800",
                                                                                children: shippingOrders
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                                lineNumber: 325,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 320,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        className: "flex justify-between items-center text-xs",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                className: "flex items-center gap-2 text-gray-500",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                        className: "w-2.5 h-2.5 rounded-full bg-green-500 inline-block"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                                        lineNumber: 329,
                                                                                        columnNumber: 27
                                                                                    }, this),
                                                                                    "Đã hoàn thành (Delivered)"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                                lineNumber: 328,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                className: "font-bold text-gray-800",
                                                                                children: deliveredOrders
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                                lineNumber: 332,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 327,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        className: "flex justify-between items-center text-xs",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                className: "flex items-center gap-2 text-gray-500",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                        className: "w-2.5 h-2.5 rounded-full bg-red-500 inline-block"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                                        lineNumber: 336,
                                                                                        columnNumber: 27
                                                                                    }, this),
                                                                                    "Đã hủy (Cancelled)"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                                lineNumber: 335,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                className: "font-bold text-gray-800",
                                                                                children: cancelledOrders
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                                lineNumber: 339,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 334,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                lineNumber: 312,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 308,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "bg-white rounded-2xl border border-gray-100 p-6 shadow-sm md:col-span-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                                className: "text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b border-gray-50",
                                                                children: "Sản phẩm hấp dẫn (Lượt thử đồ AI cao)"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                lineNumber: 346,
                                                                columnNumber: 21
                                                            }, this),
                                                            products.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-gray-400 py-6 text-center",
                                                                children: "Chưa có sản phẩm nào được đăng bán."
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                lineNumber: 350,
                                                                columnNumber: 23
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                className: "space-y-4",
                                                                children: products.slice(0, 3).map((p, idx)=>{
                                                                    // Giả lập lượt thử đồ riêng cho từng sản phẩm
                                                                    const pTryons = Math.floor(tryonHits / (idx + 1.5)) + 3;
                                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-center gap-3",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                        className: "w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-1 border border-gray-100 flex-shrink-0",
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("img", {
                                                                                            src: p.garment_image_public_url,
                                                                                            alt: p.name,
                                                                                            className: "max-w-full max-h-full object-contain"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                                                            lineNumber: 360,
                                                                                            columnNumber: 35
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                                        lineNumber: 359,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h4", {
                                                                                                className: "text-xs font-bold text-gray-700 line-clamp-1 max-w-[280px]",
                                                                                                children: p.name
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                                                lineNumber: 363,
                                                                                                columnNumber: 35
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                                                className: "text-[10px] text-gray-400 font-semibold mt-0.5",
                                                                                                children: [
                                                                                                    "Mã số: ",
                                                                                                    p._id
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                                                lineNumber: 364,
                                                                                                columnNumber: 35
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                                        lineNumber: 362,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                                lineNumber: 358,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                className: "text-right",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                        className: "text-xs font-black text-gray-800",
                                                                                        children: [
                                                                                            pTryons,
                                                                                            " lượt thử"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                                        lineNumber: 368,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                                        className: "text-[9px] font-bold text-[#ee4d2d] mt-0.5",
                                                                                        children: "Hot Item"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                                        lineNumber: 369,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                                lineNumber: 367,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, p._id, true, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 357,
                                                                        columnNumber: 29
                                                                    }, this);
                                                                })
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                lineNumber: 352,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 345,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 305,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true),
                                    activeTab === 'products' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "p-6 border-b border-gray-100 flex justify-between items-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                                className: "text-sm font-bold text-gray-800",
                                                                children: [
                                                                    "Tất cả sản phẩm (",
                                                                    products.length,
                                                                    ")"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                lineNumber: 389,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                className: "text-[10px] text-gray-400 mt-0.5",
                                                                children: "Sản phẩm đăng tải phục vụ công nghệ thử đồ AI"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                lineNumber: 390,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 388,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>router.push('/shop/add-product'),
                                                        className: "px-5 py-2.5 bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded-xl text-xs font-bold shadow-md shadow-[#ee4d2d]/25 hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5",
                                                        children: "➕ Đăng sản phẩm mới"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 392,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 387,
                                                columnNumber: 17
                                            }, this),
                                            loadingProducts ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "py-12 text-center text-xs text-gray-400",
                                                children: "Đang tải sản phẩm..."
                                            }, void 0, false, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 401,
                                                columnNumber: 19
                                            }, this) : products.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "py-16 text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        className: "text-4xl",
                                                        children: "👕"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 404,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-gray-400 font-bold mt-3",
                                                        children: "Chưa có sản phẩm nào được đăng bán."
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 405,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>router.push('/shop/add-product'),
                                                        className: "mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all cursor-pointer",
                                                        children: "Tải lên sản phẩm đầu tiên"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 406,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 403,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "overflow-x-auto",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("table", {
                                                    className: "w-full text-left border-collapse",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("thead", {
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("tr", {
                                                                className: "bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                                                        className: "py-4 px-6",
                                                                        children: "Hình ảnh"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 418,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                                                        className: "py-4 px-6",
                                                                        children: "Tên sản phẩm"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 419,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                                                        className: "py-4 px-6",
                                                                        children: "Phân loại"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 420,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                                                        className: "py-4 px-6 text-right",
                                                                        children: "Giá bán"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 421,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                                                        className: "py-4 px-6 text-center",
                                                                        children: "Tồn kho"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 422,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                                                        className: "py-4 px-6 text-center",
                                                                        children: "Trạng thái"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 423,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                lineNumber: 417,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                            lineNumber: 416,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("tbody", {
                                                            children: products.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("tr", {
                                                                    className: "border-b border-gray-100 last:border-0 text-xs text-gray-700 hover:bg-gray-50/50 transition-all",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                                            className: "py-4 px-6",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                className: "w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex items-center justify-center p-1",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("img", {
                                                                                    src: p.garment_image_public_url,
                                                                                    alt: p.name,
                                                                                    className: "max-w-full max-h-full object-contain"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/shop/dashboard.js",
                                                                                    lineNumber: 431,
                                                                                    columnNumber: 33
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                                lineNumber: 430,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                                            lineNumber: 429,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                                            className: "py-4 px-6 font-bold text-gray-800 max-w-[280px]",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                className: "line-clamp-2",
                                                                                children: p.name
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                                lineNumber: 435,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                                            lineNumber: 434,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                                            className: "py-4 px-6 capitalize",
                                                                            children: p.category === 'female' ? '👩 Nữ' : p.category === 'male' ? '👨 Nam' : '🧑 Unisex'
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                                            lineNumber: 437,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                                            className: "py-4 px-6 text-right font-black text-gray-800",
                                                                            children: [
                                                                                p.price.toLocaleString('vi-VN'),
                                                                                " ₫"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                                            lineNumber: 440,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                                            className: "py-4 px-6 text-center font-semibold text-gray-500",
                                                                            children: [
                                                                                p.stock,
                                                                                " cái"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                                            lineNumber: 443,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                                            className: "py-4 px-6 text-center",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                className: "bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.8 rounded",
                                                                                children: "Đang bán"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                                lineNumber: 447,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                                            lineNumber: 446,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, p._id, true, {
                                                                    fileName: "[project]/pages/shop/dashboard.js",
                                                                    lineNumber: 428,
                                                                    columnNumber: 27
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                            lineNumber: 426,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/pages/shop/dashboard.js",
                                                    lineNumber: 415,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 414,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/shop/dashboard.js",
                                        lineNumber: 386,
                                        columnNumber: 15
                                    }, this),
                                    activeTab === 'orders' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "p-6 border-b border-gray-100",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                        className: "text-sm font-bold text-gray-800",
                                                        children: "Danh sách đơn hàng nhận được"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 466,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] text-gray-400 mt-0.5",
                                                        children: "Xử lý đóng gói và bàn giao cho đơn vị vận chuyển"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 467,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 465,
                                                columnNumber: 17
                                            }, this),
                                            loadingOrders ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "py-12 text-center text-xs text-gray-400",
                                                children: "Đang tải danh sách đơn hàng..."
                                            }, void 0, false, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 471,
                                                columnNumber: 19
                                            }, this) : orders.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "py-16 text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        className: "text-4xl",
                                                        children: "📦"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 474,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-gray-400 font-bold mt-3",
                                                        children: "Cửa hàng chưa có đơn hàng nào."
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                        lineNumber: 475,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 473,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "overflow-x-auto",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("table", {
                                                    className: "w-full text-left border-collapse",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("thead", {
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("tr", {
                                                                className: "bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                                                        className: "py-4 px-6",
                                                                        children: "Khách hàng / Thời gian"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 482,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                                                        className: "py-4 px-6",
                                                                        children: "Sản phẩm"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 483,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                                                        className: "py-4 px-6 text-right",
                                                                        children: "Tổng tiền"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 484,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                                                        className: "py-4 px-6",
                                                                        children: "Địa chỉ nhận"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 485,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                                                        className: "py-4 px-6 text-center",
                                                                        children: "Trạng thái"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 486,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                                                        className: "py-4 px-6 text-center",
                                                                        children: "Hành động"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                        lineNumber: 487,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                lineNumber: 481,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                            lineNumber: 480,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("tbody", {
                                                            children: orders.map((order)=>{
                                                                const formattedDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                });
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("tr", {
                                                                    className: "border-b border-gray-100 last:border-0 text-xs text-gray-700 hover:bg-gray-50/50 transition-all",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                                            className: "py-4 px-6",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                    className: "font-bold text-gray-800 block",
                                                                                    children: order.buyer_id?.username || 'Khách vãng lai'
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/shop/dashboard.js",
                                                                                    lineNumber: 499,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                    className: "text-[10px] text-gray-400 block mt-0.5",
                                                                                    children: formattedDate
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/shop/dashboard.js",
                                                                                    lineNumber: 500,
                                                                                    columnNumber: 33
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                                            lineNumber: 498,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                                            className: "py-4 px-6 max-w-[250px]",
                                                                            children: order.items.map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                    className: "flex items-center gap-2 py-1 first:pt-0 last:pb-0",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                            className: "bg-gray-100 text-[10px] px-1.5 py-0.2 rounded font-bold text-gray-600",
                                                                                            children: [
                                                                                                "x",
                                                                                                item.quantity
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                                                            lineNumber: 507,
                                                                                            columnNumber: 37
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                            className: "truncate inline-block font-semibold text-gray-700",
                                                                                            children: [
                                                                                                item.name,
                                                                                                item.size && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                                    className: "text-[9px] text-[#ee4d2d] bg-[#fef5f0] px-1.5 py-0.5 rounded ml-1 font-bold",
                                                                                                    children: [
                                                                                                        "Size ",
                                                                                                        item.size
                                                                                                    ]
                                                                                                }, void 0, true, {
                                                                                                    fileName: "[project]/pages/shop/dashboard.js",
                                                                                                    lineNumber: 511,
                                                                                                    columnNumber: 41
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                                                            lineNumber: 508,
                                                                                            columnNumber: 37
                                                                                        }, this)
                                                                                    ]
                                                                                }, idx, true, {
                                                                                    fileName: "[project]/pages/shop/dashboard.js",
                                                                                    lineNumber: 506,
                                                                                    columnNumber: 35
                                                                                }, this))
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                                            lineNumber: 504,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                                            className: "py-4 px-6 text-right font-black text-gray-800",
                                                                            children: [
                                                                                order.total_amount.toLocaleString('vi-VN'),
                                                                                " ₫"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                                            lineNumber: 521,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                                            className: "py-4 px-6 max-w-[200px]",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                    className: "font-bold block",
                                                                                    children: [
                                                                                        order.shipping_info?.name,
                                                                                        " (",
                                                                                        order.shipping_info?.phone,
                                                                                        ")"
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/pages/shop/dashboard.js",
                                                                                    lineNumber: 527,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                    className: "text-[10px] text-gray-400 line-clamp-2 mt-0.5",
                                                                                    children: order.shipping_info?.address
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/shop/dashboard.js",
                                                                                    lineNumber: 528,
                                                                                    columnNumber: 33
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                                            lineNumber: 526,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                                            className: "py-4 px-6 text-center",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                className: `text-[10px] font-bold px-2 py-0.8 rounded inline-block ${order.status === 'pending' && 'bg-yellow-50 text-yellow-600' || order.status === 'shipping' && 'bg-blue-50 text-blue-600' || order.status === 'delivered' && 'bg-green-50 text-green-600' || order.status === 'cancelled' && 'bg-red-50 text-red-600'}`,
                                                                                children: [
                                                                                    order.status === 'pending' && '⏳ Chờ xử lý',
                                                                                    order.status === 'shipping' && '🚚 Đang giao',
                                                                                    order.status === 'delivered' && '✅ Hoàn thành',
                                                                                    order.status === 'cancelled' && '❌ Đã hủy'
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                                lineNumber: 533,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                                            lineNumber: 532,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                                                            className: "py-4 px-6 text-center",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("select", {
                                                                                value: order.status,
                                                                                onChange: (e)=>handleUpdateOrderStatus(order._id, e.target.value),
                                                                                className: "px-2 py-1 bg-white border border-gray-200 rounded text-xs font-semibold cursor-pointer outline-none focus:border-[#ee4d2d]",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                                                        value: "pending",
                                                                                        children: "⏳ Chờ xử lý"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                                        lineNumber: 553,
                                                                                        columnNumber: 35
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                                                        value: "shipping",
                                                                                        children: "🚚 Đang giao"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                                        lineNumber: 554,
                                                                                        columnNumber: 35
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                                                        value: "delivered",
                                                                                        children: "✅ Đã giao"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                                        lineNumber: 555,
                                                                                        columnNumber: 35
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                                                        value: "cancelled",
                                                                                        children: "❌ Hủy đơn"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/pages/shop/dashboard.js",
                                                                                        lineNumber: 556,
                                                                                        columnNumber: 35
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/pages/shop/dashboard.js",
                                                                                lineNumber: 548,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                                            lineNumber: 547,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, order._id, true, {
                                                                    fileName: "[project]/pages/shop/dashboard.js",
                                                                    lineNumber: 496,
                                                                    columnNumber: 29
                                                                }, this);
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/shop/dashboard.js",
                                                            lineNumber: 490,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/pages/shop/dashboard.js",
                                                    lineNumber: 479,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/pages/shop/dashboard.js",
                                                lineNumber: 478,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/shop/dashboard.js",
                                        lineNumber: 464,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/shop/dashboard.js",
                                lineNumber: 236,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("footer", {
                                className: "bg-white border-t border-gray-100 py-4 px-8 mt-auto text-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    className: "text-[11px] text-gray-400",
                                    children: "© 2026 SmartFit — AI Virtual Try-On Platform. Kênh Thống Kê và Quản Trị Seller v1.0"
                                }, void 0, false, {
                                    fileName: "[project]/pages/shop/dashboard.js",
                                    lineNumber: 573,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/pages/shop/dashboard.js",
                                lineNumber: 572,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/shop/dashboard.js",
                        lineNumber: 213,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/shop/dashboard.js",
                lineNumber: 132,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0j6msv3._.js.map