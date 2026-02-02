import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../api/client";

interface AuthContextType {
  accessToken: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/users/refresh`, {
          method: "POST",
          credentials: "include", 
        });
        if (!res.ok) return;
        const data = await res.json();
        setAccessToken(data.access_token);
      } catch {
        console.log("User not logged in");
      }
    };
    initAuth();
  }, []);

  const login = (token: string) => {
    setAccessToken(token);
  };

  const logout = () => {
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
