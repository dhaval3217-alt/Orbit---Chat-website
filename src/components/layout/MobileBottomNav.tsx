import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useMoodStore } from '../../store/moodStore.js';
import { useConnectionStore } from '../../store/connectionStore.js';
import {
  Compass,
  Sparkles,
  MessageCircle,
  Shield,
  Users,
  User as UserIcon,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user, profile } = useAuthStore();
  const { selectedMood } = useMoodStore();
  const { connections } = useConnectionStore();

  // Hide while inside an active full-screen audio room to prevent dock collision
  const isRoomPage = location.pathname.startsWith('/room/');
  if (isRoomPage) return null;

  // Compute pending incoming connection requests for badge
  const pendingCount = connections.filter(
    (c) => c.status === 'PENDING' && c.recipient_id === user?.id
  ).length;

  const navItems = [
    {
      id: 'explore',
      label: 'Explore',
      path: '/dashboard',
      icon: Compass,
      activeColor: 'text-indigo-400',
      activeBg: 'bg-indigo-500/15 text-indigo-400',
      badge: null,
    },
    {
      id: 'vibes',
      label: 'Vibes',
      path: '/moods',
      icon: Sparkles,
      activeColor: 'text-cyan-400',
      activeBg: 'bg-cyan-500/15 text-cyan-400',
      badge: selectedMood ? (
        <span
          className="absolute top-1 right-3 w-2 h-2 rounded-full ring-2 ring-[#0a0d14] animate-ping"
          style={{ backgroundColor: selectedMood.color || '#06b6d4' }}
        />
      ) : null,
    },
    {
      id: 'lets-chat',
      label: "Let's Chat",
      path: '/lets-chat',
      icon: MessageCircle,
      activeColor: 'text-purple-400',
      activeBg: 'bg-purple-500/15 text-purple-400',
      badge: null,
    },
    {
      id: 'connections',
      label: 'Connections',
      path: '/connections',
      icon: Users,
      activeColor: 'text-purple-400',
      activeBg: 'bg-purple-500/15 text-purple-400',
      badge:
        pendingCount > 0 ? (
          <span className="absolute top-1 right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[10px] font-extrabold text-white flex items-center justify-center ring-2 ring-[#0a0d14]">
            {pendingCount}
          </span>
        ) : null,
    },
    {
      id: 'security',
      label: 'Security',
      path: '/security',
      icon: Shield,
      activeColor: 'text-emerald-400',
      activeBg: 'bg-emerald-500/15 text-emerald-400',
      badge: null,
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: UserIcon,
      activeColor: 'text-indigo-400',
      activeBg: 'bg-indigo-500/15 text-indigo-400',
      avatar: profile?.avatar_url,
      badge: null,
    },
  ];

  return (
    <nav
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav transition-transform duration-300 ${
        isRoomPage ? 'translate-y-0' : 'translate-y-0'
      }`}
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-6 items-center h-16 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/security'
            ? location.pathname.startsWith('/security') || location.pathname === '/threat-detection'
            : location.pathname === item.path;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`relative flex flex-col items-center justify-center h-full py-1 rounded-2xl touch-target transition-all duration-200 active:scale-90 select-none ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-10 h-8 rounded-xl transition-all ${
                  isActive ? item.activeBg : 'bg-transparent'
                }`}
              >
                {item.avatar && isActive ? (
                  <img
                    src={item.avatar}
                    alt="Profile"
                    className="w-5 h-5 rounded-lg object-cover ring-1 ring-indigo-400"
                  />
                ) : (
                  <Icon
                    className={`h-5 w-5 transition-transform ${
                      isActive ? 'scale-110' : 'opacity-80'
                    }`}
                  />
                )}
                {item.badge}
              </div>
              <span
                className={`text-[9px] tracking-tight font-medium mt-0.5 ${
                  isActive ? 'font-bold text-white' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
