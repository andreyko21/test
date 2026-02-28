'use client';

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { useApp } from '@/lib/AppContext';
import { formatCurrency, getMonthlyStats, getWeeklyData, getLast6MonthsData } from '@/lib/storage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { uk } from 'date-fns/locale';

type Period = 'week' | 'month' | '6months';

export function AnalyticsScreen() {
  const { state } = useApp();
  const { transactions, categories, settings } = state;
  const [period, setPeriod] = useState<Period>('month');
  const [monthOffset, setMonthOffset] = useState(0);

  const monthStats = useMemo(() => getMonthlyStats(transactions, monthOffset), [transactions, monthOffset]);
  const weeklyData = useMemo(() => getWeeklyData(transactions), [transactions]);
  const sixMonthsData = useMemo(() => getLast6MonthsData(transactions), [transactions]);

  const currency = settings.defaultCurrency;

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  const pieData = monthStats.byCategory.slice(0, 6).map(item => {
    const cat = getCategoryById(item.categoryId);
    return {
      name: cat?.name || item.categoryId,
      value: item.amount,
      color: cat?.color || '#94a3b8',
      icon: cat?.icon || '📦',
    };
  });

  const savingsRate = monthStats.totalIncome > 0
    ? ((monthStats.totalIncome - monthStats.totalExpenses) / monthStats.totalIncome * 100).toFixed(1)
    : '0';

  const currentMonthLabel = format(subMonths(new Date(), monthOffset), 'MMMM yyyy', { locale: uk });

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        padding: '52px 16px 16px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Аналітика</h1>

        {/* Period tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-input)',
          borderRadius: 12,
          padding: 4,
        }}>
          {([
            { id: 'week', label: 'Тиждень' },
            { id: 'month', label: 'Місяць' },
            { id: '6months', label: '6 місяців' },
          ] as { id: Period; label: string }[]).map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                background: period === p.id ? 'var(--bg-card)' : 'transparent',
                color: period === p.id ? 'var(--accent)' : 'var(--text-secondary)',
                boxShadow: period === p.id ? 'var(--shadow)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Month navigation (for month view) */}
        {period === 'month' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <button
              onClick={() => setMonthOffset(o => o + 1)}
              style={{ background: 'var(--bg-input)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-primary)' }}
            >
              <ChevronLeft size={20} />
            </button>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
              {currentMonthLabel}
            </p>
            <button
              onClick={() => setMonthOffset(o => Math.max(0, o - 1))}
              disabled={monthOffset === 0}
              style={{
                background: 'var(--bg-input)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer',
                color: monthOffset === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Summary cards */}
        {period === 'month' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Доходи', value: monthStats.totalIncome, color: 'var(--success)', bg: 'var(--success-light)' },
              { label: 'Витрати', value: monthStats.totalExpenses, color: 'var(--danger)', bg: 'var(--danger-light)' },
              { label: 'Баланс', value: monthStats.balance, color: monthStats.balance >= 0 ? 'var(--success)' : 'var(--danger)', bg: monthStats.balance >= 0 ? 'var(--success-light)' : 'var(--danger-light)' },
            ].map(item => (
              <div key={item.label} className="card" style={{ padding: '12px 10px', textAlign: 'center', background: item.bg, border: 'none' }}>
                <p style={{ fontSize: 11, color: item.color, fontWeight: 600, marginBottom: 4 }}>{item.label}</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: item.color }}>
                  {formatCurrency(item.value, currency)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Savings rate */}
        {period === 'month' && monthStats.totalIncome > 0 && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Норма заощаджень</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: parseFloat(savingsRate) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {savingsRate}%
              </p>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.max(0, Math.min(100, parseFloat(savingsRate)))}%`,
                  background: parseFloat(savingsRate) >= 20 ? 'var(--success)' : parseFloat(savingsRate) >= 0 ? 'var(--warning)' : 'var(--danger)',
                }}
              />
            </div>
          </div>
        )}

        {/* Bar chart */}
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
            {period === 'week' ? 'Витрати за тиждень' : period === 'month' ? 'Доходи vs Витрати' : 'Динаміка за 6 місяців'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            {period === 'week' ? (
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip
                    formatter={(v: number | undefined) => v != null ? formatCurrency(v, currency) : ''}
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  />
                  <Bar dataKey="expenses" fill="var(--danger)" radius={[4, 4, 0, 0]} name="Витрати" />
                  <Bar dataKey="income" fill="var(--success)" radius={[4, 4, 0, 0]} name="Доходи" />
                </BarChart>
            ) : period === 'month' ? (
              <BarChart data={[{ name: currentMonthLabel, income: monthStats.totalIncome, expenses: monthStats.totalExpenses }]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip
                    formatter={(v: number | undefined) => v != null ? formatCurrency(v, currency) : ''}
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  />
                <Bar dataKey="income" fill="var(--success)" radius={[4, 4, 0, 0]} name="Доходи" />
                <Bar dataKey="expenses" fill="var(--danger)" radius={[4, 4, 0, 0]} name="Витрати" />
              </BarChart>
            ) : (
              <LineChart data={sixMonthsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip
                    formatter={(v: number | undefined) => v != null ? formatCurrency(v, currency) : ''}
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="var(--success)" strokeWidth={2} dot={{ r: 4 }} name="Доходи" />
                <Line type="monotone" dataKey="expenses" stroke="var(--danger)" strokeWidth={2} dot={{ r: 4 }} name="Витрати" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Pie chart - expenses by category */}
        {period === 'month' && pieData.length > 0 && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              Витрати за категоріями
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number | undefined) => v != null ? formatCurrency(v, currency) : ''}
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pieData.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{item.icon} {item.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatCurrency(item.value, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top categories */}
        {period === 'month' && monthStats.byCategory.length > 0 && (
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
              Топ категорій
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {monthStats.byCategory.slice(0, 5).map((item, i) => {
                const cat = getCategoryById(item.categoryId);
                const pct = monthStats.totalExpenses > 0 ? (item.amount / monthStats.totalExpenses * 100) : 0;
                return (
                  <div key={item.categoryId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{cat?.icon}</span>
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{cat?.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatCurrency(item.amount, currency)}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, background: cat?.color || 'var(--accent)' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
