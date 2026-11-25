"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  entityType: string;
  entityName: string;
  entityDetails?: { label: string; value: string }[];
  warnings?: string[];
  cautionNote?: string;
}

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  entityType,
  entityName,
  entityDetails = [],
  warnings = [],
  cautionNote,
}: DeleteDialogProps) {
  const defaultWarnings = [
    `Permanently remove the ${entityType.toLowerCase()} from the system`,
    `Remove all ${entityType.toLowerCase()} assignments and references`,
    `Affect related records and reporting`,
    `This action is permanent and cannot be reversed`,
  ];

  const activeWarnings = warnings.length > 0 ? warnings : defaultWarnings;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete {entityType}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete the {entityType.toLowerCase()}{" "}
          <span className="font-semibold text-foreground">&ldquo;{entityName}&rdquo;</span>?
          This action cannot be undone.
        </p>

        {entityDetails.length > 0 && (
          <div className="rounded-md border bg-muted/40 px-4 py-3">
            <p className="font-semibold text-sm">{entityName}</p>
            {entityDetails.map((d, i) => (
              <p key={i} className="text-sm text-muted-foreground">{d.label}: {d.value}</p>
            ))}
          </div>
        )}

        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 space-y-2">
          <p className="text-sm font-semibold text-destructive">
            Warning: Deleting this {entityType.toLowerCase()} will:
          </p>
          <ul className="space-y-1">
            {activeWarnings.map((w, i) => (
              <li key={i} className="text-sm text-destructive flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>

          {cautionNote && (
            <div className="mt-2 rounded bg-destructive/10 border border-destructive/20 px-3 py-2">
              <p className="text-sm text-destructive">
                ⚠️ {cautionNote}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete {entityType}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
