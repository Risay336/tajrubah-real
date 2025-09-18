import React from 'react';

interface IconProps {
  className?: string;
}

const PracticeIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <g transform="rotate(-10 12 12)">
            {/* The card itself */}
            <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" />
            {/* Lines representing text */}
            <line x1="7" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1" />
            <line x1="7" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="1" />
        </g>
    </svg>
);

export default PracticeIcon;
