import React from 'react';

interface IconProps {
  className?: string;
}

const PracticeIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <g transform="rotate(-15 12 12) translate(-1, 1)">
            {/* Back card */}
            <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M4.268 7.21a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6.268a2 2 0 01-2-2V7.21z"
                stroke="currentColor"
                fill="none"
                opacity="0.6"
            />
            {/* Front card */}
            <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M3.268 9.21a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H5.268a2 2 0 01-2-2V9.21z"
                stroke="currentColor"
                fill="currentColor"
                opacity="0.2"
             />
             <path
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M3.268 9.21a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H5.268a2 2 0 01-2-2V9.21z"
                stroke="currentColor"
                fill="none"
             />
        </g>
    </svg>
);

export default PracticeIcon;
