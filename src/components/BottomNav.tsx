'use client';

import { Home, List, BarChart2, Target } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick?: () => void;
}

const tabs = [
  { id: 'home', label: 'Огляд', icon: Home },
  { id: 'transactions', label: 'Транзакції', icon: List },
  { id: 'analytics', label: 'Бюджети', icon: BarChart2 },
  { id: 'budget', label: 'Цілі', icon: Target },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 430,
      background: 'rgba(10,12,30,0.75)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '10px 0 24px',
      zIndex: 30,
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 16px',
              borderRadius: 12,
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            {/* Active glow dot */}
            {isActive && (
              <span style={{
                position: 'absolute',
                top: -2,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: '#00e5cc',
                boxShadow: '0 0 8px #00e5cc, 0 0 16px rgba(0,229,204,0.5)',
              }} />
            )}
            <tab.icon
              size={22}
              strokeWidth={isActive ? 2 : 1.5}
              color={isActive ? '#00e5cc' : 'rgba(255,255,255,0.35)'}
              style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(0,229,204,0.7))' } : undefined}
            />
            <span style={{
              fontSize: 10,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#00e5cc' : 'rgba(255,255,255,0.35)',
              letterSpacing: 0.3,
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
