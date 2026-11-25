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
import { unitService, type Unit } from "@/lib/api/unit.service";
import { assignUnitService } from "@/lib/api/assign-unit.service";
import { toast } from "sonner";

interface AssignUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  onSuccess?: () => void;
}

export function AssignUnitModal({
  isOpen,
  onClose,
  userId,
  userName,
  onSuccess,
}: AssignUnitModalProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUnits, setIsFetchingUnits] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUnits();
    }
  }, [isOpen]);

  const fetchUnits = async () => {
    try {
      setIsFetchingUnits(true);
      const response = await unitService.getUnits();
      setUnits(response.results);
      
      // Auto-select the unit where user is currently head
      const currentHeadUnit = response.results.find((unit) => unit.head_of_unit === userId);
      if (currentHeadUnit) {
        setSelectedUnitId(currentHeadUnit.id.toString());
      }
    } catch (error) {
      toast.error("Failed to load units");
      console.error("Error fetching units:", error);
    } finally {
      setIsFetchingUnits(false);
    }
  };

  const getCurrentUnit = () => {
    // Find the unit where this user is the head
    return units.find((unit) => unit.head_of_unit === userId);
  };

  const getSelectedUnit = () => {
    if (!selectedUnitId) return null;
    return units.find((unit) => unit.id === parseInt(selectedUnitId));
  };

  const handleAssign = async () => {
    if (!selectedUnitId) {
      toast.error("Please select a unit");
      return;
    }

    try {
      setIsLoading(true);
      await assignUnitService.assignUnitHead(parseInt(selectedUnitId), userId);
      toast.success("Unit head assigned successfully");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to assign unit head");
      console.error("Error assigning unit head:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentUnit = getCurrentUnit();
  const selectedUnit = getSelectedUnit();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Assign Head of Unit
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Assign {userName} as head of a unit
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Unit */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Current Unit</label>
            <div className="rounded-md border bg-muted/50 px-4 py-3">
              <p className="text-sm font-medium">
                {currentUnit?.name || "No unit assigned as head"}
              </p>
            </div>
          </div>

          {/* Select Unit */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Select Unit</label>
            <Select
              value={selectedUnitId}
              onValueChange={setSelectedUnitId}
              disabled={isFetchingUnits}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    <span className="font-medium">{unit.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Unit Details */}
          {selectedUnit && (
            <div className="space-y-2">
              <label className="text-sm font-semibold">Unit Details</label>
              <div className="rounded-md bg-muted/50 p-4 space-y-2">
                <h4 className="font-semibold text-base">{selectedUnit.name}</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium">Sub Vote:</span> {selectedUnit.code}
                  </p>
                  {selectedUnit.description && (
                    <p>
                      <span className="font-medium">Description:</span> {selectedUnit.description}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span className={selectedUnit.is_active ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                      {selectedUnit.is_active ? "Active" : "Inactive"}
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
          <Button onClick={handleAssign} disabled={isLoading || !selectedUnitId}>
            {isLoading ? "Assigning..." : "Assign as Head"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
