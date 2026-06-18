const fs = require('fs');
const path = require('path');
const { File } = require('buffer');

const DEFAULT_TRYON_MODEL = 'fal-ai/image-apps-v2/virtual-try-on';
const DEFAULT_VIDEO_MODEL = 'fal-ai/kling-video/v2.1/standard/image-to-video';

const contentTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
};

function isRemoteUrl(value) {
  return /^https?:\/\//i.test(value || '');
}

async function getFalClient() {
  if (!process.env.FAL_KEY) {
    throw new Error('Missing FAL_KEY. Set your fal API key in the backend environment before generating try-on images.');
  }

  const { fal } = await import('@fal-ai/client');
  return fal;
}

async function uploadLocalFile(fal, filePath) {
  const absolutePath = path.resolve(filePath);
  const bytes = await fs.promises.readFile(absolutePath);
  const ext = path.extname(absolutePath).toLowerCase();
  const file = new File([bytes], path.basename(absolutePath), {
    type: contentTypes[ext] || 'application/octet-stream',
  });

  return fal.storage.upload(file);
}

async function toFalInputUrl(fal, imagePathOrUrl) {
  if (!imagePathOrUrl) {
    throw new Error('Image path is required for fal virtual try-on.');
  }

  if (isRemoteUrl(imagePathOrUrl)) {
    return imagePathOrUrl;
  }

  if (!fs.existsSync(imagePathOrUrl)) {
    throw new Error(`Image file does not exist: ${imagePathOrUrl}`);
  }

  return uploadLocalFile(fal, imagePathOrUrl);
}

function extractImageUrl(data) {
  return (
    data?.images?.[0]?.url ||
    data?.image?.url ||
    data?.output?.images?.[0]?.url ||
    data?.result?.images?.[0]?.url ||
    ''
  );
}

function extractVideoUrl(data) {
  return (
    data?.video?.url ||
    data?.videos?.[0]?.url ||
    data?.output?.video?.url ||
    data?.result?.video?.url ||
    ''
  );
}

async function generateVirtualTryOn({ personImage, clothingImage }) {
  const fal = await getFalClient();
  const model = process.env.FAL_TRYON_MODEL || DEFAULT_TRYON_MODEL;
  const personImageUrl = await toFalInputUrl(fal, personImage);
  const clothingImageUrl = await toFalInputUrl(fal, clothingImage);

  const result = await fal.subscribe(model, {
    input: {
      person_image_url: personImageUrl,
      clothing_image_url: clothingImageUrl,
      preserve_pose: true,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS' && Array.isArray(update.logs)) {
        update.logs.map((log) => log.message).filter(Boolean).forEach((message) => {
          console.log(`[fal] ${message}`);
        });
      }
    },
  });

  const imageUrl = extractImageUrl(result.data);
  if (!imageUrl) {
    throw new Error(`fal did not return an image URL. Response: ${JSON.stringify(result.data)}`);
  }

  return {
    imageUrl,
    requestId: result.requestId,
    model,
  };
}

async function generateCatwalkVideo({ imageUrl, prompt, duration = '5' }) {
  const fal = await getFalClient();
  const model = process.env.FAL_VIDEO_MODEL || DEFAULT_VIDEO_MODEL;
  const inputImageUrl = await toFalInputUrl(fal, imageUrl);

  const result = await fal.subscribe(model, {
    input: {
      image_url: inputImageUrl,
      prompt: prompt || 'A realistic fashion catwalk video. The person wearing the outfit walks forward naturally, subtle camera movement, clean studio lighting, high quality.',
      duration: String(duration),
      negative_prompt: 'blur, distort, low quality, deformed body, extra limbs, warped face',
      cfg_scale: 0.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS' && Array.isArray(update.logs)) {
        update.logs.map((log) => log.message).filter(Boolean).forEach((message) => {
          console.log(`[fal-video] ${message}`);
        });
      }
    },
  });

  const videoUrl = extractVideoUrl(result.data);
  if (!videoUrl) {
    throw new Error(`fal did not return a video URL. Response: ${JSON.stringify(result.data)}`);
  }

  return {
    videoUrl,
    requestId: result.requestId,
    model,
  };
}

module.exports = {
  generateCatwalkVideo,
  generateVirtualTryOn,
};
