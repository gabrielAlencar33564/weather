import { toast, type ToastOptions } from "react-toastify";

const defaultOptions: ToastOptions = {
  autoClose: 4000,
};

export const toastSuccess = (message: string, options?: ToastOptions) =>
  toast.success(message, { ...defaultOptions, ...options });

export const toastError = (message: string, options?: ToastOptions) =>
  toast.error(message, { ...defaultOptions, ...options });

export const toastInfo = (message: string, options?: ToastOptions) =>
  toast.info(message, { ...defaultOptions, ...options });

export const toastWarning = (message: string, options?: ToastOptions) =>
  toast.warn(message, { ...defaultOptions, ...options });
