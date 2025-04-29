import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden bg-white text-black">
      <Link
        href="/ramsar"
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Ramsar
      </Link>
    </div>
  );
}
