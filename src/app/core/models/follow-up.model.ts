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

export type CreateFollowUpPayload = Omit<FollowUp, 'id'>;

export type UpdateFollowUpPayload = Partial<CreateFollowUpPayload>;
