import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ClientApi } from '../../core/api/client-api';
import { FollowUpApi } from '../../core/api/follow-up-api';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        {
          provide: ClientApi,
          useValue: {
            getAll: () =>
              of([
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
                  fullName: 'Nora Hassan',
                  company: 'Northwind Labs',
                  email: 'nora@northwind.example',
                  phone: '+212 666 123 456',
                  status: 'Lead',
                  createdAt: '2026-07-05T09:15:00.000Z',
                  updatedAt: '2026-09-21T14:30:00.000Z',
                },
              ]),
          },
        },
        {
          provide: FollowUpApi,
          useValue: {
            getAll: () =>
              of([
                {
                  id: 'fu-001',
                  clientId: 'cl-001',
                  title: 'Review dashboard expansion brief',
                  dueDate: '2026-09-28',
                  priority: 'High',
                  completed: false,
                },
                {
                  id: 'fu-002',
                  clientId: 'cl-002',
                  title: 'Run discovery call',
                  dueDate: '2026-09-29',
                  priority: 'High',
                  completed: true,
                },
              ]),
          },
        },
      ],
    }).compileComponents();
  });

  it('should render dashboard summary metrics', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Dashboard');
    expect(compiled.textContent).toContain('Total clients');
    expect(compiled.textContent).toContain('Open follow-ups');
    expect(compiled.textContent).toContain('2');
  });
});
