'use client';

import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { TransactionType, Currency, CURRENCIES } from '@/types/finance';
import { format } from 'date-fns';

interface AddTransactionModalProps {
  onClose: () => void;
  editTransaction?: {
    id: string;
    type: TransactionType;
    amount: number;
    currency: Currency;
    categoryId: string;
    description: string;
    date: string;
  };
}

export function AddTransactionModal({ onClose, editTransaction }: AddTransactionModalProps) {
  const { state, addTransaction, updateTransaction } = useApp();
  const [type, setType] = useState<TransactionType>(editTransaction?.type || 'expense');
  const [amount, setAmount] = useState(editTransaction?.amount?.toString() || '');
  const [currency, setCurrency] = useState<Currency>(editTransaction?.currency || state.settings.defaultCurrency);
  const [categoryId, setCategoryId] = useState(editTransaction?.categoryId || '');
  const [description, setDescription] = useState(editTransaction?.description || '');
  const [date, setDate] = useState(
    editTransaction?.date
      ? format(new Date(editTransaction.date), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd')
  );

  const filteredCategories = state.categories.filter(
    c => c.type === type || c.type === 'both'
  );

  const handleSubmit = () => {
    if (!amount || !categoryId) return;

    const transactionData = {
      type,
      amount: parseFloat(amount),
      currency,
      categoryId,
      description: description || filteredCategories.find(c => c.id === categoryId)?.name || '',
      date: new Date(date).toISOString(),
    };

    if (editTransaction) {
      updateTransaction({ ...transactionData, id: editTransaction.id });
    } else {
      addTransaction(transactionData);
    }
    onClose();
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="bottom-sheet" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        <div style={{ padding: '0 20px 32px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              {editTransaction ? 'Редагувати' : 'Нова операція'}
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
              <X size={22} />
            </button>
          </div>

          {/* Type Toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-input)',
            borderRadius: 12,
            padding: 4,
            marginBottom: 20,
          }}>
            {(['expense', 'income'] as TransactionType[]).map(t => (
              <button
                key={t}
                onClick={() => { setType(t); setCategoryId(''); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                  transition: 'all 0.2s',
                  background: type === t ? (t === 'expense' ? 'var(--danger)' : 'var(--success)') : 'transparent',
                  color: type === t ? 'white' : 'var(--text-secondary)',
                }}
              >
                {t === 'expense' ? '💸 Витрата' : '💰 Дохід'}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Сума
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                className="input"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{ flex: 1, fontSize: 24, fontWeight: 700, textAlign: 'center' }}
              />
              <select
                className="input"
                value={currency}
                onChange={e => setCurrency(e.target.value as Currency)}
                style={{ width: 80, textAlign: 'center' }}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
              Категорія
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
            }}>
              {filteredCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: '10px 4px',
                    borderRadius: 12,
                    border: `2px solid ${categoryId === cat.id ? cat.color : 'transparent'}`,
                    background: categoryId === cat.id ? `${cat.color}20` : 'var(--bg-input)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{cat.icon}</span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: categoryId === cat.id ? cat.color : 'var(--text-secondary)',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Опис (необов&apos;язково)
            </label>
            <input
              type="text"
              className="input"
              placeholder="Додайте опис"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Date */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Дата
            </label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!amount || !categoryId}
            style={{
              opacity: !amount || !categoryId ? 0.5 : 1,
              background: type === 'expense' ? 'var(--danger)' : 'var(--success)',
            }}
          >
            {editTransaction ? 'Зберегти зміни' : `Додати ${type === 'expense' ? 'витрату' : 'дохід'}`}
          </button>
        </div>
      </div>
    </>
  );
}
