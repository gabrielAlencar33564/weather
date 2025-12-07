"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { jwtDecode } from "jwt-decode";
import { loginRequest } from "./auth-service";
import { setAuthToken } from "@/lib/api-client";
import type { IAuthLoginPayload } from "@/interfaces";
import type { IAuthProvider, IAuthState, IContextProvider } from "./auth-interface";
import { getUserById } from "../users/users-service";

const AUTH_TOKEN_KEY = "auth_token";

const AuthContext = createContext<IAuthProvider | undefined>(undefined);

interface JwtPayload {
  sub?: string;
}

export const AuthProvider: React.FC<IContextProvider> = ({ children }) => {
  const [state, setState] = useState<IAuthState>({
    user: null,
    token: null,
    error: null,
    isLoading: false,
    isSubmitting: false,
    isInitialized: false,
    isAuthenticated: false,
  });

  useEffect(() => {
    const initAuth = async () => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!storedToken) {
          return;
        }

        try {
          const decoded = jwtDecode<JwtPayload>(storedToken);
          const userId = decoded.sub;

          if (!userId) {
            throw new Error("Invalid token: missing sub");
          }

          const user = await getUserById(userId as string, storedToken);

          setAuthToken(storedToken);
          setState((prev) => ({
            ...prev,
            token: storedToken,
            user,
            isAuthenticated: true,
          }));
        } catch {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          setAuthToken(null);
          setState((prev) => ({
            ...prev,
            token: null,
            user: null,
            isAuthenticated: false,
          }));
        }
      } catch (error) {
        console.error(error);
        setState((prev) => ({ ...prev, isAuthenticated: false }));
      } finally {
        setState((prev) => ({ ...prev, isLoading: false, isInitialized: true }));
      }
    };

    void initAuth();
  }, []);

  const login = useCallback(async (payload: IAuthLoginPayload) => {
    setState((prev) => ({ ...prev, error: null, isSubmitting: true }));

    try {
      const { token } = await loginRequest(payload);
      localStorage.setItem(AUTH_TOKEN_KEY, token);

      const decoded = jwtDecode<JwtPayload>(token);
      const userId = decoded.sub;

      if (userId) {
        const user = await getUserById(userId as string, token);

        setAuthToken(token);
        setState((prev) => ({
          ...prev,
          token,
          user,
          isAuthenticated: true,
        }));
      }
    } catch (e) {
      const error = e as Error & { response?: { data?: { message?: string } } };
      const message =
        error?.response?.data?.message || error?.message || "Não foi possivel logar.";

      console.log(message);

      setState((prev) => ({ ...prev, error: message }));
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);

    setAuthToken(null);
    setState((prev) => ({
      ...prev,
      token: null,
      user: null,
      isAuthenticated: false,
    }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): IAuthProvider => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  }
  return ctx;
};
