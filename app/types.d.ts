// Existing loose module declarations
declare module "../../components/BeatCard";
declare module "../../components/BeatPlayer";
declare module "../../components/LicenseCard";
declare module "../../lib/prisma";

// ===============================
// SHARED APP TYPES
// ===============================

export type LicenseType = "lease" | "exclusive";

export type ServiceType = "full-production" | "custom";

export type UserAccount = {
  id: string;
  email: string;
  createdAt: Date;

  freeDownloadsUsed: number;

  purchases: {
    beatId?: string;
    license?: LicenseType;
    serviceType?: ServiceType;
    createdAt: Date;
  }[];
};
