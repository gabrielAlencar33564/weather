import React from "react";
import { Button, Input, Label } from "@/components/ui";

type LoginFormProps = {
  email: string;
  password: string;
  error: string;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  error,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="user@gmail.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-destructive font-medium">{error}</p>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
};
