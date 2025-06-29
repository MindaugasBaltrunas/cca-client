export const queryKeys = {
  auth: {
    login: ['auth', 'login'] as const,
    adminLogin: ['auth', 'adminLogin'] as const,
    register: ['auth', 'register'] as const,
    logout: (userId?: string) => ['auth', 'logout', userId] as const,
    refreshToken: ['auth', 'refreshToken'] as const,
    twoFactor: {
      setup: ['auth', '2fa', 'setup'] as const,
      verify: (userId?: string) => ['auth', '2fa', 'verify', userId] as const,
      enable: ['auth', '2fa', 'enable'] as const,
      disable: ['auth', '2fa', 'disable'] as const,
    },
  },
  users: {
    all: ['users'] as const,
    detail: (userId?: string) => ['users', userId] as const,
    orders: (userId?: string) => ['users', userId, 'orders'] as const,
    notifications: (userId?: string) => ['users', userId, 'notifications'] as const,
  },
};
