
import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const LavenderLogo: React.FC<LogoProps> = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    {/* Minimalist Stem */}
    <path 
      d="M12 22V12" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    
    {/* Top Petals Layer */}
    <path 
      d="M12 11.5C12 11.5 9 10 9 7.5C9 5 12 4 12 4C12 4 15 5 15 7.5C15 10 12 11.5 12 11.5Z" 
      fill="currentColor" 
      fillOpacity="0.4" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinejoin="round"
    />
    
    {/* Inner Bud */}
    <path 
      d="M12 7.5C12 7.5 10 6.5 10 5C10 3.5 12 3 12 3C12 3 14 3.5 14 5C14 6.5 12 7.5 12 7.5Z" 
      fill="currentColor" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinejoin="round"
    />
    
    {/* Bottom Petals Layer */}
    <path 
      d="M12 15C12 15 8 13.5 8 10.5C8 7.5 12 6.5 12 6.5C12 6.5 16 7.5 16 10.5C16 13.5 12 15 12 15Z" 
      fill="currentColor" 
      fillOpacity="0.2" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinejoin="round"
    />
    
    {/* Decorative Leaves */}
    <path 
      d="M12 20C12 20 14 19 15 17" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <path 
      d="M12 18C12 18 10 17 9 15" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
  </svg>
);
