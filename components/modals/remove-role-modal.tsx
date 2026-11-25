"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldOff, Trash2 } from "lucide-react";
import { roleService, type Role } from "@/lib/api/role.service";
import { assignRoleService } from "@/lib/api/assign-role.service";
import { toast } from "sonner";

interface RemoveRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  currentRoles?: string[];
  onSuccess?: () => void;
}

export function RemoveRoleModal({
  isOpen,
  onClose,
  userId,
  userName,
  currentRoles = [],
  onSuccess,
}: RemoveRoleModalProps) {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRoles, setIsFetchingRoles] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedRoleId(null);
      fetchRoles();
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    try {
      setIsFetchingRoles(true);
      const response = await roleService.getRoles();
      setAllRoles(response);
    } catch (error) {
      toast.error("Failed to load roles");
      console.error("Error fetching roles:", error);
    } finally {
      setIsFetchingRoles(false);
    }
  };

  const assignedRoles = allRoles.filter((r) =>
    currentRoles.map((n) => n.toLowerCase()).includes(r.name.toLowerCase())
  );

  const handleRemove = async () => {
    if (selectedRoleId === null) {
      toast.error("Please select a role to remove");
      return;
    }

    try {
      setIsLoading(true);
      await assignRoleService.removeRole(userId, selectedRoleId);
      toast.success("Role removed successfully");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to remove role");
      console.error("Error removing role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <ShieldOff className="h-5 w-5" />
            Remove Role
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Remove a role from <span className="font-semibold text-foreground">{userName}</span>
          </p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {isFetchingRoles ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : assignedRoles.length === 0 ? (
            <div className="rounded-md border bg-muted/40 px-4 py-6 text-center">
              <ShieldOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                This user has no roles assigned.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-semibold">Select role to remove</label>
              <div className="space-y-2">
                {assignedRoles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`w-full flex items-center justify-between rounded-md border px-4 py-3 text-left transition-colors ${
                      selectedRoleId === role.id
                        ? "border-destructive bg-destructive/10"
                        : "border-border bg-muted/30 hover:bg-muted/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        selectedRoleId === role.id ? "bg-destructive/20" : "bg-muted"
                      }`}>
                        <ShieldOff className={`h-4 w-4 ${
                          selectedRoleId === role.id ? "text-destructive" : "text-muted-foreground"
                        }`} />
                      </div>
                      <span className={`text-sm font-medium ${
                        selectedRoleId === role.id ? "text-destructive" : ""
                      }`}>
                        {role.name}
                      </span>
                    </div>
                    {selectedRoleId === role.id && (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedRoleId !== null && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive font-medium">
                ⚠️ This will revoke the selected role from{" "}
                <span className="font-semibold">{userName}</span>. They will lose
                all permissions associated with this role.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={isLoading || selectedRoleId === null || assignedRoles.length === 0}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Removing...
              </>
            ) : (
              <>
                <ShieldOff className="h-4 w-4" />
                Remove Role
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
