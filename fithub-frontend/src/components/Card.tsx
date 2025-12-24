import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  status?: 'active' | 'expired' | 'pending' | 'inactive';
}

const Card: React.FC<CardProps> = ({ children, className, variant = 'default', status, ...props }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50 hover:border-green-300';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 hover:border-yellow-300';
      case 'error':
        return 'border-red-200 bg-red-50 hover:border-red-300';
      case 'info':
        return 'border-blue-200 bg-blue-50 hover:border-blue-300';
      default:
        return 'border-gray-100 bg-white hover:border-green-200';
    }
  };

  const getStatusClasses = () => {
    switch (status) {
      case 'expired':
        return 'border-red-300 bg-red-50 hover:border-red-400';
      case 'pending':
        return 'border-yellow-200 bg-yellow-25 hover:border-yellow-300';
      case 'inactive':
        return 'border-gray-300 bg-gray-50 hover:border-gray-400';
      case 'active':
        return 'border-green-200 bg-green-50 hover:border-green-300';
      default:
        return '';
    }
  };

  const cardClasses = status ? getStatusClasses() : getVariantClasses();

  return (
    <div
      className={`p-6 rounded-lg shadow-sm border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${cardClasses} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
