export default function ImplementationGuidelinesPage() {
  return (
    <div className="prose dark:prose-invert max-w-3xl p-6">
      <h1>Implementation Guidelines</h1>
      <p>Conventions and patterns for building new components.</p>
      <ul>
        <li>Composition with Radix primitives</li>
        <li>Props and types (CVA variants, defaults)</li>
        <li>Styling with Tailwind + tokens</li>
        <li>Async/streaming and performance</li>
        <li>Accessibility checklists</li>
      </ul>
    </div>
  );
}
