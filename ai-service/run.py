from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import fal_client
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔴 API KEY FAL.AI CỦA BẠN
os.environ["FAL_KEY"] = "448e4202-f3c9-4838-a0e6-02bcf2cb0330:b7eb1e33b3c1845281acadbb1c93ae25"

def clean_local_path(path_str: str) -> str:
    """Hàm chuẩn hóa đường dẫn file Windows đề phòng lỗi từ Node.js truyền sang"""
    if not path_str:
        return ""
    path_str = path_str.replace("file:///", "").replace("file://", "")
    path_str = os.path.normpath(path_str)
    return path_str

# ==============================================================
# ENDPOINT 1: Chỉ tạo ảnh tĩnh (IDM-VTON) — Trả về NGAY LẬP TỨC
# Thời gian: ~15-30 giây
# ==============================================================
@app.post("/api/generate-tryon-image")
async def api_generate_tryon_image(request: Request):
    print("\n=======================================================")
    print("🖼️  SMARTFIT ENGINE: BƯỚC 1 — GEN ẢNH TĨNH (IDM-VTON)")
    print("=======================================================")
    
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Dữ liệu JSON không hợp lệ")

    human_path = clean_local_path(body.get("face_image"))
    garment_path = clean_local_path(body.get("garment_image"))

    print(f"📁 Đường dẫn ảnh người (Human): {human_path}")
    print(f"📁 Đường dẫn ảnh áo (Garment): {garment_path}")

    if not os.path.exists(human_path):
        raise HTTPException(status_code=404, detail=f"Không tìm thấy file ảnh người: {human_path}")
    if not os.path.exists(garment_path):
        raise HTTPException(status_code=404, detail=f"Không tìm thấy file ảnh áo: {garment_path}")

    try:
        print("🤖 Đang upload và xử lý High-Fidelity Virtual Try-On (IDM-VTON)...")
        human_url = fal_client.upload_file(human_path)
        garment_url = fal_client.upload_file(garment_path)

        vton_result = fal_client.subscribe(
            "fal-ai/idm-vton",
            arguments={
                "human_image_url": human_url,
                "garment_image_url": garment_url,
                "garment_type": "upper_body",
                "vton_mode": "balanced"
            },
            with_logs=True
        )

        if "image" in vton_result and "url" in vton_result["image"]:
            image_url = vton_result["image"]["url"]
            print(f"✅ THỬ ĐỒ THÀNH CÔNG! Link ảnh tĩnh: {image_url}")
            return {"success": True, "image_url": image_url}
        else:
            raise ValueError("IDM-VTON không trả về URL ảnh hợp lệ")

    except Exception as e:
        print(f"❌ Lỗi bước IDM-VTON: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi tạo ảnh thử đồ: {str(e)}")


# ==============================================================
# ENDPOINT 2: Tạo video catwalk từ ảnh tĩnh (Luma Ray 2)
# Được gọi bất đồng bộ từ backend Node.js — Thời gian: ~60-120 giây
# ==============================================================
@app.post("/api/generate-tryon-video")
async def api_generate_tryon_video(request: Request):
    print("\n=======================================================")
    print("🎬 SMARTFIT ENGINE: BƯỚC 2 — GEN VIDEO CATWALK (LUMA)")
    print("=======================================================")
    
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Dữ liệu JSON không hợp lệ")

    image_url = body.get("image_url")
    height = body.get("height", "168")
    weight = body.get("weight", "55")
    gender = body.get("gender", "female")

    if not image_url:
        raise HTTPException(status_code=400, detail="Thiếu image_url để tạo video")

    print(f"🖼️  Ảnh nguồn: {image_url}")
    print(f"📐 May đo: Cao {height}cm, Nặng {weight}kg, Giới tính: {gender}")

    gender_str = "male fashion model" if gender == "male" else "female fashion model"
    dynamic_prompt = (
        f"A professional {gender_str}, {height}cm tall, weighing {weight}kg, "
        f"smoothly walking forward on a fashion catwalk runway show, showcasing the outfit beautifully, "
        f"cinematic studio lighting, 4k resolution, high quality video, realistic cloth physics"
    )

    try:
        print(f"🎬 Đang gửi ảnh thử đồ sang Luma Ray 2 Flash dựng video...")
        
        video_result = fal_client.subscribe(
            "fal-ai/luma-dream-machine/ray-2-flash/image-to-video",
            arguments={
                "image_url": image_url,
                "prompt": dynamic_prompt,
                "duration": "5s"
            },
            with_logs=True
        )

        print(f"DEBUG VIDEO JSON: {video_result}")

        output_video_url = None
        if "video" in video_result and "url" in video_result["video"]:
            output_video_url = video_result["video"]["url"]
        elif isinstance(video_result, dict) and "outputs" in video_result and len(video_result["outputs"]) > 0:
            output_video_url = video_result["outputs"][0].get("url")

        if output_video_url:
            print(f"🎉 THÀNH CÔNG! Video catwalk: {output_video_url}")
            return {"success": True, "video_url": output_video_url}
        else:
            raise ValueError("Không bóc tách được trường URL video!")

    except Exception as e:
        print(f"❌ [LỖI TẦNG AI VIDEO]: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi tạo video: {str(e)}")


