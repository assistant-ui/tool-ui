import type { SerializableApprovalCard } from "@/components/tool-ui/approval-card";
import type { PresetWithCodeGen } from "./types";

export type ApprovalCardPresetName =
  | "deploy"
  | "destructive"
  | "with-metadata"
  | "receipt-approved"
  | "receipt-denied";

function generateApprovalCardCode(data: SerializableApprovalCard): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);
  props.push(`  title="${data.title}"`);

  if (data.description) {
    props.push(`  description="${data.description}"`);
  }

  if (data.icon) {
    props.push(`  icon="${data.icon}"`);
  }

  if (data.metadata && data.metadata.length > 0) {
    props.push(
      `  metadata={${JSON.stringify(data.metadata, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  if (data.variant && data.variant !== "default") {
    props.push(`  variant="${data.variant}"`);
  }

  if (data.confirmLabel && data.confirmLabel !== "Approve") {
    props.push(`  confirmLabel="${data.confirmLabel}"`);
  }

  if (data.cancelLabel && data.cancelLabel !== "Deny") {
    props.push(`  cancelLabel="${data.cancelLabel}"`);
  }

  if (data.choice) {
    props.push(`  choice="${data.choice}"`);
  } else {
    props.push(`  onConfirm={() => console.log("Approved")}`);
    props.push(`  onCancel={() => console.log("Denied")}`);
  }

  return `<ApprovalCard\n${props.join("\n")}\n/>`;
}

export const approvalCardPresets: Record<
  ApprovalCardPresetName,
  PresetWithCodeGen<SerializableApprovalCard>
> = {
  deploy: {
    description: "Simple deployment approval",
    data: {
      id: "approval-card-deploy",
      title: "Deploy to Production",
      description: "This will push the latest changes to all users.",
      icon: "rocket",
      confirmLabel: "Deploy",
    } satisfies SerializableApprovalCard,
    generateExampleCode: generateApprovalCardCode,
  },
  destructive: {
    description: "Destructive action with warning styling",
    data: {
      id: "approval-card-destructive",
      title: "Delete Project",
      description:
        "This action cannot be undone. All files, settings, and history will be permanently removed.",
      icon: "trash-2",
      variant: "destructive",
      confirmLabel: "Delete Project",
      cancelLabel: "Keep Project",
    } satisfies SerializableApprovalCard,
    generateExampleCode: generateApprovalCardCode,
  },
  "with-metadata": {
    description: "Approval with context details",
    data: {
      id: "approval-card-with-metadata",
      title: "Send Email Campaign",
      description: "Review the details before sending to your subscribers.",
      icon: "mail",
      metadata: [
        { key: "Recipients", value: "12,847 subscribers" },
        { key: "Subject", value: "Your Weekly Digest" },
        { key: "Scheduled", value: "Immediately" },
      ],
      confirmLabel: "Send Now",
    } satisfies SerializableApprovalCard,
    generateExampleCode: generateApprovalCardCode,
  },
  "receipt-approved": {
    description: "Receipt state after approval",
    data: {
      id: "approval-card-receipt-approved",
      title: "Back up database",
      choice: "approved",
      confirmLabel: "Approved",
    } satisfies SerializableApprovalCard,
    generateExampleCode: generateApprovalCardCode,
  },
  "receipt-denied": {
    description: "Receipt state after denial",
    data: {
      id: "approval-card-receipt-denied",
      title: "Delete all project files",
      choice: "denied",
      cancelLabel: "Denied",
    } satisfies SerializableApprovalCard,
    generateExampleCode: generateApprovalCardCode,
  },
};
