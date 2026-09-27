export type LicenseType = "lease" | "exclusive";

export interface LicenseConfig {
  id: LicenseType;
  name: string;
  templateUrl: string;
  defaultPrice: number;
  streamLimit: string;
  publishingSplit: {
    buyer: number;
    producer: number;
  };
}

export const LICENSE_CONFIGS: Record<LicenseType, LicenseConfig> = {
  lease: {
    id: "lease",
    name: "MP3/WAV Lease",
    templateUrl: "https://res.cloudinary.com/dcrkpsnn9/raw/upload/v1785681878/RAF_Lease_26_jmadfr.docx",
    defaultPrice: 60,
    streamLimit: "10,000 Monetized Streams",
    publishingSplit: {
      buyer: 0,
      producer: 100,
    },
  },
  exclusive: {
    id: "exclusive",
    name: "Exclusive Rights",
    templateUrl: "https://res.cloudinary.com/dcrkpsnn9/raw/upload/v1785681878/RAF_Exclu_26_jeufuz.docx",
    defaultPrice: 500,
    streamLimit: "Unlimited",
    publishingSplit: {
      buyer: 50,
      producer: 50,
    },
  },
};