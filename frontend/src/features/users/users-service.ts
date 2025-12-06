import type {
  IUser,
  IUserPaginationResponse,
  IUserPayload,
  IUserUpdatePayload,
} from "@/interfaces";
import { api } from "@/lib/api-client";

export const createUser = async (payload: IUserPayload): Promise<IUser> => {
  const { data } = await api.post<IUser>("/users", payload);
  return data;
};

export const getUsers = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<IUserPaginationResponse> => {
  const { data } = await api.get<IUserPaginationResponse>("/users", {
    params,
  });
  return data;
};

export const getUserById = async (id: string, token?: string): Promise<IUser> => {
  const { data } = await api.get<IUser>(`/users/${id}`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  return data;
};

export const updateUser = async (
  id: string,
  payload: IUserUpdatePayload
): Promise<IUser> => {
  const { data } = await api.patch<IUser>(`/users/${id}`, payload);
  return data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};
