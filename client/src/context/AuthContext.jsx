/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { buildApiUrl } from "../lib/apiBaseUrl";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const refreshSession = async () => {
    setIsLoadingAuth(true);

    try {
      const response = await fetch(buildApiUrl("/me"), {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setUser(null);
        return;
      }

      setUser(data.user || null);
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
    setUser(nextUser || null);
  };

  const logout = async () => {
    try {
      await fetch(buildApiUrl("/logout"), {
        method: "POST",
        credentials: "include",
      });
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
