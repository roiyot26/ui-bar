import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Page() {
  return (
    <main className={inter.className}>
      <section className="relative">
        <img
          src="https://images.unsplash.com/photo-1557804506-669a67965ba0"
          alt=""
          className="h-[80vh] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-purple-600" />
        <div className="absolute -top-24 right-10 h-64 w-64 rounded-full bg-purple-500 blur-3xl" />
      </section>
      <section className="grid grid-cols-3 p-8">
        <article>Fast</article>
        <article>Secure</article>
        <article>Scalable</article>
      </section>
    </main>
  );
}
