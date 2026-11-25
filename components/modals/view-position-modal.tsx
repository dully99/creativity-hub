"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Position } from "@/components/tables/columns/positions-tanstack-columns";
import { positionService } from "@/lib/api/position.service";
import { Loader2 } from "lucide-react";

interface ViewPositionModalProps {
  position: Position | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewPositionModal({ position, isOpen, onClose }: ViewPositionModalProps) {
  const [detail, setDetail] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !position) {
      setDetail(null);
      setError(null);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await positionService.getPosition(position.id);
        setDetail(data);
      } catch (err) {
        setError("Failed to load position details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, position?.id]);

  const data = detail || position;
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Position Details</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive py-4">{error}</p>
        ) : (
          <div className="space-y-3 py-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Name</p>
              <p className="text-sm font-medium">{data.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Description</p>
              <p className="text-sm">{data.description || "—"}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
