"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type CartItem = {
  id: string;
  type: "beat" | "music" | "clothing" | "service" | "merch";
  title: string;
  price: number;
  quantity: number;
  image?: string;

  beatId?: string;
  licenseId?: string;

  releaseId?: string;
  musicProductId?: string;
  songId?: string;
  purchaseType?: "track";
  itemType?: string;

  variant?: string;
  variantId?: string;
  size?: string;
  color?: string;
  sku?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (
    id: string,
    quantity: number,
    licenseId?: string,
    variant?: string
  ) => void;
  removeFromCart: (
    id: string,
    licenseId?: string,
    variant?: string
  ) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

const CART_STORAGE_KEY = "raf_cart";

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error("Failed to load RAF cart:", error);
    } finally {
      setHasLoadedCart(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedCart) return;

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error("Failed to save RAF cart:", error);
    }
  }, [cart, hasLoadedCart]);

  function addToCart(item: CartItem) {
    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          i.id === item.id &&
          i.variant === item.variant &&
          i.licenseId === item.licenseId
      );

      if (existing) {
        if (item.type === "beat") {
          return prev;
        }

        return prev.map((i) =>
          i === existing
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
              }
            : i
        );
      }

      return [
        ...prev,
        {
          ...item,
          quantity:
            item.type === "beat"
              ? 1
              : Math.max(1, item.quantity),
        },
      ];
    });
  }

  function updateQuantity(
    id: string,
    quantity: number,
    licenseId?: string,
    variant?: string
  ) {
    setCart((prev) =>
      prev.map((item) => {
        const matches =
          item.id === id &&
          item.licenseId === licenseId &&
          item.variant === variant;

        if (!matches) return item;

        if (item.type === "beat") {
          return {
            ...item,
            quantity: 1,
          };
        }

        return {
          ...item,
          quantity: Math.max(1, Math.floor(quantity)),
        };
      })
    );
  }

  function removeFromCart(
    id: string,
    licenseId?: string,
    variant?: string
  ) {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === id &&
            item.licenseId === licenseId &&
            item.variant === variant
          )
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}