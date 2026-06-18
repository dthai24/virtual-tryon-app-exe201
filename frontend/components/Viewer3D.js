import React from 'react';

export default function Viewer3D({ videoUrl, loading }) {
  if (loading || !videoUrl) return null;

  // Tự động nhận diện URL là video hay ảnh
  const isVideo = videoUrl.match(/\.(mp4|webm|ogg)(\?|$)/i);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {isVideo ? (
        <video 
          src={videoUrl} 
          autoPlay 
          loop 
          muted 
          controls 
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
        />
      ) : (
        <img 
          src={videoUrl} 
          alt="AI Generated Fit" 
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
        />
      )}
    </div>
  );
}
