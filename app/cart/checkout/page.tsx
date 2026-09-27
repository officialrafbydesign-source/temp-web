import {
  redirect,
} from "next/navigation";

export default function CartCheckoutPage() {
  redirect(
    "/checkout"
  );
}