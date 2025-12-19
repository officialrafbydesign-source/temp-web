// app/layout.tsx
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";

export const metadata = {
  title: "My Business Suite",
  description: "Unified business platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {/* Include the Header */}
          <Header />
          {/* Main Content */}
          <main>{children}</main>
          {/* Include the Footer */}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
