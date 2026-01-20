import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ActiveUser {
  role: number;
  id: string;
  token_exp: string;
}

interface UserContextType {
  user: ActiveUser | null;
  isLoading: boolean;
  login: (user: ActiveUser) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ActiveUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = () => {
      const userRole = localStorage.getItem("user_role");
      const userID = localStorage.getItem("user_id");
      const userTokenExp = localStorage.getItem("user_token_exp");
      const token = localStorage.getItem("token");

      if (userRole && userID && userTokenExp && token) {
        setUser({
          role: Number(userRole),
          id: userID,
          token_exp: userTokenExp
        });
      }
      setIsLoading(false);
    };

    initializeUser();
  }, []);

  const login = (user: ActiveUser) => {
    localStorage.setItem("user_id", user.id);
    localStorage.setItem("user_role", user.role.toString());
    localStorage.setItem("user_token_exp", user.token_exp)
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_token:exp")
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
