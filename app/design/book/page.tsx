"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import BackgroundLayer from "@/components/layout/BackgroundLayer";

interface ServiceOption {
  label: string;
  price: number;
}

interface MainService {
  id: string;
  title: string;
  options: ServiceOption[];
}

const DESIGN_SERVICES_CATALOG: MainService[] = [
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

export default function DesignBookingFormPage() {
  const [selectedServiceId, setSelectedServiceId] =
    useState<string>("logo-design");

  const [selectedOptionIndex, setSelectedOptionIndex] =
    useState<number>(0);

  const [photoCount, setPhotoCount] = useState<number>(1);
  const [advertPhotoCount, setAdvertPhotoCount] = useState<number>(1);

  const [photoAddOns, setPhotoAddOns] = useState({
    colourTone: false,
    singleColour: false,
    customEditing: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyBrand: "",
    projectTitle: "",
    projectDetails: "",
    deadlineDate: "",
    extraRevisions: false,
    paymentOption: "full" as "full" | "deposit",
    referenceFiles: [] as File[],
    mailchimp: false,
  });

  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const activeService =
    DESIGN_SERVICES_CATALOG.find(
      (service) => service.id === selectedServiceId
    ) || DESIGN_SERVICES_CATALOG[0];

  const activeOption =
    activeService.options[selectedOptionIndex] ||
    activeService.options[0];

  const photoEditingBasePrice =
    30 + Math.max(photoCount - 1, 0) * 5;

  const photoEditingAddOnRate =
    (photoAddOns.colourTone ? 10 : 0) +
    (photoAddOns.singleColour ? 10 : 0) +
    (photoAddOns.customEditing ? 20 : 0);

  const photoEditingAddOnTotal =
    photoEditingAddOnRate * photoCount;

  const photoEditingTotal =
    photoEditingBasePrice + photoEditingAddOnTotal;

  const advertPhotosTotal = 40 * advertPhotoCount;

  const basePrice =
    activeService.id === "photo-editing"
      ? photoEditingTotal
      : activeService.id === "advert-photos"
      ? advertPhotosTotal
      : activeOption.price;

  const revisionFee = formData.extraRevisions ? 10 : 0;

  const totalPrice = basePrice + revisionFee;

  const dueNow =
    formData.paymentOption === "deposit"
      ? totalPrice * 0.5
      : totalPrice;

  const handleMainServiceChange = (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedServiceId(e.target.value);
    setSelectedOptionIndex(0);

    setPhotoCount(1);
    setAdvertPhotoCount(1);

    setPhotoAddOns({
      colourTone: false,
      singleColour: false,
      customEditing: false,
    });
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        referenceFiles: Array.from(e.target.files || []),
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg("");

    try {
      const payload = new FormData();

      let serviceDescription =
        `${activeService.title} - ${activeOption.label}`;

      if (activeService.id === "advert-photos") {
        serviceDescription =
          `${activeService.title} - ${advertPhotoCount} image(s)`;
      }

      if (activeService.id === "photo-editing") {
        const selectedAddOns: string[] = [];

        if (photoAddOns.colourTone) {
          selectedAddOns.push(
            "Filter / Hue / Tone / Vibrance"
          );
        }

        if (photoAddOns.singleColour) {
          selectedAddOns.push("Single Colour Edit");
        }

        if (photoAddOns.customEditing) {
          selectedAddOns.push("Custom Editing");
        }

        serviceDescription =
          `${activeService.title} - ` +
          `${photoCount} photo(s) - ` +
          `Retouch Included` +
          `${
            selectedAddOns.length > 0
              ? ` - Add-ons: ${selectedAddOns.join(", ")}`
              : ""
          }`;
      }

      payload.append("category", "design");
      payload.append("name", formData.name);
      payload.append("email", formData.email);

      payload.append(
        "companyBrand",
        formData.companyBrand || "N/A"
      );

      payload.append("service", serviceDescription);
      payload.append("title", formData.projectTitle);
      payload.append("details", formData.projectDetails);
      payload.append("deadline", formData.deadlineDate);

      payload.append(
        "extraRevisions",
        formData.extraRevisions ? "true" : "false"
      );

      payload.append(
        "paymentOption",
        formData.paymentOption
      );

      payload.append(
        "totalPrice",
        totalPrice.toString()
      );

      payload.append(
        "dueNow",
        dueNow.toString()
      );

      payload.append(
        "mailchimp",
        formData.mailchimp ? "true" : "false"
      );

      formData.referenceFiles.forEach((file) => {
        payload.append("images", file);
      });

      const res = await fetch("/api/design/enquiry", {
        method: "POST",
        body: payload,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.error || "Submission failed"
        );
      }

      setFormSubmitted(true);
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          "Failed to submit booking inquiry."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @font-face {
          font-family: "RAF Font Demo";
          src: url("/fonts/RafFontDemo-Regular.otf") format("opentype");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        .raf-heading {
          font-family: "RAF Font Demo", sans-serif;
        }

        .section-title-panel {
          background-color: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
        }
      `}</style>

      {/* HEADER OUTSIDE BACKGROUND LAYOUT CONSTRAINT */}
      <div className="relative z-30 pt-24">
        <header className="section-title-panel relative left-1/2 w-screen max-w-none -translate-x-1/2 border-b-4 border-black">
          <div className="w-full px-6 py-10 text-center">
            <h1 className="raf-heading text-3xl md:text-5xl lg:text-6xl tracking-wide uppercase text-white">
              DESIGN SERVICE BOOKING
            </h1>
          </div>
        </header>
      </div>

      <BackgroundLayer>
        <main className="min-h-screen text-white relative w-full bg-transparent pb-20">
          {/* CENTERED FORM BLOCK - MATCHES BEATS BOOKING LAYOUT */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 pt-10">
          {formSubmitted ? (
            <div className="rounded-2xl border-4 border-black bg-black/85 backdrop-blur-md p-8 md:p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
              <span className="inline-block bg-blue-600 text-white rounded-full p-4 text-3xl font-bold">
                ✓
              </span>

              <h2 className="raf-heading text-2xl sm:text-4xl uppercase text-white">
                Request Received
              </h2>

              <p className="font-mono text-sm text-white max-w-lg mx-auto leading-6">
                Thank you for submitting your project request. A
                confirmation email has been dispatched to{" "}
                <strong className="text-white">
                  {formData.email}
                </strong>
                .
              </p>

              <button
                onClick={() => setFormSubmitted(false)}
                className="mt-2 rounded-lg border-2 border-black bg-blue-600 px-5 py-2.5 font-mono text-sm font-black text-black hover:bg-blue-500 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase"
              >
                SUBMIT ANOTHER REQUEST
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border-4 border-black bg-black/85 backdrop-blur-md p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-8"
            >
              {errorMsg && (
                <div className="p-4 bg-blue-950/80 border-2 border-blue-600 text-blue-100 text-sm font-mono rounded-lg">
                  ⚠️ Error: {errorMsg}
                </div>
              )}

              {/* SECTION 1: CONTACT DETAILS */}
              <div className="space-y-4">
                <h3 className="text-sm md:text-base font-mono font-black uppercase tracking-wider text-blue-500 border-b border-zinc-800 pb-2">
                  01. Contact Information
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-sm font-black uppercase text-white">
                      Name *
                    </label>

                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                      placeholder="Your Full Name"
                      className="w-full rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-mono text-sm font-black uppercase text-white">
                      Email *
                    </label>

                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                      placeholder="yourname@domain.com"
                      className="w-full rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-sm font-black uppercase text-white">
                    Company / Brand Name (If any)
                  </label>

                  <input
                    type="text"
                    value={formData.companyBrand}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyBrand: e.target.value,
                      })
                    }
                    placeholder="e.g. Studio, Brand, or Organization"
                    className="w-full rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* SECTION 2: SERVICE SELECTION */}
              <div className="space-y-4">
                <h3 className="text-sm md:text-base font-mono font-black uppercase tracking-wider text-blue-500 border-b border-zinc-800 pb-2">
                  02. Service Configuration
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-sm font-black uppercase text-white">
                      Select Design Service *
                    </label>

                    <select
                      value={selectedServiceId}
                      onChange={handleMainServiceChange}
                      className="w-full rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {DESIGN_SERVICES_CATALOG.map(
                        (service) => (
                          <option
                            key={service.id}
                            value={service.id}
                          >
                            {service.title}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-mono text-sm font-black uppercase text-white">
                      Select Option / Tier *
                    </label>

                    <select
                      value={selectedOptionIndex}
                      onChange={(e) =>
                        setSelectedOptionIndex(
                          Number(e.target.value)
                        )
                      }
                      className="w-full rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {activeService.options.map(
                        (option, idx) => (
                          <option key={idx} value={idx}>
                            {option.label} — £
                            {option.price} GBP
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {/* ADVERT PHOTO QUANTITY */}
                {activeService.id === "advert-photos" && (
                  <div className="rounded-lg border-2 border-zinc-800 bg-zinc-950/70 p-4 space-y-3">
                    <div>
                      <p className="font-mono text-sm font-black uppercase text-blue-400">
                        Advert Photo Quantity
                      </p>

                      <p className="font-mono text-sm text-zinc-300 mt-1 leading-6">
                        £40 per advert image. Each advert is
                        created to the style and direction in
                        your supplied brief. Retouching is
                        included.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-mono text-sm font-black uppercase text-white">
                        Number of Advert Images
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={advertPhotoCount}
                        onChange={(e) =>
                          setAdvertPhotoCount(
                            Math.max(
                              1,
                              Number(e.target.value)
                            )
                          )
                        }
                        className="w-28 rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* PHOTO EDITING CONFIGURATION */}
                {activeService.id === "photo-editing" && (
                  <div className="rounded-lg border-2 border-zinc-800 bg-zinc-950/70 p-4 space-y-4">
                    <div>
                      <p className="font-mono text-sm font-black uppercase text-blue-400">
                        Photo Editing Configuration
                      </p>

                      <p className="font-mono text-sm text-zinc-300 mt-1 leading-6">
                        Retouching costs £30 for the first
                        photo and £5 for each additional photo.
                        Optional editing add-ons are charged per
                        photo.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-mono text-sm font-black uppercase text-white">
                        Number of Photos
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={photoCount}
                        onChange={(e) =>
                          setPhotoCount(
                            Math.max(
                              1,
                              Number(e.target.value)
                            )
                          )
                        }
                        className="w-28 rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <p className="font-mono text-sm font-black uppercase text-zinc-300">
                        Optional Add-ons
                      </p>

                      <label className="flex items-start space-x-2.5 cursor-pointer font-mono text-sm text-zinc-300">
                        <input
                          type="checkbox"
                          checked={
                            photoAddOns.colourTone
                          }
                          onChange={(e) =>
                            setPhotoAddOns((prev) => ({
                              ...prev,
                              colourTone:
                                e.target.checked,
                            }))
                          }
                          className="accent-blue-500 w-4 h-4 rounded mt-0.5"
                        />

                        <span>
                          Filter / Hue / Tone / Vibrance
                          Edit — +£10 per photo
                        </span>
                      </label>

                      <label className="flex items-start space-x-2.5 cursor-pointer font-mono text-sm text-zinc-300">
                        <input
                          type="checkbox"
                          checked={
                            photoAddOns.singleColour
                          }
                          onChange={(e) =>
                            setPhotoAddOns((prev) => ({
                              ...prev,
                              singleColour:
                                e.target.checked,
                            }))
                          }
                          className="accent-blue-500 w-4 h-4 rounded mt-0.5"
                        />

                        <span>
                          Single Colour Edit — +£10 per
                          photo
                        </span>
                      </label>

                      <label className="flex items-start space-x-2.5 cursor-pointer font-mono text-sm text-zinc-300">
                        <input
                          type="checkbox"
                          checked={
                            photoAddOns.customEditing
                          }
                          onChange={(e) =>
                            setPhotoAddOns((prev) => ({
                              ...prev,
                              customEditing:
                                e.target.checked,
                            }))
                          }
                          className="accent-blue-500 w-4 h-4 rounded mt-0.5"
                        />

                        <span>
                          Custom Editing — +£20 per photo
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: PROJECT DETAILS */}
              <div className="space-y-4">
                <h3 className="text-sm md:text-base font-mono font-black uppercase tracking-wider text-blue-500 border-b border-zinc-800 pb-2">
                  03. Project Overview
                </h3>

                <div className="space-y-1.5">
                  <label className="block font-mono text-sm font-black uppercase text-white">
                    Project Title
                  </label>

                  <input
                    type="text"
                    value={formData.projectTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projectTitle: e.target.value,
                      })
                    }
                    placeholder="e.g. Summer Single Cover Art"
                    className="w-full rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-sm font-black uppercase text-white">
                    Project Details *
                  </label>

                  <textarea
                    rows={3}
                    required
                    value={formData.projectDetails}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projectDetails: e.target.value,
                      })
                    }
                    placeholder="Detail your vision, color palette, dimensions, required text, and general requirements..."
                    className="w-full rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* SECTION 4: DEADLINE & REVISIONS */}
              <div className="space-y-4">
                <h3 className="text-sm md:text-base font-mono font-black uppercase tracking-wider text-blue-500 border-b border-zinc-800 pb-2">
                  04. Schedule & Revisions
                </h3>

                <div className="space-y-1.5">
                  <label className="block font-mono text-sm font-black uppercase text-white">
                    Project Deadline *
                  </label>

                  <input
                    type="date"
                    required
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    value={formData.deadlineDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deadlineDate: e.target.value,
                      })
                    }
                    className="rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-1 space-y-1">
                  <label className="flex items-center space-x-2.5 cursor-pointer font-mono text-sm text-zinc-300 font-bold">
                    <input
                      type="checkbox"
                      checked={
                        formData.extraRevisions
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          extraRevisions:
                            e.target.checked,
                        })
                      }
                      className="accent-blue-500 w-4 h-4 rounded"
                    />

                    <span>Extra Revisions</span>
                  </label>

                  <p className="font-mono text-sm text-zinc-300 pl-6 leading-6">
                    £10 per extra revision
                  </p>
                </div>
              </div>

              {/* SECTION 5: REFERENCE ASSETS */}
              <div className="space-y-4">
                <h3 className="text-sm md:text-base font-mono font-black uppercase tracking-wider text-blue-500 border-b border-zinc-800 pb-2">
                  05. Reference Files / Attachments
                </h3>

                <div className="space-y-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="block w-full font-mono text-sm text-zinc-300 file:mr-3 file:py-2.5 file:px-4 file:rounded-md file:border-2 file:border-black file:text-sm file:font-mono file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                  />

                  {formData.referenceFiles.length >
                    0 && (
                    <p className="font-mono text-sm text-blue-400 mt-1">
                      ✓{" "}
                      {
                        formData.referenceFiles
                          .length
                      }{" "}
                      file(s) attached
                    </p>
                  )}
                </div>
              </div>

              {/* SECTION 6: PRICING & PAYMENT */}
              <div className="space-y-3 bg-zinc-950/60 p-4 rounded-xl border-2 border-black">
                <h3 className="text-sm md:text-base font-mono font-black uppercase tracking-wider text-blue-500 border-b border-zinc-800 pb-2">
                  06. Pricing Breakdown
                </h3>

                <div className="font-mono text-sm space-y-1.5 text-zinc-300">
                  {activeService.id ===
                  "photo-editing" ? (
                    <>
                      <div className="flex justify-between">
                        <span>
                          Retouch — First Photo:
                        </span>
                        <span className="font-bold text-white">
                          £30 GBP
                        </span>
                      </div>

                      {photoCount > 1 && (
                        <div className="flex justify-between">
                          <span>
                            Additional Photos (
                            {photoCount - 1} × £5):
                          </span>

                          <span className="font-bold text-white">
                            £
                            {(photoCount - 1) * 5}{" "}
                            GBP
                          </span>
                        </div>
                      )}

                      {photoAddOns.colourTone && (
                        <div className="flex justify-between text-blue-400">
                          <span>
                            Filter / Hue / Tone /
                            Vibrance ({photoCount} ×
                            £10):
                          </span>

                          <span className="font-bold">
                            +£{photoCount * 10} GBP
                          </span>
                        </div>
                      )}

                      {photoAddOns.singleColour && (
                        <div className="flex justify-between text-blue-400">
                          <span>
                            Single Colour Edit (
                            {photoCount} × £10):
                          </span>

                          <span className="font-bold">
                            +£{photoCount * 10} GBP
                          </span>
                        </div>
                      )}

                      {photoAddOns.customEditing && (
                        <div className="flex justify-between text-blue-400">
                          <span>
                            Custom Editing (
                            {photoCount} × £20):
                          </span>

                          <span className="font-bold">
                            +£{photoCount * 20} GBP
                          </span>
                        </div>
                      )}
                    </>
                  ) : activeService.id ===
                    "advert-photos" ? (
                    <div className="flex justify-between">
                      <span>
                        Advert Photos (
                        {advertPhotoCount} × £40):
                      </span>

                      <span className="font-bold text-white">
                        £{advertPhotosTotal} GBP
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span>
                        Selected Service (
                        {activeService.title} -{" "}
                        {activeOption.label}):
                      </span>

                      <span className="font-bold text-white">
                        £{basePrice} GBP
                      </span>
                    </div>
                  )}

                  {formData.extraRevisions && (
                    <div className="flex justify-between text-blue-400">
                      <span>
                        Extra Revision Option:
                      </span>

                      <span className="font-bold">
                        +£10 GBP
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-zinc-800 pt-2 text-sm font-bold text-white">
                    <span>Total Project Cost:</span>

                    <span>
                      £{totalPrice} GBP
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-1 font-mono text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentOption"
                      value="full"
                      checked={
                        formData.paymentOption ===
                        "full"
                      }
                      onChange={() =>
                        setFormData({
                          ...formData,
                          paymentOption: "full",
                        })
                      }
                      className="accent-blue-500"
                    />

                    <span>
                      Pay Full Amount (£
                      {totalPrice})
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentOption"
                      value="deposit"
                      checked={
                        formData.paymentOption ===
                        "deposit"
                      }
                      onChange={() =>
                        setFormData({
                          ...formData,
                          paymentOption:
                            "deposit",
                        })
                      }
                      className="accent-blue-500"
                    />

                    <span>
                      Pay 50% Deposit (£
                      {totalPrice * 0.5})
                    </span>
                  </label>
                </div>

                <div className="pt-1 text-sm font-mono font-black uppercase text-blue-400">
                  Amount Due Now: £{dueNow} GBP
                </div>
              </div>

              {/* MAILCHIMP CHECKBOX */}
              <div className="flex items-center space-x-2.5">
                <input
                  type="checkbox"
                  id="mailchimp"
                  checked={formData.mailchimp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mailchimp:
                        e.target.checked,
                    })
                  }
                  className="accent-blue-500 w-4 h-4 rounded"
                />

                <label
                  htmlFor="mailchimp"
                  className="font-mono text-sm text-zinc-300 cursor-pointer"
                >
                  Subscribe to newsletter for updates
                  and design offers
                </label>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg border-2 border-black bg-blue-600 px-6 py-4 text-center font-mono text-sm font-black text-black hover:bg-blue-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition active:translate-y-0.5 disabled:opacity-50 uppercase tracking-widest"
              >
                {loading
                  ? "SUBMITTING REQUEST..."
                  : `SUBMIT FORM (£${dueNow})`}
              </button>
            </form>
          )}
          </div>
        </main>
      </BackgroundLayer>
    </>
  );
}