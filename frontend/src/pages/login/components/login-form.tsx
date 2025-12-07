import React from "react";
import { Button, Input, Label } from "@/components/ui";
import type { UseFormRegister } from "react-hook-form";
import type { IAuthLoginPayload } from "@/interfaces";

type LoginFormProps = {
  error: string;
  isLoading: boolean;
  register: UseFormRegister<IAuthLoginPayload>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export const LoginForm: React.FC<LoginFormProps> = ({
  error,
  isLoading,
  register,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4" data-cy="form-login">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="user@gmail.com"
          data-cy="input-email"
          {...register("email")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••"
          {...register("password")}
          data-cy="input-password"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive font-medium" data-cy="message-erro-login">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        data-cy="button-enter"
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
};
