import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { logout as logoutService } from '@/services/auth.service';

interface ActiveUser {
  role: number;
  id: string;
  token_exp: string;
}

interface UserProfile {
  name: string;
  email: string;
  tel: string;
  role_id: number;
}

interface UserContextType {
  user: ActiveUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  login: (user: ActiveUser) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ActiveUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const fetchUserProfile = async () => {
    setIsProfileLoading(true);
    try {
      const response = await api.get("/users/current");
      setUserProfile(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile: ", error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    const initializeUser = () => {
      const userRole = localStorage.getItem("user_role");
      const userID = localStorage.getItem("user_id");
      const userTokenExp = localStorage.getItem("user_token_exp");
      const token = localStorage.getItem("token");

      if (userRole && userID && userTokenExp && token) {
        const restoredUser = {
          role: Number(userRole),
          id: userID,
          token_exp: userTokenExp
        };
        setUser(restoredUser);
        fetchUserProfile();
      }
      setIsLoading(false);
    };

    initializeUser();
  }, []);

  const login = async (activeUser: ActiveUser): Promise<void> => {
    localStorage.setItem("user_id", activeUser.id);
    localStorage.setItem("user_role", activeUser.role.toString());
    localStorage.setItem("user_token_exp", activeUser.token_exp);

    setUser(activeUser);

    await fetchUserProfile();
  };

  const logout = () => {
    logoutService();
    setUser(null);
    setUserProfile(null);
    window.location.href = "/login";
  };

  return (
    <UserContext.Provider value={{ user, userProfile, isLoading, isProfileLoading, login, logout }}>
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
