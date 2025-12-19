import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
