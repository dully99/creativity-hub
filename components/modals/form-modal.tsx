"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "select" | "textarea" | "date";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: FormField[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

function getModalWidth(fieldCount: number) {
  if (fieldCount >= 5) return "sm:max-w-[680px]";
  return "sm:max-w-[480px]";
}

function usesTwoColumns(fieldCount: number) {
  return fieldCount >= 5;
}

function isFullWidth(field: FormField) {
  return field.type === "textarea";
}

export function FormModal({
  isOpen,
  onClose,
  title,
  description,
  fields,
  initialData,
  onSubmit,
  submitLabel = "Save",
  isSubmitting = false,
}: FormModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, any> = {};
    
    fields.forEach((field) => {
      data[field.name] = formData.get(field.name);
    });
    
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${getModalWidth(fields.length)} max-h-[90vh] flex flex-col`}>
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          {description && <DialogDescription className="text-sm text-muted-foreground">{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className={`py-2 overflow-y-auto flex-1 pr-1 ${usesTwoColumns(fields.length) ? "grid grid-cols-2 gap-x-4 gap-y-3" : "space-y-3"}`}>
            {fields.map((field) => (
              <div key={field.name} className={`space-y-1.5 ${usesTwoColumns(fields.length) && isFullWidth(field) ? "col-span-2" : ""}`}>
                <label htmlFor={field.name} className="text-sm font-medium leading-none">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    placeholder={field.placeholder}
                    defaultValue={initialData?.[field.name] || ""}
                    required={field.required}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                ) : field.type === "date" ? (
                  <div className="relative">
                    <input
                      id={field.name}
                      name={field.name}
                      type="date"
                      defaultValue={initialData?.[field.name] || ""}
                      required={field.required}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                  </div>
                ) : field.type === "select" ? (
                  <SearchableSelect
                    name={field.name}
                    defaultValue={initialData?.[field.name] != null ? String(initialData[field.name]) : ""}
                    options={field.options ?? []}
                    placeholder={field.placeholder || `Select ${field.label}`}
                    required={field.required}
                  />
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    defaultValue={initialData?.[field.name] || ""}
                    required={field.required}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-9">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-9 bg-black hover:bg-black/90 text-white">
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
