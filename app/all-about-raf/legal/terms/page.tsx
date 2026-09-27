"use client";

import Link from "next/link";
import RafAboutBackground from "@/components/raf/RafAboutBackground";

const sections = [
  {
    title: "Using RAF By Design",
    body: [
      "These terms apply to use of the RAF By Design website and to general purchases, bookings and service requests made through the website.",
      "Additional terms may apply to individual products or services, including beat licences, production agreements, design work and other project-specific arrangements.",
    ],
  },
  {
    title: "Orders & Service Requests",
    body: [
      "Orders and service requests are subject to availability, review and acceptance where applicable.",
      "Submitting a request does not guarantee that RAF By Design can accept the project, date, deadline or requested scope. Where approval is required, the booking is confirmed only when RAF By Design confirms it.",
    ],
  },
  {
    title: "Prices, Deposits & Payment",
    body: [
      "Prices shown on the website are the current advertised prices unless otherwise stated. Custom work may require a separate quote.",
      "Deposits may be required for services. Any cancellation or refund rights that apply to a deposit are handled in accordance with the Returns, Cancellations & Refunds policy and applicable law.",
    ],
  },
  {
    title: "Project Information & Customer Responsibilities",
    body: [
      "Customers are responsible for supplying accurate project information, contact details, files, instructions and reference material.",
      "Customers must have the necessary rights or permission to supply any music, images, artwork, samples, logos, text or other material submitted to RAF By Design.",
    ],
  },
  {
    title: "Revisions & Changes",
    body: [
      "Revision limits and concept approval rules are shown within the relevant service information.",
      "Changes outside the agreed scope, additional concepts, major redesigns, new recordings, complete beat remakes or other substantial changes may require additional payment or a new booking.",
    ],
  },
  {
    title: "Delivery & Turnaround",
    body: [
      "Turnaround times shown on the website are estimates unless RAF By Design has expressly agreed a fixed deadline.",
      "Delivery can depend on timely customer responses, approvals, file supply, payment and other project requirements.",
    ],
  },
  {
    title: "Copyright, Licensing & Usage Rights",
    body: [
      "Ownership and usage rights depend on the specific product or service purchased.",
      "Beat leases, exclusive licences, custom production, design services and other work may have their own rights, restrictions or agreements. Those specific terms take priority for the relevant purchase where they differ from these general terms.",
    ],
  },
  {
    title: "Website & Account Use",
    body: [
      "Users must not misuse the website, attempt unauthorised access, interfere with its operation, submit unlawful material or use RAF By Design services for unlawful purposes.",
      "RAF By Design may restrict access where necessary to protect the website, customers, business systems or other users.",
    ],
  },
  {
    title: "Legal Rights",
    body: [
      "Nothing in these terms removes or limits statutory consumer rights that cannot legally be excluded.",
      "Where these general terms conflict with a mandatory legal right, the applicable legal right will take priority.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="legal-page min-h-screen relative text-black">
      <style jsx global>{`
        .legal-page {
          font-family: Arial, Helvetica, sans-serif;
        }
        .legal-page .font-raf {
          font-family: "RAF Font Demo", sans-serif;
        }
      `}</style>

      <RafAboutBackground />

      <div className="relative z-10 pt-28 pb-20">
        <header className="w-full bg-black border-y-4 border-black">
          <div className="w-full px-6 py-10 text-center">
            <h1 className="font-raf text-4xl sm:text-6xl lg:text-7xl uppercase text-white">
              Terms & Conditions
            </h1>
          </div>
        </header>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          <section className="rounded-2xl border-4 border-black bg-white p-6 sm:p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-base sm:text-lg leading-8 text-zinc-700">
              These are the general terms for the RAF By Design website,
              products and services. Specific service or licence terms may also
              apply where shown.
            </p>
          </section>

          {sections.map((section) => (
            <section
              key={section.title}
              className="overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="bg-black px-6 py-5">
                <h2 className="font-raf text-2xl sm:text-3xl uppercase text-white">
                  {section.title}
                </h2>
              </div>
              <div className="p-6 sm:p-8 space-y-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-base sm:text-lg leading-8 text-zinc-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-2xl border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="font-raf text-2xl sm:text-3xl uppercase text-black">
              Business Details
            </h2>
            <div className="mt-4 space-y-2 text-base sm:text-lg leading-7 text-zinc-700">
              <p>Registered company name: [RAF BY DESIGN LTD]</p>
              <p>Company number: [12477691]</p>
              <p>Registered office: [1 Studland Road, Lodndon, SE26 5NH]</p>
              <p>Contact email: [officialrafbydesign@gmail.com]</p>
            </div>
          </section>

          <div className="text-center">
            <Link href="/all-about-raf/legal" className="inline-flex rounded-xl border-2 border-black bg-black px-6 py-3 text-base font-black uppercase text-white transition hover:bg-zinc-800">
              ← General & Legal
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
