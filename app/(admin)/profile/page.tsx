"use client";

import { useState, useEffect } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguageStore } from "@/store/useLanguageStore";
import { authService } from "@/lib/api/auth.service";
import { toast } from "sonner";
import { Mail, Phone, Calendar, Briefcase, MapPin, User as UserIcon, Shield } from "lucide-react";

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_verified: boolean;
  profile_picture?: string;
  phone_number?: string;
  gender?: "M" | "F" | "O";
  national_id_number?: string;
  date_of_birth?: string;
  nationality?: string;
  job_title?: string;
  ministry?: number;
  department?: number;
  unit?: number;
  roles?: string[];
  permissions?: string[];
}

const translations = {
  en: {
    title: "My Profile",
    description: "View and manage your profile information",
    personalInfo: "Personal Information",
    contactInfo: "Contact Information",
    workInfo: "Work Information",
    accountInfo: "Account Information",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone Number",
    gender: "Gender",
    nationalId: "National ID",
    dateOfBirth: "Date of Birth",
    nationality: "Nationality",
    jobTitle: "Job Title",
    ministry: "Ministry",
    department: "Department",
    unit: "Unit",
    roles: "Roles",
    permissions: "Permissions",
    verified: "Verified",
    staff: "Staff Member",
    male: "Male",
    female: "Female",
    other: "Other",
  },
  sw: {
    title: "Wasifu Wangu",
    description: "Tazama na simamia taarifa za wasifu wako",
    personalInfo: "Taarifa Binafsi",
    contactInfo: "Taarifa za Mawasiliano",
    workInfo: "Taarifa za Kazi",
    accountInfo: "Taarifa za Akaunti",
    firstName: "Jina la Kwanza",
    lastName: "Jina la Mwisho",
    email: "Barua Pepe",
    phone: "Nambari ya Simu",
    gender: "Jinsia",
    nationalId: "Nambari ya Kitambulisho",
    dateOfBirth: "Tarehe ya Kuzaliwa",
    nationality: "Uraia",
    jobTitle: "Cheo cha Kazi",
    ministry: "Wizara",
    department: "Idara",
    unit: "Kitengo",
    roles: "Majukumu",
    permissions: "Ruhusa",
    verified: "Imethibitishwa",
    staff: "Mfanyakazi",
    male: "Mwanaume",
    female: "Mwanamke",
    other: "Nyingine",
  },
};

export default function ProfilePage() {
  const language = useLanguageStore((state) => state.language);
  const t = translations[language];

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await authService.getCurrentUser();
      setProfile(data as unknown as UserProfile);
    } catch (error) {
      toast.error("Failed to load profile");
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getGenderLabel = (gender?: string) => {
    if (gender === "M") return t.male;
    if (gender === "F") return t.female;
    if (gender === "O") return t.other;
    return "-";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeading title={t.title} description={t.description} />
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Failed to load profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading title={t.title} description={t.description} />

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.profile_picture} alt={`${profile.first_name} ${profile.last_name}`} />
              <AvatarFallback className="text-2xl">
                {getInitials(profile.first_name, profile.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{`${profile.first_name} ${profile.last_name}`}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex gap-2 mt-2">
                {profile.is_verified && (
                  <Badge variant="default" className="gap-1">
                    <Shield className="h-3 w-3" />
                    {t.verified}
                  </Badge>
                )}
                {profile.is_staff && (
                  <Badge variant="secondary" className="gap-1">
                    <Briefcase className="h-3 w-3" />
                    {t.staff}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t.personalInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t.firstName}</p>
                <p className="text-base">{profile.first_name || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t.lastName}</p>
                <p className="text-base">{profile.last_name || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t.gender}</p>
                <p className="text-base">{getGenderLabel(profile.gender)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t.dateOfBirth}</p>
                <p className="text-base">{formatDate(profile.date_of_birth)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t.nationality}</p>
                <p className="text-base">{profile.nationality || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t.nationalId}</p>
                <p className="text-base">{profile.national_id_number || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t.contactInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t.email}</p>
                <p className="text-base">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t.phone}</p>
                <p className="text-base">{profile.phone_number || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t.workInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t.jobTitle}</p>
                <p className="text-base">{profile.job_title || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t.ministry}</p>
                <p className="text-base">{profile.ministry || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t.department}</p>
                <p className="text-base">{profile.department || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t.unit}</p>
                <p className="text-base">{profile.unit || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t.accountInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t.roles}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.roles && profile.roles.length > 0 ? (
                    profile.roles.map((role) => (
                      <Badge key={role} variant="outline">{role}</Badge>
                    ))
                  ) : (
                    <p className="text-base">-</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t.permissions}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.permissions && profile.permissions.length > 0 ? (
                    profile.permissions.map((permission) => (
                      <Badge key={permission} variant="outline">{permission}</Badge>
                    ))
                  ) : (
                    <p className="text-base">-</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
