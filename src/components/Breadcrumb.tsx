import React from 'react';
import { ChevronRightIcon, HomeIcon } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  isMobile?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, isMobile = false }) => {
  return (
    <nav aria-label="Breadcrumb" role="navigation" className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
      <ol className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'} ${isMobile ? 'text-xs' : 'text-sm'} text-gray-400 ${isMobile ? 'overflow-x-auto' : ''}`}>
        <li className="flex items-center flex-shrink-0">
          <HomeIcon className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400`} aria-hidden="true" />
          <span className="sr-only">Home</span>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center flex-shrink-0">
            <ChevronRightIcon className={`${isMobile ? 'h-3 w-3 mx-1' : 'h-4 w-4 mx-2'} text-gray-500`} aria-hidden="true" />
            {item.href && !item.active ? (
              <a 
                href={item.href} 
                className={`hover:text-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-800 rounded ${isMobile ? 'px-0.5 py-0.5' : 'px-1 py-0.5'} ${isMobile ? 'touch-manipulation' : ''}`}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </a>
            ) : (
              <span 
                className={item.active ? 'text-gray-100 font-medium' : 'text-gray-400'}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};