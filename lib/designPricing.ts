export interface ServiceOption {
  label: string;
  price: number;
}

export interface MainService {
  id: string;
  title: string;
  options: ServiceOption[];
}

export const DESIGN_SERVICES_CATALOG: MainService[] = [
  {
    id: "logo-design",
    title: "Logo Design",
    options: [
      { label: "Black & White", price: 50 },
      { label: "Colour", price: 60 },
    ],
  },
  {
    id: "2d-character",
    title: "2D Character / Mascot",
    options: [
      { label: "Line Art", price: 45 },
      { label: "Black & White", price: 50 },
      { label: "Colour", price: 60 },
      { label: "With Effects", price: 90 },
      { label: "Colour + Background", price: 100 },
      { label: "Extra Character (+£30)", price: 30 },
    ],
  },
  {
    id: "leaflets-flyers",
    title: "Leaflets / Flyers (Up to A4)",
    options: [
      { label: "1 Side", price: 50 },
      { label: "2 Sides", price: 60 },
    ],
  },
  {
    id: "posters",
    title: "Posters",
    options: [
      { label: "A4 Size", price: 50 },
      { label: "A3 Size", price: 60 },
      { label: "A2 Size", price: 70 },
    ],
  },
  {
    id: "brochures-menus",
    title: "Brochures / Menus",
    options: [
      { label: "2 Sides", price: 60 },
      { label: "4 Sides", price: 80 },
      { label: "Extra Sides (+£10 each)", price: 10 },
    ],
  },
  {
    id: "music-cover",
    title: "Music Cover Design",
    options: [
      { label: "Simple Cover", price: 50 },
      { label: "Advanced Cover", price: 80 },
      { label: "Back Cover Add-on", price: 20 },
      { label: "Social Media Pack Add-on", price: 10 },
    ],
  },
  {
    id: "banner-design",
    title: "Banner Design",
    options: [{ label: "Standard Banner", price: 60 }],
  },
  {
    id: "custom-font",
    title: "Custom Font / Symbol",
    options: [{ label: "Custom Font / Symbol", price: 60 }],
  },
  {
    id: "pattern-design",
    title: "Pattern Design",
    options: [{ label: "Standard Pattern Design", price: 60 }],
  },
  {
    id: "business-card",
    title: "Business Card",
    options: [
      { label: "1 Side", price: 55 },
      { label: "2 Sides", price: 60 },
    ],
  },
  {
    id: "advert-photos",
    title: "Advert Photos",
    options: [{ label: "Advert Image", price: 40 }],
  },
  {
    id: "social-media",
    title: "Social Media Content",
    options: [{ label: "Up to 5 mins video", price: 60 }],
  },
  {
    id: "gif-design",
    title: "GIF Design",
    options: [{ label: "Custom Animated GIF", price: 60 }],
  },
  {
    id: "lyric-video",
    title: "Lyric Video",
    options: [{ label: "Lyric Video", price: 80 }],
  },
  {
    id: "photo-editing",
    title: "Photo Editing",
    options: [{ label: "Retouch Only", price: 30 }],
  },
  {
    id: "mockup-design",
    title: "Mockup Design",
    options: [{ label: "2D Mockup Design", price: 50 }],
  },
  {
    id: "packaging-design",
    title: "Packaging Design",
    options: [{ label: "Custom Packaging Design", price: 50 }],
  },
];

export type DesignSelection = {
  serviceId: string;
  optionIndex: number;
  photoCount: number;
  advertPhotoCount: number;
  photoAddOns: {
    colourTone: boolean;
    singleColour: boolean;
    customEditing: boolean;
  };
  extraRevisions: boolean;
};

export function priceDesignSelection(selection: DesignSelection) {
  const service = DESIGN_SERVICES_CATALOG.find(
    (entry) => entry.id === selection.serviceId
  );
  if (!service || !Number.isInteger(selection.optionIndex) ||
      selection.optionIndex < 0 || selection.optionIndex >= service.options.length) {
    throw new Error("Unknown design service or option");
  }
  if (![selection.photoCount, selection.advertPhotoCount].every(
    (count) => Number.isInteger(count) && count >= 1 && count <= 20
  )) {
    throw new Error("Invalid number of images");
  }

  const option = service.options[selection.optionIndex];
  const addOns = selection.photoAddOns;
  const addOnCount = Number(addOns.colourTone) + Number(addOns.singleColour) +
    Number(addOns.customEditing);
  let basePounds = option.price;
  let description = `${service.title} - ${option.label}`;

  if (service.id === "photo-editing") {
    const addOnRate = Number(addOns.colourTone) * 10 +
      Number(addOns.singleColour) * 10 + Number(addOns.customEditing) * 20;
    basePounds = 30 + (selection.photoCount - 1) * 5 +
      addOnRate * selection.photoCount;
    description = `${service.title} - ${selection.photoCount} photo(s)`;
  } else if (service.id === "advert-photos") {
    basePounds = 40 * selection.advertPhotoCount;
    description = `${service.title} - ${selection.advertPhotoCount} image(s)`;
  }

  const totalPence = (basePounds + Number(selection.extraRevisions) * 10) * 100;
  // These need an agreed quote before payment, even where a guide price is shown.
  const requiresQuote = selection.extraRevisions || addOnCount > 0 ||
    /extra|add-on|custom/i.test(option.label) ||
    ["custom-font", "gif-design", "packaging-design"].includes(service.id) ||
    (service.id === "photo-editing" && selection.photoCount > 1) ||
    (service.id === "advert-photos" && selection.advertPhotoCount > 1);

  return { service, option, description, totalPence, requiresQuote };
}
