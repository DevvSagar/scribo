/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const refreshSession = async () => {
    setIsLoadingAuth(true);

    if (!API_BASE_URL) {
      setUser(null);
      setIsLoadingAuth(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setUser(null);
        return;
      }

      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = (nextUser) => {
    setUser(nextUser);
  };

  const logout = async () => {
    try {
      if (API_BASE_URL) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          credentials: "include",
        });
      }
    } catch {
      // Clear local auth state even if the request fails.
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoadingAuth,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
