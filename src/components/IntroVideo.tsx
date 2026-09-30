// src/components/IntroVideo.tsx
import React, { useState, useRef, useEffect } from 'react';

interface IntroVideoProps {
  src: string;
  onClose: () => void;
}

export const IntroVideo: React.FC<IntroVideoProps> = ({ src, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // وقتی ویدیو تموم شد، محو بشه و بسته شه
  const handleEnded = () => {
    setIsVisible(false);
    setTimeout(onClose, 600); // هماهنگ با انیمیشن fade-out
  };

  // اگه ویدیو پخش نشد (مثلاً مرورگر بلاک کرد)، بعد از ۵ ثانیه ببندش
  useEffect(() => {
    const timer = setTimeout(() => {
      if (videoRef.current?.paused) {
        setIsVisible(false);
        setTimeout(onClose, 600);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-600 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        className="w-full h-full object-cover"
      />

      {/* دکمه‌ی رد کردن */}
      <button
        onClick={handleEnded}
        className="absolute top-4 left-4 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm backdrop-blur-md border border-white/20 transition-all"
      >
        رد کردن ✕
      </button>
    </div>
  );
};