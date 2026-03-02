'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 z-30">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-white hover:text-amber-600 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 ml-auto">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.email}</p>
            <p className="text-xs text-zinc-400">Administrador</p>
          </div>
          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-zinc-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
