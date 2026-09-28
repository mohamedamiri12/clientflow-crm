import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, pipe, switchMap, tap } from 'rxjs';

import { FollowUpApi } from '../../core/api/follow-up-api';
import { FollowUp } from '../../core/models/follow-up.model';

interface FollowUpState {
  followUps: readonly FollowUp[];
  isLoading: boolean;
  error: string | null;
}

const getIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

const initialFollowUpState: FollowUpState = {
  followUps: [],
  isLoading: false,
  error: null,
};

export const FollowUpStore = signalStore(
  { providedIn: 'root' },
  withState(initialFollowUpState),
  withComputed(({ followUps }) => ({
    followUpCount: computed(() => followUps().length),
    openFollowUpCount: computed(() => followUps().filter((followUp) => !followUp.completed).length),
    completedFollowUpCount: computed(
      () => followUps().filter((followUp) => followUp.completed).length,
    ),
    overdueFollowUpCount: computed(() => {
      const today = getIsoDate(new Date());
      return followUps().filter(
        (followUp) => !followUp.completed && followUp.dueDate < today,
      ).length;
    }),
    dueTodayFollowUpCount: computed(() => {
      const today = getIsoDate(new Date());
      return followUps().filter(
        (followUp) => !followUp.completed && followUp.dueDate === today,
      ).length;
    }),
    highPriorityOpenCount: computed(
      () =>
        followUps().filter(
          (followUp) => !followUp.completed && followUp.priority === 'High',
        ).length,
    ),
  })),
  withMethods((store, followUpApi = inject(FollowUpApi)) => {
    const loadFollowUps = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          followUpApi.getAll().pipe(
            tap((followUps) => patchState(store, { followUps, isLoading: false })),
            catchError(() => {
              patchState(store, {
                isLoading: false,
                error: 'Unable to load follow-ups. Please try again.',
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    );

    return {
      load: () => loadFollowUps(undefined),
    };
  }),
);
