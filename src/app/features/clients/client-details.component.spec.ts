import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { Client } from '../../core/models/client.model';
import { ClientStore } from './client.store';
import { ClientDetailsComponent } from './client-details.component';
import { ClientDialogData } from './client-dialog.component';

const client: Client = {
  id: 'cl-001',
  fullName: 'Amina El Idrissi',
  company: 'Atlas Analytics',
  email: 'amina@atlasanalytics.example',
  phone: '+212 661 234 567',
  status: 'Active',
  notes: 'Interested in expanding the reporting dashboard.',
  createdAt: '2026-07-04T09:15:00.000Z',
  updatedAt: '2026-09-20T14:30:00.000Z',
};

describe('ClientDetailsComponent', () => {
  let getClient: () => Observable<Client>;
  let removeClient: (id: string) => Observable<void>;
  let dialogResults: unknown[];
  let openedDialogs: ClientDialogData[];
  let removedClientIds: string[];
  let navigations: unknown[][];

  beforeEach(async () => {
    getClient = () => of(client);
    removeClient = () => of(undefined);
    dialogResults = [];
    openedDialogs = [];
    removedClientIds = [];
    navigations = [];

    await TestBed.configureTestingModule({
      imports: [ClientDetailsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => client.id } } },
        },
        {
          provide: Router,
          useValue: {
            navigate: (commands: unknown[]) => {
              navigations.push(commands);
              return Promise.resolve(true);
            },
          },
        },
        {
          provide: ClientStore,
          useValue: {
            getById: () => getClient(),
            remove: (id: string) => {
              removedClientIds.push(id);
              return removeClient(id);
            },
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: (_component: unknown, config: { data: ClientDialogData }) => {
              openedDialogs.push(config.data);
              return { afterClosed: () => of(dialogResults.shift()) };
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('loads and displays the requested client', async () => {
    const fixture = TestBed.createComponent(ClientDetailsComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.client()).toEqual(client);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Atlas Analytics');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(client.notes);
  });

  it('does not delete when the confirmation is canceled', async () => {
    dialogResults.push(false);
    const fixture = TestBed.createComponent(ClientDetailsComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    (fixture.nativeElement as HTMLElement).querySelector('.delete-action')?.dispatchEvent(
      new MouseEvent('click'),
    );
    await fixture.whenStable();

    expect(openedDialogs[0].kind).toBe('confirm');
    expect(removedClientIds).toEqual([]);
  });

  it('deletes only after confirmation, shows success, and returns to the list', async () => {
    dialogResults.push(true, false);
    const fixture = TestBed.createComponent(ClientDetailsComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    (fixture.nativeElement as HTMLElement).querySelector('.delete-action')?.dispatchEvent(
      new MouseEvent('click'),
    );
    await fixture.whenStable();

    expect(removedClientIds).toEqual([client.id]);
    expect(openedDialogs.map((dialog) => dialog.kind)).toEqual(['confirm', 'message']);
    expect(navigations).toEqual([['/clients']]);
  });

  it('shows an error message and stays on the page when deletion fails', async () => {
    dialogResults.push(true);
    removeClient = () => throwError(() => new Error('Network unavailable'));
    const fixture = TestBed.createComponent(ClientDetailsComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    (fixture.nativeElement as HTMLElement).querySelector('.delete-action')?.dispatchEvent(
      new MouseEvent('click'),
    );
    await fixture.whenStable();

    expect(openedDialogs[1]).toMatchObject({
      kind: 'message',
      title: 'Could not delete client',
    });
    expect(navigations).toEqual([]);
  });
});