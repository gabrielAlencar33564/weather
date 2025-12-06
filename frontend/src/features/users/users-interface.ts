import type {
  IUser,
  IUserPaginationResponse,
  IUserPayload,
  IUserUpdatePayload,
} from "@/interfaces";

export interface IUsersState {
  users: IUser[];
  meta: IUserPaginationResponse["meta"] | null;
  isSubmitting: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  listError: string | null;
}

export interface ILoadParams {
  limit?: number;
  offset?: number;
}

export interface IUsersProvider extends IUsersState {
  loadUsers: (params?: ILoadParams) => Promise<void>;
  createUser: (payload: IUserPayload) => Promise<IUser>;
  updateUser: (id: string, payload: IUserUpdatePayload) => Promise<IUser>;
  deleteUser: (id: string) => Promise<void>;
}

export interface IContextProvider {
  children: React.ReactNode;
}
