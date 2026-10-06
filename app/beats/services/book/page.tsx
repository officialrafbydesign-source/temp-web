"use client";

import { useState, FormEvent, ChangeEvent } from "react";

interface ProductionBookingFormData {
  // Contact
  name: string;
  email: string;
  companyBrand: string;

  // Service Selection
  lookingFor: string;

  // Common Details
  projectType: string;
  musicTypes: string[];
  projectDescription: string;

  // References & Deadline
  referenceLinks: string;
  referenceFile: File | null;
  deadlineDate: string;

  // Conditional: Recording + Mixdown
  recordingHours: string;
  recordingCalendarDate: string;

  // Conditional: Track Mixdown/Edit
  editTypes: string[];
  editDetails: string;
  inStudio: "yes" | "no";
  studioSessionDate: string;

  // Conditional: Other Audio Service
  otherAudioServiceType: string;
}

const LOOKING_FOR_OPTIONS = [
  "Custom Made Beat",
  "Recording + Mixdown",
  "Track Mixdown/Edit",
  "Other Audio Service",
  "Full Production Deal",
];

const PROJECT_TYPE_OPTIONS = [
  "Artist Project",
  "Film/TV",
  "Video Game",
  "Commercial Advert",
  "Youtube Content/Podcast",
  "Other (please specify)",
];

const MUSIC_GENRE_OPTIONS = [
  "Hip Hop",
  "Grime",
  "Trap",
  "Alternative",
  "Cinematic/Mood Based",
];

const EDIT_TYPE_OPTIONS = [
  "None / General Mix/Edit",
  "Beat",
  "Automation",
  "Extra Vocals FX",
  "Other",
];

const OTHER_AUDIO_SERVICES = [
  { id: "audio-clean", label: "Audio Clean [External Service]", disabled: false },
  { id: "voiceovers", label: "Voiceovers", disabled: false },
  { id: "audiobook", label: "Audiobook", disabled: false },
  { id: "sound-fx", label: "Sound FX / Sound Foley [External Service]", disabled: false },
  { id: "podcasting", label: "Podcasting [Service Coming Soon]", disabled: true },
];

