"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminLayout from "../components/AdminLayout";

type BookingArea =
  | "MUSIC"
  | "DESIGN";

type DayStatus =
  | "TRANSPARENT"
  | "GREEN"
  | "AMBER"
  | "RED";

type RequestKind =
  | "music"
  | "design";

function safeReferenceLinks(value: string | null | undefined) {
  return (value || "").split(/\s+/).slice(0, 5).flatMap((part) => {
    try {
      const url = new URL(part);
      return url.protocol === "https:" || url.protocol === "http:" ? [url.toString()] : [];
    } catch {
      return [];
    }
  });
}

type BookingDay = {
  id: string;
  date: string;
  area: BookingArea;
  status: DayStatus;
  note?: string | null;
};

type Customer = {
  id?: string;
  name?: string | null;
  email?: string | null;
};

type MusicService = {
  id?: string;
  name?: string | null;
};

type ServicePayment = {
  id: string;
  stage: "deposit" | "balance" | "full";
  amount: number;
  totalAmount: number;
  status: string;
  stripeInvoiceId?: string | null;
};

type Booking = {
  id: string;
  payments?: ServicePayment[];
  date?: string | null;
  status: string;

  companyBrand?: string | null;
  projectType?: string | null;
  musicTypes?: string[];
  referenceLinks?: string | null;
  referenceFileName?: string | null;
  referenceFileUrl?: string | null;
  deadlineText?: string | null;

  recordingHours?: string | null;
  recordingDate?: string | null;
  editOptions?: string | null;
  editDetails?: string | null;
  inStudioSession?: string | null;
  studioSessionDate?: string | null;
  otherAudioService?: string | null;
  projectDescription?: string | null;

  adminNotes?: string | null;
  createdAt: string;

  user?: Customer;
  service?: MusicService;
};

type DesignEnquiry = {
  id: string;
  payments?: ServicePayment[];
  title: string;
  details: string;
  services: string[];
  fileUrls: string[];

  companyBrand?: string | null;
  deadline?: string | null;
  extraRevisions?: boolean;
  paymentOption?: string | null;
  totalPrice?: number | null;
  dueNow?: number | null;

  status: string;
  adminNotes?: string | null;
  createdAt: string;

  user?: Customer;
};

type EditingState = {
  kind: RequestKind;
  id: string;
  data: Record<
    string,
    string | number | boolean
  >;
} | null;

type EmailState = {
  kind: RequestKind;
  id: string;
  email: string;
  subject: string;
  message: string;
} | null;

const STATUS_STYLES: Record<
  DayStatus,
  string
> = {
  TRANSPARENT:
    "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50",

  GREEN:
    "bg-emerald-100 border-emerald-400 text-emerald-900 font-medium",

  AMBER:
    "bg-amber-100 border-amber-400 text-amber-900 font-medium",

  RED:
    "bg-rose-100 border-rose-400 text-rose-900 font-medium",
};

const STATUS_BADGE: Record<
  DayStatus,
  string
> = {
  TRANSPARENT:
    "bg-white border border-zinc-300",

  GREEN:
    "bg-emerald-500",

  AMBER:
    "bg-amber-500",

  RED:
    "bg-rose-500",
};

function dayKey(
  dateValue?:
    | string
    | Date
    | null
) {
  if (!dateValue) {
    return "";
  }

  const date =
    typeof dateValue ===
    "string"
      ? new Date(
          dateValue
        )
      : dateValue;

  return Number.isNaN(
    date.getTime()
  )
    ? ""
    : date
        .toISOString()
        .split("T")[0];
}

function inputDate(
  value?: string | null
) {
  return value
    ? dayKey(value)
    : "";
}

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "Not specified";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  );
}

function infoValue(
  value: unknown
) {
  if (
    Array.isArray(value)
  ) {
    return value.length
      ? value.join(", ")
      : "—";
  }

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return String(value);
}

function statusClass(
  status?: string
) {
  switch (
    (
      status ||
      ""
    ).toLowerCase()
  ) {
    case "approved":
    case "confirmed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";

    case "rejected":
      return "bg-rose-100 text-rose-800 border-rose-200";

    case "pending":
    case "new":
    default:
      return "bg-amber-100 text-amber-800 border-amber-200";
  }
}

function statusLabel(
  status?: string
) {
  const normalised =
    (
      status ||
      "pending"
    ).toLowerCase();

  if (
    normalised ===
    "new"
  ) {
    return "NEW";
  }

  return normalised.toUpperCase();
}

async function readResponse(
  response: Response
) {
  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "The request failed."
    );
  }

  return data;
}

