import React from 'react';

const Heart: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div className="absolute text-blue-300" style={style}>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  </div>
);

const LoveAnimation: React.FC = () => {
    const hearts = Array.from({ length: 25 }).map((_, i) => {
        const size = Math.random() * 2.5 + 1.5; // 1.5rem to 4rem
        const animationDuration = Math.random() * 2 + 3; // 3s to 5s
        const animationDelay = Math.random() * 2;
        const left = Math.random() * 100;
        
        const style: React.CSSProperties = {
            width: `${size}rem`,
            height: `${size}rem`,
            left: `${left}vw`,
            animation: `floatUp ${animationDuration}s ease-out forwards`,
            animationDelay: `${animationDelay}s`,
            opacity: 0,
            filter: `blur(${Math.random() * 2}px)`
        };
        
        return <Heart key={i} style={style} />;
    });

    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        {hearts}
        <style>{`
            @keyframes floatUp {
                0% { transform: translateY(100vh); opacity: 0; }
                20% { opacity: 0.7; }
                90% { opacity: 0.7; }
                100% { transform: translateY(-10vh); opacity: 0; }
            }
        `}</style>
      </div>
    );
};

export default LoveAnimation;