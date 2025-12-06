import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup.string().required("Informe o e-mail").email("Informe um e-mail válido"),
  password: yup
    .string()
    .required("Informe a senha")
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
});
