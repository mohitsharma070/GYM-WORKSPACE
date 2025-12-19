import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon; // Lucide icon component
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ icon: Icon, title, subtitle, actions }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
          <Icon size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
};

export default PageHeader;
