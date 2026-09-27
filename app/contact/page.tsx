"use client";

import { useState } from "react";
import RafAboutBackground from "@/components/raf/RafAboutBackground";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    inquiryType: "General",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) setSubmitted(true);
  };

  return (
    <main className="contact-page min-h-screen relative text-black">
      <style jsx global>{`
        .contact-page {
          font-family: Arial, Helvetica, sans-serif;
        }

        .contact-page .font-mono,
        .contact-page .font-clarity {
          font-family: Arial, Helvetica, sans-serif !important;
        }

        .contact-page .font-raf {
          font-family: "RAF Font Demo", sans-serif;
        }
      `}</style>

      <RafAboutBackground />

      <div className="relative z-10 pt-28 pb-24">
        <header className="w-full bg-black border-y-4 border-black">
          <div className="w-full px-6 py-10 text-center">
            <h1 className="font-raf text-4xl sm:text-6xl lg:text-7xl uppercase text-white">
              Contact RAF
            </h1>
          </div>
        </header>

        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <section className="overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="border-b-4 border-black bg-white px-6 py-6 sm:px-8 sm:py-7 text-center">
              <p className="text-base sm:text-lg font-bold uppercase tracking-[0.16em] text-red-600">
                Get In Touch
              </p>

              <p className="mx-auto mt-3 max-w-3xl text-base sm:text-lg leading-8 text-zinc-700">
                Contact Form
              </p>
            </div>

            <div className="p-6 sm:p-8">
              {submitted ? (
                <div className="rounded-xl border-4 border-black bg-black p-6 sm:p-8 text-center text-white">
                  <h3 className="font-raf text-2xl sm:text-3xl uppercase">
                    Transmission Received
                  </h3>

                  <p className="mt-3 text-base sm:text-lg leading-7 text-zinc-300">
                    We will reply via the provided secure terminal address.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-7">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm sm:text-base font-black uppercase tracking-wider text-black">
                        01. Name
                      </label>

                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className="rounded-lg border-3 border-black bg-zinc-50 p-4 text-base font-bold text-black outline-none transition focus:bg-white focus:ring-2 focus:ring-red-500"
                        placeholder="ENTER FULL NAME"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm sm:text-base font-black uppercase tracking-wider text-black">
                        02. Email Address
                      </label>

                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="rounded-lg border-3 border-black bg-zinc-50 p-4 text-base font-bold text-black outline-none transition focus:bg-white focus:ring-2 focus:ring-red-500"
                        placeholder="NAME@DOMAIN.COM"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm sm:text-base font-black uppercase tracking-wider text-black">
                      03. Enquiry
                    </label>

                    <select
                      value={form.inquiryType}
                      onChange={(e) =>
                        setForm({ ...form, inquiryType: e.target.value })
                      }
                      className="rounded-lg border-3 border-black bg-zinc-50 p-4 text-base font-black uppercase text-black outline-none transition focus:bg-white focus:ring-2 focus:ring-red-500"
                    >
                      <option value="General">
                        General Enquiries
                      </option>
                      <option value="Beats">
                        Beats, Music Bookings & Custom Production
                      </option>
                      <option value="Design">
                        Design Services & Bookings
                      </option>
                      <option value="Music">
                        Music Shop
                      </option>
                      <option value="Clothing">
                        Clothing Shop
                      </option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm sm:text-base font-black uppercase tracking-wider text-black">
                      04. Write Message
                    </label>

                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      className="resize-none rounded-lg border-3 border-black bg-zinc-50 p-4 text-base font-bold text-black outline-none transition focus:bg-white focus:ring-2 focus:ring-red-500"
                      placeholder="WRITE YOUR MESSAGE HERE..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl border-4 border-black bg-black py-4 px-6 text-base font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] transition hover:bg-red-600 active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
