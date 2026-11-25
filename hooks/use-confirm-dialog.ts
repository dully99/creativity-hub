"use client";

import { useCallback, useRef, useState } from "react";
import { ConfirmVariant } from "@/components/modals/confirm-dialog";
import { LucideIcon } from "lucide-react";

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  icon?: LucideIcon;
  onConfirm: () => void | Promise<void>;
}

interface ConfirmDialogState {
  open: boolean;
  isLoading: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: ConfirmVariant;
  icon?: LucideIcon;
}

const closedState: ConfirmDialogState = {
  open: false,
  isLoading: false,
  title: "",
  description: "",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  variant: "default",
};

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState>(closedState);
  const onConfirmRef = useRef<(() => void | Promise<void>) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    onConfirmRef.current = options.onConfirm;
    setState({
      open: true,
      isLoading: false,
      title: options.title,
      description: options.description,
      confirmLabel: options.confirmLabel ?? "Confirm",
      cancelLabel: options.cancelLabel ?? "Cancel",
      variant: options.variant ?? "default",
      icon: options.icon,
    });
  }, []);

  const closeConfirm = useCallback(() => {
    onConfirmRef.current = null;
    setState(closedState);
  }, []);

  const runConfirm = useCallback(async () => {
    if (!onConfirmRef.current) return;
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await onConfirmRef.current();
      onConfirmRef.current = null;
      setState(closedState);
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  return {
    confirm,
    closeConfirm,
    runConfirm,
    confirmDialog: state,
  };
}
