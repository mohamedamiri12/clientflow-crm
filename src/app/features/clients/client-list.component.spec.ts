import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ClientApi } from '../../core/api/client-api';
import { Client } from '../../core/models/client.model';
import { ClientListComponent } from './client-list.component';

const clients: readonly Client[] = [
  {
    id: 'cl-001',
    fullName: 'Amina El Idrissi',
    company: 'Atlas Analytics',
    email: 'amina@atlasanalytics.example',
    phone: '+212 661 234 567',
    status: 'Active',
    createdAt: '2026-07-04T09:15:00.000Z',
    updatedAt: '2026-09-20T14:30:00.000Z',
  },
  {
    id: 'cl-002',
    fullName: 'Liam Carter',
    company: 'Northstar Studio',
    email: 'liam@northstarstudio.example',
    phone: '+44 7700 900 321',
    status: 'Lead',
    createdAt: '2026-09-05T10:20:00.000Z',
    updatedAt: '2026-09-18T11:45:00.000Z',
  },
  {
    id: 'cl-003',
    fullName: 'Sofia Martinez',
    company: 'Cedar & Co.',
    email: 'sofia@cedarco.example',
    phone: '+34 612 456 789',
    status: 'Active',
    createdAt: '2026-03-11T08:00:00.000Z',
    updatedAt: '2026-09-12T16:10:00.000Z',
  },
  {
    id: 'cl-004',
    fullName: 'Noah Williams',
    company: 'BrightPath Learning',
    email: 'noah@brightpath.example',
    phone: '+1 202 555 0148',
    status: 'Inactive',
    createdAt: '2025-11-20T13:45:00.000Z',
    updatedAt: '2026-08-30T09:25:00.000Z',
  },
  {
    id: 'cl-005',
    fullName: 'Yasmine Bennani',
    company: 'Riad Commerce',
    email: 'yasmine@riadcommerce.example',
    phone: '+212 667 890 123',
    status: 'Lead',
    createdAt: '2026-09-14T15:05:00.000Z',
    updatedAt: '2026-09-22T08:35:00.000Z',
  },
  {
    id: 'cl-006',
    fullName: 'Oliver Chen',
    company: 'Harbor Logistics',
    email: 'oliver@harborlogistics.example',
    phone: '+65 8123 4567',
    status: 'Active',
    createdAt: '2026-05-08T12:10:00.000Z',
    updatedAt: '2026-09-16T10:00:00.000Z',
  },
];

describe('ClientListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientListComponent],
      providers: [
        {
          provide: ClientApi,
          useValue: {
            getAll: () => of(clients),
          },
        },
      ],
    }).compileComponents();
  });

  it('renders the client table with search, filters, sort, and pagination', async () => {
    const fixture = TestBed.createComponent(ClientListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Clients');
    expect(compiled.querySelectorAll('tbody tr')).toHaveLength(5);
    expect(compiled.textContent).toContain('Amina El Idrissi');

    const searchInput = compiled.querySelector('input[type="search"]') as HTMLInputElement;
    searchInput.value = 'liam';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Liam Carter');
    expect(compiled.textContent).not.toContain('Amina El Idrissi');

    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const statusSelect = compiled.querySelector('select') as HTMLSelectElement;
    statusSelect.value = 'Active';
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Amina El Idrissi');
    expect(compiled.textContent).not.toContain('Liam Carter');

    const sortButton = Array.from(compiled.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Company'),
    );
    sortButton?.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    const firstRow = compiled.querySelector('tbody tr')?.textContent ?? '';
    expect(firstRow).toContain('Atlas Analytics');

    const nextButton = Array.from(compiled.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Next'),
    );
    nextButton?.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Page');
  });
});
