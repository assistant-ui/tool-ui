import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("approval-card action layout contracts", () => {
  it("renders action buttons in a dedicated action container outside the card shell", () => {
    const content = read("components/tool-ui/approval-card/approval-card.tsx");

    const cardShellIndex = content.indexOf('<div className="bg-card');
    const actionsContainerIndex = content.indexOf(
      '<div className="@container/actions">',
    );
    const actionButtonsIndex = content.indexOf("<ActionButtons");

    expect(cardShellIndex).toBeGreaterThan(-1);
    expect(actionsContainerIndex).toBeGreaterThan(cardShellIndex);
    expect(actionButtonsIndex).toBeGreaterThan(actionsContainerIndex);
  });

  it("keeps shared action buttons fully round", () => {
    const content = read("components/tool-ui/shared/action-buttons.tsx");

    expect(content).toContain('"rounded-full px-4!"');
  });
});
