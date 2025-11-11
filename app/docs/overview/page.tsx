import Content from "./content.mdx";

export default function OverviewPage() {
  return (
    <div className="bg-background relative box-border flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg rounded-tl-lg border-t border-l">
      <div className="scrollbar-subtle z-10 min-h-0 flex-1 overflow-auto overscroll-contain p-6 sm:p-10 lg:p-12">
        <div className="prose dark:prose-invert mx-auto max-w-3xl">
          <Content />
        </div>
      </div>
    </div>
  );
}
