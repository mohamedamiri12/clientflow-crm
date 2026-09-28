export const FOLLOW_UP_PRIORITIES = ['Low', 'Medium', 'High'] as const;

export type FollowUpPriority = (typeof FOLLOW_UP_PRIORITIES)[number];

export interface FollowUp {
  readonly id: string;
  clientId: string;
  title: string;
  dueDate: string;
  priority: FollowUpPriority;
  completed: boolean;
  notes?: string;
}
