"use client";

import { useState } from "react";

interface ErrorDialogState {
  open: boolean;
  title: string;
  message: string;
}

export function useErrorDialog() {
  const [state, setState] = useState<ErrorDialogState>({
    open: false,
    title: "Something went wrong",
    message: "",
  });

  const showError = (message: string, title = "Something went wrong") => {
    setState({ open: true, title, message });
  };

  const closeError = () => {
    setState(prev => ({ ...prev, open: false }));
  };

  return {
    errorDialog: state,
    showError,
    closeError,
  };
}
