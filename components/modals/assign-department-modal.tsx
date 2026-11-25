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
import { Building2 } from "lucide-react";
import { departmentService, type Department } from "@/lib/api/department.service";
import { assignDepartmentService } from "@/lib/api/assign-department.service";
import { toast } from "sonner";

function getDepartmentHeadId(dept: Department): number | null {
  return dept.head_of_department ?? dept.head_of_division ?? null;
}

interface AssignDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  currentDepartment?: number | null;
  onSuccess?: () => void;
}

export function AssignDepartmentModal({
  isOpen,
  onClose,
  userId,
  userName,
  currentDepartment = null,
  onSuccess,
}: AssignDepartmentModalProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDepartments, setIsFetchingDepartments] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      if (currentDepartment) {
        setSelectedDepartmentId(currentDepartment.toString());
      }
    }
  }, [isOpen, currentDepartment]);

  const fetchDepartments = async () => {
    try {
      setIsFetchingDepartments(true);
      const response = await departmentService.getDepartments();
      setDepartments(response.results);
      
      // Auto-select the department where user is currently head
      const currentHeadDept = response.results.find(
        (dept) => getDepartmentHeadId(dept) === userId
      );
      if (currentHeadDept) {
        setSelectedDepartmentId(currentHeadDept.id.toString());
      }
    } catch (error) {
      toast.error("Failed to load departments");
      console.error("Error fetching departments:", error);
    } finally {
      setIsFetchingDepartments(false);
    }
  };

  const getCurrentDepartment = () => {
    // Find the department where this user is the head
    return departments.find((dept) => getDepartmentHeadId(dept) === userId);
  };

  const getSelectedDepartment = () => {
    if (!selectedDepartmentId) return null;
    return departments.find((dept) => dept.id === parseInt(selectedDepartmentId));
  };

  const handleAssign = async () => {
    if (!selectedDepartmentId) {
      toast.error("Please select a department");
      return;
    }

    try {
      setIsLoading(true);
      await assignDepartmentService.assignDepartmentHead(parseInt(selectedDepartmentId), userId);
      toast.success("Division head assigned successfully");
      onSuccess?.();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to assign division head";
      toast.error(message);
      console.error("Error assigning department head:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentDept = getCurrentDepartment();
  const selectedDept = getSelectedDepartment();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Assign Head of Division
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Assign {userName} as head of a division
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Division */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Current Division</label>
            <div className="rounded-md border bg-muted/50 px-4 py-3">
              <p className="text-sm font-medium">
                {currentDept?.name || "No division assigned as head"}
              </p>
            </div>
          </div>

          {/* Select Division */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Select Division</label>
            <Select
              value={selectedDepartmentId}
              onValueChange={setSelectedDepartmentId}
              disabled={isFetchingDepartments}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a division" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    <span className="font-medium">{dept.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Division Details */}
          {selectedDept && (
            <div className="space-y-2">
              <label className="text-sm font-semibold">Division Details</label>
              <div className="rounded-md bg-muted/50 p-4 space-y-2">
                <h4 className="font-semibold text-base">{selectedDept.name}</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium">Code:</span> {selectedDept.code}
                  </p>
                  {selectedDept.description && (
                    <p>
                      <span className="font-medium">Description:</span> {selectedDept.description}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span className={selectedDept.is_active ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                      {selectedDept.is_active ? "Active" : "Inactive"}
                    </span>
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
          <Button onClick={handleAssign} disabled={isLoading || !selectedDepartmentId}>
            {isLoading ? "Assigning..." : "Assign as Head"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
