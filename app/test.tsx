import BeatCard from "../components/BeatCard";

export default function TestPage() {
  return <BeatCard beat={{ id: "1", title: "Test Beat", audioUrl: "", genre: "Hip Hop", licenses: [{ id: "1", name: "Basic", price: 10 }] }} />;
}
