"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Activity } from "@/components/tables/columns/activities-tanstack-columns";
import { activityService } from "@/lib/api/activity.service";
import { Loader2 } from "lucide-react";

interface ViewActivityModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewActivityModal({ activity, isOpen, onClose }: ViewActivityModalProps) {
  const [detail, setDetail] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !activity) {
      setDetail(null);
      setError(null);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await activityService.getActivity(activity.id);
        setDetail(data);
      } catch (err) {
        setError("Failed to load activity details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, activity?.id]);

  const data = detail || activity;
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Activity Details</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive py-4">{error}</p>
        ) : (
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Name</p>
                <p className="text-sm font-medium">{data.name}</p>
              </div>
              {data.code && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Code</p>
                  <p className="text-sm font-medium">{data.code}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Target</p>
              <p className="text-sm font-medium">{data.target_name || data.target}</p>
            </div>
            {data.section_name ? (
              <div>
                <p className="text-xs text-muted-foreground uppercase">Section</p>
                <p className="text-sm font-medium">{data.section_name}</p>
              </div>
            ) : null}
            {data.description && (
              <div>
                <p className="text-xs text-muted-foreground uppercase">Description</p>
                <p className="text-sm">{data.description}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground uppercase">Financial Year</p>
              <p className="text-sm font-medium">{data.financial_year_name || data.financial_year}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
