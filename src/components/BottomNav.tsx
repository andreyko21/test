'use client';

import { Home, List, BarChart2, Settings, PlusCircle } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
}

const tabs = [
  { id: 'home', label: 'Головна', icon: Home },
  { id: 'transactions', label: 'Операції', icon: List },
  { id: 'add', label: '', icon: PlusCircle, isAction: true },
  { id: 'analytics', label: 'Аналітика', icon: BarChart2 },
  { id: 'settings', label: 'Налаштування', icon: Settings },
];

export function BottomNav({ activeTab, onTabChange, onAddClick }: BottomNavProps) {
  return (
    <nav className="tab-bar">
      {tabs.map(tab => {
        if (tab.isAction) {
          return (
            <button
              key={tab.id}
              onClick={onAddClick}
              style={{
                background: 'var(--accent)',
                border: 'none',
                borderRadius: '50%',
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                transform: 'translateY(-8px)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'translateY(-6px) scale(0.95)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'translateY(-8px)')}
            >
              <tab.icon size={28} color="white" strokeWidth={2.5} />
            </button>
          );
        }

        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 12px',
              borderRadius: 12,
              transition: 'all 0.2s',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              minWidth: 60,
            }}
          >
            <tab.icon
              size={22}
              strokeWidth={isActive ? 2.5 : 1.8}
              color={isActive ? 'var(--accent)' : 'var(--text-muted)'}
            />
            <span style={{
              fontSize: 10,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
