import React from 'react';

interface LogoProps {
  variant?: 'horizontal' | 'compact' | 'icon' | 'badge' | 'appicon';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
  light?: boolean;
}

export const AmandaLogo: React.FC<LogoProps> = ({
  variant = 'compact',
  size = 'md',
  className = '',
  light = false,
}) => {
  // Theme-aware default colors (can be overridden by explicit props)
  const textColor = light ? 'text-white' : 'text-[#1A120B]';
  const subtextColor = light ? 'text-stone-300' : 'text-[#D4A373]';

  // Height and width classes for the main wrapper based on size
  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-18 h-18',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
    custom: '',
  };

  // Reusable core vector graphic: the brand icon (Cup, 'A' Monogram, Steam, Leaves, and Cherries)
  const LogoSvgCore = ({ className = "w-full h-full" }: { className?: string }) => (
    <svg
      viewBox="0 0 200 160"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Premium Gold Metallic Gradient */}
        <linearGradient id="amandaGoldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8A6421" />
          <stop offset="30%" stopColor="#C5A059" />
          <stop offset="60%" stopColor="#E6C98F" />
          <stop offset="85%" stopColor="#C5A059" />
          <stop offset="100%" stopColor="#96702B" />
        </linearGradient>

        {/* Soft Coffee Brown Shadow Gradient */}
        <radialGradient id="amandaCupShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1A120B" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#1A120B" stopOpacity="0" />
        </radialGradient>

        {/* Premium Dark Brown Gradient for Backgrounds */}
        <linearGradient id="amandaChocolateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D1B14" />
          <stop offset="50%" stopColor="#1C100A" />
          <stop offset="100%" stopColor="#0F0805" />
        </linearGradient>
      </defs>

      {/* Shadow under saucer */}
      <ellipse cx="100" cy="142" rx="55" ry="8" fill="url(#amandaCupShadow)" />

      {/* 1. GREEN COFFEE LEAVES AND COFFEE CHERRIES ON THE LEFT */}
      {/* Upper Leaf */}
      <path
        d="M 68,66 C 54,62 42,72 44,88 C 58,92 70,82 68,66 Z"
        fill="#4E6E35"
        stroke="#3F5A29"
        strokeWidth="0.75"
      />
      {/* Upper Leaf central vein */}
      <path d="M 44,88 Q 56,80 68,66" fill="none" stroke="#6D994D" strokeWidth="1" />
      
      {/* Lower Leaf */}
      <path
        d="M 62,94 C 48,94 38,106 42,120 C 56,120 66,108 62,94 Z"
        fill="#608A3F"
        stroke="#4E6E35"
        strokeWidth="0.75"
      />
      {/* Lower Leaf central vein */}
      <path d="M 42,120 Q 52,110 62,94" fill="none" stroke="#82B35B" strokeWidth="1" />

      {/* Middle/Back Leaf */}
      <path
        d="M 50,78 C 34,78 26,90 28,104 C 44,104 52,92 50,78 Z"
        fill="#3F5A29"
        stroke="#2E431E"
        strokeWidth="0.75"
        opacity="0.9"
      />
      {/* Back Leaf central vein */}
      <path d="M 28,104 Q 38,94 50,78" fill="none" stroke="#507337" strokeWidth="1" />

      {/* RED COFFEE CHERRIES (Vibrant clustering) */}
      {/* Cherry 1 */}
      <circle cx="64" cy="94" r="7.5" fill="#A31D1D" stroke="#680F0F" strokeWidth="0.5" />
      <circle cx="62" cy="92" r="2" fill="#FFA5A5" opacity="0.8" /> {/* Highlight */}

      {/* Cherry 2 */}
      <circle cx="56" cy="104" r="7" fill="#D32F2F" stroke="#8A1515" strokeWidth="0.5" />
      <circle cx="54" cy="102" r="1.8" fill="#FFA5A5" opacity="0.8" />

      {/* Cherry 3 */}
      <circle cx="68" cy="106" r="6.5" fill="#B71C1C" stroke="#720E0E" strokeWidth="0.5" />
      <circle cx="66" cy="104" r="1.5" fill="#FFA5A5" opacity="0.8" />


      {/* 2. THE COFFEE CUP & SAUCER */}
      {/* Golden Double Saucer (Bottom layers) */}
      <ellipse cx="102" cy="138" rx="52" ry="12" fill="#1A120B" stroke="url(#amandaGoldGrad)" strokeWidth="3" />
      <ellipse cx="102" cy="135" rx="44" ry="9" fill="#2A1B14" stroke="url(#amandaGoldGrad)" strokeWidth="1.5" />

      {/* Elegant Coffee Cup Body */}
      <path
        d="M 64,84 C 64,118 78,130 102,130 C 126,130 140,118 140,84 Z"
        fill="#1A120B"
        stroke="url(#amandaGoldGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Handle of the cup on the right */}
      <path
        d="M 140,94 C 158,94 164,114 140,118"
        fill="none"
        stroke="url(#amandaGoldGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />


      {/* 3. STYLIZED 'A' MONOGRAM WITH THE COFFEE BEAN INTEGRATION */}
      {/* Left leg of 'A' flowing down into the cup and wrapping elegantly around the bottom saucer */}
      <path
        d="M 100,45 C 92,58 76,82 74,104 C 72,120 85,124 100,124 C 112,124 122,118 126,110 C 128,106 124,104 122,108 C 118,114 110,118 100,118 C 90,118 80,114 81,102 C 83,86 96,65 100,58"
        fill="url(#amandaGoldGrad)"
      />

      {/* Right sweeping leg of 'A' looping gracefully to the right with active motion */}
      <path
        d="M 100,45 C 104,58 114,80 128,95 C 144,112 158,108 148,90 C 138,72 118,52 100,45"
        fill="url(#amandaGoldGrad)"
      />

      {/* Loop detail framing the A crossbar */}
      <path
        d="M 80,95 C 90,92 110,92 124,96 C 128,97 128,95 124,94 C 110,88 90,88 80,92"
        fill="url(#amandaGoldGrad)"
      />

      {/* The golden Coffee Bean embedded at the core inside the monogram */}
      <g transform="translate(100, 92) scale(0.6)">
        <ellipse cx="0" cy="0" rx="14" ry="9" fill="url(#amandaGoldGrad)" transform="rotate(-30)" />
        <path d="M -12,6 Q 0,-3 12,-6" fill="none" stroke="#2A1B14" strokeWidth="2" strokeLinecap="round" />
      </g>


      {/* 4. THREE WISPS OF ELEGANT RISE STEAM */}
      {/* Central steam */}
      <path
        d="M 100,36 C 96,28 104,24 100,14 C 98,10 94,12 96,6"
        fill="none"
        stroke="url(#amandaGoldGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Left steam */}
      <path
        d="M 88,38 C 84,32 92,28 88,20 C 86,16 82,18 84,12"
        fill="none"
        stroke="url(#amandaGoldGrad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Right steam */}
      <path
        d="M 112,38 C 108,32 116,28 112,20 C 110,16 106,18 108,12"
        fill="none"
        stroke="url(#amandaGoldGrad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );

  // Elegant wordmark for the brand
  const TextWordmark = ({ textLight = false }: { textLight?: boolean }) => {
    const mainColor = textLight ? 'fill-white' : 'fill-[#1A120B]';
    const accentGold = 'fill-[#C5A059]';
    
    return (
      <svg
        viewBox="0 0 320 80"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="textGoldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8A6421" />
            <stop offset="50%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#E6C98F" />
          </linearGradient>
        </defs>
        
        {/* 'AMANDA' CUSTOM SERIF VECTOR PATHS WITH CORRESPONDING STYLIZATIONS */}
        <g className="transform translate-y-6">
          {/* Stylized A with swoosh */}
          <path d="M 10,40 C -4,40 -2,10 14,2 L 20,2 L 32,40 L 25,40 L 16,10 L 12,24 C 18,24 24,28 20,40 Z" className={mainColor} />
          {/* Golden swoosh looping around first 'A' */}
          <path d="M -5,35 Q 12,24 25,5 C 27,2 24,0 20,3 Q 8,20 -7,32 Z" fill="url(#textGoldGrad)" />

          {/* M */}
          <path d="M 38,40 L 38,2 L 46,2 L 54,30 L 62,2 L 70,2 L 70,40 L 64,40 L 64,10 L 56,40 L 52,40 L 44,10 L 44,40 Z" className={mainColor} />

          {/* A (Second A with coffee bean inside) */}
          <path d="M 78,40 L 90,2 L 96,2 L 108,40 L 101,40 L 98,30 L 88,30 L 85,40 Z" className={mainColor} />
          {/* Crossbar Coffee Bean embedded in second 'A' */}
          <g transform="translate(93, 22) scale(0.35)">
            <ellipse cx="0" cy="0" rx="14" ry="9" fill="url(#textGoldGrad)" transform="rotate(-15)" />
            <path d="M -12,5 Q 0,-3 12,-5" fill="none" stroke="#2A1B14" strokeWidth="2.5" />
          </g>

          {/* N */}
          <path d="M 116,40 L 116,2 L 124,2 L 138,32 L 138,2 L 144,2 L 144,40 L 136,40 L 122,10 L 122,40 Z" className={mainColor} />

          {/* D */}
          <path d="M 152,40 L 152,2 L 168,2 C 184,2 188,14 188,21 C 188,30 180,40 166,40 Z M 159,34 L 165,34 C 176,34 180,26 180,21 C 180,14 175,8 164,8 L 159,8 Z" className={mainColor} />

          {/* A (Third standard elegant A) */}
          <path d="M 196,40 L 208,2 L 214,2 L 226,40 L 219,40 L 216,30 L 206,30 L 203,40 Z M 211,14 L 208,24 L 214,24 Z" className={mainColor} />
        </g>

        {/* 'C O F F E E' SPACED OUT SERIF WITH FLANKING GOLD LINES */}
        <g className="transform translate-y-24">
          {/* Flanking Left line */}
          <line x1="10" y1="5" x2="62" y2="5" stroke="url(#textGoldGrad)" strokeWidth="1.5" />

          {/* C */}
          <path d="M 84,10 C 76,10 72,5 72,0 C 72,-6 78,-10 84,-10 C 88,-10 90,-8 90,-6 L 85,-6 C 85,-7 84,-8 82,-8 C 79,-8 77,-5 77,0 C 77,4 79,8 82,8 C 84,8 85,7 85,6 L 90,6 C 90,8 88,10 84,10 Z" className={mainColor} />

          {/* O */}
          <path d="M 104,10 C 96,10 92,6 92,0 C 92,-6 96,-10 104,-10 C 112,-10 116,-6 116,0 C 116,6 112,10 104,10 Z M 104,8 C 109,8 111,4 111,0 C 111,-4 109,-8 104,-8 C 99,-8 97,-4 97,0 C 97,4 99,8 104,8 Z" className={mainColor} />

          {/* F */}
          <path d="M 124,10 L 124,-10 L 138,-10 L 138,-6 L 129,-6 L 129,-2 L 136,-2 L 136,2 L 129,2 L 129,10 Z" className={mainColor} />

          {/* F */}
          <path d="M 146,10 L 146,-10 L 160,-10 L 160,-6 L 151,-6 L 151,-2 L 158,-2 L 158,2 L 151,2 L 151,10 Z" className={mainColor} />

          {/* E */}
          <path d="M 168,10 L 168,-10 L 182,-10 L 182,-6 L 173,-6 L 173,-2 L 180,-2 L 180,2 L 173,2 L 173,6 L 182,6 L 182,10 Z" className={mainColor} />

          {/* E */}
          <path d="M 190,10 L 190,-10 L 204,-10 L 204,-6 L 195,-6 L 195,-2 L 202,-2 L 202,2 L 195,2 L 195,6 L 204,6 L 204,10 Z" className={mainColor} />

          {/* Flanking Right line */}
          <line x1="226" y1="5" x2="278" y2="5" stroke="url(#textGoldGrad)" strokeWidth="1.5" />
        </g>
      </svg>
    );
  };

  // Render the exact requested variant
  switch (variant) {
    case 'icon':
      return (
        <div className={`inline-block ${sizeClasses[size]} ${className}`}>
          <LogoSvgCore />
        </div>
      );

    case 'badge':
      // The Circular Emblem with Gold Border and Coffee Gradient Background
      return (
        <div 
          className={`flex flex-col items-center justify-center rounded-full border-2 border-[#D4A373] bg-gradient-to-br from-[#2D1B14] to-[#0F0805] shadow-xl p-4 text-center overflow-hidden transition-transform duration-300 hover:scale-105 ${className}`}
          style={{
            width: size === 'xs' ? '64px' : size === 'sm' ? '96px' : size === 'md' ? '140px' : size === 'lg' ? '190px' : size === 'xl' ? '250px' : '100%',
            height: size === 'xs' ? '64px' : size === 'sm' ? '96px' : size === 'md' ? '140px' : size === 'lg' ? '190px' : size === 'xl' ? '250px' : '100%',
          }}
        >
          <div className="w-[70%] h-[70%] -mt-1">
            <LogoSvgCore />
          </div>
          {size !== 'xs' && size !== 'sm' && (
            <div className="w-[85%] mt-1">
              <TextWordmark textLight={true} />
            </div>
          )}
        </div>
      );

    case 'appicon':
      // The Rounded-Square Emblem (Apple / Android App style)
      return (
        <div 
          className={`flex items-center justify-center rounded-3xl border border-[#D4A373]/30 bg-gradient-to-br from-[#2D1B14] to-[#0F0805] shadow-2xl p-3 transition-transform duration-300 hover:scale-105 ${className}`}
          style={{
            width: size === 'xs' ? '40px' : size === 'sm' ? '64px' : size === 'md' ? '96px' : size === 'lg' ? '128px' : size === 'xl' ? '180px' : '100%',
            height: size === 'xs' ? '40px' : size === 'sm' ? '64px' : size === 'md' ? '96px' : size === 'lg' ? '128px' : size === 'xl' ? '180px' : '100%',
          }}
        >
          <div className="w-[85%] h-[85%]">
            <LogoSvgCore />
          </div>
        </div>
      );

    case 'horizontal':
      return (
        <div className={`flex items-center gap-3.5 ${className}`}>
          <div className={`${size === 'xs' ? 'w-8 h-8' : size === 'sm' ? 'w-12 h-12' : size === 'md' ? 'w-16 h-16' : 'w-20 h-20'} flex-shrink-0`}>
            <LogoSvgCore />
          </div>
          <div className={`${size === 'xs' ? 'w-24' : size === 'sm' ? 'w-36' : size === 'md' ? 'w-44' : 'w-56'} flex-shrink-0`}>
            <TextWordmark textLight={light} />
          </div>
        </div>
      );

    case 'compact':
    default:
      // Vertical Stacked Logo (perfect for popups, headers, and hero overlays)
      return (
        <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
          <div className={`${size === 'xs' ? 'w-10 h-10' : size === 'sm' ? 'w-16 h-16' : size === 'md' ? 'w-24 h-24' : size === 'lg' ? 'w-36 h-36' : 'w-48 h-48'} flex-shrink-0`}>
            <LogoSvgCore />
          </div>
          <div className={`${size === 'xs' ? 'w-24' : size === 'sm' ? 'w-36' : size === 'md' ? 'w-44' : 'w-64'} flex-shrink-0`}>
            <TextWordmark textLight={light} />
          </div>
        </div>
      );
  }
};
