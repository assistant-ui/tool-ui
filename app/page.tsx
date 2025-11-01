import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          tool-ui Component Library
        </h1>
        <p className="text-lg text-muted-foreground">
          Open source component library for rendering tool call widgets in
          TypeScript/React chat applications.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/playground"
            className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to Playground
          </Link>
        </div>
      </div>
    </main>
  );
}
