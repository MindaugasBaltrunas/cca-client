import { useState, useMemo, useCallback } from 'react';

export const useTwoFactorFlow = () => {
  const [is2FAFlow, setIs2FAFlow] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>();
  const [needsSetup, setNeedsSetup] = useState(false);

  const isInTwoFactorFlow = useMemo(() => {
    return is2FAFlow && !!tempUserId;
  }, [is2FAFlow, tempUserId]);

  const startTwoFactorFlow = useCallback((userId: string) => {
    setIs2FAFlow(true);
    setTempUserId(userId);
    setNeedsSetup(false);
  }, []);

  const resetTwoFactorFlow = useCallback(() => {
    setIs2FAFlow(false);
    setTempUserId(null);
    setTwoFactorEnabled(undefined);
    setNeedsSetup(false);
  }, []);

  return {
    is2FAFlow,
    tempUserId,
    twoFactorEnabled,
    setTwoFactorEnabled,
    needsSetup,
    setNeedsSetup,
    isInTwoFactorFlow,
    startTwoFactorFlow,
    resetTwoFactorFlow,
  };
};
