export default function Home() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
      <main className="flex flex-col items-center gap-6 text-center px-6">
        <h1 className="font-display font-semibold text-4xl text-ink">
          Earnie
        </h1>
        <p className="font-body text-lg text-ink-soft max-w-sm">
          Earn coins, complete chores, and learn to save — a financial adventure for kids.
        </p>
        <div className="flex gap-3 mt-2">
          <a
            href="/login"
            className="inline-flex items-center justify-center px-5 py-3 rounded-control bg-green text-white font-display font-semibold text-base border-2 border-ink"
          >
            Get started
          </a>
        </div>
      </main>
    </div>
  );
}
