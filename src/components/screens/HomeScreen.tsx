'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Bell, ArrowRight, Target } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { formatCurrency, getMonthlyStats, calculateBudgetSpent, predictNextMonthExpenses } from '@/lib/storage';
import { format, parseISO, isThisMonth } from 'date-fns';
import { uk } from 'date-fns/locale';

interface HomeScreenProps {
  onAddTransaction: () => void;
  onNavigate: (tab: string) => void;
}

export function HomeScreen({ onAddTransaction, onNavigate }: HomeScreenProps) {
  const { state } = useApp();
  const { transactions, categories, budgets, reminders, settings } = state;

  const monthStats = useMemo(() => getMonthlyStats(transactions, 0), [transactions]);
  const budgetsWithSpent = useMemo(() => calculateBudgetSpent(budgets, transactions), [budgets, transactions]);
  const prediction = useMemo(() => predictNextMonthExpenses(transactions), [transactions]);

  const recentTransactions = useMemo(() =>
    transactions.slice(0, 5),
    [transactions]
  );

  const activeReminders = reminders.filter(r => r.isActive).slice(0, 2);

  const totalBalance = monthStats.totalIncome - monthStats.totalExpenses;
  const currency = settings.defaultCurrency;

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        padding: '48px 20px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, left: -20,
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>
                {format(new Date(), 'MMMM yyyy', { locale: uk })}
              </p>
              <h1 style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>Загальний баланс</h1>
            </div>
            <button
              onClick={() => onNavigate('settings')}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: 12,
                padding: '8px 12px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
              }}
            >
              <Bell size={16} />
              {activeReminders.length > 0 && (
                <span style={{
                  background: '#ef4444',
                  borderRadius: '50%',
                  width: 16, height: 16,
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {activeReminders.length}
                </span>
              )}
            </button>
          </div>

          <div style={{ marginBottom: 28 }}>
            <p style={{
              color: 'white',
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: -1,
            }}>
              {formatCurrency(totalBalance, currency)}
            </p>
          </div>

          {/* Income / Expense row */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{
              flex: 1,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 16,
              padding: '12px 16px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 4 }}>
                  <TrendingUp size={14} color="white" />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Доходи</span>
              </div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>
                {formatCurrency(monthStats.totalIncome, currency)}
              </p>
            </div>
            <div style={{
              flex: 1,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 16,
              padding: '12px 16px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 4 }}>
                  <TrendingDown size={14} color="white" />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Витрати</span>
              </div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>
                {formatCurrency(monthStats.totalExpenses, currency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px', marginTop: -40 }}>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
          marginBottom: 20,
        }}>
          {[
            { icon: '💸', label: 'Витрата', action: onAddTransaction, color: '#fee2e2' },
            { icon: '💰', label: 'Дохід', action: onAddTransaction, color: '#d1fae5' },
            { icon: '📊', label: 'Аналітика', action: () => onNavigate('analytics'), color: '#e0e7ff' },
            { icon: '🎯', label: 'Бюджет', action: () => onNavigate('budget'), color: '#fef3c7' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '14px 8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                boxShadow: 'var(--shadow)',
                transition: 'transform 0.15s',
              }}
            >
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Budget Overview */}
        {budgetsWithSpent.length > 0 && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Бюджети</h3>
              <button
                onClick={() => onNavigate('budget')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}
              >
                Всі <ArrowRight size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {budgetsWithSpent.slice(0, 3).map(budget => {
                const cat = getCategoryById(budget.categoryId);
                const pct = Math.min((budget.spent / budget.amount) * 100, 100);
                const isOver = budget.spent > budget.amount;
                return (
                  <div key={budget.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{cat?.icon}</span>
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{cat?.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isOver ? 'var(--danger)' : 'var(--text-primary)' }}>
                          {formatCurrency(budget.spent, currency)}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}> / {formatCurrency(budget.amount, currency)}</span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${pct}%`,
                          background: isOver ? 'var(--danger)' : pct > 80 ? 'var(--warning)' : cat?.color || 'var(--accent)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Prediction */}
        {prediction > 0 && (
          <div className="card" style={{
            padding: 16,
            marginBottom: 16,
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1px solid #bae6fd',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: '#0ea5e9', borderRadius: 12, padding: 10 }}>
                <Target size={20} color="white" />
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#0369a1', fontWeight: 500 }}>Прогноз на наступний місяць</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#0c4a6e' }}>
                  {formatCurrency(prediction, currency)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Останні операції</h3>
            <button
              onClick={() => onNavigate('transactions')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}
            >
              Всі <ArrowRight size={14} />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>💳</p>
              <p>Немає операцій</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentTransactions.map(t => {
                const cat = getCategoryById(t.categoryId);
                return (
                  <div key={t.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{
                      width: 42, height: 42,
                      borderRadius: 12,
                      background: `${cat?.color}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0,
                    }}>
                      {cat?.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {t.description || cat?.name}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {format(parseISO(t.date), 'd MMM', { locale: uk })}
                      </p>
                    </div>
                    <p style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: t.type === 'income' ? 'var(--success)' : 'var(--danger)',
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

        {/* Reminders */}
        {activeReminders.length > 0 && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              🔔 Нагадування
            </h3>
            {activeReminders.map(r => {
              const cat = getCategoryById(r.categoryId);
              return (
                <div key={r.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: 22 }}>{cat?.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{r.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {format(parseISO(r.dueDate), 'd MMM', { locale: uk })}
                    </p>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--warning)' }}>
                    {formatCurrency(r.amount, r.currency)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
