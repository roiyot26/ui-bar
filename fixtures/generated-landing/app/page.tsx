export default function Page() {
  return (
    <main>
      <section id="hero" className="relative">
        <img
          src="https://images.unsplash.com/photo-1557804506-669a67965ba0"
          alt=""
          className="h-[80vh] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-purple-600" />
        <h1 className="absolute inset-0 flex items-center justify-center text-5xl">
          Unlock your potential
        </h1>
        <div className="absolute -top-24 right-10 h-64 w-64 rounded-full bg-purple-500 blur-3xl" />
      </section>

      <section id="features" className="grid grid-cols-3 p-3 mt-7 px-11">
        <article>Fast</article>
        <article>Secure</article>
        <article>Scalable</article>
      </section>

      <section id="testimonials">
        <p>★★★★★</p>
        <blockquote>This changed my life.</blockquote>
        <p>Jane, CEO of a Fortune 500</p>
      </section>

      <section id="pricing">
        <p>Pro — $9</p>
      </section>

      <section id="faq">
        <h2>FAQ</h2>
        <p>How does it work?</p>
      </section>
    </main>
  );
}
