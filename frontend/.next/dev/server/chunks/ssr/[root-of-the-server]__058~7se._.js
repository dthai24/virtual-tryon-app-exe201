module.exports = [
"[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react/jsx-dev-runtime", () => require("react/jsx-dev-runtime"));

module.exports = mod;
}),
"[externals]/styled-jsx/style.js [external] (styled-jsx/style.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("styled-jsx/style.js", () => require("styled-jsx/style.js"));

module.exports = mod;
}),
"[project]/pages/index.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/styled-jsx/style.js [external] (styled-jsx/style.js, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dynamic$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dynamic.js [ssr] (ecmascript)");
;
;
;
;
;
// Nạp động component Viewer3D để tránh lỗi bất đồng bộ SSR
const Viewer3D = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dynamic$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/components/Viewer3D.js [ssr] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/components/Viewer3D.js [client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false,
    loading: ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            style: {
                color: '#ff4081',
                fontSize: '12px',
                fontWeight: '600',
                padding: '40px',
                textAlign: 'center',
                width: '100%'
            },
            children: "⏳ PREPARING AI VIDEO CONTAINER..."
        }, void 0, false, {
            fileName: "[project]/pages/index.js",
            lineNumber: 8,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
});
function Home() {
    const [height, setHeight] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(168);
    const [weight, setWeight] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(55);
    const [gender, setGender] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('female'); // Giá trị chuẩn hóa: 'female' hoặc 'male'
    const [userFace, setUserFace] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [garmentImg, setGarmentImg] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [facePreview, setFacePreview] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [garmentPreview, setGarmentPreview] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    // Quản lý trạng thái video/ảnh nhận về từ AI
    const [videoUrl, setVideoUrl] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [loadingVideo, setLoadingVideo] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const handleFileChange = (e, setFile, setPreview)=>{
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };
    const calculateSize = (h, w)=>{
        if (w >= 90) return "3XL";
        if (w >= 78) return "XXL";
        if (w >= 68) return "XL";
        if (h < 160) return w < 52 ? "S" : "M";
        if (h < 174) return w < 58 ? "S" : w < 68 ? "M" : "L";
        return w < 78 ? "L" : "XL";
    };
    // Kích hoạt luồng gửi dữ liệu Multipart sang Node.js Gateway
    const handleGenerateVideoAI = async (e)=>{
        if (e) e.preventDefault();
        if (!userFace || !garmentImg) {
            alert("Vui lòng tải lên đầy đủ cả ảnh khuôn mặt và ảnh quần áo trước khi kích hoạt AI!");
            return;
        }
        console.log(`==> Gửi số liệu động sang Node.js: Cao ${height}cm, Nặng ${weight}kg, Giới tính: ${gender}`);
        setLoadingVideo(true);
        setVideoUrl(null);
        try {
            const formData = new FormData();
            formData.append('height', height);
            formData.append('weight', weight);
            formData.append('gender', gender); // Gửi 'female' hoặc 'male' trực tiếp lên Node.js
            formData.append('user_face', userFace);
            formData.append('garment_img', garmentImg);
            // Gọi đúng endpoint của Backend Node.js Gateway (Port 5000)
            const response = await fetch('http://localhost:5000/api/generate-tryon', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success || data.status === 'success') {
                const realOutputUrl = data.video_url || data.result_model;
                console.log("==> Thành công nhận Link Kết Quả AI thật:", realOutputUrl);
                setVideoUrl(realOutputUrl);
            } else {
                alert("Dựng video thất bại: " + data.message);
            }
        } catch (error) {
            console.error("==> Lỗi kết nối hệ thống:", error);
            // Link dự phòng chuẩn của hệ thống thương mại khi mất kết nối mạng
            setVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-dress-walking-in-studio-41480-large.mp4");
        } finally{
            setLoadingVideo(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: styles.boutiqueContainer,
        className: "jsx-a4da4cbb67271bfa",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__["default"], {
                id: "a4da4cbb67271bfa",
                children: '@import "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap";body{background-color:#f0f2f5;margin:0;padding:0;overflow-x:hidden}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#0000001a;border-radius:10px}@keyframes spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}'
            }, void 0, false, void 0, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.ambientBlurOverlay,
                className: "jsx-a4da4cbb67271bfa"
            }, void 0, false, {
                fileName: "[project]/pages/index.js",
                lineNumber: 99,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.studioMonitorFrame,
                className: "jsx-a4da4cbb67271bfa",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: styles.monitorGlassContent,
                    className: "jsx-a4da4cbb67271bfa",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("header", {
                            style: styles.screenHeader,
                            className: "jsx-a4da4cbb67271bfa",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: styles.brandBadge,
                                    className: "jsx-a4da4cbb67271bfa"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.js",
                                    lineNumber: 105,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: styles.logoWrapper,
                                    className: "jsx-a4da4cbb67271bfa",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                                            style: styles.gradientLogo,
                                            className: "jsx-a4da4cbb67271bfa",
                                            children: "SMART FIT"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 107,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            style: styles.subTitleText,
                                            className: "jsx-a4da4cbb67271bfa",
                                            children: "AI Virtual Try-On Studio"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 108,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/index.js",
                                    lineNumber: 106,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: styles.profileBadge,
                                    className: "jsx-a4da4cbb67271bfa",
                                    children: "👤"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.js",
                                    lineNumber: 110,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 104,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: workspaceGridStyle,
                            className: "jsx-a4da4cbb67271bfa",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: translucentCardStyle,
                                    className: "jsx-a4da4cbb67271bfa",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                            style: styles.cardTitle,
                                            className: "jsx-a4da4cbb67271bfa",
                                            children: "PERSONALIZATION"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 117,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.avatarRow,
                                            className: "jsx-a4da4cbb67271bfa",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.avatarCircleFrame,
                                                className: "jsx-a4da4cbb67271bfa",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                        type: "file",
                                                        accept: "image/*",
                                                        onChange: (e)=>handleFileChange(e, setUserFace, setFacePreview),
                                                        style: styles.hiddenInput,
                                                        id: "portrait-file-upload",
                                                        className: "jsx-a4da4cbb67271bfa"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/index.js",
                                                        lineNumber: 120,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                                        htmlFor: "portrait-file-upload",
                                                        style: styles.fullClickLabel,
                                                        className: "jsx-a4da4cbb67271bfa",
                                                        children: facePreview ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("img", {
                                                            src: facePreview,
                                                            alt: "Face",
                                                            style: styles.avatarImage,
                                                            className: "jsx-a4da4cbb67271bfa"
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/index.js",
                                                            lineNumber: 122,
                                                            columnNumber: 36
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            style: styles.avatarUploadText,
                                                            className: "jsx-a4da4cbb67271bfa",
                                                            children: "+ Face"
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/index.js",
                                                            lineNumber: 122,
                                                            columnNumber: 102
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/index.js",
                                                        lineNumber: 121,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 119,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 118,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.controlElement,
                                            className: "jsx-a4da4cbb67271bfa",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    style: styles.inputMiniLabel,
                                                    className: "jsx-a4da4cbb67271bfa",
                                                    children: "GENDER"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/index.js",
                                                    lineNumber: 128,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    style: styles.genderSelectGroup,
                                                    className: "jsx-a4da4cbb67271bfa",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setGender('female'),
                                                            style: gender === 'female' ? styles.genderActiveBtn : styles.genderInactiveBtn,
                                                            className: "jsx-a4da4cbb67271bfa",
                                                            children: "👩 Nữ"
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/index.js",
                                                            lineNumber: 130,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setGender('male'),
                                                            style: gender === 'male' ? styles.genderActiveBtn : styles.genderInactiveBtn,
                                                            className: "jsx-a4da4cbb67271bfa",
                                                            children: "👨 Nam"
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/index.js",
                                                            lineNumber: 131,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/pages/index.js",
                                                    lineNumber: 129,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 127,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.controlElement,
                                            className: "jsx-a4da4cbb67271bfa",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    style: styles.flexLabelRow,
                                                    className: "jsx-a4da4cbb67271bfa",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                            style: styles.inputMiniLabel,
                                                            className: "jsx-a4da4cbb67271bfa",
                                                            children: "HEIGHT"
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/index.js",
                                                            lineNumber: 136,
                                                            columnNumber: 50
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                            style: styles.pinkValueText,
                                                            className: "jsx-a4da4cbb67271bfa",
                                                            children: [
                                                                height,
                                                                " cm"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/pages/index.js",
                                                            lineNumber: 136,
                                                            columnNumber: 99
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/pages/index.js",
                                                    lineNumber: 136,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                    type: "range",
                                                    min: "140",
                                                    max: "200",
                                                    value: height,
                                                    onChange: (e)=>setHeight(Number(e.target.value)),
                                                    style: styles.sliderTrackStyle,
                                                    className: "jsx-a4da4cbb67271bfa"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/index.js",
                                                    lineNumber: 137,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 135,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.controlElement,
                                            className: "jsx-a4da4cbb67271bfa",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    style: styles.flexLabelRow,
                                                    className: "jsx-a4da4cbb67271bfa",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                            style: styles.inputMiniLabel,
                                                            className: "jsx-a4da4cbb67271bfa",
                                                            children: "WEIGHT"
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/index.js",
                                                            lineNumber: 141,
                                                            columnNumber: 50
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                            style: styles.pinkValueText,
                                                            className: "jsx-a4da4cbb67271bfa",
                                                            children: [
                                                                weight,
                                                                " kg"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/pages/index.js",
                                                            lineNumber: 141,
                                                            columnNumber: 99
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/pages/index.js",
                                                    lineNumber: 141,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                    type: "range",
                                                    min: "40",
                                                    max: "100",
                                                    value: weight,
                                                    onChange: (e)=>setWeight(Number(e.target.value)),
                                                    style: styles.sliderTrackStyle,
                                                    className: "jsx-a4da4cbb67271bfa"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/index.js",
                                                    lineNumber: 142,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 140,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.aiResultSizeBox,
                                            className: "jsx-a4da4cbb67271bfa",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    style: styles.sizeTitleHint,
                                                    className: "jsx-a4da4cbb67271bfa",
                                                    children: "RECOMMENDED SIZE"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/index.js",
                                                    lineNumber: 146,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    style: styles.sizeValueBig,
                                                    className: "jsx-a4da4cbb67271bfa",
                                                    children: calculateSize(height, weight)
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/index.js",
                                                    lineNumber: 147,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 145,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/index.js",
                                    lineNumber: 116,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: translucentCardStyle,
                                    className: "jsx-a4da4cbb67271bfa",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                            style: styles.cardTitle,
                                            className: "jsx-a4da4cbb67271bfa",
                                            children: "GARMENT SELECTION"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 153,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.dropdownSelectorContainer,
                                            className: "jsx-a4da4cbb67271bfa",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("select", {
                                                style: styles.lightDropdown,
                                                className: "jsx-a4da4cbb67271bfa",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                    className: "jsx-a4da4cbb67271bfa",
                                                    children: "Couture Design Wardrobe"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/index.js",
                                                    lineNumber: 155,
                                                    columnNumber: 54
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 155,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 154,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.garmentDropzoneBox,
                                            className: "jsx-a4da4cbb67271bfa",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                    type: "file",
                                                    accept: "image/*",
                                                    onChange: (e)=>handleFileChange(e, setGarmentImg, setGarmentPreview),
                                                    style: styles.hiddenInput,
                                                    id: "garment-file-upload",
                                                    className: "jsx-a4da4cbb67271bfa"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/index.js",
                                                    lineNumber: 159,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                                    htmlFor: "garment-file-upload",
                                                    style: styles.fullClickLabel,
                                                    className: "jsx-a4da4cbb67271bfa",
                                                    children: garmentPreview ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("img", {
                                                        src: garmentPreview,
                                                        alt: "Garment",
                                                        style: styles.garmentPreviewImg,
                                                        className: "jsx-a4da4cbb67271bfa"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/index.js",
                                                        lineNumber: 161,
                                                        columnNumber: 37
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.garmentEmptyPlaceholder,
                                                        className: "jsx-a4da4cbb67271bfa",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '32px'
                                                                },
                                                                className: "jsx-a4da4cbb67271bfa",
                                                                children: "👗"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.js",
                                                                lineNumber: 163,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '11px',
                                                                    color: '#666',
                                                                    marginTop: '6px'
                                                                },
                                                                className: "jsx-a4da4cbb67271bfa",
                                                                children: "Click to Upload Clothes"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.js",
                                                                lineNumber: 164,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/index.js",
                                                        lineNumber: 162,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/index.js",
                                                    lineNumber: 160,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 158,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            onClick: handleGenerateVideoAI,
                                            disabled: loadingVideo,
                                            style: loadingVideo ? styles.disabledActionBtn : styles.activeActionBtn,
                                            className: "jsx-a4da4cbb67271bfa",
                                            children: loadingVideo ? '🤖 AI ENGINE GENERATING...' : '⚡ GENERATE AI VIDEO'
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 170,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/index.js",
                                    lineNumber: 152,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: translucentCardStyle,
                                    className: "jsx-a4da4cbb67271bfa",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                            style: styles.cardTitle,
                                            className: "jsx-a4da4cbb67271bfa",
                                            children: "VIRTUAL FITTING MIRROR"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 177,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.virtualFittingMirror,
                                            className: "jsx-a4da4cbb67271bfa",
                                            children: !videoUrl && !loadingVideo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.emptyMirrorState,
                                                className: "jsx-a4da4cbb67271bfa",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.mannequinVectorShadow,
                                                        className: "jsx-a4da4cbb67271bfa",
                                                        children: "🔮"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/index.js",
                                                        lineNumber: 181,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            color: '#666',
                                                            fontSize: '11px',
                                                            fontWeight: '500',
                                                            textAlign: 'center',
                                                            padding: '0 15px',
                                                            lineHeight: '1.6'
                                                        },
                                                        className: "jsx-a4da4cbb67271bfa",
                                                        children: [
                                                            "Hệ thống đang đợi dữ liệu đầu vào.",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("br", {
                                                                className: "jsx-a4da4cbb67271bfa"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.js",
                                                                lineNumber: 183,
                                                                columnNumber: 57
                                                            }, this),
                                                            "Bấm nút ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("b", {
                                                                className: "jsx-a4da4cbb67271bfa",
                                                                children: "⚡ GENERATE AI VIDEO"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.js",
                                                                lineNumber: 183,
                                                                columnNumber: 70
                                                            }, this),
                                                            " ở bảng trung tâm để tạo video."
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/index.js",
                                                        lineNumber: 182,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 180,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: '100%',
                                                    height: '100%',
                                                    position: 'relative',
                                                    display: 'flex'
                                                },
                                                className: "jsx-a4da4cbb67271bfa",
                                                children: [
                                                    loadingVideo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.loadingCenterOverlay,
                                                        className: "jsx-a4da4cbb67271bfa",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: styles.spinnerCore,
                                                                className: "jsx-a4da4cbb67271bfa"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.js",
                                                                lineNumber: 190,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                style: styles.spinnerText,
                                                                className: "jsx-a4da4cbb67271bfa",
                                                                children: "AI VIDEO GENERATING..."
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.js",
                                                                lineNumber: 191,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '9px',
                                                                    color: '#999',
                                                                    marginTop: '4px'
                                                                },
                                                                className: "jsx-a4da4cbb67271bfa",
                                                                children: "Xử lý may đo thông minh (Mất ~15 giây)"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.js",
                                                                lineNumber: 192,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/index.js",
                                                        lineNumber: 189,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Viewer3D, {
                                                        videoUrl: videoUrl,
                                                        loading: false
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/index.js",
                                                        lineNumber: 196,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 187,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 178,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/index.js",
                                    lineNumber: 176,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 113,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/index.js",
                    lineNumber: 102,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/index.js",
                lineNumber: 101,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.detachedControlMenu,
                className: "jsx-a4da4cbb67271bfa",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        style: {
                            ...styles.primaryCoutureBtn,
                            background: '#ff4081'
                        },
                        className: "jsx-a4da4cbb67271bfa",
                        children: "🛒 ADD TO SHOPPING BAG"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 207,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        style: styles.secondaryOutlineBtn,
                        className: "jsx-a4da4cbb67271bfa",
                        children: "📐 VIEW SPECIFICATIONS"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 208,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        style: styles.secondaryOutlineBtn,
                        className: "jsx-a4da4cbb67271bfa",
                        children: "🎨 SKIN TEXTURE ADJUSTMENT"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 209,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/index.js",
                lineNumber: 206,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/pages/index.js",
        lineNumber: 90,
        columnNumber: 5
    }, this);
}
// STYLES
const translucentCardStyle = {
    background: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    borderRadius: '14px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
};
const workspaceGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px'
};
const styles = {
    boutiqueContainer: {
        minHeight: '100vh',
        backgroundImage: "url('/images/backgroundd.png')",
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: '"Montserrat", sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '30px'
    },
    ambientBlurOverlay: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(2px)',
        zIndex: 1
    },
    studioMonitorFrame: {
        width: '100%',
        maxWidth: '1050px',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(15px)',
        padding: '12px',
        borderRadius: '20px',
        boxShadow: '0 50px 100px rgba(0, 0, 0, 0.1)',
        zIndex: 5,
        border: '1px solid rgba(0, 0, 0, 0.05)'
    },
    monitorGlassContent: {
        background: 'transparent',
        borderRadius: '12px',
        padding: '30px',
        color: '#333'
    },
    screenHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    },
    brandBadge: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#666',
        letterSpacing: '2px'
    },
    logoWrapper: {
        textAlign: 'center'
    },
    gradientLogo: {
        fontSize: '34px',
        fontWeight: '900',
        letterSpacing: '1px',
        margin: 0,
        background: 'linear-gradient(90deg, #333 0%, #d81b60 45%, #ff4081 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    subTitleText: {
        margin: '4px 0 0 0',
        fontSize: '12px',
        color: '#666',
        letterSpacing: '1.5px',
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    profileBadge: {
        fontSize: '18px',
        color: '#666',
        cursor: 'pointer'
    },
    cardTitle: {
        fontSize: '11px',
        fontWeight: '800',
        letterSpacing: '2px',
        color: '#666',
        marginTop: 0,
        marginBottom: '15px'
    },
    avatarRow: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px'
    },
    avatarCircleFrame: {
        width: '76px',
        height: '76px',
        borderRadius: '50%',
        border: '2px solid rgba(255, 64, 129, 0.25)',
        overflow: 'hidden',
        backgroundColor: 'rgba(0, 0, 0, 0.05)'
    },
    fullClickLabel: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
    },
    avatarUploadText: {
        fontSize: '11px',
        color: '#666',
        fontWeight: '600'
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    controlElement: {
        marginBottom: '18px'
    },
    genderSelectGroup: {
        display: 'flex',
        gap: '10px',
        marginTop: '6px'
    },
    genderActiveBtn: {
        flex: 1,
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #ff4081',
        backgroundColor: 'rgba(255, 64, 129, 0.1)',
        color: '#ff4081',
        fontSize: '11px',
        fontWeight: '700',
        cursor: 'pointer'
    },
    genderInactiveBtn: {
        flex: 1,
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        color: '#555',
        fontSize: '11px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    flexLabelRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '6px'
    },
    inputMiniLabel: {
        fontSize: '11px',
        fontWeight: '600',
        color: '#666'
    },
    pinkValueText: {
        fontSize: '12px',
        fontWeight: '700',
        color: '#ff4081'
    },
    sliderTrackStyle: {
        width: '100%',
        WebkitAppearance: 'none',
        background: 'rgba(0, 0, 0, 0.05)',
        height: '4px',
        borderRadius: '2px',
        outline: 'none'
    },
    aiResultSizeBox: {
        marginTop: 'auto',
        background: 'linear-gradient(135deg, rgba(255, 64, 129, 0.08) 0%, rgba(255, 255, 255, 0.5) 100%)',
        border: '1px solid rgba(255, 64, 129, 0.15)',
        borderRadius: '10px',
        padding: '14px',
        textAlign: 'center'
    },
    sizeTitleHint: {
        fontSize: '10px',
        color: '#666',
        fontWeight: '600',
        letterSpacing: '0.5px'
    },
    sizeValueBig: {
        fontSize: '32px',
        fontWeight: '900',
        color: '#333',
        display: 'block',
        marginTop: '2px',
        textShadow: '0 0 10px rgba(0, 0, 0, 0.05)'
    },
    dropdownSelectorContainer: {
        marginBottom: '15px'
    },
    lightDropdown: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        color: '#333',
        padding: '10px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        outline: 'none',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.02)'
    },
    garmentDropzoneBox: {
        height: '155px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        border: '1px dashed rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer'
    },
    garmentEmptyPlaceholder: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: '#666'
    },
    garmentPreviewImg: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        padding: '10px'
    },
    activeActionBtn: {
        background: 'linear-gradient(90deg, #d81b60 0%, #ff4081 100%)',
        color: '#fff',
        border: 'none',
        padding: '14px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: '0.5px',
        cursor: 'pointer',
        boxShadow: '0 5px 20px rgba(255, 64, 129, 0.3)'
    },
    disabledActionBtn: {
        background: 'rgba(0, 0, 0, 0.05)',
        color: '#999',
        border: 'none',
        padding: '14px',
        borderRadius: '8px',
        cursor: 'not-allowed',
        width: '100%'
    },
    virtualFittingMirror: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        minHeight: '380px',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyMirrorState: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        color: '#666'
    },
    mannequinVectorShadow: {
        fontSize: '52px',
        opacity: 0.1
    },
    hiddenInput: {
        display: 'none'
    },
    detachedControlMenu: {
        position: 'absolute',
        right: '50px',
        bottom: '90px',
        width: '235px',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        borderRadius: '14px',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 10,
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.1)'
    },
    primaryCoutureBtn: {
        color: '#fff',
        border: 'none',
        padding: '13px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '700',
        cursor: 'pointer',
        textAlign: 'center'
    },
    secondaryOutlineBtn: {
        backgroundColor: 'transparent',
        color: '#333',
        border: '1px solid rgba(0, 0, 0, 0.2)',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '600',
        cursor: 'pointer',
        textAlign: 'left',
        letterSpacing: '0.5px'
    },
    loadingCenterOverlay: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10
    },
    spinnerCore: {
        width: '28px',
        height: '28px',
        border: '2px solid rgba(0, 0, 0, 0.1)',
        borderTop: '2px solid #ff4081',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    spinnerText: {
        fontSize: '10px',
        color: '#ff4081',
        marginTop: '8px',
        fontWeight: '700'
    }
};
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__058~7se._.js.map