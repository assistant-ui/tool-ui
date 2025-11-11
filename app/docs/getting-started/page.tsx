import { Steps, Step } from "fumadocs-ui/components/steps";

export default function GettingStartedPage() {
  return (
    <div className="prose dark:prose-invert max-w-3xl p-6">
      <h1>Getting Started</h1>
      <p>
        Install dependencies, wire Tailwind, and render your first component.
      </p>
      <Steps>
        <Step>
          <p>Copy the component folder(s) you need.</p>
        </Step>
        <Step>
          <p>Ensure Radix + shadcn atoms are available.</p>
        </Step>
        <Step>
          <p>Verify Tailwind and container queries.</p>
        </Step>
      </Steps>
    </div>
  );
}
