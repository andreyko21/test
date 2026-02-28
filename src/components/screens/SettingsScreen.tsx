'use client';

import { useState } from 'react';
import {
  Moon, Sun, Monitor, ChevronRight, Plus, Trash2, Edit2,
  Bell, Shield, Globe, Tag, Target, X, Check
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { Category, Budget, Reminder, Currency, CURRENCIES } from '@/types/finance';
import { formatCurrency } from '@/lib/storage';
import { format, parseISO } from 'date-fns';

type SubScreen = null | 'categories' | 'budgets' | 'reminders' | 'security' | 'currency';

const EMOJI_OPTIONS = ['🍔', '🚗', '🏠', '🎮', '💊', '🛍️', '📚', '✈️', '💼', '💻', '📈', '🎁', '📦', '🎵', '🏋️', '🐾', '🌿', '☕', '🎨', '🔧'];
const COLOR_OPTIONS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#82E0AA', '#85C1E9', '#F8C471', '#F1948A', '#AEB6BF', '#6366f1', '#8b5cf6'];

export function SettingsScreen() {
  const { state, updateSettings, addCategory, updateCategory, deleteCategory, addBudget, updateBudget, deleteBudget, addReminder, updateReminder, deleteReminder } = useApp();
  const { settings, categories, budgets, reminders } = state;

  const [subScreen, setSubScreen] = useState<SubScreen>(null);

  // Category form
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('📦');
  const [catColor, setCatColor] = useState('#6366f1');
  const [catType, setCatType] = useState<'expense' | 'income' | 'both'>('expense');
  const [showCatForm, setShowCatForm] = useState(false);

  // Budget form
  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const [budgetCatId, setBudgetCatId] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetPeriod, setBudgetPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  // Reminder form
  const [editReminder, setEditReminder] = useState<Reminder | null>(null);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderAmount, setReminderAmount] = useState('');
  const [reminderCatId, setReminderCatId] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderRecurring, setReminderRecurring] = useState(false);
  const [reminderInterval, setReminderInterval] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [showReminderForm, setShowReminderForm] = useState(false);

  const openCatForm = (cat?: Category) => {
    if (cat) {
      setEditCat(cat);
      setCatName(cat.name);
      setCatIcon(cat.icon);
      setCatColor(cat.color);
      setCatType(cat.type as 'expense' | 'income' | 'both');
    } else {
      setEditCat(null);
      setCatName('');
      setCatIcon('📦');
      setCatColor('#6366f1');
      setCatType('expense');
    }
    setShowCatForm(true);
  };

  const saveCat = () => {
    if (!catName) return;
    if (editCat) {
      updateCategory({ ...editCat, name: catName, icon: catIcon, color: catColor, type: catType });
    } else {
      addCategory({ name: catName, icon: catIcon, color: catColor, type: catType, isCustom: true });
    }
    setShowCatForm(false);
  };

  const openBudgetForm = (b?: Budget) => {
    if (b) {
      setEditBudget(b);
      setBudgetCatId(b.categoryId);
      setBudgetAmount(b.amount.toString());
      setBudgetPeriod(b.period);
    } else {
      setEditBudget(null);
      setBudgetCatId('');
      setBudgetAmount('');
      setBudgetPeriod('monthly');
    }
    setShowBudgetForm(true);
  };

  const saveBudget = () => {
    if (!budgetCatId || !budgetAmount) return;
    if (editBudget) {
      updateBudget({ ...editBudget, categoryId: budgetCatId, amount: parseFloat(budgetAmount), period: budgetPeriod, currency: settings.defaultCurrency });
    } else {
      addBudget({ categoryId: budgetCatId, amount: parseFloat(budgetAmount), period: budgetPeriod, currency: settings.defaultCurrency });
    }
    setShowBudgetForm(false);
  };

  const openReminderForm = (r?: Reminder) => {
    if (r) {
      setEditReminder(r);
      setReminderTitle(r.title);
      setReminderAmount(r.amount.toString());
      setReminderCatId(r.categoryId);
      setReminderDate(format(parseISO(r.dueDate), 'yyyy-MM-dd'));
      setReminderRecurring(r.isRecurring);
      setReminderInterval(r.recurringInterval || 'monthly');
    } else {
      setEditReminder(null);
      setReminderTitle('');
      setReminderAmount('');
      setReminderCatId('');
      setReminderDate('');
      setReminderRecurring(false);
      setReminderInterval('monthly');
    }
    setShowReminderForm(true);
  };

  const saveReminder = () => {
    if (!reminderTitle || !reminderDate) return;
    const data = {
      title: reminderTitle,
      amount: parseFloat(reminderAmount) || 0,
      currency: settings.defaultCurrency,
      categoryId: reminderCatId || 'other',
      dueDate: new Date(reminderDate).toISOString(),
      isRecurring: reminderRecurring,
      recurringInterval: reminderRecurring ? reminderInterval : undefined,
      isActive: true,
    };
    if (editReminder) {
      updateReminder({ ...editReminder, ...data });
    } else {
      addReminder(data);
    }
    setShowReminderForm(false);
  };

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  if (subScreen === 'categories') {
    return (
      <div style={{ paddingBottom: 100 }}>
        <div style={{ padding: '52px 16px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSubScreen(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 15, fontWeight: 600 }}>← Назад</button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', flex: 1 }}>Категорії</h1>
          <button onClick={() => openCatForm()} style={{ background: 'var(--accent)', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: 'white', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Plus size={16} /> Додати
          </button>
        </div>
        <div style={{ padding: 16 }}>
          {['expense', 'income', 'both'].map(type => {
            const cats = categories.filter(c => c.type === type);
            if (cats.length === 0) return null;
            return (
              <div key={type} style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {type === 'expense' ? 'Витрати' : type === 'income' ? 'Доходи' : 'Обидва'}
                </p>
                <div className="card" style={{ overflow: 'hidden' }}>
                  {cats.map((cat, i) => (
                    <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < cats.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {cat.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</p>
                        {cat.isCustom && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Власна</p>}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openCatForm(cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={16} /></button>
                        {cat.isCustom && (
                          <button onClick={() => deleteCategory(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={16} /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {showCatForm && (
          <>
            <div className="overlay" onClick={() => setShowCatForm(false)} />
            <div className="bottom-sheet" style={{ padding: '20px 20px 32px' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                {editCat ? 'Редагувати категорію' : 'Нова категорія'}
              </h3>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Назва</label>
                <input className="input" value={catName} onChange={e => setCatName(e.target.value)} placeholder="Назва категорії" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Іконка</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {EMOJI_OPTIONS.map(e => (
                    <button key={e} onClick={() => setCatIcon(e)} style={{ fontSize: 22, background: catIcon === e ? 'var(--accent-light)' : 'var(--bg-input)', border: catIcon === e ? '2px solid var(--accent)' : '2px solid transparent', borderRadius: 10, padding: 6, cursor: 'pointer' }}>{e}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Колір</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {COLOR_OPTIONS.map(c => (
                    <button key={c} onClick={() => setCatColor(c)} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: catColor === c ? '3px solid var(--text-primary)' : '3px solid transparent', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Тип</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['expense', 'income', 'both'] as const).map(t => (
                    <button key={t} onClick={() => setCatType(t)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: catType === t ? 'var(--accent)' : 'var(--bg-input)', color: catType === t ? 'white' : 'var(--text-secondary)' }}>
                      {t === 'expense' ? 'Витрата' : t === 'income' ? 'Дохід' : 'Обидва'}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-primary" onClick={saveCat}>Зберегти</button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (subScreen === 'budgets') {
    return (
      <div style={{ paddingBottom: 100 }}>
        <div style={{ padding: '52px 16px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSubScreen(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 15, fontWeight: 600 }}>← Назад</button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', flex: 1 }}>Бюджети</h1>
          <button onClick={() => openBudgetForm()} style={{ background: 'var(--accent)', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: 'white', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Plus size={16} /> Додати
          </button>
        </div>
        <div style={{ padding: 16 }}>
          {budgets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 40, marginBottom: 8 }}>🎯</p>
              <p>Немає бюджетів</p>
            </div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              {budgets.map((b, i) => {
                const cat = getCategoryById(b.categoryId);
                return (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < budgets.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: 24 }}>{cat?.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{cat?.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.period === 'monthly' ? 'Щомісяця' : 'Щотижня'}</p>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(b.amount, b.currency)}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openBudgetForm(b)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={16} /></button>
                      <button onClick={() => deleteBudget(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showBudgetForm && (
          <>
            <div className="overlay" onClick={() => setShowBudgetForm(false)} />
            <div className="bottom-sheet" style={{ padding: '20px 20px 32px' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                {editBudget ? 'Редагувати бюджет' : 'Новий бюджет'}
              </h3>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Категорія</label>
                <select className="input" value={budgetCatId} onChange={e => setBudgetCatId(e.target.value)}>
                  <option value="">Оберіть категорію</option>
                  {categories.filter(c => c.type === 'expense' || c.type === 'both').map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Сума</label>
                <input className="input" type="number" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Період</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['monthly', 'weekly'] as const).map(p => (
                    <button key={p} onClick={() => setBudgetPeriod(p)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: budgetPeriod === p ? 'var(--accent)' : 'var(--bg-input)', color: budgetPeriod === p ? 'white' : 'var(--text-secondary)' }}>
                      {p === 'monthly' ? 'Щомісяця' : 'Щотижня'}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-primary" onClick={saveBudget}>Зберегти</button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (subScreen === 'reminders') {
    return (
      <div style={{ paddingBottom: 100 }}>
        <div style={{ padding: '52px 16px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSubScreen(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 15, fontWeight: 600 }}>← Назад</button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', flex: 1 }}>Нагадування</h1>
          <button onClick={() => openReminderForm()} style={{ background: 'var(--accent)', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: 'white', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Plus size={16} /> Додати
          </button>
        </div>
        <div style={{ padding: 16 }}>
          {reminders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 40, marginBottom: 8 }}>🔔</p>
              <p>Немає нагадувань</p>
            </div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              {reminders.map((r, i) => {
                const cat = getCategoryById(r.categoryId);
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < reminders.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: 24 }}>{cat?.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{r.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {format(parseISO(r.dueDate), 'd MMM')} {r.isRecurring ? `• ${r.recurringInterval === 'monthly' ? 'щомісяця' : r.recurringInterval === 'weekly' ? 'щотижня' : r.recurringInterval}` : ''}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(r.amount, r.currency)}</p>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 4 }}>
                        <button onClick={() => openReminderForm(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={14} /></button>
                        <button onClick={() => deleteReminder(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showReminderForm && (
          <>
            <div className="overlay" onClick={() => setShowReminderForm(false)} />
            <div className="bottom-sheet" style={{ padding: '20px 20px 32px', maxHeight: '80vh', overflowY: 'auto' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                {editReminder ? 'Редагувати нагадування' : 'Нове нагадування'}
              </h3>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Назва</label>
                <input className="input" value={reminderTitle} onChange={e => setReminderTitle(e.target.value)} placeholder="Назва нагадування" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Сума</label>
                <input className="input" type="number" value={reminderAmount} onChange={e => setReminderAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Категорія</label>
                <select className="input" value={reminderCatId} onChange={e => setReminderCatId(e.target.value)}>
                  <option value="">Оберіть категорію</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Дата</label>
                <input className="input" type="date" value={reminderDate} onChange={e => setReminderDate(e.target.value)} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <div
                    onClick={() => setReminderRecurring(!reminderRecurring)}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: reminderRecurring ? 'var(--accent)' : 'var(--bg-input)',
                      position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 2, left: reminderRecurring ? 22 : 2,
                      width: 20, height: 20, borderRadius: '50%', background: 'white',
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Повторюване</span>
                </label>
              </div>
              {reminderRecurring && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Інтервал</label>
                  <select className="input" value={reminderInterval} onChange={e => setReminderInterval(e.target.value as typeof reminderInterval)}>
                    <option value="daily">Щодня</option>
                    <option value="weekly">Щотижня</option>
                    <option value="monthly">Щомісяця</option>
                    <option value="yearly">Щороку</option>
                  </select>
                </div>
              )}
              <button className="btn-primary" onClick={saveReminder}>Зберегти</button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Main settings screen
  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '52px 16px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Налаштування</h1>
      </div>

      <div style={{ padding: 16 }}>
        {/* Theme */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Зовнішній вигляд</p>
          <div className="card" style={{ padding: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Тема</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {([
                { id: 'light', label: 'Світла', icon: Sun },
                { id: 'dark', label: 'Темна', icon: Moon },
                { id: 'system', label: 'Системна', icon: Monitor },
              ] as const).map(t => (
                <button
                  key={t.id}
                  onClick={() => updateSettings({ theme: t.id })}
                  style={{
                    flex: 1,
                    padding: '10px 6px',
                    borderRadius: 12,
                    border: `2px solid ${settings.theme === t.id ? 'var(--accent)' : 'transparent'}`,
                    background: settings.theme === t.id ? 'var(--accent-light)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <t.icon size={20} color={settings.theme === t.id ? 'var(--accent)' : 'var(--text-muted)'} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: settings.theme === t.id ? 'var(--accent)' : 'var(--text-secondary)' }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Currency */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Фінанси</p>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Валюта за замовчуванням</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CURRENCIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => updateSettings({ defaultCurrency: c.code })}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      background: settings.defaultCurrency === c.code ? 'var(--accent)' : 'var(--bg-input)',
                      color: settings.defaultCurrency === c.code ? 'white' : 'var(--text-secondary)',
                    }}
                  >
                    {c.symbol} {c.code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Management */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Управління</p>
          <div className="card" style={{ overflow: 'hidden' }}>
            {[
              { icon: Tag, label: 'Категорії', sub: `${categories.length} категорій`, action: () => setSubScreen('categories') },
              { icon: Target, label: 'Бюджети', sub: `${budgets.length} бюджетів`, action: () => setSubScreen('budgets') },
              { icon: Bell, label: 'Нагадування', sub: `${reminders.length} нагадувань`, action: () => setSubScreen('reminders') },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={18} color="var(--accent)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.sub}</p>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" />
              </button>
            ))}
          </div>
        </div>

        {/* Security */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Безпека</p>
          <div className="card" style={{ overflow: 'hidden' }}>
            {[
              { label: 'PIN-код', sub: settings.pinEnabled ? 'Увімкнено' : 'Вимкнено', key: 'pinEnabled' as const },
              { label: 'Біометрія', sub: settings.biometricEnabled ? 'Увімкнено' : 'Вимкнено', key: 'biometricEnabled' as const },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i < 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={18} color="var(--accent)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.sub}</p>
                </div>
                <div
                  onClick={() => updateSettings({ [item.key]: !settings[item.key] })}
                  style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: settings[item.key] ? 'var(--accent)' : 'var(--bg-input)',
                    position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 2, left: settings[item.key] ? 22 : 2,
                    width: 20, height: 20, borderRadius: '50%', background: 'white',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* App info */}
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 24, marginBottom: 4 }}>💰</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>FinanceApp</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Версія 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
