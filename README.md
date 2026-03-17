<a href="https://tool-ui.com">
  <img src=".github/assets/header.png" alt="Tool UI" width="100%">
</a>

Copy/paste React components for rendering tool calls in AI chat interfaces. Built by [assistant-ui](https://github.com/assistant-ui).

**[Docs](https://tool-ui.com/docs/overview)** · **[Gallery](https://tool-ui.com/docs/gallery)** · **[Quick Start](https://tool-ui.com/docs/quick-start)**

When a model calls a tool, most apps dump raw JSON into the conversation. These components turn tool payloads into interactive UI like approvals, forms, tables, charts, and media cards so users can understand and act without leaving the chat.

## Featured Components

<table border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td valign="top" width="50%">
      <strong><a href="https://www.tool-ui.com/docs/option-list">Option List</a></strong><br>
      Let users select from multiple choices<br><br>
      <a href="https://tool-ui.com/docs/option-list">
        <img src=".github/assets/option-list.png" alt="Option List component" width="100%">
      </a>
    </td>
    <td valign="top" width="50%">
      <strong><a href="https://www.tool-ui.com/docs/question-flow">Question Flow</a></strong><br>
      Multi-step guided questions with branching<br><br>
      <a href="https://tool-ui.com/docs/question-flow">
        <img src=".github/assets/question-flow.png" alt="Question Flow component" width="100%">
      </a>
    </td>
  </tr>
</table>


## Why Tool UI?

- **Copy/paste, not install** — shadcn/ui model. Components live in your codebase. No dependency lock-in.
- **Schema-validated** — Every component has a Zod schema. Parse tool output, render when valid, fail safely when not.
- **Interactive with receipts** — Components aren't just displays. Users make choices that flow back to the assistant. Choices persist as receipts.
- **Built on shadcn/ui** — Radix primitives, Tailwind styling, your theme. No new design system to learn.

## Components

- **Progress**: Plan, Progress Tracker
- **Input**: Option List, Parameter Slider, Preferences Panel, Question Flow
- **Display**: Citation, Geo Map, Item Carousel, Link Preview, Stats Display, Terminal, Weather Widget
- **Artifacts**: Chart, Code Block, Code Diff, Data Table, Instagram Post, LinkedIn Post, Message Draft, X Post
- **Confirmation**: Approval Card, Order Summary
- **Media**: Audio, Image, Image Gallery, Video

Each component includes a Zod schema for payload validation and presets for realistic example data. Browse them all in the [Gallery](https://tool-ui.com/docs/gallery).

<a href="https://tool-ui.com/docs/gallery">
  <img src=".github/assets/gallery.png" alt="Tool UI component gallery" width="100%">
</a>

## License

MIT License. See [LICENSE](LICENSE.md) for details.
