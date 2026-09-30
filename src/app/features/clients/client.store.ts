import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, pipe, switchMap, tap } from 'rxjs';

import { ClientApi } from '../../core/api/client-api';
import {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
} from '../../core/models/client.model';

interface ClientState {
  clients: readonly Client[];
  isLoading: boolean;
  error: string | null;
}

const initialClientState: ClientState = {
  clients: [],
  isLoading: false,
  error: null,
};

export const ClientStore = signalStore(
  { providedIn: 'root' },
  withState(initialClientState),
  withComputed(({ clients }) => ({
    clientCount: computed(() => clients().length),
    activeClientCount: computed(
      () => clients().filter((client) => client.status === 'Active').length,
    ),
  })),
  withMethods((store, clientApi = inject(ClientApi)) => {
    const loadClients = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          clientApi.getAll().pipe(
            tap((clients) => patchState(store, { clients, isLoading: false })),
            catchError(() => {
              patchState(store, {
                isLoading: false,
                error: 'Unable to load clients. Please try again.',
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    );

    return {
      load: () => loadClients(undefined),
      getById: (id: string) =>
        clientApi.getById(id).pipe(
          tap((client) => {
            const exists = store.clients().some((current) => current.id === client.id);
            patchState(store, {
              clients: exists
                ? store.clients().map((current) => (current.id === client.id ? client : current))
                : [...store.clients(), client],
            });
          }),
        ),
      create: (payload: CreateClientPayload) =>
        clientApi.create(payload).pipe(
          tap((client) => patchState(store, { clients: [...store.clients(), client] })),
        ),
      update: (id: string, payload: UpdateClientPayload) =>
        clientApi.update(id, payload).pipe(
          tap((updatedClient) =>
            patchState(store, {
              clients: store
                .clients()
                .map((client) => (client.id === id ? updatedClient : client)),
            }),
          ),
        ),
      remove: (id: string) =>
        clientApi.delete(id).pipe(
          tap(() =>
            patchState(store, {
              clients: store.clients().filter((client) => client.id !== id),
            }),
          ),
        ),
    };
  }),
);
