# Tool UI Copy Style Guide

Every example in Tool UI—showcase scenes, presets, mock data—should feel like a real interaction someone would actually have with an AI assistant. The copy is part of the product. It shapes how developers imagine using these components in their own applications.

## The Core Test

Before finalizing any example copy, ask: **"Would someone actually do this?"**

Not "could this technically happen" but "is this a realistic, common, or aspirational use case?" If the answer is no, find a better scenario.

**Passes the test:**
- "Find me flights to Tokyo in March" → flight search results
- "Run the tests for the auth module" → terminal output
- "Help me pick a movie for tonight" → option selection

**Fails the test:**
- "Draft a review for that ramen place" → X post draft (who does this?)
- "Show me 30 console.log statements" → collapsible code (tech demo, not real use)
- "Display categories A, B, C, D" → chart (placeholder data)

---

## Voice Guidelines

The assistant voice adapts to match the context of each interaction.

### Match the Tone to the Task

| Context | Tone | Example |
|---------|------|---------|
| Professional/business | Efficient, direct | "Here are the Q3 results." |
| Technical/developer | Competent, concise | "Tests passed." / "Build failed—see errors below." |
| Personal/casual | Warm, helpful | "Found some options you might like." |
| Creative | Collaborative | "Here's a draft to start with." |

### Preamble Guidelines

The assistant preamble (the text before showing a Tool UI) should:

- **Be brief.** One sentence max. The UI speaks for itself.
- **Acknowledge the request** without repeating it back verbatim.
- **Avoid filler** like "Sure!", "Absolutely!", "Great question!"
- **Match the weight of the task.** Don't be bubbly about serious requests or clinical about fun ones.

**Good preambles:**
- "Here's your spending breakdown." (direct, informative)
- "Found a few options." (casual, helpful)
- "Tests passed." (minimal for routine output)

### Interactive vs. Delivery Components

Match the preamble to the component's interaction model:

| Component Type | User Role | Preamble Style | Example |
|----------------|-----------|----------------|---------|
| Delivery | Views results | Announcing | "Here's your spending breakdown." |
| Interactive | Takes action | Inviting | "Here are the settings if you want to fine-tune:" |

**Delivery** (charts, citations, terminal): User consumes what's shown.
**Interactive** (sliders, option lists, approval cards): User must act on what's shown.

For interactive components, avoid imperative preambles like "Adjust these:" or "Select one:"—these sound like commands. Instead, present the controls as available options: "Here are some choices:" or "Here are the settings if you'd like to dial it in:"

**Weak preambles:**
- "Here's a draft:" (too terse—what kind of draft?)
- "On it! Let me look into some options." (too chatty for most contexts)
- "I'd be happy to help you with that!" (filler)

### User Message Guidelines

User messages in showcase scenes should:

- **Sound natural.** How would you actually phrase this request?
- **Be specific enough** to justify the response, but not artificially detailed.
- **Vary in style.** Some terse, some conversational—real users differ.

**Good user messages:**
- "How did I spend money this week?"
- "Find me flights to Tokyo in March"
- "What should I listen to right now?"

**Weak user messages:**
- "Please generate a bar chart showing my spending by category" (too formal/specific)
- "Music" (too vague to justify a curated response)

---

## Scenario Selection

### Diverse Personas

The showcase should represent different people with different needs:

- A developer debugging or running builds
- A professional managing work tasks
- A consumer shopping or planning
- Someone managing personal life (travel, entertainment, gifts)

Don't force all examples through one persona. Each scene can be a different person.

### Believable Stakes

Match the UI treatment to the stakes of the scenario.

**Mismatched stakes (avoid):**
- Destructive confirmation dialog for deleting a to-do item
- Casual checkbox list for authorizing a financial transaction
- Dramatic approval card for a trivial setting change

**Well-matched stakes:**
- Destructive confirmation for "Delete Project" with permanent consequences
- Simple option list for choosing a movie genre
- Approval card with metadata for deploying to production

### Real Use Cases, Not Capability Demos

Every preset should represent a scenario where someone would actually use that component—not just a demonstration that the component works.

**Capability demo (avoid):**
```typescript
// Shows the component can collapse, but why would this exist?
code: Array.from({ length: 30 }, (_, i) => `console.log("Line ${i + 1}")`).join("\n")
```

**Real use case:**
```typescript
// A realistic script someone might generate or review
code: `#!/bin/bash
# Deploy script for production

echo "Running pre-flight checks..."
pnpm test && pnpm build

echo "Deploying to production..."
rsync -avz ./dist/ deploy@server:/var/www/app/

echo "Deployment complete."`
```

Both demonstrate collapsibility, but only the second passes the believability test.

---

## Specificity Standards

Thoughtful specificity makes examples feel real. Generic placeholders make them feel fake.

### Use Real (or Real-Seeming) Names

| Instead of | Use |
|------------|-----|
| "John Doe" | "Sarah Chen" or a real public figure where appropriate |
| "Company A" | "Stripe" or a plausible company name |
| "Product 1" | "Sony WH-1000XM5" or specific product |
| "user@example.com" | "alex.rivera@company.com" |

