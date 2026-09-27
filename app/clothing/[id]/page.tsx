"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { sanitizeCloudinaryUrl } from "@/lib/utils";
import { useCart } from "@/app/context/CartContext";
import HipHop100Background from "@/components/hiphop100/HipHop100Background";

type Variant = {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku?: string | null;
};

type Product = {
  id: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  range?: string | null;
  category?: string | null;
  price: number | string;
  salePrice?: number | string | null;
  colour?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[];
  sku?: string | null;
  tags?: string[];
  variants?: Variant[];
};

function SafeImage({ src, alt, className = "", ...props }: any) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-8 text-center border-4 border-black min-h-[400px]">
        <span className="text-yellow-500 text-xs font-mono uppercase tracking-widest mb-2 font-black">
          IMAGE PENDING
        </span>
        <p className="text-xs text-zinc-500 italic font-mono uppercase max-w-xs">
          {alt}
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      {...props}
      onError={() => setError(true)}
      className={`object-cover w-full h-full ${className}`}
    />
  );
}

function money(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? `£${amount.toFixed(2)}` : "COMING SOON";
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;

      try {
        setIsLoading(true);

        // New dedicated Clothing endpoint.
        let res = await fetch(`/api/clothing/${productId}`, {
          cache: "no-store",
        });

        // Preserve compatibility with your existing product routes.
        if (!res.ok) {
          res = await fetch(`/api/products/${productId}`, {
            cache: "no-store",
          });
        }

        if (res.ok) {
          const data = await res.json();
          const loadedProduct = (data?.product || data) as Product;
          setProduct(loadedProduct);

          const firstAvailableVariant = loadedProduct.variants?.find(
            (variant) => Number(variant.stock || 0) > 0
          );

          if (firstAvailableVariant) {
            setSelectedSize(firstAvailableVariant.size || "");
            setSelectedColor(firstAvailableVariant.color || "");
          }

          return;
        }

        // Final fallback: find the item in the complete products list.
        const listRes = await fetch("/api/products", { cache: "no-store" });

        if (listRes.ok) {
          const data = await listRes.json();
          const items = Array.isArray(data) ? data : data.products || [];
          const found = items.find(
            (item: Product) => String(item.id) === String(productId)
          );

          if (found) {
            setProduct(found);

            const firstAvailableVariant = found.variants?.find(
              (variant: Variant) => Number(variant.stock || 0) > 0
            );

            if (firstAvailableVariant) {
              setSelectedSize(firstAvailableVariant.size || "");
              setSelectedColor(firstAvailableVariant.color || "");
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch product details:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  const variants = product?.variants || [];

  const totalStock = useMemo(
    () => variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0),
    [variants]
  );

  const sizes = useMemo(
    () =>
      Array.from(
        new Set(
          variants
            .filter((variant) => variant.size)
            .map((variant) => variant.size)
        )
      ),
    [variants]
  );

  const colorsForSize = useMemo(() => {
    if (!selectedSize) return [];

    return Array.from(
      new Set(
        variants
          .filter(
            (variant) =>
              variant.size === selectedSize &&
              variant.color &&
              Number(variant.stock || 0) > 0
          )
          .map((variant) => variant.color)
      )
    );
  }, [variants, selectedSize]);

  const selectedVariant = useMemo(
    () =>
      variants.find(
        (variant) =>
          variant.size === selectedSize &&
          variant.color === selectedColor
      ) || null,
    [variants, selectedSize, selectedColor]
  );

  const currentPrice = Number(product?.salePrice ?? product?.price ?? 0);
  const regularPrice = Number(product?.price ?? 0);
  const hasSale =
    product?.salePrice !== null &&
    product?.salePrice !== undefined &&
    Number.isFinite(currentPrice) &&
    currentPrice < regularPrice;

  const rawImages = useMemo(() => {
    if (!product) return [];

    const list = [
      ...(product.imageUrls || []),
      product.imageUrl || "",
      product.image || "",
    ]
      .map((url) => sanitizeCloudinaryUrl(url || "", ""))
      .filter(Boolean);

    return Array.from(new Set(list));
  }, [product]);

  function chooseSize(size: string) {
    setSelectedSize(size);
    setQuantity(1);

    const firstAvailable = variants.find(
      (variant) =>
        variant.size === size && Number(variant.stock || 0) > 0
    );

    setSelectedColor(firstAvailable?.color || "");
  }

  function handleAddToCart() {
    if (!product) return;

    const hasVariants = variants.length > 0;

    if (hasVariants && (!selectedVariant || selectedVariant.stock <= 0)) {
      return;
    }

    addToCart({
      id: product.id,
      type: "clothing",
      title: selectedVariant
        ? `${product.name} — ${selectedVariant.size} / ${selectedVariant.color}`
        : product.name,
      price: currentPrice,
      quantity,
      image: rawImages[0] || undefined,
      variantId: selectedVariant?.id,
      size: selectedVariant?.size,
      color: selectedVariant?.color,
      sku: selectedVariant?.sku || product.sku || undefined,
    } as any);

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs uppercase font-bold">
        LOADING ITEM TERMINAL...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h1 className="raf-heading text-3xl text-yellow-500 uppercase">
          PRODUCT NOT FOUND
        </h1>
        <p className="font-mono text-xs text-zinc-400">
          Record [{productId}] does not exist in store matrix.
        </p>
        <Link
          href="/clothing"
          className="rounded border-4 border-black bg-yellow-500 hover:bg-yellow-400 px-6 py-3 font-mono font-black text-xs uppercase text-black tracking-wider transition shadow-[4px_4px_0px_rgba(0,0,0,1)]"
        >
          RETURN TO CLOTHING MATRIX
        </Link>
      </main>
    );
  }

  const hasVariants = variants.length > 0;
  const selectedStock = selectedVariant ? Number(selectedVariant.stock || 0) : 0;
  const maxQuantity = hasVariants ? Math.max(1, selectedStock) : 99;
  const canAdd = !hasVariants || Boolean(selectedVariant && selectedStock > 0);
  const priceFormatted = money(currentPrice);

  return (
    <main className="min-h-screen relative text-white bg-black overflow-hidden pb-24">
      <style>
        {`
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
        `}
      </style>

      <HipHop100Background />

      <div className="relative z-10 pt-24 max-w-7xl mx-auto px-6 space-y-8">
        {/* BREADCRUMB / BACK LINK */}
        <Link
          href="/clothing"
          className="inline-flex items-center gap-2 font-mono text-xs font-black uppercase text-yellow-500 hover:underline tracking-widest"
        >
          &larr; BACK TO CATALOG
        </Link>

        {/* PRODUCT GRID LAYOUT */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* IMAGE PANEL */}
          <div className="space-y-4">
            <div className="rounded-2xl border-4 border-black bg-black/80 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="aspect-[4/5] relative bg-zinc-950">
                <SafeImage
                  src={rawImages[activeImage] || rawImages[0]}
                  alt={product.name}
                />

                {product.category && (
                  <span className="absolute top-4 left-4 rounded border-2 border-black bg-yellow-500 px-3 py-1 text-xs font-mono font-black uppercase text-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    {product.category}
                  </span>
                )}
              </div>
            </div>

            {rawImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {rawImages.map((imageUrl, index) => (
                  <button
                    key={`${imageUrl}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`aspect-square overflow-hidden rounded-lg border-4 bg-black transition ${
                      activeImage === index
                        ? "border-yellow-500"
                        : "border-black hover:border-yellow-500/60"
                    }`}
                  >
                    <SafeImage
                      src={imageUrl}
                      alt={`${product.name} image ${index + 1}`}
                      className="min-h-0"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT INFO PANEL */}
          <div className="rounded-2xl border-4 border-black bg-black/80 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-8 font-mono">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-yellow-500 mb-2">
                // {product.range || "STUDIO LINE"}
              </p>
              <h1 className="raf-heading text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wide text-white leading-tight">
                {product.name}
              </h1>

              {product.brand && (
                <p className="mt-3 text-sm font-black uppercase tracking-widest text-zinc-400">
                  {product.brand}
                </p>
              )}

              <div className="mt-4 flex items-end gap-3">
                <span className="text-2xl font-black text-yellow-500">
                  {priceFormatted}
                </span>

                {hasSale && (
                  <span className="text-sm font-black text-zinc-500 line-through pb-1">
                    {money(regularPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="border-t-2 border-black pt-6 text-sm text-zinc-300 space-y-3 leading-relaxed">
              <h3 className="text-white font-black uppercase tracking-wider">
                // SPECIFICATIONS
              </h3>
              <p>
                {product.description ||
                  "Authentic HipHop100 apparel piece engineered for everyday movement and urban durability."}
              </p>

              <div className="grid sm:grid-cols-2 gap-2 pt-2 text-xs uppercase text-zinc-400">
                {product.category && (
                  <p>
                    <span className="text-white font-bold">CATEGORY:</span>{" "}
                    {product.category}
                  </p>
                )}
                {product.sku && (
                  <p>
                    <span className="text-white font-bold">PRODUCT SKU:</span>{" "}
                    {product.sku}
                  </p>
                )}
                {hasVariants && (
                  <p>
                    <span className="text-white font-bold">TOTAL STOCK:</span>{" "}
                    {totalStock}
                  </p>
                )}
                {selectedVariant?.sku && (
                  <p>
                    <span className="text-white font-bold">VARIANT SKU:</span>{" "}
                    {selectedVariant.sku}
                  </p>
                )}
              </div>
            </div>

            {/* SIZE SELECTOR */}
            {hasVariants && sizes.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-white block">
                  // SELECT SIZE:
                </label>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size) => {
                    const sizeStock = variants
                      .filter((variant) => variant.size === size)
                      .reduce(
                        (sum, variant) => sum + Number(variant.stock || 0),
                        0
                      );

                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={sizeStock <= 0}
                        onClick={() => chooseSize(size)}
                        className={`min-h-12 min-w-12 px-3 rounded border-4 font-mono font-black text-xs uppercase transition disabled:cursor-not-allowed disabled:opacity-30 ${
                          selectedSize === size
                            ? "border-black bg-yellow-500 text-black shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                            : "border-black/50 bg-zinc-900 text-zinc-400 hover:border-black hover:text-white"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* COLOUR SELECTOR */}
            {hasVariants && colorsForSize.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-white block">
                  // SELECT COLOUR:
                </label>
                <div className="flex flex-wrap gap-3">
                  {colorsForSize.map((color) => {
                    const variant = variants.find(
                      (item) =>
                        item.size === selectedSize && item.color === color
                    );
                    const inStock = Number(variant?.stock || 0) > 0;

                    return (
                      <button
                        key={color}
                        type="button"
                        disabled={!inStock}
                        onClick={() => {
                          setSelectedColor(color);
                          setQuantity(1);
                        }}
                        className={`min-h-12 px-4 rounded border-4 font-mono font-black text-xs uppercase transition disabled:cursor-not-allowed disabled:opacity-30 ${
                          selectedColor === color
                            ? "border-black bg-yellow-500 text-black shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                            : "border-black/50 bg-zinc-900 text-zinc-400 hover:border-black hover:text-white"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {hasVariants && (
              <div className="rounded border-2 border-black bg-zinc-900/60 p-4 text-xs uppercase tracking-wider">
                {selectedVariant ? (
                  <p className={selectedStock > 0 ? "text-yellow-500" : "text-red-400"}>
                    <span className="font-black">SELECTED STOCK:</span>{" "}
                    {selectedStock > 0
                      ? `${selectedStock} AVAILABLE`
                      : "OUT OF STOCK"}
                  </p>
                ) : (
                  <p className="text-zinc-500">SELECT A SIZE / COLOUR OPTION</p>
                )}
              </div>
            )}

            {/* QUANTITY CONTROL */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-white block">
                // QUANTITY:
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 rounded border-2 border-black bg-zinc-900 font-black text-white hover:bg-zinc-800"
                >
                  -
                </button>
                <span className="w-12 text-center font-black text-lg">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={!canAdd || quantity >= maxQuantity}
                  onClick={() =>
                    setQuantity(Math.min(maxQuantity, quantity + 1))
                  }
                  className="h-10 w-10 rounded border-2 border-black bg-zinc-900 font-black text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* TAGS */}
            {product.tags && product.tags.length > 0 && (
              <div className="border-t-2 border-black pt-5">
                <p className="text-xs font-black uppercase tracking-wider text-white mb-3">
                  // TAGS:
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border-2 border-black bg-zinc-900 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className="pt-4 space-y-4">
              <button
                type="button"
                disabled={!canAdd}
                onClick={handleAddToCart}
                className="w-full rounded border-4 border-black bg-yellow-500 hover:bg-yellow-400 px-6 py-4 font-mono font-black text-sm uppercase text-black tracking-wider transition shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {!canAdd
                  ? "OUT OF STOCK"
                  : addedToCart
                    ? "ADDED TO MATRIX CART ✓"
                    : `ADD TO CART — ${priceFormatted}`}
              </button>

              <div className="grid grid-cols-2 gap-4 text-[10px] text-zinc-400 uppercase tracking-widest text-center">
                <div className="p-3 border-2 border-black rounded bg-zinc-900/40">
                  ⚡ ORDER FULFILMENT
                </div>
                <div className="p-3 border-2 border-black rounded bg-zinc-900/40">
                  🔒 SECURE CHECKOUT
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
