"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield } from "lucide-react";
import { roleService, type Role } from "@/lib/api/role.service";
import { assignRoleService } from "@/lib/api/assign-role.service";
import { toast } from "sonner";

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  currentRoles?: string[];
  onSuccess?: () => void;
}

export function AssignRoleModal({
  isOpen,
  onClose,
  userId,
  userName,
  currentRoles = [],
  onSuccess,
}: AssignRoleModalProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRoles, setIsFetchingRoles] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedRoleId("");
      fetchRoles();
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    try {
      setIsFetchingRoles(true);
      const response = await roleService.getRoles();
      setRoles(response);
    } catch (error) {
      toast.error("Failed to load roles");
      console.error("Error fetching roles:", error);
    } finally {
      setIsFetchingRoles(false);
    }
  };

  const getCurrentRoleNames = () => {
    if (currentRoles.length === 0) return "No role assigned";
    return currentRoles.join(", ");
  };

  const getSelectedRole = () => {
    if (!selectedRoleId) return null;
    return roles.find((role) => role.id === parseInt(selectedRoleId));
  };

  const handleAssign = async () => {
    if (!selectedRoleId) {
      toast.error("Please select a role");
      return;
    }

    try {
      setIsLoading(true);
      await assignRoleService.assignRole(userId, parseInt(selectedRoleId));
      toast.success("Role assigned successfully");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to assign role");
      console.error("Error assigning role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentRoleNames = getCurrentRoleNames();
  const selectedRole = getSelectedRole();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Assign Role
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Add another role for {userName}. Users can hold multiple roles.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Roles */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Current Roles</label>
            <div className="rounded-md border bg-muted/50 px-4 py-3">
              <p className="text-sm font-medium">
                {currentRoleNames}
              </p>
            </div>
          </div>

          {/* Select Role */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Add Role</label>
            <Select
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
              disabled={isFetchingRoles}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role to add" />
              </SelectTrigger>
              <SelectContent>
                {roles.filter((role) => !currentRoles.includes(role.name)).length === 0 ? (
                  <div className="px-2 py-3 text-sm text-muted-foreground">
                    All available roles are already assigned.
                  </div>
                ) : (
                  roles
                    .filter((role) => !currentRoles.includes(role.name))
                    .map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        <span className="font-medium">{role.name}</span>
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Role Details */}
          {selectedRole && (
            <div className="space-y-2">
              <label className="text-sm font-semibold">Role Details</label>
              <div className="rounded-md bg-muted/50 p-4 space-y-2">
                <h4 className="font-semibold text-base">{selectedRole.name}</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium">Name:</span> {selectedRole.name}
                  </p>
                  <p>
                    <span className="font-medium">Description:</span> Administrative access for {selectedRole.name.toLowerCase()}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span className="text-green-600 dark:text-green-400">Active</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isLoading || !selectedRoleId}>
            {isLoading ? "Assigning..." : "Add Role"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