### Use Plausible Numbers

| Instead of | Use |
|------------|-----|
| $99.99 | $347.50 (feels like a real cart total) |
| 100, 200, 300 | 284, 156, 89 (real data is messy) |
| "5 items" | "3 items" or "12 items" (round numbers feel fake) |

### Ground with Details

Details that anchor a scenario in reality:

- Real airline codes (ANA, JAL, United—not "Airline A")
- Real album covers from actual artists
- Specific dates that make sense ("Mar 15, 11:30am" not "Date 1")
- Plausible file names ("use-debounce.ts" not "example.ts")

### When Inventing, Invent Completely

If you can't use real data, invent something that feels specific:

- "Ceramic Pour-Over Set" > "Product B"
- "Transcribe punch cards to magnetic tape" > "Task 3"
- "Sushi Nakazawa · Japanese · 0.3 mi" > "Restaurant 1 · Food · Nearby"

---

## Anti-Patterns

### Generic Placeholder Data

The most common failure. Anything that screams "I didn't think about this."

**Red flags:**
- Category A, B, C, D
- Item 1, Item 2, Item 3
- $99.99, $199.99, $299.99
- user1, user2, user3
- Lorem ipsum (obviously)
- "Example title" / "Sample description"

### Mismatched Stakes

UI treatment that doesn't match the scenario's weight.

**Examples to avoid:**
- A destructive red button for "Remove from favorites"
- A simple checkbox for "Transfer $50,000"
- An approval card with confirmation step for "Enable dark mode"

### Tech Demo Smell

Examples that only make sense if you're demonstrating a feature.

**Symptoms:**
- Unrealistic volume of data (30 console.logs)
- Arbitrary variety (all 4 status types in one view)
- Labels that describe the feature ("highlighted lines example")
- Data that exists only to show formatting ("Currency: $1,234.56")

### Scenarios That Don't Map to Real Behavior

Things that sound creative but aren't how people actually work.

**Examples:**
- Drafting an X post for a restaurant review (who does this?)
- Asking an AI to "display a bar chart" (you'd ask a question, get a chart as answer)
- "Show me all formatting options" (not a real user request)

---

## Component-Specific Notes

### Charts
Users don't ask for charts—they ask questions that might be answered with charts. Frame the scenario as a question: "How did I spend money this week?" not "Generate a spending chart."

### Terminal / CodeBlock
Developer scenarios should feel like real development tasks: running tests, building, deploying, debugging. Avoid synthetic examples that exist only to show syntax highlighting.

### OptionList
Good for decisions with 3-5 distinct options. Each option should be meaningfully different. Avoid yes/no choices (use ApprovalCard) or long lists (use DataTable).

### DataTable
Ideal for comparative data. The scenario should justify why someone needs to see multiple items in a structured format. Real-world tables rarely have perfectly clean data—some null values and inconsistencies add realism.

### Social Posts (X, LinkedIn, Instagram)
Only show drafting scenarios where AI-assisted drafting makes sense: thought leadership, announcements, threads. Avoid scenarios where AI drafting feels inauthentic (personal reviews, emotional posts).

### ApprovalCard
Reserve for consequential actions: deployments, deletions, sends. The metadata should help the user make the decision (recipients, affected resources, timing).

---

## Validation Checklist

Before finalizing any example copy:

- [ ] **Believability:** Would someone actually do this?
- [ ] **Voice match:** Does the assistant tone fit the context?
- [ ] **Specificity:** Are there any generic placeholders?
- [ ] **Stakes match:** Does the UI weight match the scenario weight?
- [ ] **Not a tech demo:** Would this example make sense outside documentation?
- [ ] **Diverse:** Does this add variety to the overall set of examples?

---

## Examples of Good Copy

### Showcase Scene (Chart)
```
User: "How did I spend money this week?"
Assistant: "Here's your spending breakdown."
[Chart showing: Groceries $284, Dining $156, Transport $89, Entertainment $67, Shopping $124]
```
- Natural question (not "show me a chart")
- Plausible, unround numbers
- Brief preamble

### Preset (ApprovalCard - Destructive)
```typescript
{
  title: "Delete Project?",
  description: "This action cannot be undone. All files, settings, and history will be permanently removed.",
  icon: "trash-2",
  variant: "destructive",
  confirmLabel: "Delete Project",
  cancelLabel: "Keep Project",
}
```
- Stakes justify destructive treatment
- Clear consequences in description
- Action labels are specific ("Delete Project" not just "Delete")

### Preset (ItemCarousel - Restaurants)
```typescript
{
  id: "rest-1",
  name: "Sushi Nakazawa",
  subtitle: "Japanese · 0.3 mi",
  actions: [
    { id: "menu", label: "Menu", variant: "secondary" },
    { id: "reserve", label: "Reserve" },
  ],
}
```
- Real restaurant name (or realistic one)
- Specific cuisine and distance
- Actions that make sense for the context

---

## Summary

Write copy as if it will be seen by users of the products built with Tool UI—because it will be. Developers will copy these examples, adapt them, and ship them. Make every example something worth shipping.
