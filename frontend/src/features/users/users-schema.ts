import type { IUserPayload } from "@/interfaces";
import * as yup from "yup";

export const userFormSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(120, "Nome pode ter no máximo 120 caracteres")
    .when("$isEditing", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Nome é obrigatório"),
    }),
  email: yup
    .string()
    .trim()
    .email("E-mail inválido")
    .when("$isEditing", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("E-mail é obrigatório"),
    }),
  password: yup
    .string()
    .trim()
    .when("$isEditing", {
      is: true,
      then: (schema) =>
        schema
          .notRequired()
          .nullable()
          .transform((value) => (value === "" ? undefined : value))
          .min(6, "Senha deve ter pelo menos 6 caracteres"),
      otherwise: (schema) =>
        schema
          .required("Senha é obrigatória")
          .min(6, "Senha deve ter pelo menos 6 caracteres"),
    }),
}) as yup.ObjectSchema<Partial<IUserPayload>>;
