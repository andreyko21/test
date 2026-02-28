'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { TransactionsScreen } from '@/components/screens/TransactionsScreen';
import { AnalyticsScreen } from '@/components/screens/AnalyticsScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';

type Tab = 'home' | 'transactions' | 'analytics' | 'budget' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as Tab);
  };

  return (
    <div className="app-container">
      {/* Main content */}
      <main style={{ minHeight: '100vh', overflowY: 'auto' }}>
        {activeTab === 'home' && (
          <HomeScreen
            onAddTransaction={() => setShowAddModal(true)}
            onNavigate={handleTabChange}
          />
        )}
        {activeTab === 'transactions' && <TransactionsScreen />}
        {activeTab === 'analytics' && <AnalyticsScreen />}
        {(activeTab === 'budget' || activeTab === 'settings') && <SettingsScreen />}
      </main>

      {/* Bottom navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAddClick={() => setShowAddModal(true)}
      />

      {/* Add transaction modal */}
      {showAddModal && (
        <AddTransactionModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
