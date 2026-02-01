'use client';

import { createContext, useContext } from 'react';

interface DashboardContextType {
  refreshData: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children, onRefresh }: { children: React.ReactNode; onRefresh?: () => void }) {
  const value = {
    refreshData: onRefresh || (() => {})
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}