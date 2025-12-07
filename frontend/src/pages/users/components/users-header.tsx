import React from "react";
import { Button } from "@/components";
import { Plus } from "lucide-react";

type UsersHeaderProps = {
  onNewUser: () => void;
  isSubmitting?: boolean;
};

export const UsersHeader: React.FC<UsersHeaderProps> = ({
  onNewUser,
  isSubmitting = false,
}) => {
  return (
    <div
      className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      data-cy="users-header"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestão de Usuários</h1>
        <p className="text-muted-foreground">Administre o acesso ao sistema</p>
      </div>
      <Button onClick={onNewUser} disabled={isSubmitting} data-cy="button-new-user">
        <Plus className="mr-2 h-4 w-4" /> Novo Usuário
      </Button>
    </div>
  );
};
