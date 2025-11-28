import React, { useEffect, useState } from 'react';

const TIPS = [
  "Don't get busted.",
  "You can rob convenience stores for quick cash.",
  "Invest in the stock market before assassinations.",
  "The Vinewood sign is a great place for a selfie.",
  "Visit Los Santos Customs to upgrade your ride."
];

const IMAGES = [
  "https://picsum.photos/1920/1080?grayscale&random=1",
  "https://picsum.photos/1920/1080?grayscale&random=2",
  "https://picsum.photos/1920/1080?grayscale&random=3"
];

interface IntroOverlayProps {
  onComplete: () => void;
}

const IntroOverlay: React.FC<IntroOverlayProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Progress Bar Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
             setIsFading(true);
             setTimeout(onComplete, 1000);
          }, 500);
          return 100;
        }
        return next;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [onComplete]);

  // Image Cycling
  useEffect(() => {
    const interval = setInterval(() => {
        setCurrentImage(prev => (prev + 1) % IMAGES.length);
        setCurrentTip(prev => (prev + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (isFading && progress >= 100) return null;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col justify-between bg-black transition-opacity duration-1000 ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Background Ken Burns Effect */}
        {IMAGES.map((img, idx) => (
            <div 
                key={idx}
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
                style={{ 
                    backgroundImage: `url(${img})`,
                    opacity: currentImage === idx ? 0.4 : 0,
                    transform: currentImage === idx ? 'scale(1.1)' : 'scale(1.0)',
                    transition: 'opacity 1s ease-in-out, transform 6s linear'
                }}
            />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80" />

        <div className="relative z-10 p-12">
            <h1 className="text-4xl md:text-6xl font-gta text-white font-bold tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                Loading Story Mode
            </h1>
        </div>

        <div className="relative z-10 p-12 w-full max-w-4xl mx-auto mb-12">
             <div className="mb-4 flex items-center gap-4">
                 <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
                 <p className="text-white text-lg font-gta tracking-wide shadow-black drop-shadow-md">
                     {TIPS[currentTip]}
                 </p>
             </div>
             
             <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                 <div 
                    className="h-full bg-white transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                 />
             </div>
        </div>
    </div>
  );
};

export default IntroOverlay;