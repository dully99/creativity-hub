"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Shield } from "lucide-react";
import { departmentService, Department } from "@/lib/api/department.service";
import { userService, User } from "@/lib/api/user.service";
import { ministryService, Ministry } from "@/lib/api/ministry.service";
import { toast } from "sonner";

interface ViewDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  divisionId: number;
}

export function ViewDivisionModal({
  isOpen,
  onClose,
  divisionId,
}: ViewDivisionModalProps) {
  const [division, setDivision] = useState<Department | null>(null);
  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [head, setHead] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && divisionId) {
      fetchDivisionDetails();
    }
  }, [isOpen, divisionId]);

  const fetchDivisionDetails = async () => {
    try {
      setIsLoading(true);
      const divisionData = await departmentService.getDepartment(divisionId);
      setDivision(divisionData);

      // Fetch ministry details
      if (divisionData.ministry) {
        const ministryData = await ministryService.getMinistry(divisionData.ministry);
        setMinistry(ministryData);
      }

      // Fetch head details
      if (divisionData.head_of_department) {
        const userData = await userService.getUser(divisionData.head_of_department);
        setHead(userData);
      }
    } catch (error) {
      toast.error("Failed to load division details");
      console.error("Error fetching division details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Division Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : division ? (
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-base font-medium">{division.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sub Vote</label>
                  <p className="text-base font-medium">{division.code}</p>
                </div>
              </div>
              {division.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-base">{division.description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="text-base">
                  {division.is_active ? (
                    <span className="text-green-600 dark:text-green-400">Active</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">Inactive</span>
                  )}
                </p>
              </div>
            </div>

            {/* Ministry Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Ministry
              </h3>
              {ministry ? (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-base font-medium">{ministry.name}</p>
                  <p className="text-sm text-muted-foreground">{ministry.code}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No ministry assigned</p>
              )}
            </div>

            {/* Head Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Head of Division
              </h3>
              {head ? (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-base font-medium">
                    {head.first_name} {head.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{head.email}</p>
                  <p className="text-sm text-muted-foreground">{head.username}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No head assigned</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">Division not found</p>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
