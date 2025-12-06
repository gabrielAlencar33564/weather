"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui";
import { LoginHeader, LoginForm } from "./components";
import { loginSchema, useAuth } from "@/features/auth";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type { IAuthLoginPayload } from "@/interfaces";

const LoginPage: React.FC = () => {
  const { error: apiError, login: onLogin } = useAuth();

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<IAuthLoginPayload>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const email = useWatch({ name: "email", control });
  const password = useWatch({ name: "password", control });

  const onSubmit = async (values: IAuthLoginPayload) => {
    await onLogin({
      email: values.email,
      password: values.password,
    });
  };

  const fieldErrorMessage = errors.email?.message || errors.password?.message || "";

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <LoginHeader />
        <CardContent>
          <LoginForm
            email={email}
            password={password}
            error={apiError || fieldErrorMessage}
            isLoading={isSubmitting}
            onEmailChange={(value: string) =>
              setValue("email", value, { shouldValidate: true })
            }
            onPasswordChange={(value: string) =>
              setValue("password", value, { shouldValidate: true })
            }
            onSubmit={handleSubmit(onSubmit)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
