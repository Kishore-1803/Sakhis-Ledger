/**
 * SessionContext.ts
 *
 * Provides the `onLogout` callback to any component in the tree without
 * needing to prop-drill through Tab/Stack navigators.
 *
 * Usage:
 *   const { onLogout } = useSession();
 *   onLogout();   // triggers profile switch back to Login screen
 */

import React, { createContext, useContext } from 'react';

interface SessionContextValue {
  onLogout: () => Promise<void>;
}

const noop = async () => {};

export const SessionContext = createContext<SessionContextValue>({
  onLogout: noop,
});

export function useSession(): SessionContextValue {
  return useContext(SessionContext);
}
