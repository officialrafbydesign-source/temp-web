import { redirect } from "next/navigation";

export default function UserPurchasesPage() {
  redirect("/account/orders");
}