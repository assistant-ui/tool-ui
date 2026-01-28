"use client";

export function HomeBackground() {
  return (
    <>
      <div
        className="bg-background pointer-events-none fixed inset-0 opacity-60 dark:opacity-40"
        style={{ animation: "home-bg-fade-in 0.6s ease-out forwards" }}
        aria-hidden="true"
      />
      <style jsx>{`
        @keyframes home-bg-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
