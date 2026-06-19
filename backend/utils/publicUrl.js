const path = require('path');

function getPublicBaseUrl() {
  return (process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/+$/, '');
}

function isRemoteUrl(value) {
  return /^https?:\/\//i.test(value || '');
}

function isLocalFilePath(value) {
  if (!value || isRemoteUrl(value)) {
    return false;
  }

  return (
    value.includes(':/') ||
    value.includes(':\\') ||
    value.startsWith('/') ||
    /^[a-zA-Z]:/.test(value)
  );
}

function publicUploadUrl(...segments) {
  const safeSegments = segments
    .filter(Boolean)
    .map((segment) => encodeURIComponent(String(segment)));

  return `${getPublicBaseUrl()}/public/uploads/${safeSegments.join('/')}`;
}

function productImagePublicUrl(imageUrl) {
  if (!isLocalFilePath(imageUrl)) {
    return imageUrl;
  }

  return publicUploadUrl('products', path.basename(imageUrl));
}

module.exports = {
  getPublicBaseUrl,
  isLocalFilePath,
  productImagePublicUrl,
  publicUploadUrl,
};
