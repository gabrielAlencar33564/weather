export type RolesType = "admin" | "user";

export interface IAuthLoginPayload {
  email: string;
  password: string;
}

export interface IAuthLoginResponse {
  token: string;
}
