"use client";

import { useState } from "react";

interface DeleteDialogState<T> {
  open: boolean;
  item: T | null;
  isDeleting: boolean;
}

export function useDeleteDialog<T>() {
  const [state, setState] = useState<DeleteDialogState<T>>({
    open: false,
    item: null,
    isDeleting: false,
  });

  const confirmDelete = (item: T) => {
    setState({ open: true, item, isDeleting: false });
  };

  const closeDelete = () => {
    setState(prev => ({ ...prev, open: false, item: null }));
  };

  const setDeleting = (isDeleting: boolean) => {
    setState(prev => ({ ...prev, isDeleting }));
  };

  return {
    deleteDialog: state,
    confirmDelete,
    closeDelete,
    setDeleting,
  };
}
