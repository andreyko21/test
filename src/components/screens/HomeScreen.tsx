'use client';

import { useMemo } from 'react';
import { Zap, Mic, Camera, ArrowRight } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { formatCurrency, getMonthlyStats, calculateBudgetSpent } from '@/lib/storage';
import { format, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';

interface HomeScreenProps {
  onAddTransaction: () => void;
  onNavigate: (tab: string) => void;
}

const quickCategories = [
  { label: 'Кава', icon: '☕' },
  { label: 'Покупки', icon: '🛍️' },
  { label: 'Сміття', icon: '🗑️' },
  { label: 'Транспорт', icon: '🚌' },
];

// Mini sparkline chart component
function SparkLine() {
  const points = [30, 55, 40, 70, 50, 80, 65, 90, 75, 100];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 80;
  const h = 36;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x},${y}`;
  });
  const polyline = coords.join(' ');
  const areaPath = `M${coords[0]} ${coords.slice(1).map(c => `L${c}`).join(' ')} L${w},${h} L0,${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00e5cc" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00e5cc" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkGrad)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="#00e5cc"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last dot */}
      <circle
        cx={coords[coords.length - 1].split(',')[0]}
        cy={coords[coords.length - 1].split(',')[1]}
        r="3"
        fill="#00e5cc"
        style={{ filter: 'drop-shadow(0 0 4px #00e5cc)' }}
      />
    </svg>
  );
}

