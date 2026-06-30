import React from 'react';
import { useGlobalSync } from './useGlobalSync';

export const GlobalSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useGlobalSync();
  return <>{children}</>;
};
