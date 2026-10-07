"use client";

import Link from "next/link";
import RafAboutBackground from "@/components/raf/RafAboutBackground";

const sections = [
  {
    title: "Information We Collect",
    body: [
      "We may collect information you provide when you create an account, place an order, submit a service request, contact us, join a mailing list, or otherwise interact with RAF By Design.",
      "This may include your name, contact details, billing or delivery information, order and booking information, uploaded project files, messages, preferences and other information needed to provide the requested service.",
    ],
  },
  {
    title: "How We Use Your Information",
    body: [
      "We use personal information to process orders, respond to enquiries, manage bookings and service requests, provide products and services, maintain customer records, prevent misuse, meet legal or accounting obligations, and improve the operation of RAF By Design.",
      "Where consent is required, such as for optional marketing or certain non-essential cookies, you can choose whether to provide that consent.",
    ],
  },
  {
    title: "Lawful Use Of Data",
    body: [
      "Depending on the situation, information may be processed because it is necessary to fulfil a contract or requested service, because RAF By Design has a legitimate business reason to use it, because a legal obligation applies, or because you have given consent.",
      "Consent is not used where another lawful basis is more appropriate.",
    ],
  },
  {
    title: "Sharing Information",
    body: [
      "Information may be shared with service providers where necessary to operate the website and fulfil orders or services. This may include payment providers, hosting and database providers, email services, delivery companies and other operational suppliers.",
      "RAF By Design does not sell personal information to third parties.",
    ],
  },
  {
    title: "Data Retention",
    body: [
      "Personal information is kept only for as long as reasonably necessary for the purpose it was collected, including order fulfilment, customer support, accounting, dispute handling and legal obligations.",
      "Different categories of information may be kept for different periods.",
    ],
  },
  {
    title: "Your Rights",
    body: [
      "You may have rights to request access to your personal information, correct inaccurate information, request deletion in certain circumstances, restrict or object to some processing, and withdraw consent where processing is based on consent.",
      "Requests can be made using the contact details shown on this website. Statutory rights and complaint rights remain unaffected.",
    ],
  },
  {
    title: "Cookies",
    body: [
      "Essential cookies may be used where necessary for the website to function, such as account, basket, checkout, security or session features.",
      "Non-essential cookies or similar technologies used for analytics, advertising or other optional purposes will be controlled through the website cookie settings where required. Users can accept, reject or manage non-essential cookies.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      title="Privacy & Cookies"
      intro="This notice explains how RAF By Design handles personal information and website cookies."
      sections={sections}
    />
  );
}

function LegalDocumentPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: { title: string; body: string[] }[];
}) {
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
              {title}
            </h1>
          </div>
        </header>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          <section className="rounded-2xl border-4 border-black bg-white p-6 sm:p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-base sm:text-lg leading-8 text-zinc-700">{intro}</p>
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
              Contact & Business Details
            </h2>
            <div className="mt-4 space-y-2 text-base sm:text-lg leading-7 text-zinc-700">
              <p>Privacy contact: officialrafbydesign@gmail.com</p>
              <p>Registered company name: RAF BY DESIGN LTD</p>
              <p>Company number: 12477691</p>
              <p>Registered office: 1 Studland Road, London, SE26 5NH</p>
            </div>
          </section>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/all-about-raf/legal" className="rounded-xl border-2 border-black bg-black px-6 py-3 text-base font-black uppercase text-white transition hover:bg-zinc-800">
              ← General & Legal
            </Link>
            <Link href="/contact" className="rounded-xl border-2 border-black bg-white px-6 py-3 text-base font-black uppercase text-black transition hover:bg-zinc-100">
              Contact RAF
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
