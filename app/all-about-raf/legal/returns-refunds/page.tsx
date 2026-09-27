"use client";

import Link from "next/link";
import RafAboutBackground from "@/components/raf/RafAboutBackground";

const sections = [
  {
    title: "Physical Products",
    body: [
      "Physical products such as clothing may be returned in accordance with your statutory rights.",
      "Items should be returned in their original condition and should not be used beyond what is reasonably necessary to inspect or try the product. Where an item has been handled beyond this and its value has been reduced, the refund may be reduced where legally permitted.",
      "Faulty, damaged or incorrectly supplied items are handled separately and statutory rights remain unaffected.",
    ],
  },
  {
    title: "Digital Downloads",
    body: [
      "Digital products are supplied for immediate access where the customer expressly requests immediate supply and confirms the required acknowledgement during checkout.",
      "Once the digital content has been supplied and the applicable cancellation right has been lost, digital purchases are normally non-refundable unless a legal right to a refund applies.",
      "In exceptional circumstances RAF By Design may offer store credit at its discretion. Discretionary store credit does not replace any refund or remedy the customer is legally entitled to receive.",
    ],
  },
  {
    title: "Service Cancellations",
    body: [
      "Where a statutory 14-day cancellation period applies to a service booking, the customer may cancel during that period.",
      "The booking or payment flow will provide the relevant cancellation information before the request is completed.",
    ],
  },
  {
    title: "Starting Work Early",
    body: [
      "If a customer asks RAF By Design to begin work before the end of an applicable 14-day cancellation period, the customer will be asked to make that request expressly.",
      "If the customer later cancels after work has started, RAF By Design may charge a reasonable amount for work already completed where legally permitted. Where the service has been fully performed following the required request and acknowledgement, the cancellation right may end.",
    ],
  },
  {
    title: "Deposits",
    body: [
      "Deposits are treated as part of the relevant service booking and are not automatically described as non-refundable in every situation.",
      "Whether a deposit is refundable depends on the cancellation rights that apply, whether work has started, the amount of work already carried out, and any specific project terms agreed with the customer.",
    ],
  },
  {
    title: "How To Request A Return Or Cancellation",
    body: [
      "To request a return, cancellation or refund, contact RAF By Design using the website contact details and include your order or booking reference.",
      "Where a physical item must be returned, return instructions will be provided before the item is sent back.",
    ],
  },
];

export default function ReturnsRefundsPage() {
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
              Returns, Cancellations & Refunds
            </h1>
          </div>
        </header>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          <section className="rounded-2xl border-4 border-black bg-white p-6 sm:p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-base sm:text-lg leading-8 text-zinc-700">
              This policy explains how returns, cancellations and refunds are
              handled for physical products, digital purchases and RAF By
              Design services.
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
              Checkout & Booking Acknowledgements
            </h2>

            <div className="mt-5 space-y-5">
              <div className="rounded-xl border-2 border-black bg-zinc-50 p-5">
                <p className="font-black uppercase text-black">Digital Purchase</p>
                <p className="mt-2 text-base sm:text-lg leading-7 text-zinc-700">
                  I request immediate access to my digital purchase and
                  understand that once the download or digital content is
                  supplied, I may lose my 14-day right to cancel.
                </p>
              </div>

              <div className="rounded-xl border-2 border-black bg-zinc-50 p-5">
                <p className="font-black uppercase text-black">Early Service Start</p>
                <p className="mt-2 text-base sm:text-lg leading-7 text-zinc-700">
                  I request that RAF By Design begins work before the end of my
                  14-day cancellation period. I understand that if I later
                  cancel, I may be charged for work already completed and that
                  my cancellation right may end once the service has been fully
                  performed where the law allows.
                </p>
              </div>
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