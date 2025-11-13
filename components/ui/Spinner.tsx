import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-4',
  }[size];
  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses} border-t-blue-500 border-r-blue-500 border-b-blue-500/20 border-l-blue-500/20 rounded-full animate-spin`}></div>
    </div>
  );
};

export default Spinner;