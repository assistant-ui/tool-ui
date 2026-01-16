import type { SerializableMessageDraft } from "@/components/tool-ui/message-draft";
import type { PresetWithCodeGen } from "./types";

export type MessageDraftPresetName =
  | "email"
  | "email-with-cc"
  | "slack-channel"
  | "slack-dm"
  | "sent";

function generateMessageDraftCode(data: SerializableMessageDraft): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);
  props.push(`  channel="${data.channel}"`);

  if (data.channel === "email") {
    props.push(`  subject="${data.subject}"`);
    if (data.from) {
      props.push(`  from="${data.from}"`);
    }
    props.push(
      `  to={${JSON.stringify(data.to)}}`,
    );
    if (data.cc && data.cc.length > 0) {
      props.push(
        `  cc={${JSON.stringify(data.cc)}}`,
      );
    }
    if (data.bcc && data.bcc.length > 0) {
      props.push(
        `  bcc={${JSON.stringify(data.bcc)}}`,
      );
    }
  }

  if (data.channel === "slack") {
    const targetProps = [`type: "${data.target.type}"`, `name: "${data.target.name}"`];
    if (data.target.type === "channel" && data.target.memberCount !== undefined) {
      targetProps.push(`memberCount: ${data.target.memberCount}`);
    }
    props.push(`  target={{ ${targetProps.join(", ")} }}`);
  }

  props.push(`  body={\`${data.body.replace(/`/g, "\\`")}\`}`);

  if (data.outcome) {
    props.push(`  outcome="${data.outcome}"`);
  }

  props.push(`  onSend={() => console.log("Message sent")}`);
  props.push(`  onCancel={() => console.log("Message cancelled")}`);

  return `<MessageDraft\n${props.join("\n")}\n/>`;
}

export const messageDraftPresets: Record<
  MessageDraftPresetName,
  PresetWithCodeGen<SerializableMessageDraft>
> = {
  email: {
    description: "Simple email to a single recipient",
    data: {
      id: "message-draft-email",
      channel: "email",
      subject: "Updated proposal attached",
      from: "sarah.mitchell@acme.co",
      to: ["marcus.chen@acme.co"],
      body: `Hi Marcus,

I've attached the revised proposal with the changes we discussed. The new timeline reflects the Q2 launch date, and I've adjusted the budget breakdown in section 3.

Let me know if you have any questions.

Best,
Sarah`,
    },
    generateExampleCode: generateMessageDraftCode,
  },
  "email-with-cc": {
    description: "Email with CC and BCC recipients",
    data: {
      id: "message-draft-email-cc",
      channel: "email",
      subject: "Re: Q4 Budget Review Meeting",
      from: "dana.kim@raycast.com",
      to: ["finance-team@raycast.com"],
      cc: ["jamie.wright@raycast.com", "ops@raycast.com"],
      bcc: ["cfo@raycast.com"],
      body: `Hi team,

Following up on yesterday's meeting. I've compiled the department requests and attached the consolidated spreadsheet.

Key changes from last quarter:
- Engineering: +15% for infrastructure scaling
- Marketing: Flat (reallocating to digital)
- Support: +8% for new hires

Please review and flag any concerns by Friday. We'll finalize allocations next week.

Thanks,
Dana`,
    },
    generateExampleCode: generateMessageDraftCode,
  },
  "slack-channel": {
    description: "Slack message to a channel",
    data: {
      id: "message-draft-slack-channel",
      channel: "slack",
      target: { type: "channel", name: "eng-releases", memberCount: 47 },
      body: `Shipped v2.4.1 to production. Changes:
- Fixed auth token refresh bug
- Improved search latency by 40%
- Added keyboard shortcuts for power users

Monitoring dashboards look good. Rollback plan ready if needed.`,
    },
    generateExampleCode: generateMessageDraftCode,
  },
  "slack-dm": {
    description: "Direct message to a person",
    data: {
      id: "message-draft-slack-dm",
      channel: "slack",
      target: { type: "dm", name: "Alex Rivera" },
      body: `Hey Alex, just wanted to check in on the API integration. The client asked if we're still on track for the Thursday demo. No pressure if things shifted - just want to give them an accurate update.`,
    },
    generateExampleCode: generateMessageDraftCode,
  },
  sent: {
    description: "Sent receipt state",
    data: {
      id: "message-draft-sent",
      channel: "email",
      subject: "Interview follow-up",
      from: "jordan.hayes@gmail.com",
      to: ["hiring@stripe.com"],
      body: `Thank you for taking the time to speak with me today about the Senior Engineer position. I enjoyed learning more about the team's work on payment infrastructure.

I'm excited about the opportunity and look forward to hearing from you.

Best regards,
Jordan`,
      outcome: "sent",
    },
    generateExampleCode: generateMessageDraftCode,
  },
};
