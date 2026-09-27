export type LicenseRule = {
  label: string;
  description: string;
  features: string[];
  highlight?: boolean;
};

export const LICENSE_RULES: Record<string, LicenseRule> = {
  leasing: {
    label: "Leasing License",
    description:
      "Non-exclusive license for independent releases and small projects",
    features: [
      "Untagged MP3 & WAV files",
      "Up to 10,000 audio streams",
      "Up to 1,000 distribution copies",
      "Delivered by email",
      "Beat remains available to others",
    ],
  },

  exclusive: {
    label: "Exclusive License",
    description:
      "Full exclusive rights for serious releases and commercial use",
    features: [
      "Untagged MP3 & WAV files",
      "WAV track stems included",
      "Unlimited streams & distribution",
      "Beat removed from store",
      "50/50 split publishing rights",
    ],
    highlight: true,
  },
};
