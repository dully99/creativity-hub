"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, ArrowRight, ArrowLeft, Search } from "lucide-react";
import { permissionService, type Permission } from "@/lib/api/permission.service";
import { assignPermissionService } from "@/lib/api/assign-permission.service";
import { roleService } from "@/lib/api/role.service";
import { toast } from "sonner";
import { TransferListModal } from "./transfer-list-modal";

interface AssignRolePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: number;
  roleName: string;
  onSuccess?: () => void;
}

export function AssignRolePermissionModal({
  isOpen,
  onClose,
  roleId,
  roleName,
  onSuccess,
}: AssignRolePermissionModalProps) {
  const [originalPermissions, setOriginalPermissions] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [assignedPermissions, setAssignedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPermissions, setIsFetchingPermissions] = useState(false);
  const [availableSearch, setAvailableSearch] = useState("");
  const [assignedSearch, setAssignedSearch] = useState("");
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedAvailable([]);
      setSelectedAssigned([]);
      setAvailableSearch("");
      setAssignedSearch("");
      fetchAllPermissions();
      fetchRolePermissions();
    }
  }, [isOpen, roleId]);

  const fetchRolePermissions = async () => {
    try {
      const perms = await roleService.getRolePermissions(roleId);
      setAssignedPermissions(perms);
      setOriginalPermissions(perms);
    } catch (error) {
      toast.error("Failed to load role permissions");
      console.error("Error fetching role permissions:", error);
    }
  };

  const fetchAllPermissions = async () => {
    try {
      setIsFetchingPermissions(true);
      const all: Permission[] = [];
      let page = 1;
      while (true) {
        const response = await permissionService.getPermissionsPaginated({ page });
        all.push(...response.results);
        if (!response.next) break;
        page++;
      }
      setPermissions(all);
    } catch (error) {
      toast.error("Failed to load permissions");
      console.error("Error fetching permissions:", error);
    } finally {
      setIsFetchingPermissions(false);
    }
  };

  const availablePermissions = permissions.filter(
    (p) => !assignedPermissions.includes(p.codename)
  );

  const filteredAvailable = availablePermissions.filter(
    (p) =>
      p.name.toLowerCase().includes(availableSearch.toLowerCase()) ||
      p.codename.toLowerCase().includes(availableSearch.toLowerCase())
  );

  const permissionMap = new Map(permissions.map((p) => [p.codename, p]));

  const filteredAssigned = assignedPermissions
    .filter((codename) => {
      const p = permissionMap.get(codename);
      if (!assignedSearch) return true;
      if (!p) return codename.toLowerCase().includes(assignedSearch.toLowerCase());
      return (
        p.name.toLowerCase().includes(assignedSearch.toLowerCase()) ||
        p.codename.toLowerCase().includes(assignedSearch.toLowerCase())
      );
    });

  const handleMoveToAssigned = () => {
    setAssignedPermissions([...assignedPermissions, ...selectedAvailable]);
    setSelectedAvailable([]);
  };

  const handleMoveToAvailable = () => {
    setAssignedPermissions(
      assignedPermissions.filter((p) => !selectedAssigned.includes(p))
    );
    setSelectedAssigned([]);
  };

  const toggleAvailableSelection = (codename: string) => {
    setSelectedAvailable((prev) =>
      prev.includes(codename)
        ? prev.filter((p) => p !== codename)
        : [...prev, codename]
    );
  };

  const toggleAssignedSelection = (codename: string) => {
    setSelectedAssigned((prev) =>
      prev.includes(codename)
        ? prev.filter((p) => p !== codename)
        : [...prev, codename]
    );
  };

  const handleAssign = async () => {
    try {
      setIsLoading(true);

      const permissionsToAdd = assignedPermissions.filter(
        (p) => !originalPermissions.includes(p)
      );

      if (permissionsToAdd.length > 0) {
        await assignPermissionService.assignRolePermissions(roleId, permissionsToAdd);
        toast.success("Permissions assigned to role successfully");
      } else {
        toast.info("No new permissions to assign");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to assign permissions to role");
      console.error("Error assigning role permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TransferListModal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Assign Role Permissions</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage permissions for role{" "}
            <span className="font-semibold">{roleName}</span>
          </p>
        </div>

        {/* Role Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
          <Shield className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium">{roleName}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Current permissions: {assignedPermissions.length}
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-6 mb-6">
          {/* Available Permissions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Available Permissions</h3>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {filteredAvailable.length} permissions
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search available..."
                value={availableSearch}
                onChange={(e) => setAvailableSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="border rounded-lg h-[400px] overflow-y-auto bg-white dark:bg-gray-950">
              {isFetchingPermissions ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredAvailable.map((permission) => (
                    <div
                      key={permission.id}
                      onClick={() => toggleAvailableSelection(permission.codename)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedAvailable.includes(permission.codename)
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                    >
                      <p className="text-sm font-medium">{permission.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {permission.codename}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Transfer Buttons */}
          <div className="flex flex-col items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleMoveToAssigned}
              disabled={selectedAvailable.length === 0}
              className="h-10 w-10"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleMoveToAvailable}
              disabled={selectedAssigned.length === 0}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Assigned Permissions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Assigned Permissions</h3>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {assignedPermissions.length} permissions
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search assigned..."
                value={assignedSearch}
                onChange={(e) => setAssignedSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="border rounded-lg h-[400px] overflow-y-auto bg-white dark:bg-gray-950">
              <div className="divide-y">
                {filteredAssigned.map((codename) => {
                  const p = permissionMap.get(codename);
                  return (
                    <div
                      key={codename}
                      onClick={() => toggleAssignedSelection(codename)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedAssigned.includes(codename)
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                    >
                      <p className="text-sm font-medium">{p ? p.name : codename}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{codename}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isLoading}>
            {isLoading ? "Assigning..." : "Assign Permissions"}
          </Button>
        </div>
      </div>
    </TransferListModal>
  );
}
