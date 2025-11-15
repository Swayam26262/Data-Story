'use client';

import { useState, useCallback } from 'react';

export type UpgradeReason = 'story_limit' | 'row_limit' | 'feature' | 'general';

interface UseUpgradeReturn {
  isUpgradeModalOpen: boolean;
  upgradeReason: UpgradeReason;
  resetDate?: Date;
  openUpgradeModal: (reason?: UpgradeReason, resetDate?: Date) => void;
  closeUpgradeModal: () => void;
}

export function useUpgrade(): UseUpgradeReturn {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason>('general');
  const [resetDate, setResetDate] = useState<Date | undefined>();

  const openUpgradeModal = useCallback(
    (reason: UpgradeReason = 'general', date?: Date) => {
      setUpgradeReason(reason);
      setResetDate(date);
      setIsUpgradeModalOpen(true);
    },
    []
  );

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
  }, []);

  return {
    isUpgradeModalOpen,
    upgradeReason,
    resetDate,
    openUpgradeModal,
    closeUpgradeModal,
  };
}