export function HomeScreen({ onAddTransaction, onNavigate }: HomeScreenProps) {
  const { state } = useApp();
  const { transactions, categories, budgets, settings } = state;

  const monthStats = useMemo(() => getMonthlyStats(transactions, 0), [transactions]);
  const budgetsWithSpent = useMemo(() => calculateBudgetSpent(budgets, transactions), [budgets, transactions]);

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  const totalBalance = monthStats.totalIncome - monthStats.totalExpenses;
  const currency = settings.defaultCurrency;

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  // Glass card style
  const glassCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 20,
    boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
  };

  const neonGlassCard: React.CSSProperties = {
    ...glassCard,
    border: '1px solid rgba(0,229,204,0.25)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 0 20px rgba(0,229,204,0.08), inset 0 1px 0 rgba(255,255,255,0.08)',
  };

  return (
    <div style={{ paddingBottom: 110, minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ padding: '52px 20px 20px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Title + Pro badge */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{
                color: 'rgba(255,255,255,0.95)',
                fontSize: 22,
                fontWeight: 300,
                letterSpacing: 0.5,
              }}>
                Витрата
              </h1>
              <span style={{
                background: 'linear-gradient(135deg, #00e5cc, #00b8a0)',
                color: '#001a17',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 20,
                letterSpacing: 0.5,
                boxShadow: '0 0 8px rgba(0,229,204,0.5)',
              }}>
                PRO
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 300 }}>
              {format(new Date(), 'MMMM yyyy', { locale: uk })}
            </p>
          </div>

          {/* Avatar */}
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: '2px solid rgba(0,229,204,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            boxShadow: '0 0 12px rgba(0,229,204,0.2)',
          }}>
            👤
          </div>
        </div>
      </div>

      {/* ── Budget / Balance Card ── */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ ...neonGlassCard, padding: '20px 20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 400, marginBottom: 6, letterSpacing: 0.5 }}>
                наявність
              </p>
              <p style={{
                color: 'white',
                fontSize: 38,
                fontWeight: 200,
                letterSpacing: -1,
                lineHeight: 1,
              }}>
                {formatCurrency(totalBalance, currency)}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <SparkLine />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(0,229,204,0.12)',
                border: '1px solid rgba(0,229,204,0.3)',
                borderRadius: 20,
                padding: '3px 10px',
              }}>
                <Zap size={11} color="#00e5cc" style={{ filter: 'drop-shadow(0 0 4px #00e5cc)' }} />
                <span style={{ color: '#00e5cc', fontSize: 12, fontWeight: 600 }}>130</span>
              </div>
            </div>
          </div>

          {/* Income / Expense row */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <div style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 3 }}>Доходи</p>
              <p style={{ color: '#4ade80', fontSize: 15, fontWeight: 600 }}>
                +{formatCurrency(monthStats.totalIncome, currency)}
              </p>
            </div>
            <div style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 3 }}>Витрати</p>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 600 }}>
                -{formatCurrency(monthStats.totalExpenses, currency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Categories ── */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {quickCategories.map((cat, i) => (
            <button
              key={i}
              onClick={onAddTransaction}
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: '12px 16px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s',
                minWidth: 72,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(0,229,204,0.4)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(0,229,204,0.15)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.1)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: 22 }}>{cat.icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 400 }}>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={glassCard}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 16px 12px',
          }}>
            <h3 style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 500, letterSpacing: 0.3 }}>
              Останні транзакції
            </h3>
            <button
              onClick={() => onNavigate('transactions')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#00e5cc',
                fontSize: 12,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              Всі <ArrowRight size={13} />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0 20px', color: 'rgba(255,255,255,0.3)' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>💳</p>
              <p style={{ fontSize: 13 }}>Немає операцій</p>
            </div>
          ) : (
            <div style={{ padding: '0 16px 8px' }}>
              {recentTransactions.map((t, idx) => {
                const cat = getCategoryById(t.categoryId);
                const isLast = idx === recentTransactions.length - 1;
                return (
                  <div key={t.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 0',
                    borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  }}>
                    {/* Icon */}
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: cat?.color ? `${cat.color}22` : 'rgba(99,102,241,0.2)',
                      border: `1px solid ${cat?.color ? `${cat.color}44` : 'rgba(99,102,241,0.3)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      flexShrink: 0,
                    }}>
                      {cat?.icon || '💳'}
                    </div>

                    {/* Name + date */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.85)',
                        marginBottom: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {t.description || cat?.name || 'Транзакція'}
                      </p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                        {format(parseISO(t.date), 'd MMM', { locale: uk })}
                      </p>
                    </div>

                    {/* Amount */}
                    <p style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: t.type === 'income' ? '#4ade80' : 'rgba(255,255,255,0.75)',
                      flexShrink: 0,
                    }}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, t.currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Budgets ── */}
      {budgetsWithSpent.length > 0 && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={glassCard}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 16px 12px',
            }}>
              <h3 style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 500 }}>Бюджети</h3>
              <button
                onClick={() => onNavigate('budget')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#00e5cc',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                Всі <ArrowRight size={13} />
              </button>
            </div>
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {budgetsWithSpent.slice(0, 3).map(budget => {
                const cat = getCategoryById(budget.categoryId);
                const pct = Math.min((budget.spent / budget.amount) * 100, 100);
                const isOver = budget.spent > budget.amount;
                const barColor = isOver ? '#f87171' : pct > 80 ? '#fbbf24' : '#00e5cc';
                return (
                  <div key={budget.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{cat?.icon}</span>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{cat?.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isOver ? '#f87171' : 'rgba(255,255,255,0.85)' }}>
                          {formatCurrency(budget.spent, currency)}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}> / {formatCurrency(budget.amount, currency)}</span>
                      </div>
                    </div>
                    <div style={{
                      height: 4,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.08)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        borderRadius: 2,
                        background: barColor,
                        boxShadow: `0 0 6px ${barColor}80`,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Add Panel ── */}
      <div style={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
        zIndex: 20,
      }}>
        {/* Mic */}
        <button style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          border: '1.5px solid rgba(0,229,204,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 0 12px rgba(0,229,204,0.15)',
          backdropFilter: 'blur(10px)',
        }}>
          <Mic size={20} color="#00e5cc" />
        </button>

        {/* Plus */}
        <button
          onClick={onAddTransaction}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(0,229,204,0.25), rgba(0,229,204,0.1))',
            border: '2px solid rgba(0,229,204,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(0,229,204,0.35), 0 0 40px rgba(0,229,204,0.15)',
            backdropFilter: 'blur(10px)',
            fontSize: 28,
            color: '#00e5cc',
            fontWeight: 200,
          }}
        >
          +
        </button>

        {/* Camera */}
        <button style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          border: '1.5px solid rgba(0,229,204,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 0 12px rgba(0,229,204,0.15)',
          backdropFilter: 'blur(10px)',
        }}>
          <Camera size={20} color="#00e5cc" />
        </button>
      </div>
    </div>
  );
}
