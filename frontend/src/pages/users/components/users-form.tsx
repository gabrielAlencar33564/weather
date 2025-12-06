import React from "react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
} from "@/components/ui";
import type { IUserUpdatePayload } from "@/interfaces";

interface IUsersFormData {
  name: string;
  email: string;
  password?: string;
}

type UsersFormProps = {
  isEditing: boolean;
  error: string | null;
  register: UseFormRegister<IUserUpdatePayload>;
  errors: FieldErrors<IUsersFormData>;
  isSubmitting: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onCancel: () => void;
};

export const UsersForm: React.FC<UsersFormProps> = ({
  isEditing,
  register,
  errors,
  error,
  isSubmitting,
  onSubmit,
  onCancel,
}) => {
  return (
    <Card className="bg-muted/30 border-border animate-in fade-in slide-in-from-top-4">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Usuário" : "Novo Usuário"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" placeholder="Ex: Ana Costa" {...register("name")} />
              {errors.name && (
                <span className="text-sm text-red-500">{errors.name.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Ex: ana@email.com" {...register("email")} />
              {errors.email && (
                <span className="text-sm text-red-500">{errors.email.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder={isEditing ? "(Deixe em branco para manter)" : "******"}
                {...register("password")}
              />
              {errors.password && (
                <span className="text-sm text-red-500">{errors.password.message}</span>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEditing
                ? isSubmitting
                  ? "Salvando..."
                  : "Salvar"
                : isSubmitting
                ? "Criando..."
                : "Confirmar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