# ==============================================================
# ENDPOINT CŨ (giữ lại để tương thích ngược nếu cần)
# ==============================================================
@app.post("/api/generate-tryon")
async def api_generate_tryon(request: Request):
    """Legacy endpoint — chuyển hướng sang quy trình mới (image -> video riêng biệt)"""
    print("\n⚠️  [Legacy] Gọi qua /api/generate-tryon — Đang xử lý đầy đủ image+video...")
    
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Dữ liệu JSON không hợp lệ")

    # Gọi bước 1: tạo ảnh
    image_req = Request(request.scope, request.receive)
    # Tạo lại body cho sub-call bước 1
    human_path = clean_local_path(body.get("face_image"))
    garment_path = clean_local_path(body.get("garment_image"))
    height = body.get("height", "168")
    weight = body.get("weight", "55")
    gender = body.get("gender", "female")

    # Bước 1: ảnh
    vton_image_url = None
    try:
        human_url = fal_client.upload_file(human_path)
        garment_url = fal_client.upload_file(garment_path)
        vton_result = fal_client.subscribe(
            "fal-ai/idm-vton",
            arguments={
                "human_image_url": human_url,
                "garment_image_url": garment_url,
                "garment_type": "upper_body",
                "vton_mode": "balanced"
            },
            with_logs=True
        )
        if "image" in vton_result and "url" in vton_result["image"]:
            vton_image_url = vton_result["image"]["url"]
    except Exception as e:
        print(f"❌ Lỗi bước ảnh (legacy): {str(e)}")

    if not vton_image_url:
        return {"success": True, "video_url": "https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-dress-walking-in-studio-41480-large.mp4"}

    # Bước 2: video
    try:
        gender_str = "male fashion model" if gender == "male" else "female fashion model"
        dynamic_prompt = (
            f"A professional {gender_str}, {height}cm tall, weighing {weight}kg, "
            f"smoothly walking forward on a fashion catwalk runway show, showcasing the outfit beautifully, "
            f"cinematic studio lighting, 4k resolution, high quality video, realistic cloth physics"
        )
        video_result = fal_client.subscribe(
            "fal-ai/luma-dream-machine/ray-2-flash/image-to-video",
            arguments={"image_url": vton_image_url, "prompt": dynamic_prompt, "duration": "5s"},
            with_logs=True
        )
        output_video_url = None
        if "video" in video_result and "url" in video_result["video"]:
            output_video_url = video_result["video"]["url"]
        elif isinstance(video_result, dict) and "outputs" in video_result and len(video_result["outputs"]) > 0:
            output_video_url = video_result["outputs"][0].get("url")
        if output_video_url:
            return {"success": True, "video_url": output_video_url}
    except Exception as video_err:
        print(f"❌ Lỗi bước video (legacy): {str(video_err)}")
        return {"success": True, "video_url": vton_image_url}

    return {"success": True, "video_url": "https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-dress-walking-in-studio-41480-large.mp4"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8099)