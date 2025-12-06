import React from "react";
import { Badge } from "@/components";
import type { IUser } from "@/interfaces";

type UserRoleBadgeProps = {
  role: IUser["role"] | "admin" | "user";
};

const ROLE_CONFIG: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  admin: {
    label: "Administrador",
    className:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-700/60",
  },
  user: {
    label: "Usuário",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-100 dark:border-emerald-700/60",
  },
};

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role }) => {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG["user"];

  return (
    <Badge
      variant="outline"
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}
    >
      {config.label}
    </Badge>
  );
};
