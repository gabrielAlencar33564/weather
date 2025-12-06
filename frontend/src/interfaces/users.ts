import type { RolesType } from "./auth";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: RolesType;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPayload {
  name: string;
  email: string;
  password: string;
}

export type IUserUpdatePayload = Partial<IUserPayload>;

export interface IUserPaginationMeta {
  total: number;
  offset: number;
  limit: number;
  last_page: number;
  current_page: number;
}

export interface IUserPaginationResponse {
  data: IUser[];
  meta: IUserPaginationMeta;
}
