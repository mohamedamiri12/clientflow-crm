import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import { ClientApi } from '../../core/api/client-api';
import { Client, CreateClientPayload, UpdateClientPayload } from '../../core/models/client.model';
import { ClientStore } from './client.store';

const activeClient: Client = {
  id: 'cl-001',
  fullName: 'Amina El Idrissi',
  company: 'Atlas Analytics',
  email: 'amina@atlasanalytics.example',
  phone: '+212 661 234 567',
  status: 'Active',
  createdAt: '2026-07-04T09:15:00.000Z',
  updatedAt: '2026-09-20T14:30:00.000Z',
};

describe('ClientStore', () => {
  let store: InstanceType<typeof ClientStore>;
  let getAll: () => Observable<readonly Client[]>;
  let createClient: (payload: CreateClientPayload) => Observable<Client>;
  let updateClient: (id: string, payload: UpdateClientPayload) => Observable<Client>;

  beforeEach(() => {
    getAll = () => of([]);
    createClient = () => of(activeClient);
    updateClient = () => of(activeClient);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ClientApi,
          useValue: {
            getAll: () => getAll(),
            create: (payload: CreateClientPayload) => createClient(payload),
            update: (id: string, payload: UpdateClientPayload) => updateClient(id, payload),
          },
        },
      ],
    });

    store = TestBed.inject(ClientStore);
  });

  it('loads clients and updates derived counts', () => {
    getAll = () => of([activeClient, { ...activeClient, id: 'cl-002', status: 'Lead' }]);

    store.load();

    expect(store.clients()).toHaveLength(2);
    expect(store.clientCount()).toBe(2);
    expect(store.activeClientCount()).toBe(1);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('exposes a helpful error when loading fails', () => {
    getAll = () => throwError(() => new Error('Network unavailable'));

    store.load();

    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe('Unable to load clients. Please try again.');
  });

  it('recalculates derived counts after a later load', () => {
    getAll = () => of([activeClient]);
    store.load();

    getAll = () =>
      of([
        activeClient,
        { ...activeClient, id: 'cl-002', status: 'Inactive' },
        { ...activeClient, id: 'cl-003', status: 'Active' },
      ]);
    store.load();

    expect(store.clientCount()).toBe(3);
    expect(store.activeClientCount()).toBe(2);
  });

  it('adds a created client to the current list after the API succeeds', () => {
    const createdClient = { ...activeClient, id: 'cl-002' };
    createClient = () => of(createdClient);

    store.create({
      fullName: createdClient.fullName,
      company: createdClient.company,
      email: createdClient.email,
      phone: createdClient.phone,
      status: createdClient.status,
    }).subscribe();

    expect(store.clients()).toEqual([createdClient]);
    expect(store.clientCount()).toBe(1);
  });

  it('replaces the edited client in the current list after the API succeeds', () => {
    const updatedClient = { ...activeClient, company: 'Updated Analytics' };
    getAll = () => of([activeClient]);
    updateClient = () => of(updatedClient);
    store.load();

    store.update(activeClient.id, { company: updatedClient.company }).subscribe();

    expect(store.clients()).toEqual([updatedClient]);
  });
});
