"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, ArrowRight, ArrowLeft, Search } from "lucide-react";
import { permissionService, type Permission, type PermissionsResponse } from "@/lib/api/permission.service";
import { assignPermissionService } from "@/lib/api/assign-permission.service";
import { toast } from "sonner";
import { TransferListModal } from "./transfer-list-modal";

interface AssignPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  currentPermissions?: string[];
  onSuccess?: () => void;
}

export function AssignPermissionModal({
  isOpen,
  onClose,
  userId,
  userName,
  currentPermissions = [],
  onSuccess,
}: AssignPermissionModalProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permPage, setPermPage] = useState(1);
  const [permTotal, setPermTotal] = useState(0);
  const PAGE_SIZE = 10;
  const [assignedPermissions, setAssignedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPermissions, setIsFetchingPermissions] = useState(false);
  const [availableSearch, setAvailableSearch] = useState("");
  const [assignedSearch, setAssignedSearch] = useState("");
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPermPage(1);
      setAssignedPermissions(currentPermissions);
      setSelectedAvailable([]);
      setSelectedAssigned([]);
    }
    // currentPermissions intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) fetchPermissions(permPage);
  }, [isOpen, permPage]);

  const fetchPermissions = async (page: number) => {
    try {
      setIsFetchingPermissions(true);
      const response = await permissionService.getPermissionsPaginated({ page });
      setPermissions(response.results);
      setPermTotal(response.count);
    } catch (error) {
      toast.error("Failed to load permissions");
      console.error("Error fetching permissions:", error);
    } finally {
      setIsFetchingPermissions(false);
    }
  };

  const totalPages = Math.ceil(permTotal / PAGE_SIZE);

  const availablePermissions = permissions.filter(
    (p) => !assignedPermissions.includes(p.codename)
  );

  const filteredAvailable = availablePermissions.filter(
    (p) =>
      p.name.toLowerCase().includes(availableSearch.toLowerCase()) ||
      p.codename.toLowerCase().includes(availableSearch.toLowerCase())
  );

  const filteredAssigned = permissions
    .filter((p) => assignedPermissions.includes(p.codename))
    .filter(
      (p) =>
        p.name.toLowerCase().includes(assignedSearch.toLowerCase()) ||
        p.codename.toLowerCase().includes(assignedSearch.toLowerCase())
    );

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

      // Determine which permissions were added and which were removed
      const permissionsToAdd = assignedPermissions.filter(
        (p) => !currentPermissions.includes(p)
      );
      const permissionsToRemove = currentPermissions.filter(
        (p) => !assignedPermissions.includes(p)
      );

      // Call both endpoints if needed
      const promises = [];
      
      if (permissionsToAdd.length > 0) {
        promises.push(
          assignPermissionService.assignPermissions(userId, permissionsToAdd)
        );
      }
      
      if (permissionsToRemove.length > 0) {
        promises.push(
          assignPermissionService.removePermissions(userId, permissionsToRemove)
        );
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        toast.success("Permissions updated successfully");
      } else {
        toast.info("No changes to permissions");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to update permissions");
      console.error("Error updating permissions:", error);
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
            <h2 className="text-lg font-semibold">Manage Role Permissions</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage role assignments for <span className="font-semibold">{userName}</span>
          </p>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
          <Search className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium">{userName}</p>
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
                placeholder="Search available permissions..."
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
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-500">Page {permPage} of {totalPages}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPermPage((p) => Math.max(1, p - 1))}
                    disabled={permPage <= 1}
                    className="px-2 py-1 text-xs border rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    ‹ Prev
                  </button>
                  <button
                    onClick={() => setPermPage((p) => Math.min(totalPages, p + 1))}
                    disabled={permPage >= totalPages}
                    className="px-2 py-1 text-xs border rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Next ›
                  </button>
                </div>
              </div>
            )}
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
                {filteredAssigned.length} permissions
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search assigned permissions..."
                value={assignedSearch}
                onChange={(e) => setAssignedSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="border rounded-lg h-[400px] overflow-y-auto bg-white dark:bg-gray-950">
              <div className="divide-y">
                {filteredAssigned.map((permission) => (
                  <div
                    key={permission.id}
                    onClick={() => toggleAssignedSelection(permission.codename)}
                    className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedAssigned.includes(permission.codename)
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
