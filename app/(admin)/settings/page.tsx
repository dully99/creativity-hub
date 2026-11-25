"use client";

import PageHeading from "@/components/headers/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUserStore } from "@/store/user-store";
import { useLanguageStore } from "@/store/useLanguageStore";
import { toast } from "sonner";

const translations = {
  en: {
    title: "Settings",
    description: "Manage your profile and preferences",
    profile: "Profile",
    profileDescription: "Update your account details",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    notifications: "Notifications",
    notificationsDescription: "Configure how you receive updates",
    emailNotifications: "Email notifications",
    save: "Save changes",
    saved: "Settings saved (placeholder)",
  },
  sw: {
    title: "Mipangilio",
    description: "Simamia wasifu na mapendeleo yako",
    profile: "Wasifu",
    profileDescription: "Sasisha maelezo ya akaunti yako",
    firstName: "Jina la kwanza",
    lastName: "Jina la mwisho",
    email: "Barua pepe",
    notifications: "Arifa",
    notificationsDescription: "Sanidi jinsi unavyopokea masasisho",
    emailNotifications: "Arifa za barua pepe",
    save: "Hifadhi mabadiliko",
    saved: "Mipangilio imehifadhiwa (mahali pa kuweka)",
  },
};

export default function SettingsPage() {
  const language = useLanguageStore((state) => state.language);
  const { user } = useUserStore();
  const t = translations[language];

  const handleSave = () => {
    toast.success(t.saved);
  };

  return (
    <div className="space-y-6">
      <PageHeading title={t.title} description={t.description} />

      <Card>
        <CardHeader>
          <CardTitle>{t.profile}</CardTitle>
          <CardDescription>{t.profileDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t.firstName}</Label>
              <Input id="firstName" defaultValue={user?.first_name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t.lastName}</Label>
              <Input id="lastName" defaultValue={user?.last_name} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input id="email" type="email" defaultValue={user?.email} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.notifications}</CardTitle>
          <CardDescription>{t.notificationsDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label htmlFor="email-notifications">{t.emailNotifications}</Label>
          <Switch id="email-notifications" defaultChecked />
        </CardContent>
      </Card>

      <Button onClick={handleSave}>{t.save}</Button>
    </div>
  );
}
