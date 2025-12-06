import { api } from "@/lib/api-client";
import type { IAuthLoginPayload, IAuthLoginResponse } from "@/interfaces";

export const loginRequest = async (
  payload: IAuthLoginPayload
): Promise<IAuthLoginResponse> => {
  const { data } = await api.post<IAuthLoginResponse>("/auth/login", payload);
  return data;
};
