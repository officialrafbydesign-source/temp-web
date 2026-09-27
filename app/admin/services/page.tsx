"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import CloudinaryImagePicker from "@/components/admin/CloudinaryImagePicker";

type DesignServiceItem = {
  id?: string;
  title: string;
  price: number;
  imageUrl: string;
  description: string;
  category: string;
};

const emptyServiceForm: DesignServiceItem = {
  title: "",
  price: 0,
  imageUrl: "",
  description: "",
  category: "Design",
};

export default function AdminServicesPage() {
  const [
    services,
    setServices,
  ] = useState<
    DesignServiceItem[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    serviceForm,
    setServiceForm,
  ] = useState<DesignServiceItem>(
    emptyServiceForm
  );

  const fetchDesignServices =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const response =
            await fetch(
              "/api/admin/designservices",
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
            await response.json();

          if (
            !response.ok
          ) {
            throw new Error(
              data.error ||
                "Failed to load design services"
            );
          }

          setServices(
            Array.isArray(
              data.services
            )
              ? data.services
              : []
          );
        } catch (error) {
          console.error(
            "Failed loading design services:",
            error
          );

          setError(
            error instanceof
              Error
              ? error.message
              : "Failed to load design services"
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
    fetchDesignServices();
  }, [
    fetchDesignServices,
  ]);

  const handleSaveService =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setError("");
      setSuccessMessage("");
      setSaving(true);

      try {
        const response =
          await fetch(
            "/api/admin/designservices",
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
                JSON.stringify(
                  serviceForm
                ),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data.error ||
              "Failed to save design service"
          );
        }

        setSuccessMessage(
          serviceForm.id
            ? "Design service updated successfully."
            : "Design service created successfully."
        );

        setServiceForm(
          emptyServiceForm
        );

        await fetchDesignServices();
      } catch (error) {
        console.error(
          "Design service save error:",
          error
        );

        setError(
          error instanceof
            Error
            ? error.message
            : "Failed to save design service"
        );
      } finally {
        setSaving(false);
      }
    };

  const handleLoadService =
    (
      service: DesignServiceItem
    ) => {
      setError("");
      setSuccessMessage("");

      setServiceForm({
        id: service.id,
        title:
          service.title,
        price:
          service.price,
        imageUrl:
          service.imageUrl ||
          "",
        description:
          service.description ||
          "",
        category:
          service.category ||
          "Design",
      });

      window.scrollTo({
        top: 0,
        behavior:
          "smooth",
      });
    };

  const handleNewService =
    () => {
      setServiceForm(
        emptyServiceForm
      );

      setError("");
      setSuccessMessage("");
    };

  return (
    <main className="max-w-5xl mx-auto p-6 sm:p-8 [font-family:Arial,Helvetica,sans-serif] space-y-8">
      <header className="border-b-4 border-black pb-4">
        <h1 className="text-2xl sm:text-3xl font-black uppercase text-red-600">
          Design Service Manager
        </h1>

        <p className="mt-2 text-sm text-zinc-700">
          Create and update
          design services,
          prices and
          Cloudinary artwork.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border-2 border-red-700 bg-red-50 px-4 py-3 font-bold text-red-700"
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border-2 border-green-700 bg-green-50 px-4 py-3 font-bold text-green-800"
        >
          {
            successMessage
          }
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <form
          onSubmit={
            handleSaveService
          }
          className="rounded-xl border-4 border-black bg-zinc-950 p-6 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-black uppercase">
              {serviceForm.id
                ? "Edit Design Service"
                : "New Design Service"}
            </h2>

            {serviceForm.id && (
              <button
                type="button"
                onClick={
                  handleNewService
                }
                className="rounded border border-white bg-zinc-800 px-3 py-2 text-xs font-bold uppercase text-white transition hover:bg-zinc-700"
              >
                New Service
              </button>
            )}
          </div>

          <div>
            <label
              htmlFor="service-title"
              className="mb-2 block text-xs font-bold uppercase text-zinc-300"
            >
              Service title
            </label>

            <input
              id="service-title"
              type="text"
              required
              maxLength={150}
              value={
                serviceForm.title
              }
              onChange={(
                event
              ) =>
                setServiceForm(
                  (
                    current
                  ) => ({
                    ...current,

                    title:
                      event
                        .target
                        .value,
                  })
                )
              }
              className="w-full rounded border-2 border-black bg-zinc-900 p-3 text-base font-bold text-white outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="service-category"
              className="mb-2 block text-xs font-bold uppercase text-zinc-300"
            >
              Category
            </label>

            <input
              id="service-category"
              type="text"
              required
              maxLength={100}
              value={
                serviceForm.category
              }
              onChange={(
                event
              ) =>
                setServiceForm(
                  (
                    current
                  ) => ({
                    ...current,

                    category:
                      event
                        .target
                        .value,
                  })
                )
              }
              className="w-full rounded border-2 border-black bg-zinc-900 p-3 text-base font-bold text-white outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="service-price"
              className="mb-2 block text-xs font-bold uppercase text-zinc-300"
            >
              Price (£)
            </label>

            <input
              id="service-price"
              type="number"
              required
              min="0"
              step="0.01"
              value={
                serviceForm.price
              }
              onChange={(
                event
              ) =>
                setServiceForm(
                  (
                    current
                  ) => ({
                    ...current,

                    price:
                      Number(
                        event
                          .target
                          .value
                      ),
                  })
                )
              }
              className="w-full rounded border-2 border-black bg-zinc-900 p-3 text-base font-bold text-white outline-none focus:border-red-500"
            />

            <p className="mt-2 text-xs text-zinc-400">
              Enter the price
              in pounds. For
              example, enter 60
              for £60.
            </p>
          </div>

          <div>
            <label
              htmlFor="service-description"
              className="mb-2 block text-xs font-bold uppercase text-zinc-300"
            >
              Description
            </label>

            <textarea
              id="service-description"
              rows={5}
              value={
                serviceForm.description
              }
              onChange={(
                event
              ) =>
                setServiceForm(
                  (
                    current
                  ) => ({
                    ...current,

                    description:
                      event
                        .target
                        .value,
                  })
                )
              }
              className="w-full resize-y rounded border-2 border-black bg-zinc-900 p-3 text-base text-white outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-zinc-300">
              Service image
              (Cloudinary)
            </label>

            <CloudinaryImagePicker
              folder="design/services"
              currentValue={
                serviceForm.imageUrl
              }
              onSelectImage={(
                selectedUrl
              ) =>
                setServiceForm(
                  (
                    current
                  ) => ({
                    ...current,

                    imageUrl:
                      selectedUrl,
                  })
                )
              }
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded border-2 border-black bg-red-600 py-3 font-black uppercase text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : serviceForm.id
                ? "Update Design Service"
                : "Create Design Service"}
          </button>
        </form>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-black uppercase text-zinc-800">
              Design Services
              ({
                services.length
              })
            </h2>

            <button
              type="button"
              onClick={
                handleNewService
              }
              className="rounded border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase text-black transition hover:bg-zinc-100"
            >
              Add New
            </button>
          </div>

          {loading ? (
            <div className="rounded-xl border-2 border-black bg-zinc-950 p-5 text-sm font-bold text-white">
              Loading
              services...
            </div>
          ) : services.length ===
            0 ? (
            <div className="rounded-xl border-2 border-black bg-zinc-950 p-5 text-sm text-zinc-300">
              No design
              services have
              been added yet.
            </div>
          ) : (
            <div className="space-y-3">
              {services.map(
                (service) => (
                  <article
                    key={
                      service.id
                    }
                    className={`rounded-xl border-2 p-4 ${
                      serviceForm.id ===
                      service.id
                        ? "border-red-600 bg-red-950"
                        : "border-black bg-zinc-950"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        {service.imageUrl ? (
                          <img
                            src={
                              service.imageUrl
                            }
                            alt={
                              service.title
                            }
                            className="h-16 w-16 shrink-0 rounded border-2 border-black bg-zinc-900 object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border-2 border-zinc-700 bg-zinc-900 px-1 text-center text-[9px] font-bold uppercase text-zinc-400">
                            No image
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black uppercase text-white">
                            {
                              service.title
                            }
                          </p>

                          <p className="mt-1 text-xs font-bold text-zinc-400">
                            {service.category ||
                              "Design"}
                          </p>

                          <p className="mt-1 text-sm font-black text-red-400">
                            £
                            {Number(
                              service.price
                            ).toFixed(
                              2
                            )}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleLoadService(
                            service
                          )
                        }
                        className="shrink-0 rounded border border-white bg-zinc-800 px-3 py-2 text-xs font-bold uppercase text-white transition hover:bg-zinc-700"
                      >
                        Edit
                      </button>
                    </div>

                    {service.description && (
                      <p className="mt-4 border-t border-zinc-800 pt-3 text-sm leading-6 text-zinc-300">
                        {
                          service.description
                        }
                      </p>
                    )}
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}