export default function BookingsAdminPage() {
  const [
    bookings,
    setBookings,
  ] = useState<
    Booking[]
  >([]);

  const [
    designEnquiries,
    setDesignEnquiries,
  ] = useState<
    DesignEnquiry[]
  >([]);

  const [
    bookingDays,
    setBookingDays,
  ] = useState<
    BookingDay[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    working,
    setWorking,
  ] = useState<
    string | null
  >(null);

  const [
    message,
    setMessage,
  ] = useState("");

  const [lastInvoiceUrl, setLastInvoiceUrl] = useState("");

  const [
    area,
    setArea,
  ] =
    useState<BookingArea>(
      "MUSIC"
    );

  const [
    currentMonth,
    setCurrentMonth,
  ] =
    useState<Date>(
      new Date()
    );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );

  const [
    status,
    setStatus,
  ] =
    useState<DayStatus>(
      "GREEN"
    );

  const [
    note,
    setNote,
  ] = useState("");

  const [
    editing,
    setEditing,
  ] =
    useState<EditingState>(
      null
    );

  const [
    emailState,
    setEmailState,
  ] =
    useState<EmailState>(
      null
    );

  const loadData =
    useCallback(
      async () => {
        try {
          const response =
            await fetch(
              "/api/admin/bookings",
              {
                method:
                  "GET",

                credentials:
                  "include",

                cache:
                  "no-store",
              }
            );

          const data =
            await readResponse(
              response
            );

          setBookings(
            Array.isArray(
              data.bookings
            )
              ? data.bookings
              : []
          );

          setDesignEnquiries(
            Array.isArray(
              data.designEnquiries
            )
              ? data.designEnquiries
              : []
          );

          setBookingDays(
            Array.isArray(
              data.bookingDays
            )
              ? data.bookingDays
              : []
          );
        } catch (error) {
          console.error(
            "Failed to fetch bookings:",
            error
          );

          setMessage(
            `❌ ${
              error instanceof
              Error
                ? error.message
                : "Failed to load booking data."
            }`
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );

  useEffect(() => {
    loadData();
  }, [
    loadData,
  ]);

  const calendarDays =
    useMemo(() => {
      const year =
        currentMonth.getFullYear();

      const month =
        currentMonth.getMonth();

      const firstDay =
        new Date(
          year,
          month,
          1
        );

      const lastDay =
        new Date(
          year,
          month + 1,
          0
        );

      const days: {
        dateStr: string;
        isCurrentMonth: boolean;
        dayNum: number;
      }[] = [];

      for (
        let index =
          firstDay.getDay() -
          1;
        index >= 0;
        index -= 1
      ) {
        const date =
          new Date(
            year,
            month,
            -index
          );

        days.push({
          dateStr:
            dayKey(date),

          isCurrentMonth:
            false,

          dayNum:
            date.getDate(),
        });
      }

      for (
        let day = 1;
        day <=
        lastDay.getDate();
        day += 1
      ) {
        const date =
          new Date(
            year,
            month,
            day
          );

        days.push({
          dateStr:
            dayKey(date),

          isCurrentMonth:
            true,

          dayNum:
            day,
        });
      }

      const remainingSlots =
        42 -
        days.length;

      for (
        let day = 1;
        day <=
        remainingSlots;
        day += 1
      ) {
        const date =
          new Date(
            year,
            month + 1,
            day
          );

        days.push({
          dateStr:
            dayKey(date),

          isCurrentMonth:
            false,

          dayNum:
            day,
        });
      }

      return days;
    }, [
      currentMonth,
    ]);

  const daysMap =
    useMemo(() => {
      const map =
        new Map<
          string,
          BookingDay
        >();

      bookingDays.forEach(
        (
          bookingDay
        ) => {
          if (
            bookingDay.area ===
            area
          ) {
            map.set(
              dayKey(
                bookingDay.date
              ),
              bookingDay
            );
          }
        }
      );

      return map;
    }, [
      bookingDays,
      area,
    ]);

  const pendingMusic =
    bookings.filter(
      (booking) =>
        ![
          "approved",
          "rejected",
        ].includes(
          booking.status.toLowerCase()
        )
    ).length;

  const pendingDesign =
    designEnquiries.filter(
      (enquiry) =>
        ![
          "approved",
          "rejected",
        ].includes(
          enquiry.status.toLowerCase()
        )
    ).length;

  function handleCellClick(
    dateStr: string
  ) {
    setSelectedDate(
      dateStr
    );

    const existing =
      daysMap.get(
        dateStr
      );

    if (existing) {
      setStatus(
        existing.status
      );

      setNote(
        existing.note ||
          ""
      );
    } else {
      setStatus(
        "GREEN"
      );

      setNote("");
    }
  }

  function changeMonth(
    amount: number
  ) {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() +
          amount,
        1
      )
    );
  }

  async function saveBookingDay(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setWorking(
        "calendar"
      );

      setMessage("");

      const response =
        await fetch(
          "/api/admin/bookings",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify({
                date:
                  selectedDate,

                area,
                status,
                note,
              }),
          }
        );

      await readResponse(
        response
      );

      setMessage(
        "✅ Calendar availability saved."
      );

      setNote("");

      await loadData();
    } catch (error) {
      setMessage(
        `❌ ${
          error instanceof
          Error
            ? error.message
            : "Failed to save day status."
        }`
      );
    } finally {
      setWorking(
        null
      );
    }
  }

  function openMusicEdit(
    booking: Booking
  ) {
    setEditing({
      kind:
        "music",

      id:
        booking.id,

      data: {
        name:
          booking.user
            ?.name || "",

        email:
          booking.user
            ?.email || "",

        serviceType:
          booking.service
            ?.name || "",

        date:
          inputDate(
            booking.date
          ),

        companyBrand:
          booking.companyBrand ||
          "",

        projectType:
          booking.projectType ||
          "",

        musicTypes:
          (
            booking.musicTypes ||
            []
          ).join(", "),

        referenceLinks:
          booking.referenceLinks ||
          "",

        deadlineText:
          booking.deadlineText ||
          "",

        recordingHours:
          booking.recordingHours ||
          "",

        recordingDate:
          inputDate(
            booking.recordingDate
          ),

        editOptions:
          booking.editOptions ||
          "",

        editDetails:
          booking.editDetails ||
          "",

        inStudioSession:
          booking.inStudioSession ||
          "",

        studioSessionDate:
          inputDate(
            booking.studioSessionDate
          ),

        otherAudioService:
          booking.otherAudioService ||
          "",

        projectDescription:
          booking.projectDescription ||
          "",

        adminNotes:
          booking.adminNotes ||
          "",
      },
    });
  }

  function openDesignEdit(
    enquiry: DesignEnquiry
  ) {
    setEditing({
      kind:
        "design",

      id:
        enquiry.id,

      data: {
        name:
          enquiry.user
            ?.name || "",

        email:
          enquiry.user
            ?.email || "",

        title:
          enquiry.title ||
          "",

        details:
          enquiry.details ||
          "",

        services:
          (
            enquiry.services ||
            []
          ).join(", "),

        companyBrand:
          enquiry.companyBrand ||
          "",

        deadline:
          inputDate(
            enquiry.deadline
          ),

        extraRevisions:
          Boolean(
            enquiry.extraRevisions
          ),

        paymentOption:
          enquiry.paymentOption ||
          "",

        totalPrice:
          enquiry.totalPrice ??
          "",

        dueNow:
          enquiry.dueNow ??
          "",

        adminNotes:
          enquiry.adminNotes ||
          "",
      },
    });
  }

  function updateEditingField(
    key: string,
    value:
      | string
      | number
      | boolean
  ) {
    setEditing(
      (current) =>
        current
          ? {
              ...current,

              data: {
                ...current.data,

                [key]:
                  value,
              },
            }
          : current
    );
  }

  async function saveRequestEdit() {
    if (!editing) {
      return;
    }

    try {
      setWorking(
        `edit-${editing.kind}-${editing.id}`
      );

      setMessage("");

      const response =
        await fetch(
          "/api/admin/bookings",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify({
                kind:
                  editing.kind,

                id:
                  editing.id,

                action:
                  "update",

                data:
                  editing.data,
              }),
          }
        );

      await readResponse(
        response
      );

      setEditing(
        null
      );

      setMessage(
        "✅ Request details updated."
      );

      await loadData();
    } catch (error) {
      setMessage(
        `❌ ${
          error instanceof
          Error
            ? error.message
            : "Failed to update request."
        }`
      );
    } finally {
      setWorking(
        null
      );
    }
  }

  async function changeRequestStatus(
    kind: RequestKind,
    id: string,
    action:
      | "approve"
      | "reject"
  ) {
    if (
      action ===
        "reject" &&
      !window.confirm(
        "Reject this request?"
      )
    ) {
      return;
    }

    try {
      setWorking(
        `${action}-${kind}-${id}`
      );

      setMessage("");

      const response =
        await fetch(
          "/api/admin/bookings",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify({
                kind,
                id,
                action,
              }),
          }
        );

      await readResponse(
        response
      );

      setMessage(
        action ===
          "approve"
          ? "✅ Request approved."
          : "✅ Request rejected."
      );

      await loadData();
    } catch (error) {
      setMessage(
        `❌ ${
          error instanceof
          Error
            ? error.message
            : "Failed to change request status."
        }`
      );
    } finally {
      setWorking(
        null
      );
    }
  }

  function openMusicEmail(
    booking: Booking
  ) {
    const approved =
      booking.status.toLowerCase() ===
      "approved";

    const rejected =
      booking.status.toLowerCase() ===
      "rejected";

    const name =
      booking.user
        ?.name ||
      "there";

    const service =
      booking.service
        ?.name ||
      "music service";

    setEmailState({
      kind:
        "music",

      id:
        booking.id,

      email:
        booking.user
          ?.email || "",

      subject:
        rejected
          ? `RAF By Design – ${service} Request Update`
          : approved
            ? `RAF By Design – ${service} Confirmed`
            : `RAF By Design – ${service} Request`,

      message:
        rejected
          ? `Hi ${name},

Thank you for your ${service} request. Unfortunately, we are unable to confirm the request as submitted.

Please reply if you would like to discuss alternative dates or options.

Regards,
RAF By Design`
          : approved
            ? `Hi ${name},

Your RAF By Design ${service} request has been confirmed.

${
  booking.date
    ? `Date: ${formatDate(
        booking.date
      )}
`
    : ""
}${
  booking.recordingHours
    ? `Recording time: ${booking.recordingHours}
`
    : ""
}
Please reply to this email if you need to confirm any final details.

Regards,
RAF By Design`
            : `Hi ${name},

Thank you for your ${service} request. We are reviewing the details and will confirm the next steps with you.

Regards,
RAF By Design`,
    });
  }

  function openDesignEmail(
    enquiry: DesignEnquiry
  ) {
    const approved =
      enquiry.status.toLowerCase() ===
      "approved";

    const rejected =
      enquiry.status.toLowerCase() ===
      "rejected";

    const name =
      enquiry.user
        ?.name ||
      "there";

    const service =
      enquiry.services
        ?.join(", ") ||
      "design service";

    setEmailState({
      kind:
        "design",

      id:
        enquiry.id,

      email:
        enquiry.user
          ?.email || "",

      subject:
        rejected
          ? `RAF By Design – ${enquiry.title} Request Update`
          : approved
            ? `RAF By Design – ${enquiry.title} Confirmed`
            : `RAF By Design – ${enquiry.title} Enquiry`,

      message:
        rejected
          ? `Hi ${name},

Thank you for your ${service} request for "${enquiry.title}". Unfortunately, we are unable to confirm the request as submitted.

Please reply if you would like to discuss alternative options.

Regards,
RAF By Design`
          : approved
            ? `Hi ${name},

Your RAF By Design request for "${enquiry.title}" has been confirmed.

Service: ${service}
${
  enquiry.deadline
    ? `Requested deadline: ${formatDate(
        enquiry.deadline
      )}
`
    : ""
}${
  enquiry.totalPrice !==
    null &&
  enquiry.totalPrice !==
    undefined
    ? `Project total: £${enquiry.totalPrice.toFixed(
        2
      )}
`
    : ""
}
Please reply to confirm any remaining project details.

Regards,
RAF By Design`
            : `Hi ${name},

Thank you for your design enquiry for "${enquiry.title}". We are reviewing your request and will confirm the next steps with you.

Regards,
RAF By Design`,
    });
  }

  async function sendClientEmail() {
    if (!emailState) {
      return;
    }

    try {
      setWorking(
        `email-${emailState.kind}-${emailState.id}`
      );

      setMessage("");

      const response =
        await fetch(
          "/api/admin/bookings",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify({
                kind:
                  emailState.kind,

                id:
                  emailState.id,

                action:
                  "email",

                subject:
                  emailState.subject,

                message:
                  emailState.message,
              }),
          }
        );

      const result =
        await readResponse(
          response
        );

      setEmailState(
        null
      );

      setMessage(
        `✅ Email sent to ${result.sentTo}.`
      );
    } catch (error) {
      setMessage(
        `❌ ${
          error instanceof
          Error
            ? error.message
            : "Failed to send client email."
        }`
      );
    } finally {
      setWorking(
        null
      );
    }
  }

  async function createInvoice(kind: RequestKind, id: string, stage: "deposit" | "balance") {
    let totalPrice: number | undefined;
    if (stage === "deposit") {
      const entered = window.prompt("Confirmed total service price in pounds (for example, 60.00):");
      if (entered === null) return;
      totalPrice = Number(entered);
      if (!Number.isFinite(totalPrice) || totalPrice < 1 ||
          !/^\d+(?:\.\d{1,2})?$/.test(entered.trim())) {
        setMessage("❌ Enter a valid confirmed total in pounds and pence.");
        return;
      }
    } else if (!window.confirm("The work is complete and the balance is now due. Send the invoice?")) {
      return;
    }

    try {
      setWorking(`invoice-${kind}-${id}`);
      setLastInvoiceUrl("");
      const response = await fetch("/api/admin/bookings/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ kind, id, stage, totalPrice }),
      });
      const result = await readResponse(response);
      setMessage(`✅ ${stage === "deposit" ? "Deposit" : "Balance"} invoice sent.`);
      setLastInvoiceUrl(result.invoiceUrl || "");
      await loadData();
    } catch (error) {
      setMessage(`❌ ${error instanceof Error ? error.message : "Unable to send invoice."}`);
    } finally {
      setWorking(null);
    }
  }

  return (
    <AdminLayout active="bookings">
      <div className="space-y-6 text-black [font-family:Arial,Helvetica,sans-serif]">
        {lastInvoiceUrl && (
          <a href={lastInvoiceUrl} target="_blank" rel="noopener noreferrer" className="inline-block rounded bg-blue-700 p-3 font-bold text-white underline">
            Open the invoice just sent to the client
          </a>
        )}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-black">
              Bookings &
              Enquiries
            </h1>

            <p className="mt-1 text-sm text-zinc-600">
              Review, edit,
              approve or reject
              Music and Design
              requests.
            </p>
          </div>

          <div className="rounded-lg border bg-zinc-100 px-3 py-2 text-sm">
            <span className="font-bold">
              Business email:
            </span>{" "}
            officialrafbydesign@gmail.com
          </div>
        </header>

        {message && (
          <div className="rounded-lg border bg-white px-4 py-3 text-sm font-bold shadow-sm">
            {message}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Music Requests"
            total={
              bookings.length
            }
            detail={`${pendingMusic} awaiting decision`}
          />

          <SummaryCard
            label="Design Enquiries"
            total={
              designEnquiries.length
            }
            detail={`${pendingDesign} awaiting decision`}
          />

          <SummaryCard
            label="Music Days"
            total={
              bookingDays.filter(
                (day) =>
                  day.area ===
                  "MUSIC"
              ).length
            }
            detail="Configured dates"
          />

          <SummaryCard
            label="Design Days"
            total={
              bookingDays.filter(
                (day) =>
                  day.area ===
                  "DESIGN"
              ).length
            }
            detail="Configured dates"
          />
        </section>

        <section className="space-y-6 rounded-xl border bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-xl font-black">
                Monthly
                Availability
              </h2>

              <div className="flex rounded-lg border bg-zinc-100 p-1">
                {(
                  [
                    "MUSIC",
                    "DESIGN",
                  ] as BookingArea[]
                ).map(
                  (
                    item
                  ) => (
                    <button
                      key={
                        item
                      }
                      type="button"
                      onClick={() =>
                        setArea(
                          item
                        )
                      }
                      className={`rounded px-3 py-2 text-sm font-black ${
                        area ===
                        item
                          ? "bg-black text-white"
                          : "text-zinc-700"
                      }`}
                    >
                      {
                        item
                      }
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-xs font-bold">
              <Legend
                colour="bg-white border"
                label="Undecided"
              />

              <Legend
                colour="bg-emerald-500"
                label="Free"
              />

              <Legend
                colour="bg-amber-500"
                label="Pending"
              />

              <Legend
                colour="bg-rose-500"
                label="Busy"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                changeMonth(
                  -1
                )
              }
              className="rounded border px-3 py-2 text-sm font-bold hover:bg-zinc-100"
            >
              ← Previous
            </button>

            <h3 className="text-center text-lg font-black">
              {currentMonth.toLocaleString(
                "en-GB",
                {
                  month:
                    "long",

                  year:
                    "numeric",
                }
              )}
            </h3>

            <button
              type="button"
              onClick={() =>
                changeMonth(
                  1
                )
              }
              className="rounded border px-3 py-2 text-sm font-bold hover:bg-zinc-100"
            >
              Next →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map(
              (
                day
              ) => (
                <div
                  key={
                    day
                  }
                  className="py-1 text-center text-xs font-black uppercase text-zinc-500"
                >
                  {
                    day
                  }
                </div>
              )
            )}

            {calendarDays.map(
              (
                cell
              ) => {
                const dayData =
                  daysMap.get(
                    cell.dateStr
                  );

                const cellStatus:
                  DayStatus =
                  dayData
                    ? dayData.status
                    : "TRANSPARENT";

                const selected =
                  selectedDate ===
                  cell.dateStr;

                return (
                  <button
                    key={
                      cell.dateStr
                    }
                    type="button"
                    onClick={() =>
                      handleCellClick(
                        cell.dateStr
                      )
                    }
                    className={`flex min-h-[72px] flex-col justify-between rounded border p-2 text-left transition ${
                      cell.isCurrentMonth
                        ? "opacity-100"
                        : "opacity-30"
                    } ${
                      STATUS_STYLES[
                        cellStatus
                      ]
                    } ${
                      selected
                        ? "ring-2 ring-black"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">
                        {
                          cell.dayNum
                        }
                      </span>

                      {dayData && (
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            STATUS_BADGE[
                              cellStatus
                            ]
                          }`}
                        />
                      )}
                    </div>

                    {dayData?.note && (
                      <p className="line-clamp-2 text-[10px]">
                        {
                          dayData.note
                        }
                      </p>
                    )}
                  </button>
                );
              }
            )}
          </div>

          <form
            onSubmit={
              saveBookingDay
            }
            className="grid grid-cols-1 items-end gap-3 rounded-lg border bg-zinc-50 p-4 md:grid-cols-5"
          >
            <Field
              label="Selected Date"
              type="date"
              value={
                selectedDate
              }
              onChange={
                setSelectedDate
              }
            />

            <label className="block">
              <span className="mb-1 block text-sm font-bold text-zinc-600">
                Service Area
              </span>

              <select
                value={
                  area
                }
                onChange={(
                  event
                ) =>
                  setArea(
                    event
                      .target
                      .value as BookingArea
                  )
                }
                className="w-full rounded-lg border bg-white p-2.5 text-sm"
              >
                <option value="MUSIC">
                  Music
                </option>

                <option value="DESIGN">
                  Design
                </option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-bold text-zinc-600">
                Status
              </span>

              <select
                value={
                  status
                }
                onChange={(
                  event
                ) =>
                  setStatus(
                    event
                      .target
                      .value as DayStatus
                  )
                }
                className="w-full rounded-lg border bg-white p-2.5 text-sm"
              >
                <option value="TRANSPARENT">
                  Undecided
                </option>

                <option value="GREEN">
                  Free
                </option>

                <option value="AMBER">
                  Pending
                </option>

                <option value="RED">
                  Busy
                </option>
              </select>
            </label>

            <Field
              label="Note"
              value={
                note
              }
              onChange={
                setNote
              }
            />

            <button
              disabled={
                working ===
                "calendar"
              }
              className="rounded bg-black p-2.5 text-sm font-black text-white disabled:opacity-50"
            >
              {working ===
              "calendar"
                ? "Saving..."
                : "Save Day"}
            </button>
          </form>
        </section>

        {loading ? (
          <div className="rounded-xl border bg-white p-6 font-bold">
            Loading
            requests...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">
                Music Service
                Requests
              </h2>

              <p className="mb-5 mt-1 text-sm text-zinc-600">
                Requests from
                the Music
                booking form.
              </p>

              {bookings.length ===
                0 && (
                <p className="text-sm text-zinc-500">
                  No music
                  requests found.
                </p>
              )}

              <div className="space-y-4">
                {bookings.map(
                  (
                    booking
                  ) => (
                    <article
                      key={
                        booking.id
                      }
                      className="space-y-4 rounded-xl border bg-zinc-50 p-4"
                    >
                      <RequestHeader
                        title={
                          booking
                            .service
                            ?.name ||
                          "Music Service"
                        }
                        customer={
                          booking
                            .user
                        }
                        status={
                          booking.status
                        }
                      />

                      <div className="grid gap-2 text-sm sm:grid-cols-2">
                        <Info
                          label="Company/Brand"
                          value={
                            booking.companyBrand
                          }
                        />

                        <Info
                          label="Project Type"
                          value={
                            booking.projectType
                          }
                        />

                        <Info
                          label="Music Type"
                          value={
                            booking.musicTypes
                          }
                        />

                        <Info
                          label="Main Date"
                          value={formatDate(
                            booking.date
                          )}
                        />

                        <Info
                          label="Recording Hours"
                          value={
                            booking.recordingHours
                          }
                        />

                        <Info
                          label="Recording Date"
                          value={formatDate(
                            booking.recordingDate
                          )}
                        />

                        <Info
                          label="Studio Session"
                          value={
                            booking.inStudioSession
                          }
                        />

                        <Info
                          label="Studio Date"
                          value={formatDate(
                            booking.studioSessionDate
                          )}
                        />

                        <Info
                          label="Deadline"
                          value={
                            booking.deadlineText
                          }
                        />

                        <Info
                          label="Other Audio"
                          value={
                            booking.otherAudioService
                          }
                        />
                      </div>

                      {booking.projectDescription && (
                        <DetailBox
                          title="Project Description"
                          value={
                            booking.projectDescription
                          }
                        />
                      )}

                      {(booking.editOptions ||
                        booking.editDetails) && (
                        <DetailBox
                          title="Edit Requirements"
                          value={`${infoValue(
                            booking.editOptions
                          )}

${infoValue(
  booking.editDetails
)}`}
                        />
                      )}

                      <div className="flex flex-wrap gap-2">
                        {safeReferenceLinks(booking.referenceLinks).map((url, index) => (
                          <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                            className="rounded border bg-white px-3 py-2 text-sm font-bold hover:bg-zinc-100">
                            Reference Link {index + 1}
                          </a>
                        ))}

                        {booking.referenceFileUrl && (
                          <a
                            href={
                              `/api/admin/bookings/references?kind=music&id=${encodeURIComponent(booking.id)}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="rounded border bg-white px-3 py-2 text-sm font-bold hover:bg-zinc-100"
                          >
                            Uploaded
                            Reference
                          </a>
                        )}
                      </div>

                      {booking.adminNotes && (
                        <DetailBox
                          title="Admin Notes"
                          value={
                            booking.adminNotes
                          }
                          warning
                        />
                      )}

                      <PaymentPanel
                        payments={booking.payments || []}
                        approved={booking.status.toLowerCase() === "approved"}
                        onCreate={(stage) => createInvoice("music", booking.id, stage)}
                        working={working === `invoice-music-${booking.id}`}
                      />

                      <RequestActions
                        kind="music"
                        id={
                          booking.id
                        }
                        status={
                          booking.status
                        }
                        working={
                          working
                        }
                        onEdit={() =>
                          openMusicEdit(
                            booking
                          )
                        }
                        onApprove={() =>
                          changeRequestStatus(
                            "music",
                            booking.id,
                            "approve"
                          )
                        }
                        onReject={() =>
                          changeRequestStatus(
                            "music",
                            booking.id,
                            "reject"
                          )
                        }
                        onEmail={() =>
                          openMusicEmail(
                            booking
                          )
                        }
                      />
                    </article>
                  )
                )}
              </div>
            </section>

            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">
                Design
                Enquiries
              </h2>

              <p className="mb-5 mt-1 text-sm text-zinc-600">
                Requests from
                the Design
                enquiry form.
              </p>

              {designEnquiries.length ===
                0 && (
                <p className="text-sm text-zinc-500">
                  No design
                  enquiries
                  found.
                </p>
              )}

              <div className="space-y-4">
                {designEnquiries.map(
                  (
                    enquiry
                  ) => (
                    <article
                      key={
                        enquiry.id
                      }
                      className="space-y-4 rounded-xl border bg-zinc-50 p-4"
                    >
                      <RequestHeader
                        title={
                          enquiry.title
                        }
                        customer={
                          enquiry.user
                        }
                        status={
                          enquiry.status
                        }
                      />

                      <div className="grid gap-2 text-sm sm:grid-cols-2">
                        <Info
                          label="Company/Brand"
                          value={
                            enquiry.companyBrand
                          }
                        />

                        <Info
                          label="Services"
                          value={
                            enquiry.services
                          }
                        />

                        <Info
                          label="Deadline"
                          value={formatDate(
                            enquiry.deadline
                          )}
                        />

                        <Info
                          label="Extra Revisions"
                          value={
                            enquiry.extraRevisions
                              ? "Yes"
                              : "No"
                          }
                        />

                        <Info
                          label="Payment"
                          value={
                            enquiry.paymentOption
                          }
                        />

                        <Info
                          label="Total"
                          value={
                            enquiry.totalPrice ===
                              null ||
                            enquiry.totalPrice ===
                              undefined
                              ? "—"
                              : `£${enquiry.totalPrice.toFixed(
                                  2
                                )}`
                          }
                        />

                        <Info
                          label="Due Now"
                          value={
                            enquiry.dueNow ===
                              null ||
                            enquiry.dueNow ===
                              undefined
                              ? "—"
                              : `£${enquiry.dueNow.toFixed(
                                  2
                                )}`
                          }
                        />

                        <Info
                          label="Submitted"
                          value={formatDate(
                            enquiry.createdAt
                          )}
                        />
                      </div>

                      <DetailBox
                        title="Project Details"
                        value={
                          enquiry.details
                        }
                      />

                      {enquiry.fileUrls
                        ?.length >
                        0 && (
                        <div className="flex flex-wrap gap-2">
                          {enquiry.fileUrls.map(
                            (
                              _url,
                              index
                            ) => (
                              <a
                                key={
                                  index
                                }
                                href={
                                  `/api/admin/bookings/references?kind=design&id=${encodeURIComponent(enquiry.id)}&index=${index}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="rounded border bg-white px-3 py-2 text-sm font-bold hover:bg-zinc-100"
                              >
                                Reference{" "}
                                {index +
                                  1}
                              </a>
                            )
                          )}
                        </div>
                      )}

                      {enquiry.adminNotes && (
                        <DetailBox
                          title="Admin Notes"
                          value={
                            enquiry.adminNotes
                          }
                          warning
                        />
                      )}

                      <PaymentPanel
                        payments={enquiry.payments || []}
                        approved={enquiry.status.toLowerCase() === "approved"}
                        onCreate={(stage) => createInvoice("design", enquiry.id, stage)}
                        working={working === `invoice-design-${enquiry.id}`}
                      />

                      <RequestActions
                        kind="design"
                        id={
                          enquiry.id
                        }
                        status={
                          enquiry.status
                        }
                        working={
                          working
                        }
                        onEdit={() =>
                          openDesignEdit(
                            enquiry
                          )
                        }
                        onApprove={() =>
                          changeRequestStatus(
                            "design",
                            enquiry.id,
                            "approve"
                          )
                        }
                        onReject={() =>
                          changeRequestStatus(
                            "design",
                            enquiry.id,
                            "reject"
                          )
                        }
                        onEmail={() =>
                          openDesignEmail(
                            enquiry
                          )
                        }
                      />
                    </article>
                  )
                )}
              </div>
            </section>
          </div>
        )}

        {editing && (
          <EditRequestModal
            editing={
              editing
            }
            working={
              working
            }
            onChange={
              updateEditingField
            }
            onSave={
              saveRequestEdit
            }
            onClose={() =>
              setEditing(
                null
              )
            }
          />
        )}

        {emailState && (
          <EmailModal
            emailState={
              emailState
            }
            working={
              working
            }
            onChange={
              setEmailState
            }
            onSend={
              sendClientEmail
            }
            onClose={() =>
              setEmailState(
                null
              )
            }
          />
        )}
      </div>
    </AdminLayout>
  );
}

