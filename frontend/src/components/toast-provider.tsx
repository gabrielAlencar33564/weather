"use client";

import { useDarkMode } from "@/hooks/use-dark-mode";
import React from "react";
import { ToastContainer, Slide } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export const ToastProvider: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const theme = isDarkMode ? "dark" : "light";

  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      transition={Slide}
      theme={theme}
    />
  );
};
