"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CartItem } from "@/types"; // Add this to your types folder (see below for types)

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get the cart items from localStorage or wherever you're storing them
    const storedCartItems = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(storedCartItems);

    // Calculate total amount
    const total = storedCartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalAmount(total);
  }, []);

  const handleCheckout = async () => {
    setLoading(true);

    // Make sure to replace this with your actual user ID
    const userId = "user-id-from-session"; // Retrieve this from your auth system (NextAuth, JWT, etc.)

    try {
      // Prepare order data to send to API
      const orderData = cartItems.map(item => ({
        beatId: item.id,
        licenseId: item.licenseId,  // License type (Basic, Premium, etc.)
        amount: item.price * item.quantity,
      }));

      // Send order creation request to backend
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          orderItems: orderData,
          totalAmount,
        }),
      });

      const data = await res.json();
      if (data.order) {
        // Trigger Stripe checkout or other payment gateway here
        const checkoutSessionId = data.order.id;  // Use order ID as session reference
        router.push(`/checkout/payment/${checkoutSessionId}`);  // Redirect to payment page
      } else {
        alert("Error creating order");
      }
    } catch (err) {
      console.error("Error creating order:", err);
      alert("Failed to create order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {loading && <p>Processing your order...</p>}

      <div className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold">Your Cart</h2>
          <div className="space-y-4 mt-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p>Price: £{item.price.toFixed(2)}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <div>
                  <p>Total: £{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-lg font-bold">Total Amount: £{totalAmount.toFixed(2)}</p>
          <button
            onClick={handleCheckout}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}
