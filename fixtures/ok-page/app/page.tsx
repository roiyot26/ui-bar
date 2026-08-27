export default function Page() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mt-16 text-3xl">Shift log</h1>
      <p className="mt-4 text-zinc-400">
        Notes from the night desk. One column, real copy, no template.
      </p>
      <ul className="mt-8 space-y-4">
        <li>Gate 4 stuck open until 01:10.</li>
        <li>Replaced the lamp on bay 2.</li>
      </ul>
    </main>
  );
}