function SummaryCard({
  label,
  total,
  detail,
}: {
  label: string;
  total: number;
  detail: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-sm font-black uppercase text-zinc-600">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black">
        {total}
      </p>

      <p className="mt-1 text-sm text-amber-700">
        {detail}
      </p>
    </div>
  );
}

function Legend({
  colour,
  label,
}: {
  colour: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1">
      <span
        className={`h-3 w-3 rounded-full ${colour}`}
      />

      {label}
    </span>
  );
}

function RequestHeader({
  title,
  customer,
  status,
}: {
  title: string;
  customer?: Customer;
  status: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-black text-zinc-900">
          {title}
        </h3>

        <p className="text-sm text-zinc-700">
          {customer?.name ||
            "Client"}{" "}
          ·{" "}
          {customer?.email ||
            "No email"}
        </p>
      </div>

      <span
        className={`rounded-full border px-2.5 py-1 text-xs font-black ${statusClass(
          status
        )}`}
      >
        {statusLabel(
          status
        )}
      </span>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  return (
    <p>
      <strong>
        {label}:
      </strong>{" "}
      {infoValue(
        value
      )}
    </p>
  );
}

function DetailBox({
  title,
  value,
  warning = false,
}: {
  title: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        warning
          ? "border-amber-200 bg-amber-50"
          : "bg-white"
      }`}
    >
      <p className="mb-1 text-sm font-black text-zinc-600">
        {title}
      </p>

      <p className="whitespace-pre-wrap text-sm text-zinc-800">
        {value}
      </p>
    </div>
  );
}

function PaymentPanel({
  payments,
  approved,
  onCreate,
  working,
}: {
  payments: ServicePayment[];
  approved: boolean;
  onCreate: (stage: "deposit" | "balance") => void;
  working: boolean;
}) {
  const deposit = payments.find((payment) => payment.stage === "deposit");
  const balance = payments.find((payment) => payment.stage === "balance");
  const full = payments.find((payment) => payment.stage === "full");

  return (
    <div className="rounded-lg border border-blue-300 bg-blue-50 p-3 text-sm">
      <p className="font-bold">Payment</p>
      {payments.length === 0 && <p>No payment requested yet.</p>}
      {payments.map((payment) => (
        <p key={payment.id}>
          {payment.stage}: £{(payment.amount / 100).toFixed(2)} — {payment.status}
        </p>
      ))}
      {approved && !full && !deposit && (
        <button type="button" disabled={working} onClick={() => onCreate("deposit")}
          className="mt-2 rounded bg-blue-700 px-3 py-2 font-bold text-white disabled:opacity-50">
          Send 50% deposit invoice
        </button>
      )}
      {approved && deposit && deposit.status !== "paid" && (
        <button type="button" disabled={working} onClick={() => onCreate("deposit")}
          className="mt-2 rounded bg-blue-700 px-3 py-2 font-bold text-white disabled:opacity-50">
          Open or retry deposit invoice
        </button>
      )}
      {approved && deposit?.status === "paid" && !balance && (
        <button type="button" disabled={working} onClick={() => onCreate("balance")}
          className="mt-2 rounded bg-blue-700 px-3 py-2 font-bold text-white disabled:opacity-50">
          Send balance invoice after work is complete
        </button>
      )}
      {approved && balance && balance.status !== "paid" && (
        <button type="button" disabled={working} onClick={() => onCreate("balance")}
          className="mt-2 rounded bg-blue-700 px-3 py-2 font-bold text-white disabled:opacity-50">
          Open or retry balance invoice
        </button>
      )}
    </div>
  );
}

function RequestActions({
  kind,
  id,
  status,
  working,
  onEdit,
  onApprove,
  onReject,
  onEmail,
}: {
  kind: RequestKind;
  id: string;
  status: string;
  working: string | null;
  onEdit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onEmail: () => void;
}) {
  const normalised =
    status.toLowerCase();

  return (
    <div className="flex flex-wrap gap-2 border-t pt-3">
      <button
        type="button"
        onClick={
          onEdit
        }
        className="rounded bg-zinc-900 px-3 py-2 text-sm font-bold text-white hover:bg-black"
      >
        Edit Details
      </button>

      <button
        type="button"
        disabled={
          working ===
            `approve-${kind}-${id}` ||
          normalised ===
            "approved"
        }
        onClick={
          onApprove
        }
        className="rounded bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
      >
        Approve
      </button>

      <button
        type="button"
        disabled={
          working ===
            `reject-${kind}-${id}` ||
          normalised ===
            "rejected"
        }
        onClick={
          onReject
        }
        className="rounded bg-rose-600 px-3 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-40"
      >
        Reject
      </button>

      <button
        type="button"
        onClick={
          onEmail
        }
        className="rounded bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
      >
        Email Client
      </button>
    </div>
  );
}

function EditRequestModal({
  editing,
  working,
  onChange,
  onSave,
  onClose,
}: {
  editing: NonNullable<EditingState>;
  working: string | null;

  onChange: (
    key: string,
    value:
      | string
      | number
      | boolean
  ) => void;

  onSave: () => void;
  onClose: () => void;
}) {
  const saving =
    working ===
    `edit-${editing.kind}-${editing.id}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-5">
          <div>
            <h2 className="text-xl font-black">
              Edit{" "}
              {editing.kind ===
              "music"
                ? "Music Request"
                : "Design Enquiry"}
            </h2>

            <p className="text-sm text-zinc-500">
              Changes are
              saved to the
              request.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded border px-3 py-2 font-bold"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="rounded border bg-zinc-50 p-3 text-sm">
            <strong>Client:</strong> {editing.data.name || "—"}
          </div>
          <div className="rounded border bg-zinc-50 p-3 text-sm">
            <strong>Email:</strong> {editing.data.email || "—"}
          </div>

          {editing.kind ===
          "music" ? (
            <>
              <Field
                label="Service"
                value={
                  editing.data.serviceType
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "serviceType",
                    value
                  )
                }
              />

              <Field
                label="Company / Brand"
                value={
                  editing.data.companyBrand
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "companyBrand",
                    value
                  )
                }
              />

              <Field
                label="Project Type"
                value={
                  editing.data.projectType
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "projectType",
                    value
                  )
                }
              />

              <Field
                label="Music Types / Genres"
                value={
                  editing.data.musicTypes
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "musicTypes",
                    value
                  )
                }
              />

              <Field
                label="Main Date"
                type="date"
                value={
                  editing.data.date
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "date",
                    value
                  )
                }
              />

              <Field
                label="Deadline"
                value={
                  editing.data.deadlineText
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "deadlineText",
                    value
                  )
                }
              />

              <Field
                label="Recording Hours"
                value={
                  editing.data.recordingHours
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "recordingHours",
                    value
                  )
                }
              />

              <Field
                label="Recording Date"
                type="date"
                value={
                  editing.data.recordingDate
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "recordingDate",
                    value
                  )
                }
              />

              <Field
                label="Studio Session?"
                value={
                  editing.data.inStudioSession
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "inStudioSession",
                    value
                  )
                }
              />

              <Field
                label="Studio Session Date"
                type="date"
                value={
                  editing.data.studioSessionDate
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "studioSessionDate",
                    value
                  )
                }
              />

              <Field
                label="Edit Options"
                value={
                  editing.data.editOptions
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "editOptions",
                    value
                  )
                }
              />

              <Field
                label="Other Audio Service"
                value={
                  editing.data.otherAudioService
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "otherAudioService",
                    value
                  )
                }
              />

              <Field
                label="Reference Links"
                value={
                  editing.data.referenceLinks
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "referenceLinks",
                    value
                  )
                }
              />

              <TextAreaField
                label="Project Description"
                value={
                  editing.data.projectDescription
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "projectDescription",
                    value
                  )
                }
              />

              <TextAreaField
                label="Edit Details"
                value={
                  editing.data.editDetails
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "editDetails",
                    value
                  )
                }
              />

              <TextAreaField
                label="Admin Notes"
                value={
                  editing.data.adminNotes
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "adminNotes",
                    value
                  )
                }
              />
            </>
          ) : (
            <>
              <Field
                label="Project Title"
                value={
                  editing.data.title
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "title",
                    value
                  )
                }
              />

              <Field
                label="Company / Brand"
                value={
                  editing.data.companyBrand
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "companyBrand",
                    value
                  )
                }
              />

              <Field
                label="Services"
                value={
                  editing.data.services
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "services",
                    value
                  )
                }
              />

              <Field
                label="Deadline"
                type="date"
                value={
                  editing.data.deadline
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "deadline",
                    value
                  )
                }
              />

              <Field
                label="Payment Option"
                value={
                  editing.data.paymentOption
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "paymentOption",
                    value
                  )
                }
              />

              <Field
                label="Total Price (£)"
                type="number"
                value={
                  editing.data.totalPrice
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "totalPrice",
                    value
                  )
                }
              />

              <Field
                label="Amount Due (£)"
                type="number"
                value={
                  editing.data.dueNow
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "dueNow",
                    value
                  )
                }
              />

              <label className="flex items-center gap-3 rounded-lg border p-3">
                <input
                  type="checkbox"
                  checked={Boolean(
                    editing.data.extraRevisions
                  )}
                  onChange={(
                    event
                  ) =>
                    onChange(
                      "extraRevisions",
                      event
                        .target
                        .checked
                    )
                  }
                />

                <span className="text-sm font-bold">
                  Extra Revision
                  Requested
                </span>
              </label>

              <TextAreaField
                label="Project Details"
                value={
                  editing.data.details
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "details",
                    value
                  )
                }
              />

              <TextAreaField
                label="Admin Notes"
                value={
                  editing.data.adminNotes
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "adminNotes",
                    value
                  )
                }
              />
            </>
          )}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-white p-5">
          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded border px-4 py-2 text-sm font-bold"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              onSave
            }
            className="rounded bg-black px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmailModal({
  emailState,
  working,
  onChange,
  onSend,
  onClose,
}: {
  emailState: NonNullable<EmailState>;
  working: string | null;

  onChange: React.Dispatch<
    React.SetStateAction<EmailState>
  >;

  onSend: () => void;
  onClose: () => void;
}) {
  const sending =
    working ===
    `email-${emailState.kind}-${emailState.id}`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="text-xl font-black">
              Email Client
            </h2>

            <p className="text-sm text-zinc-500">
              To:{" "}
              {emailState.email ||
                "No email"}
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded border px-3 py-2 font-bold"
          >
            Close
          </button>
        </div>

        <div className="space-y-4 p-5">
          <Field
            label="Subject"
            value={
              emailState.subject
            }
            onChange={(
              value
            ) =>
              onChange(
                (
                  current
                ) =>
                  current
                    ? {
                        ...current,

                        subject:
                          value,
                      }
                    : current
              )
            }
          />

          <TextAreaField
            label="Message"
            rows={12}
            value={
              emailState.message
            }
            onChange={(
              value
            ) =>
              onChange(
                (
                  current
                ) =>
                  current
                    ? {
                        ...current,

                        message:
                          value,
                      }
                    : current
              )
            }
          />
        </div>

        <div className="flex justify-end gap-2 border-t p-5">
          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded border px-4 py-2 text-sm font-bold"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              !emailState.email ||
              sending
            }
            onClick={
              onSend
            }
            className="rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {sending
              ? "Sending..."
              : "Send Email"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;

  value:
    | string
    | number
    | boolean
    | undefined;

  onChange: (
    value: string
  ) => void;

  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-zinc-600">
        {label}
      </span>

      <input
        type={
          type
        }
        step={
          type ===
          "number"
            ? "0.01"
            : undefined
        }
        value={
          typeof value ===
          "boolean"
            ? ""
            : value ?? ""
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        className="w-full rounded-lg border bg-white p-2.5 text-sm"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;

  value:
    | string
    | number
    | boolean
    | undefined;

  onChange: (
    value: string
  ) => void;

  rows?: number;
}) {
  return (
    <label className="block sm:col-span-2">
      <span className="mb-1 block text-sm font-bold text-zinc-600">
        {label}
      </span>

      <textarea
        rows={
          rows
        }
        value={
          typeof value ===
          "boolean"
            ? ""
            : value ?? ""
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        className="w-full resize-y rounded-lg border bg-white p-2.5 text-sm"
      />
    </label>
  );
}
