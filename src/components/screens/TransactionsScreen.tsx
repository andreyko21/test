'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Trash2, Edit2, Download, X } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { formatCurrency, exportToCSV } from '@/lib/storage';
import { Transaction } from '@/types/finance';
import { format, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';
import { AddTransactionModal } from '@/components/AddTransactionModal';

export function TransactionsScreen() {
  const { state, deleteTransaction } = useApp();
  const { transactions, categories, settings } = state;

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      const matchSearch = !search ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        cat?.name.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || t.type === filterType;
      const matchCat = filterCategory === 'all' || t.categoryId === filterCategory;
      return matchSearch && matchType && matchCat;
    });
  }, [transactions, categories, search, filterType, filterCategory]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: { date: string; transactions: Transaction[] }[] = [];
    const map = new Map<string, Transaction[]>();

    filtered.forEach(t => {
      const dateKey = format(parseISO(t.date), 'yyyy-MM-dd');
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(t);
    });

    map.forEach((txns, date) => {
      groups.push({ date, transactions: txns });
    });

    return groups.sort((a, b) => b.date.localeCompare(a.date));
  }, [filtered]);

  const handleExportCSV = () => {
    const csv = exportToCSV(filtered, categories);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        padding: '52px 16px 16px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Операції</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleExportCSV}
              style={{
                background: 'var(--bg-input)',
                border: 'none',
                borderRadius: 10,
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--text-secondary)',
                fontSize: 13,
              }}
            >
              <Download size={16} /> CSV
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: showFilters ? 'var(--accent)' : 'var(--bg-input)',
                border: 'none',
                borderRadius: 10,
                padding: '8px 12px',
                cursor: 'pointer',
                color: showFilters ? 'white' : 'var(--text-secondary)',
              }}
            >
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: showFilters ? 12 : 0 }}>
          <Search size={16} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }} />
          <input
            type="text"
            className="input"
            placeholder="Пошук операцій..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['all', 'expense', 'income'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    background: filterType === t ? 'var(--accent)' : 'var(--bg-input)',
                    color: filterType === t ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {t === 'all' ? 'Всі' : t === 'expense' ? 'Витрати' : 'Доходи'}
                </button>
              ))}
            </div>
            <div style={{ overflowX: 'auto', display: 'flex', gap: 6, paddingBottom: 4 }}>
              <button
                onClick={() => setFilterCategory('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  background: filterCategory === 'all' ? 'var(--accent)' : 'var(--bg-input)',
                  color: filterCategory === 'all' ? 'white' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Всі категорії
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    background: filterCategory === cat.id ? cat.color : 'var(--bg-input)',
                    color: filterCategory === cat.id ? 'white' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex',
        gap: 0,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '8px 16px',
      }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Операцій</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{filtered.length}</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Доходи</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)' }}>
            +{formatCurrency(filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), settings.defaultCurrency)}
          </p>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Витрати</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--danger)' }}>
            -{formatCurrency(filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), settings.defaultCurrency)}
          </p>
        </div>
      </div>

      {/* Transaction list */}
      <div style={{ padding: '8px 16px' }}>
        {grouped.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Нічого не знайдено</p>
            <p style={{ fontSize: 14 }}>Спробуйте змінити фільтри</p>
          </div>
        ) : (
          grouped.map(group => (
            <div key={group.date} style={{ marginBottom: 16 }}>
              {/* Date header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
                padding: '4px 0',
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {format(parseISO(group.date), 'd MMMM, EEEE', { locale: uk })}
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                  {formatCurrency(
                    group.transactions.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0),
                    settings.defaultCurrency
                  )}
                </p>
              </div>

              {/* Transactions */}
              <div className="card" style={{ overflow: 'hidden' }}>
                {group.transactions.map((t, idx) => {
                  const cat = getCategoryById(t.categoryId);
                  return (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        borderBottom: idx < group.transactions.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <div style={{
                        width: 44, height: 44,
                        borderRadius: 12,
                        background: `${cat?.color}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, flexShrink: 0,
                      }}>
                        {cat?.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                          {t.description || cat?.name}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat?.name}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: t.type === 'income' ? 'var(--success)' : 'var(--danger)',
                          marginBottom: 4,
                        }}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, t.currency)}
                        </p>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setEditingTransaction(t)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(t.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 2 }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit modal */}
      {editingTransaction && (
        <AddTransactionModal
          onClose={() => setEditingTransaction(null)}
          editTransaction={editingTransaction}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <>
          <div className="overlay" onClick={() => setConfirmDelete(null)} />
          <div className="bottom-sheet" style={{ padding: '24px 20px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: 40, marginBottom: 8 }}>🗑️</p>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Видалити операцію?
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                Цю дію неможливо скасувати
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn-secondary"
                onClick={() => setConfirmDelete(null)}
                style={{ flex: 1 }}
              >
                Скасувати
              </button>
              <button
                onClick={() => {
                  deleteTransaction(confirmDelete);
                  setConfirmDelete(null);
                }}
                style={{
                  flex: 1,
                  background: 'var(--danger)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  padding: 14,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Видалити
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
