"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

type Variant = {
  size: string;
  color: string;
  stock: string;
  sku: string;
};

type Product = {
  id: string;
  name: string;
  brand?: string | null;
  range?: string | null;
  category?: string | null;
  description?: string | null;
  price: number;
  salePrice?: number | null;
  imageUrls: string[];
  sku?: string | null;
  tags: string[];

  variants: {
    id: string;
    size: string;
    color: string;
    stock: number;
    sku?: string | null;
  }[];
};

const CLOTHING_RANGES = [
  {
    label: "Originals Range",
    value: "originals",
  },
  {
    label: "State of Mind Range",
    value: "state-of-mind",
  },
  {
    label: "4 Elements Range",
    value: "4-elements",
  },
  {
    label: "#KeepIt100 Range",
    value: "keepit100",
  },
  {
    label: "Accessories / Merch",
    value: "accessories-merch",
  },
];

const emptyVariant = (): Variant => ({
  size: "",
  color: "",
  stock: "",
  sku: "",
});

function getRangeLabel(value?: string | null) {
  if (!value) return "Unassigned";

  return (
    CLOTHING_RANGES.find((range) => range.value === value)
      ?.label || value
  );
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [viewMode, setViewMode] =
    useState<"table" | "cards">("table");

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("HipHop100");
  const [range, setRange] = useState("originals");
  const [category, setCategory] = useState("T-Shirt");
  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");

  const [imageUrls, setImageUrls] = useState("");

  const [sku, setSku] = useState("");
  const [tags, setTags] = useState("");

  const [variants, setVariants] = useState<Variant[]>([
    {
      size: "S",
      color: "",
      stock: "",
      sku: "",
    },
    {
      size: "M",
      color: "",
      stock: "",
      sku: "",
    },
    {
      size: "L",
      color: "",
      stock: "",
      sku: "",
    },
    {
      size: "XL",
      color: "",
      stock: "",
      sku: "",
    },
    {
      size: "XXL",
      color: "",
      stock: "",
      sku: "",
    },
  ]);

  async function loadProducts() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/clothing");

      if (!res.ok) {
        throw new Error(
          "Failed to load clothing catalogue"
        );
      }

      const rawData = await res.json();

      let list: Product[] = [];

      if (Array.isArray(rawData)) {
        list = rawData;
      } else if (Array.isArray(rawData.products)) {
        list = rawData.products;
      } else if (Array.isArray(rawData.clothing)) {
        list = rawData.clothing;
      } else if (Array.isArray(rawData.data)) {
        list = rawData.data;
      } else if (Array.isArray(rawData.items)) {
        list = rawData.items;
      }

      setProducts(list);
    } catch (err) {
      console.error(
        "Failed to fetch clothing items:",
        err
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) => {
      const q = search.toLowerCase();

      if (!q) return true;

      return (
        product.name?.toLowerCase().includes(q) ||
        product.brand?.toLowerCase().includes(q) ||
        product.range?.toLowerCase().includes(q) ||
        getRangeLabel(product.range)
          .toLowerCase()
          .includes(q) ||
        product.category
          ?.toLowerCase()
          .includes(q) ||
        product.sku?.toLowerCase().includes(q) ||
        product.tags
          ?.join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
  );

  function resetForm() {
    setEditingId(null);

    setName("");
    setBrand("HipHop100");
    setRange("originals");
    setCategory("T-Shirt");
    setDescription("");

    setPrice("");
    setSalePrice("");

    setImageUrls("");

    setSku("");
    setTags("");

    setVariants([
      {
        size: "S",
        color: "",
        stock: "",
        sku: "",
      },
      {
        size: "M",
        color: "",
        stock: "",
        sku: "",
      },
      {
        size: "L",
        color: "",
        stock: "",
        sku: "",
      },
      {
        size: "XL",
        color: "",
        stock: "",
        sku: "",
      },
      {
        size: "XXL",
        color: "",
        stock: "",
        sku: "",
      },
    ]);
  }

  function handleSearchSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSearch(searchInput.trim());
  }

  function clearSearch() {
    setSearch("");
    setSearchInput("");
  }

  function updateVariant(
    index: number,
    field: keyof Variant,
    value: string
  ) {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      )
    );
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      emptyVariant(),
    ]);
  }

  function removeVariant(index: number) {
    setVariants((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  function handleEdit(product: Product) {
    setEditingId(product.id);

    setName(product.name || "");

    setBrand(
      product.brand || "HipHop100"
    );

    setRange(
      product.range || "originals"
    );

    setCategory(
      product.category || "T-Shirt"
    );

    setDescription(
      product.description || ""
    );

    setPrice(
      String(product.price ?? "")
    );

    setSalePrice(
      product.salePrice !== null &&
        product.salePrice !== undefined
        ? String(product.salePrice)
        : ""
    );

    setImageUrls(
      product.imageUrls?.join(", ") || ""
    );

    setSku(product.sku || "");

    setTags(
      product.tags?.join(", ") || ""
    );

    setVariants(
      product.variants?.length
        ? product.variants.map((v) => ({
            size: v.size || "",
            color: v.color || "",
            stock: String(v.stock ?? ""),
            sku: v.sku || "",
          }))
        : [emptyVariant()]
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: string) {
    const confirmed = confirm(
      "Delete this clothing item?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/admin/clothing?id=${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      setProducts((prev) =>
        prev.filter((p) => p.id !== id)
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error(err);

      alert(
        "Failed to delete product."
      );
    }
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch(
        "/api/admin/clothing",
        {
          method: editingId
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: editingId,
            name,
            brand,
            range,
            category,
            description,
            price: Number(price),

            salePrice: salePrice
              ? Number(salePrice)
              : null,

            imageUrls,
            sku,
            tags,
            variants,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Save failed"
        );
      }

      if (editingId) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? data
              : p
          )
        );

        setMessage(
          "✅ Clothing item updated."
        );
      } else {
        setProducts((prev) => [
          data,
          ...prev,
        ]);

        setMessage(
          "✅ Clothing item added."
        );
      }

      resetForm();
    } catch (err: any) {
      console.error(err);

      setMessage(
        `❌ ${
          err?.message ||
          "Failed to save clothing."
        }`
      );
    } finally {
      setSubmitting(false);
    }
  }

  const imageList = imageUrls
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  return (
    <AdminLayout active="orders">
      <div className="space-y-8 text-black">
        <h1 className="text-3xl font-bold">
          👕 Clothing Admin
        </h1>

        {message && (
          <div className="rounded border border-zinc-300 bg-zinc-100 p-3 font-semibold">
            {message}
          </div>
        )}

        {/* ADD / EDIT FORM */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border border-zinc-200 p-6 rounded-lg shadow"
        >
          <h2 className="md:col-span-2 text-xl font-bold">
            {editingId
              ? "Edit Clothing Item"
              : "Add Clothing Item"}
          </h2>

          <input
            className="border p-2 rounded"
            placeholder="Product Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />

          <input
            className="border p-2 rounded"
            placeholder="Brand"
            value={brand}
            onChange={(e) =>
              setBrand(e.target.value)
            }
          />

          {/* RANGE */}
          <div className="space-y-1">
            <label className="text-sm font-semibold">
              Clothing Range
            </label>

            <select
              className="border p-2 rounded w-full"
              value={range}
              onChange={(e) =>
                setRange(e.target.value)
              }
            >
              {CLOTHING_RANGES.map(
                (rangeOption) => (
                  <option
                    key={
                      rangeOption.value
                    }
                    value={
                      rangeOption.value
                    }
                  >
                    {
                      rangeOption.label
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {/* CATEGORY */}
          <div className="space-y-1">
            <label className="text-sm font-semibold">
              Product Category
            </label>

            <select
              className="border p-2 rounded w-full"
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
            >
              <option value="T-Shirt">
                T-Shirt
              </option>

              <option value="Hoodie">
                Hoodie
              </option>

              <option value="Jumper">
                Jumper
              </option>

              <option value="Hat">
                Hat
              </option>

              <option value="Cap">
                Cap
              </option>

              <option value="Beanie">
                Beanie
              </option>

              <option value="Sticker">
                Sticker
              </option>

              <option value="Keyring">
                Keyring
              </option>

              <option value="Canvas">
                Canvas
              </option>

              <option value="Poster">
                Poster
              </option>

              <option value="Magnet">
                Magnet
              </option>

              <option value="Accessory">
                Accessory
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          <input
            className="border p-2 rounded"
            type="number"
            placeholder="Price (£)"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
            required
          />

          <input
            className="border p-2 rounded"
            type="number"
            placeholder="Sale Price (£)"
            value={salePrice}
            onChange={(e) =>
              setSalePrice(
                e.target.value
              )
            }
          />

          <input
            className="border p-2 rounded md:col-span-2"
            placeholder="Main SKU"
            value={sku}
            onChange={(e) =>
              setSku(e.target.value)
            }
          />

          <input
            className="border p-2 rounded md:col-span-2"
            placeholder="Cloudinary Image URLs (comma-separated)"
            value={imageUrls}
            onChange={(e) =>
              setImageUrls(
                e.target.value
              )
            }
          />

          {imageList.length > 0 && (
            <div className="md:col-span-2">
              <p className="font-semibold mb-2">
                Image Preview
              </p>

              <div className="flex flex-wrap gap-3">
                {imageList.map(
                  (url) => (
                    <img
                      key={url}
                      src={url}
                      alt="Product preview"
                      className="w-32 aspect-square object-cover rounded border"
                    />
                  )
                )}
              </div>
            </div>
          )}

          <input
            className="border p-2 rounded md:col-span-2"
            placeholder="Tags (comma-separated)"
            value={tags}
            onChange={(e) =>
              setTags(e.target.value)
            }
          />

          <textarea
            className="border p-2 rounded md:col-span-2"
            placeholder="Product Description"
            rows={4}
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />

          {/* VARIANTS */}
          <div className="md:col-span-2 border border-zinc-200 rounded p-4 space-y-3">
            <h2 className="font-bold text-lg">
              Variants / Stock
            </h2>

            {variants.map(
              (variant, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-5 gap-2 border-b pb-3"
                >
                  <input
                    className="border p-2 rounded"
                    placeholder="Size"
                    value={variant.size}
                    onChange={(e) =>
                      updateVariant(
                        index,
                        "size",
                        e.target.value
                      )
                    }
                  />

                  <input
                    className="border p-2 rounded"
                    placeholder="Colour"
                    value={
                      variant.color
                    }
                    onChange={(e) =>
                      updateVariant(
                        index,
                        "color",
                        e.target.value
                      )
                    }
                  />

                  <input
                    className="border p-2 rounded"
                    type="number"
                    min="0"
                    placeholder="Stock"
                    value={
                      variant.stock
                    }
                    onChange={(e) =>
                      updateVariant(
                        index,
                        "stock",
                        e.target.value
                      )
                    }
                  />

                  <input
                    className="border p-2 rounded"
                    placeholder="Variant SKU"
                    value={variant.sku}
                    onChange={(e) =>
                      updateVariant(
                        index,
                        "sku",
                        e.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeVariant(
                        index
                      )
                    }
                    className="bg-red-600 text-white px-3 py-2 rounded"
                  >
                    Remove
                  </button>
                </div>
              )
            )}

            <button
              type="button"
              onClick={addVariant}
              className="bg-zinc-800 text-white px-4 py-2 rounded"
            >
              Add Variant
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="md:col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : editingId
              ? "Update Clothing"
              : "Save Clothing"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="md:col-span-2 bg-zinc-600 text-white py-2 rounded hover:bg-zinc-700"
            >
              Cancel Edit
            </button>
          )}
        </form>

        {/* CATALOGUE CONTROLS */}
        <div className="bg-white border border-zinc-200 p-6 rounded-lg shadow space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">
              Clothing Catalogue
            </h2>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setViewMode("table")
                }
                className={`px-4 py-2 rounded font-semibold ${
                  viewMode === "table"
                    ? "bg-green-600 text-white"
                    : "bg-zinc-200 text-black"
                }`}
              >
                Table
              </button>

              <button
                type="button"
                onClick={() =>
                  setViewMode("cards")
                }
                className={`px-4 py-2 rounded font-semibold ${
                  viewMode === "cards"
                    ? "bg-green-600 text-white"
                    : "bg-zinc-200 text-black"
                }`}
              >
                Cards
              </button>
            </div>
          </div>

          <form
            onSubmit={
              handleSearchSubmit
            }
            className="flex flex-wrap gap-3"
          >
            <input
              className="border p-2 rounded flex-1 min-w-[240px]"
              placeholder="Search clothing by name, range, brand, category, SKU, or tags"
              value={searchInput}
              onChange={(e) =>
                setSearchInput(
                  e.target.value
                )
              }
            />

            <button
              type="submit"
              className="bg-zinc-800 text-white px-4 py-2 rounded"
            >
              Search
            </button>

            <button
              type="button"
              onClick={clearSearch}
              className="bg-zinc-200 text-black px-4 py-2 rounded"
            >
              Clear
            </button>
          </form>

          <div className="flex flex-wrap gap-4 text-sm font-semibold">
            <p>
              Total Items:{" "}
              {products.length}
            </p>

            <p>
              Showing:{" "}
              {
                filteredProducts.length
              }
            </p>
          </div>
        </div>

        {loading && (
          <p>
            Loading clothing
            inventory...
          </p>
        )}

        {/* TABLE VIEW */}
        {!loading &&
          viewMode === "table" && (
            <div className="bg-white border border-zinc-200 rounded-lg shadow overflow-x-auto">
              <table className="min-w-[1200px] w-full text-sm">
                <thead className="bg-zinc-100 border-b">
                  <tr>
                    <th className="p-3 text-left">
                      Image
                    </th>

                    <th className="p-3 text-left">
                      Name
                    </th>

                    <th className="p-3 text-left">
                      Range
                    </th>

                    <th className="p-3 text-left">
                      Brand
                    </th>

                    <th className="p-3 text-left">
                      Category
                    </th>

                    <th className="p-3 text-left">
                      Price
                    </th>

                    <th className="p-3 text-left">
                      Sale
                    </th>

                    <th className="p-3 text-left">
                      SKU
                    </th>

                    <th className="p-3 text-left">
                      Stock
                    </th>

                    <th className="p-3 text-left">
                      Tags
                    </th>

                    <th className="p-3 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map(
                    (product) => {
                      const totalStock =
                        product.variants?.reduce(
                          (
                            sum,
                            variant
                          ) =>
                            sum +
                            Number(
                              variant.stock ||
                                0
                            ),
                          0
                        ) || 0;

                      return (
                        <tr
                          key={
                            product.id
                          }
                          className="border-b align-top hover:bg-zinc-50"
                        >
                          <td className="p-3">
                            {product
                              .imageUrls?.[0] ? (
                              <img
                                src={
                                  product
                                    .imageUrls[0]
                                }
                                alt={
                                  product.name
                                }
                                className="w-16 aspect-square object-cover rounded border"
                              />
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="p-3 font-semibold">
                            {
                              product.name
                            }
                          </td>

                          <td className="p-3">
                            {getRangeLabel(
                              product.range
                            )}
                          </td>

                          <td className="p-3">
                            {product.brand ||
                              "—"}
                          </td>

                          <td className="p-3">
                            {product.category ||
                              "—"}
                          </td>

                          <td className="p-3">
                            £
                            {
                              product.price
                            }
                          </td>

                          <td className="p-3">
                            {product.salePrice !==
                              null &&
                            product.salePrice !==
                              undefined
                              ? `£${product.salePrice}`
                              : "—"}
                          </td>

                          <td className="p-3">
                            {product.sku ||
                              "—"}
                          </td>

                          <td className="p-3">
                            {totalStock}
                          </td>

                          <td className="p-3">
                            {product.tags
                              ?.length
                              ? product.tags.join(
                                  ", "
                                )
                              : "—"}
                          </td>

                          <td className="p-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleEdit(
                                    product
                                  )
                                }
                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    product.id
                                  )
                                }
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}

        {/* CARD VIEW */}
        {!loading &&
          viewMode === "cards" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(
                (product) => {
                  const totalStock =
                    product.variants?.reduce(
                      (
                        sum,
                        variant
                      ) =>
                        sum +
                        Number(
                          variant.stock ||
                            0
                        ),
                      0
                    ) || 0;

                  return (
                    <div
                      key={product.id}
                      className="border rounded shadow bg-white overflow-hidden"
                    >
                      {product
                        .imageUrls?.[0] ? (
                        <img
                          src={
                            product
                              .imageUrls[0]
                          }
                          alt={
                            product.name
                          }
                          className="w-full aspect-square object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-square bg-zinc-200 flex items-center justify-center">
                          No Image
                        </div>
                      )}

                      <div className="p-4 space-y-2">
                        <h2 className="font-bold text-lg">
                          {
                            product.name
                          }
                        </h2>

                        <p>
                          Range:{" "}
                          {getRangeLabel(
                            product.range
                          )}
                        </p>

                        <p>
                          Brand:{" "}
                          {product.brand ||
                            "—"}
                        </p>

                        <p>
                          Category:{" "}
                          {product.category ||
                            "—"}
                        </p>

                        <p>
                          Price: £
                          {
                            product.price
                          }
                        </p>

                        <p>
                          Sale:{" "}
                          {product.salePrice !==
                            null &&
                          product.salePrice !==
                            undefined
                            ? `£${product.salePrice}`
                            : "—"}
                        </p>

                        <p>
                          SKU:{" "}
                          {product.sku ||
                            "—"}
                        </p>

                        <p>
                          Stock:{" "}
                          {totalStock}
                        </p>

                        <p>
                          Tags:{" "}
                          {product.tags
                            ?.length
                            ? product.tags.join(
                                ", "
                              )
                            : "—"}
                        </p>

                        <div className="pt-2 space-y-1 text-sm">
                          {product.variants?.map(
                            (variant) => (
                              <p
                                key={
                                  variant.id
                                }
                              >
                                {variant.size ||
                                  "—"}{" "}
                                /{" "}
                                {variant.color ||
                                  "—"}{" "}
                                — Stock:{" "}
                                {
                                  variant.stock
                                }
                              </p>
                            )
                          )}
                        </div>

                        <div className="flex gap-2 pt-3">
                          <button
                            onClick={() =>
                              handleEdit(
                                product
                              )
                            }
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                product.id
                              )
                            }
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
      </div>
    </AdminLayout>
  );
}