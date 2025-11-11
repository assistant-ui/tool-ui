export type Task = {
  id: string;
  customer: string;
  issue: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'waiting' | 'done';
  assignee: string;
  created: string; // ISO string
};

const ALL_TASKS: Task[] = [
  {
    id: 'T-1042',
    customer: 'Acme Co.',
    issue: 'Checkout failing intermittently on mobile',
    priority: 'high',
    status: 'open',
    assignee: 'J. Patel',
    created: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
  },
  {
    id: 'T-1041',
    customer: 'Globex',
    issue: 'SLA report shows incorrect totals',
    priority: 'medium',
    status: 'in-progress',
    assignee: 'M. Chen',
    created: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26h ago
  },
  {
    id: 'T-1039',
    customer: 'Umbrella Corp',
    issue: '2FA backup codes not accepted',
    priority: 'low',
    status: 'open',
    assignee: 'A. Gomez',
    created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'T-1035',
    customer: 'Hooli',
    issue: 'Attachments fail on Safari 17',
    priority: 'high',
    status: 'in-progress',
    assignee: 'R. Davis',
    created: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

export async function getMockTasks({ assignee }: { assignee?: string } = {}): Promise<Task[]> {
  let items = ALL_TASKS;
  if (assignee) items = items.filter((t) => t.assignee.toLowerCase().includes(assignee.toLowerCase()));
  // Sort by urgency (high → medium → low), then by created desc (newest first)
  const rank = { high: 1, medium: 2, low: 3 } as const;
  return [...items].sort((a, b) => {
    const byUrgency = rank[a.priority] - rank[b.priority];
    if (byUrgency !== 0) return byUrgency;
    return new Date(b.created).getTime() - new Date(a.created).getTime();
  });
}
