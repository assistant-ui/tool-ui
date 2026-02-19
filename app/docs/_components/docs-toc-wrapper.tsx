import { DocsToc } from "./docs-toc";

export function DocsTocWrapper() {
  return (
    <div className="hidden min-w-0 w-[200px] shrink-0 xl:block">
      <div className="sticky top-6">
        <DocsToc />
      </div>
    </div>
  );
}
