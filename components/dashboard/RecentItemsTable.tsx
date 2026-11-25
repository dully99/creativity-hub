"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RecentItem } from "@/lib/mock/dashboard";
import { useLanguageStore } from "@/store/useLanguageStore";
import { formatDistanceToNow } from "date-fns";

const translations = {
  en: {
    title: "Recent Items",
    name: "Name",
    owner: "Owner",
    category: "Category",
    status: "Status",
    updated: "Updated",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  },
  sw: {
    title: "Vitu vya Hivi Karibuni",
    name: "Jina",
    owner: "Mmiliki",
    category: "Kategoria",
    status: "Hali",
    updated: "Imesasishwa",
    pending: "Inasubiri",
    approved: "Imeidhinishwa",
    rejected: "Imekataliwa",
  },
};

interface RecentItemsTableProps {
  items: RecentItem[];
}

const statusVariant = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
} as const;

export function RecentItemsTable({ items }: RecentItemsTableProps) {
  const language = useLanguageStore((state) => state.language);
  const t = translations[language];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.name}</TableHead>
              <TableHead>{t.owner}</TableHead>
              <TableHead>{t.category}</TableHead>
              <TableHead>{t.status}</TableHead>
              <TableHead className="text-right">{t.updated}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.owner}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[item.status]}>{t[item.status]}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-right text-sm">
                  {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
