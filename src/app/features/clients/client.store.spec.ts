import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import { ClientApi } from '../../core/api/client-api';
import { Client } from '../../core/models/client.model';
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

  beforeEach(() => {
    getAll = () => of([]);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ClientApi,
          useValue: { getAll: () => getAll() },
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
});
