"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "admin_token=; path=/; max-age=0; SameSite=Lax";
    router.push("/admin/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
    >
      Logout
    </button>
  );
}
