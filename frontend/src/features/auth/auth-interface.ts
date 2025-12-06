import type { IAuthLoginPayload, IUser } from "@/interfaces";

export interface IAuthState {
  user: IUser | null;
  token: string | null;
  error: string | null;
  isLoading?: boolean;
  isSubmitting?: boolean;
  isInitialized?: boolean;
  isAuthenticated: boolean;
}

export interface IAuthProvider extends IAuthState {
  login: (payload: IAuthLoginPayload) => Promise<void>;
  logout: () => void;
}

export interface IContextProvider {
  children: React.ReactNode;
}
