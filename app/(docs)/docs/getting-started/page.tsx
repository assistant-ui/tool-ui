export default function GettingStartedPage() {
  return (
    <div className="prose dark:prose-invert max-w-3xl p-6">
      <h1>Getting Started</h1>
      <p>
        Install dependencies, wire Tailwind, and render your first component.
      </p>
      <ol>
        <li>Copy the component folder(s) you need.</li>
        <li>Ensure Radix + shadcn atoms are available.</li>
        <li>Verify Tailwind and container queries.</li>
      </ol>
    </div>
  );
}
