"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

const navigationItems = [
  {
    href: '/',
    label: 'Inicio',
    icon: '🏠'
  },
  {
    href: '/ventas',
    label: 'Ventas',
    icon: '💰'
  },
  {
    href: '/clientes',
    label: 'Clientes',
    icon: '👥'
  },
  {
    href: '/reportes',
    label: 'Reportes',
    icon: '📊'
  }
];

export const MobileNavigation: React.FC = () => {
  const pathname = usePathname();
  const { trabajadorActual } = useApp();

  if (!trabajadorActual) {
    return null; // No mostrar navegación si no hay trabajador seleccionado
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="grid grid-cols-4 h-16">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Marca de agua discreta */}
      <div className="absolute bottom-0 right-2 text-xs text-gray-300 opacity-40 pb-1">
        CREATE POR THIAGO AMORES
      </div>
    </div>
  );
};
