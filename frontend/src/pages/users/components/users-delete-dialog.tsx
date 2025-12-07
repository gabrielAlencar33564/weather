import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from "@/components/ui";
import { AlertTriangle } from "lucide-react";
import type { IUser } from "@/interfaces";

type UsersDeleteDialogProps = {
  open: boolean;
  user: IUser | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export const UsersDeleteDialog: React.FC<UsersDeleteDialogProps> = ({
  open,
  user,
  isSubmitting = false,
  onOpenChange,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-cy="users-delete-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription data-cy="users-delete-dialog-message">
            Tem certeza que deseja remover o usuário <b>{user?.name}</b>?
            <br />
            Esta ação não pode ser desfeita e o usuário perderá o acesso imediatamente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            data-cy="button-cancel-delete-user"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting}
            data-cy="button-confirm-delete-user"
          >
            {isSubmitting ? "Excluindo..." : "Excluir Usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
