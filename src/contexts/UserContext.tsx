import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'landlord' | 'tenant';

interface UserContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  tenantId?: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('landlord');
  const tenantId = role === 'tenant' ? 'tenant-1' : undefined;

  return (
    <UserContext.Provider value={{ role, setRole, tenantId }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
