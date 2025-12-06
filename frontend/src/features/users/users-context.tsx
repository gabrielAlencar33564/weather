"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import type { IUser, IUserPayload, IUserUpdatePayload } from "@/interfaces";
import {
  createUser as createUserApi,
  getUsers as getUsersApi,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
} from "./users-service";
import type {
  IContextProvider,
  ILoadParams,
  IUsersProvider,
  IUsersState,
} from "./users-interface";
import { toastError } from "@/lib/toast";

const UsersContext = createContext<IUsersProvider | undefined>(undefined);

export const UsersProvider: React.FC<IContextProvider> = ({ children }) => {
  const [state, setState] = useState<IUsersState>({
    users: [],
    meta: null,
    error: null,
    listError: null,
    isLoading: false,
    isSubmitting: false,
    isInitialized: false,
  });

  const loadUsers = useCallback(async (params?: ILoadParams) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await getUsersApi(params);
      setState((prev) => ({
        ...prev,
        users: response.data,
        meta: response.meta,
      }));
    } catch (e) {
      const error = e as Error & { response?: { data?: { message?: string } } };
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível carregar os usuários.";

      setState((prev) => ({ ...prev, listError: message }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false, isInitialized: true }));
    }
  }, []);

  const createUser = useCallback(async (payload: IUserPayload): Promise<IUser> => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const created = await createUserApi(payload);
      setState((prev) => ({ ...prev, users: [...prev.users, created] }));

      return created;
    } catch (e) {
      const error = e as Error & { response?: { data?: { message?: string } } };
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível criar o usuário.";

      setState((prev) => ({ ...prev, error: message }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, []);

  const updateUser = useCallback(
    async (id: string, payload: IUserUpdatePayload): Promise<IUser> => {
      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

      try {
        const updated = await updateUserApi(id, payload);
        setState((prev) => ({
          ...prev,
          users: prev.users.map((u) => (u._id === updated._id ? updated : u)),
        }));

        return updated;
      } catch (e) {
        const error = e as Error & { response?: { data?: { message?: string } } };
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Não foi possível atualizar o usuário.";

        setState((prev) => ({ ...prev, error: message }));
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    []
  );

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteUserApi(id);
      setState((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u._id !== id),
      }));
    } catch (e) {
      const error = e as Error & { response?: { data?: { message?: string } } };
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível remover o usuário.";

      toastError(message);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, []);

  return (
    <UsersContext.Provider
      value={{
        ...state,
        loadUsers,
        createUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = (): IUsersProvider => {
  const ctx = useContext(UsersContext);
  if (!ctx) {
    throw new Error("useUsers deve ser usado dentro de <UsersProvider>");
  }
  return ctx;
};
