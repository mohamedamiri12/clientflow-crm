import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import { FollowUpApi } from '../../core/api/follow-up-api';
import { FollowUp } from '../../core/models/follow-up.model';
import { FollowUpStore } from './follow-up.store';

const today = new Date().toISOString().slice(0, 10);
const overdue = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
const future = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

const followUps: readonly FollowUp[] = [
  {
    id: 'fu-001',
    clientId: 'cl-001',
    title: 'Review dashboard expansion brief',
    dueDate: overdue,
    priority: 'High',
    completed: false,
  },
  {
    id: 'fu-002',
    clientId: 'cl-002',
    title: 'Run discovery call',
    dueDate: today,
    priority: 'High',
    completed: false,
  },
  {
    id: 'fu-003',
    clientId: 'cl-003',
    title: 'Prepare quarterly account review',
    dueDate: future,
    priority: 'Medium',
    completed: false,
  },
  {
    id: 'fu-004',
    clientId: 'cl-004',
    title: 'Close follow-up task',
    dueDate: today,
    priority: 'Low',
    completed: true,
  },
];

describe('FollowUpStore', () => {
  let store: InstanceType<typeof FollowUpStore>;
  let getAll: () => Observable<readonly FollowUp[]>;

  beforeEach(() => {
    getAll = () => of([]);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: FollowUpApi,
          useValue: { getAll: () => getAll(), getByClientId: () => getAll() },
        },
      ],
    });

    store = TestBed.inject(FollowUpStore);
  });

  it('loads follow-ups and calculates dashboard metrics', () => {
    getAll = () => of(followUps);

    store.load();

    expect(store.followUps()).toHaveLength(4);
    expect(store.followUpCount()).toBe(4);
    expect(store.openFollowUpCount()).toBe(3);
    expect(store.completedFollowUpCount()).toBe(1);
    expect(store.overdueFollowUpCount()).toBe(1);
    expect(store.dueTodayFollowUpCount()).toBe(1);
    expect(store.highPriorityOpenCount()).toBe(2);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('exposes a helpful error when loading fails', () => {
    getAll = () => throwError(() => new Error('Network unavailable'));

    store.load();

    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe('Unable to load follow-ups. Please try again.');
  });
});
