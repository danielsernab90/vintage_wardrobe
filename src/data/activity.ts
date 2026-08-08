export type ActivityEntry = {
  id: string;
  /** Display date as shown in the feed, e.g. "Today", "Jun 3", "3/2" */
  when: string;
  /** Sort key — ISO-ish for reverse chrono (Today = far future) */
  sortKey: string;
  description: string;
};

/**
 * Curated activity feed drawn from established dashboard data:
 * incident logs, subscriber joins, and the Decision Queue Keep As Is
 * action already exercised in the demo session.
 */
export const activityLog: ActivityEntry[] = [
  {
    id: "act-keep-071",
    when: "Today",
    sortKey: "2026-08-07",
    description:
      "SPEC-071 marked Keep As Is, returned to rotation",
  },
  {
    id: "act-join-claire",
    when: "Jun 3",
    sortKey: "2026-06-03",
    description: "Claire Duval joined as Starter subscriber",
  },
  {
    id: "act-join-nora",
    when: "May 22",
    sortKey: "2026-05-22",
    description: "Nora Hale joined as Starter subscriber",
  },
  {
    id: "act-inc-014",
    when: "3/2",
    sortKey: "2026-03-02",
    description:
      "SPEC-014 returned in excellent condition, no action needed",
  },
  {
    id: "act-inc-067",
    when: "2/20",
    sortKey: "2026-02-20",
    description: "SPEC-067 lining repaired, back in rotation",
  },
  {
    id: "act-inc-071-feb",
    when: "2/8",
    sortKey: "2026-02-08",
    description: "SPEC-071 flagged for review, elbow wear noted",
  },
  {
    id: "act-inc-071-jan",
    when: "1/15",
    sortKey: "2026-01-15",
    description:
      "SPEC-071 returned with visible elbow wear, flagged for Decision Queue",
  },
];

export function getActivityLog(entries: ActivityEntry[] = activityLog) {
  return [...entries].sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}
