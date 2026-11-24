import { redirect } from "next/navigation";
export default async function LegacyReleasePage({ params }: { params: Promise<{ id: string }> }) {
  redirect(`/music/${encodeURIComponent((await params).id)}`);
}