export default function BeatsBookingFormPage() {
  const [formData, setFormData] = useState<ProductionBookingFormData>({
    name: "",
    email: "",
    companyBrand: "",
    lookingFor: "Custom Made Beat",
    projectType: "Artist Project",
    musicTypes: [],
    projectDescription: "",
    referenceLinks: "",
    referenceFile: null,
    deadlineDate: "",
    recordingHours: "2",
    recordingCalendarDate: "",
    editTypes: [],
    editDetails: "",
    inStudio: "no",
    studioSessionDate: "",
    otherAudioServiceType: "audio-clean",
  });

  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Handlers
  const handleGenreToggle = (genre: string) => {
    setFormData((prev) => {
      const exists = prev.musicTypes.includes(genre);
      return {
        ...prev,
        musicTypes: exists
          ? prev.musicTypes.filter((item) => item !== genre)
          : [...prev.musicTypes, genre],
      };
    });
  };

  const handleEditTypeToggle = (option: string) => {
    setFormData((prev) => {
      const exists = prev.editTypes.includes(option);
      return {
        ...prev,
        editTypes: exists
          ? prev.editTypes.filter((item) => item !== option)
          : [...prev.editTypes, option],
      };
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.includes("audio")) {
        setErrorMsg("Please upload a valid MP3/Audio file.");
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        setErrorMsg("Audio reference files must be 3 MB or smaller. You can paste a link for larger files.");
        return;
      }
      setFormData({ ...formData, referenceFile: file });
      setErrorMsg("");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const payload = new FormData();

      payload.append("category", "beats");
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("companyBrand", formData.companyBrand || "N/A");
      payload.append("serviceType", formData.lookingFor);
      payload.append("projectType", formData.projectType);
      payload.append(
        "musicTypes",
        formData.musicTypes.join(", ") || "None selected"
      );
      payload.append("referenceLinks", formData.referenceLinks || "None");
      payload.append(
        "deadlineDate",
        formData.lookingFor === "Full Production Deal"
          ? "Confirmed via Email"
          : formData.deadlineDate
      );

      payload.append(
        "recordingHours",
        formData.lookingFor === "Recording + Mixdown"
          ? `${formData.recordingHours} Hours`
          : "N/A"
      );

      payload.append(
        "recordingDate",
        formData.lookingFor === "Recording + Mixdown"
          ? formData.recordingCalendarDate
          : "N/A"
      );

      payload.append(
        "editOptions",
        formData.lookingFor === "Track Mixdown/Edit"
          ? formData.editTypes.join(", ")
          : "N/A"
      );

      payload.append(
        "editDetails",
        formData.lookingFor === "Track Mixdown/Edit"
          ? formData.editDetails
          : "N/A"
      );

      payload.append(
        "inStudioSession",
        formData.lookingFor === "Track Mixdown/Edit"
          ? formData.inStudio
          : "N/A"
      );

      payload.append(
        "studioSessionDate",
        formData.lookingFor === "Track Mixdown/Edit" &&
          formData.inStudio === "yes"
          ? formData.studioSessionDate
          : "N/A"
      );

      payload.append(
        "otherAudioService",
        formData.lookingFor === "Other Audio Service"
          ? formData.otherAudioServiceType
          : "N/A"
      );

      payload.append("projectDescription", formData.projectDescription);

      if (formData.referenceFile) {
        payload.append("referenceFile", formData.referenceFile);
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        body: payload,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Submission failed");
      }

      setFormSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit booking inquiry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen text-white overflow-hidden pb-20 pt-24 relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.50), rgba(0,0,0,0.80)), url('https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068305/WEBSITE_BACKGROUND_RED_uipmtc.jpg')",
        backgroundAttachment: "fixed",
        backgroundPosition: "center center",
        backgroundSize: "cover",
      }}
    >
      {/* HEADER */}
      <header className="w-full bg-black/60 backdrop-blur-sm border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 py-10 text-center">
          <h1 className="font-raf text-3xl md:text-5xl lg:text-6xl tracking-wide uppercase text-white">
            MUSIC SERVICE BOOKING
          </h1>
        </div>
      </header>

      {/* MAIN FORM */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-10">
        {formSubmitted ? (
          <div className="rounded-2xl border-4 border-black bg-black/85 backdrop-blur-md p-8 md:p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <span className="inline-block bg-red-600 text-white rounded-full p-4 text-3xl font-bold">✓</span>
            <h2 className="font-raf text-2xl sm:text-4xl uppercase text-white">Request Received</h2>
            <p className="font-mono text-sm text-white max-w-lg mx-auto leading-6">
              Thank you for submitting your project request. It has been sent to RAF By Design for review. We will contact <strong className="text-white">{formData.email}</strong> once the request has been reviewed.
            </p>
            <button
              onClick={() => {
                setFormSubmitted(false);
              }}
              className="mt-4 rounded-lg border-2 border-black bg-red-600 px-6 py-3 font-mono text-sm font-black text-black hover:bg-red-500 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase"
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
              <div className="p-4 bg-red-950/80 border-2 border-red-600 text-red-100 text-sm font-mono rounded-lg">
                ⚠️ Error: {errorMsg}
              </div>
            )}

            {/* SECTION 1: WHAT ARE YOU LOOKING FOR */}
            <div className="space-y-4">
              <h3 className="text-sm md:text-base font-mono font-black uppercase tracking-wider text-red-500 border-b border-zinc-800 pb-2">
                01. What Are You Looking For? *
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LOOKING_FOR_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 border-black cursor-pointer transition font-mono text-sm ${
                      formData.lookingFor === option
                        ? "bg-red-600 text-white font-bold"
                        : "bg-zinc-950 text-zinc-300 hover:bg-zinc-900"
                    }`}
                  >
                    <input
                      type="radio"
                      name="lookingFor"
                      value={option}
                      checked={formData.lookingFor === option}
                      onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                      className="accent-red-500 w-4 h-4"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* SECTION 2: CONTACT DETAILS */}
            <div className="space-y-4">
              <h3 className="text-sm md:text-base font-mono font-black uppercase tracking-wider text-red-500 border-b border-zinc-800 pb-2">
                02. Contact Information
              </h3>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block font-mono text-sm font-black uppercase text-white">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Full Name"
                    className="w-full rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white focus:bg-black outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-sm font-black uppercase text-white">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="yourname@domain.com"
                    className="w-full rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white focus:bg-black outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-sm font-black uppercase text-white">
                  Company / Brand Name (If any)
                </label>
                <input
                  type="text"
                  value={formData.companyBrand}
                  onChange={(e) => setFormData({ ...formData, companyBrand: e.target.value })}
                  placeholder="e.g. Studio, Label, or Brand"
                  className="w-full rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white focus:bg-black outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* SECTION 3: SERVICE-SPECIFIC QUESTIONS */}
            <div className="space-y-6 bg-zinc-950/60 p-5 rounded-xl border-2 border-black">
              <h3 className="text-sm md:text-base font-mono font-black uppercase tracking-wider text-red-500 border-b border-zinc-800 pb-2">
                03. Service Requirements ({formData.lookingFor})
              </h3>

              {/* RECORDING + MIXDOWN SPECIFIC QUESTIONS */}
              {formData.lookingFor === "Recording + Mixdown" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block font-mono text-sm font-black uppercase text-white">
                      a. How many hours? (2 hrs minimum) *
                    </label>
                    <select
                      value={formData.recordingHours}
                      onChange={(e) => setFormData({ ...formData, recordingHours: e.target.value })}
                      className="w-full sm:w-1/2 rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="2">2 Hours (Minimum)</option>
                      <option value="3">3 Hours</option>
                      <option value="4">4 Hours</option>
                      <option value="5">5 Hours</option>
                      <option value="6">6 Hours (Full Day)</option>
                      <option value="8">8+ Hours</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-mono text-sm font-black uppercase text-white">
                      b. Select Preferred Recording Session Date *
                    </label>
                    <p className="font-mono text-sm text-zinc-300 leading-6">
                      Choose a preferred date. We will confirm availability after reviewing your request.
                    </p>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.recordingCalendarDate}
                      onChange={(e) => setFormData({ ...formData, recordingCalendarDate: e.target.value })}
                      className="rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-900 text-white outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}

              {/* TRACK MIXDOWN / EDIT SPECIFIC QUESTIONS */}
              {formData.lookingFor === "Track Mixdown/Edit" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block font-mono text-sm font-black uppercase text-white mb-2">
                      a. What do you want to edit?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {EDIT_TYPE_OPTIONS.map((option) => {
                        const isChecked = formData.editTypes.includes(option);
                        return (
                          <label
                            key={option}
                            className={`flex items-center space-x-2 p-2.5 rounded-lg border-2 border-black cursor-pointer font-mono text-sm ${
                              isChecked
                                ? "bg-red-600 text-white font-bold"
                                : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleEditTypeToggle(option)}
                              className="accent-red-500 w-4 h-4"
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="pt-4 space-y-2">
                      <label className="block font-mono text-sm font-black uppercase text-white">
                        Please add details of what you would like
                      </label>
                      <textarea
                        rows={3}
                        value={formData.editDetails}
                        onChange={(e) => setFormData({ ...formData, editDetails: e.target.value })}
                        placeholder="Detail specific edit notes, timestamps, or vocal FX adjustments..."
                        className="w-full rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-zinc-800 pt-4">
                    <label className="block font-mono text-sm font-black uppercase text-white">
                      b. This is an external session. Do you want to be in studio? *
                    </label>
                    <div className="flex space-x-4">
                      <label className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg border-2 border-black cursor-pointer font-mono text-sm ${
                        formData.inStudio === "yes" ? "bg-red-600 text-white font-bold" : "bg-zinc-900 text-zinc-300"
                      }`}>
                        <input
                          type="radio"
                          name="inStudio"
                          value="yes"
                          checked={formData.inStudio === "yes"}
                          onChange={() => setFormData({ ...formData, inStudio: "yes" })}
                          className="accent-red-500"
                        />
                        <span>Yes</span>
                      </label>

                      <label className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg border-2 border-black cursor-pointer font-mono text-sm ${
                        formData.inStudio === "no" ? "bg-red-600 text-white font-bold" : "bg-zinc-900 text-zinc-300"
                      }`}>
                        <input
                          type="radio"
                          name="inStudio"
                          value="no"
                          checked={formData.inStudio === "no"}
                          onChange={() => setFormData({ ...formData, inStudio: "no" })}
                          className="accent-red-500"
                        />
                        <span>No</span>
                      </label>
                    </div>

                    {/* CALENDAR FOR IN-STUDIO SESSION */}
                    {formData.inStudio === "yes" && (
                      <div className="mt-4 p-4 rounded-lg bg-zinc-900 border-2 border-black space-y-2">
                        <label className="block font-mono text-sm font-black uppercase text-white">
                          Select Studio Attendance Location Slot
                        </label>
                        <p className="font-mono text-sm text-zinc-300 leading-6">
                          Choose a preferred date for your studio mixdown session. We will confirm availability after reviewing your request.
                        </p>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split("T")[0]}
                          value={formData.studioSessionDate}
                          onChange={(e) => setFormData({ ...formData, studioSessionDate: e.target.value })}
                          className="rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* OTHER AUDIO SERVICE SPECIFIC QUESTIONS */}
              {formData.lookingFor === "Other Audio Service" && (
                <div className="space-y-4">
                  <label className="block font-mono text-sm font-black uppercase text-white">
                    What service would you like? *
                  </label>
                  <div className="space-y-2">
                    {OTHER_AUDIO_SERVICES.map((srv) => (
                      <label
                        key={srv.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 border-black font-mono text-sm ${
                          srv.disabled
                            ? "opacity-40 cursor-not-allowed bg-zinc-900 text-zinc-500"
                            : formData.otherAudioServiceType === srv.id
                            ? "bg-red-600 text-white font-bold cursor-pointer"
                            : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
                        }`}
                      >
                        <input
                          type="radio"
                          name="otherAudioService"
                          disabled={srv.disabled}
                          value={srv.id}
                          checked={formData.otherAudioServiceType === srv.id}
                          onChange={(e) => setFormData({ ...formData, otherAudioServiceType: e.target.value })}
                          className="accent-red-500"
                        />
                        <span>{srv.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* CUSTOM BEAT / FULL PRODUCTION DEAL COMMON OPTIONS */}
              {(formData.lookingFor === "Custom Made Beat" || formData.lookingFor === "Full Production Deal") && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block font-mono text-sm font-black uppercase text-white">
                      Project Type
                    </label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {PROJECT_TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-mono text-sm font-black uppercase text-white">
                      Type of Music
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {MUSIC_GENRE_OPTIONS.map((genre) => {
                        const isChecked = formData.musicTypes.includes(genre);
                        return (
                          <label
                            key={genre}
                            className={`flex items-center space-x-2 p-2.5 rounded-lg border-2 border-black cursor-pointer font-mono text-sm ${
                              isChecked
                                ? "bg-red-600 text-white font-bold"
                                : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleGenreToggle(genre)}
                              className="accent-red-500 w-4 h-4"
                            />
                            <span>{genre}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: REFERENCE TRACK / MOOD & FILES */}
            <div className="space-y-4">
              <h3 className="text-sm md:text-base font-mono font-black uppercase tracking-wider text-red-500 border-b border-zinc-800 pb-2">
                04. Reference Track / Mood
              </h3>

              <div className="space-y-3">
                <label className="block font-mono text-sm font-black uppercase text-white">
                  Track / Reference Links
                </label>
                <p className="font-mono text-sm text-zinc-300 leading-6">
                  Add working links for tracks (Spotify, YouTube, SoundCloud, Dropbox). Leave a gap/space between multiple links.
                </p>
                <textarea
                  rows={2}
                  value={formData.referenceLinks}
                  onChange={(e) => setFormData({ ...formData, referenceLinks: e.target.value })}
                  placeholder="https://open.spotify.com/track/...  https://youtube.com/watch?v=..."
                  className="w-full rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="block font-mono text-sm font-black uppercase text-white">
                  Upload MP3 Reference File
                </label>
                <p className="font-mono text-sm text-zinc-300 leading-6">
                  Upload one MP3 reference file, up to 3 MB. Larger files can be shared using the reference link field. Uploaded files are private to the booking team.
                </p>
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg"
                  onChange={handleFileChange}
                  className="block w-full font-mono text-sm text-zinc-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-2 file:border-black file:text-sm file:font-mono file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
                />
                {formData.referenceFile && (
                  <p className="font-mono text-sm text-red-300 mt-1">
                    ✓ File attached: {formData.referenceFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* SECTION 5: DEADLINE & SCHEDULING */}
            <div className="space-y-4">
              <h3 className="text-sm md:text-base font-mono font-black uppercase tracking-wider text-red-500 border-b border-zinc-800 pb-2">
                05. Project Deadline
              </h3>

              {formData.lookingFor === "Full Production Deal" ? (
                <div className="p-4 rounded-xl border-2 border-red-600 bg-red-950/30 text-white font-mono text-sm leading-6 space-y-2">
                  <p className="font-bold text-white uppercase">Full Production Deal Schedule</p>
                  <p>
                    Calendar selection is excluded for Full Production Deals. Because this service combines multiple tailored production phases, all deadlines and session dates will be confirmed directly via email consultation.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block font-mono text-sm font-black uppercase text-white">
                    Target Completion Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.deadlineDate}
                    onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                    className="rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}
            </div>

            {/* SECTION 6: BRIEF DESCRIPTION */}
            <div className="space-y-4">
              <h3 className="text-sm md:text-base font-mono font-black uppercase tracking-wider text-red-500 border-b border-zinc-800 pb-2">
                06. Brief Description of Project
              </h3>

              <div className="space-y-2">
                <label className="block font-mono text-sm font-black uppercase text-white">
                  Project description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.projectDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, projectDescription: e.target.value })
                  }
                  placeholder="Provide additional details regarding vision, style, vocal arrangements, or overall expectations..."
                  className="w-full rounded-lg border-2 border-black p-3 font-mono text-sm bg-zinc-950 text-white outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border-2 border-black bg-red-600 px-6 py-4 text-center font-mono text-sm font-black text-black hover:bg-red-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition active:translate-y-0.5 disabled:opacity-50 uppercase tracking-widest"
            >
              {loading ? "SUBMITTING REQUEST..." : "SUBMIT FORM"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
