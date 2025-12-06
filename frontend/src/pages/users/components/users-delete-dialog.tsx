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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription>
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
          >
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Excluindo..." : "Excluir Usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
