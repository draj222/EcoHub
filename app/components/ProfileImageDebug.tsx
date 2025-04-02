'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FiUser, FiCamera } from 'react-icons/fi';

interface ProfileImageProps {
  imageUrl: string | null | undefined;
  userName: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  showUploadOverlay?: boolean;
}

export default function ProfileImageDebug({ 
  imageUrl, 
  userName, 
  size = 'md', 
  className = '',
  onClick,
  showUploadOverlay = false
}: ProfileImageProps) {
  // Force refresh periodically to ensure image loads
  const [forceRefreshKey, setForceRefreshKey] = useState(Date.now());
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Get dimensions based on size
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  }[size];
  
  // Add cache busting parameter to avoid caching issues
  const imageSrc = imageUrl ? 
    (imageUrl.includes('?') ? imageUrl : `${imageUrl}?v=${forceRefreshKey}`) : 
    '';

  // Force refresh every 2 seconds for a max of 3 attempts if image doesn't load
  useEffect(() => {
    if (!imageLoaded && !imageError) {
      const timer = setTimeout(() => {
        setForceRefreshKey(Date.now());
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [imageLoaded, imageError, forceRefreshKey]);

  // Log image info for debugging
  useEffect(() => {
    if (imageUrl) {
      console.log('ProfileImageDebug - Image URL:', {
        original: imageUrl,
        withCacheBusting: imageSrc,
        timestamp: new Date().toISOString()
      });
    }
  }, [imageUrl, imageSrc]);

  return (
    <div 
      className={`relative ${dimensions} rounded-full overflow-hidden bg-green-100 flex items-center justify-center group ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {imageSrc ? (
        <>
          <Image
            key={`profile-debug-${forceRefreshKey}`}
            src={imageSrc}
            alt={userName || "User"}
            fill
            className="object-cover"
            style={{ aspectRatio: "1/1" }}
            priority
            unoptimized={true}
            onLoad={() => {
              console.log('ProfileImageDebug - Image loaded successfully');
              setImageLoaded(true);
            }}
            onError={(e) => {
              console.error('ProfileImageDebug - Image failed to load:', imageSrc);
              setImageError(true);
            }}
          />
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-50">
              <div className="animate-pulse">Loading...</div>
            </div>
          )}
        </>
      ) : (
        <FiUser className="text-green-500 text-xl" />
      )}

      {/* Upload overlay */}
      {showUploadOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <FiCamera className="text-white text-xl" />
        </div>
      )}
    </div>
  );
} 