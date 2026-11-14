export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-5 px-5 py-12">
      <span className="w-fit rounded-full bg-mint px-4 py-2 text-sm font-semibold text-forest">
        M0 · bootstrap only
      </span>
      <h1 className="text-4xl font-bold tracking-tight text-forest">flaht bladi</h1>
      <p className="max-w-xl text-lg text-ink">
        The frontend foundation is installed. A bilingual component preview will be
        connected after DEV2 finishes the shared UI and localization work.
      </p>
      <p className="text-sm text-muted">
        No accounts, backend operations, agricultural calculations or recommendations are available.
      </p>
    </main>
  );
}
