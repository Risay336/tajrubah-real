
import React from 'react';

interface IconProps {
  className?: string;
}

const TranslateIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m4 13h4m-4 0a1 1 0 01-1-1V7a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1M3 21h12M12 17l-4 4m0-4l4 4" />
  </svg>
);

export default TranslateIcon;
