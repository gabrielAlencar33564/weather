import React from "react";
import { User } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui";

export const LoginHeader: React.FC = () => {
  return (
    <CardHeader className="space-y-1 text-center">
      <div className="flex justify-center mb-4">
        <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
      <CardTitle className="text-2xl font-bold text-foreground">
        Bem-vindo ao GDash
      </CardTitle>
      <p className="text-sm text-muted-foreground">
        Entre para acessar o dashboard de clima
      </p>
    </CardHeader>
  );
};
