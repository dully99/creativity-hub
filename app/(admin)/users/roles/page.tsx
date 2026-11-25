"use client";

import PageHeading from "@/components/headers/page-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguageStore } from "@/store/useLanguageStore";

const translations = {
  en: {
    title: "Roles",
    description: "Role-based access control placeholder",
    cardTitle: "Roles & permissions",
    cardDescription: "Wire up your auth provider and define roles here.",
  },
  sw: {
    title: "Majukumu",
    description: "Mahali pa udhibiti wa ufikiaji kulingana na majukumu",
    cardTitle: "Majukumu na ruhusa",
    cardDescription: "unganisha mtoa huduma wa uthibitishaji na ufafanue majukumu hapa.",
  },
};

export default function RolesPage() {
  const language = useLanguageStore((state) => state.language);
  const t = translations[language];

  return (
    <div className="space-y-6">
      <PageHeading title={t.title} description={t.description} />
      <Card>
        <CardHeader>
          <CardTitle>{t.cardTitle}</CardTitle>
          <CardDescription>{t.cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm">
            <li>Admin — full access</li>
            <li>Editor — create and update content</li>
            <li>Viewer — read-only access</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
