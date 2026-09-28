import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { FollowUpApi } from './follow-up-api';

describe('FollowUpApi', () => {
  let service: FollowUpApi;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FollowUpApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('gets all follow-ups', () => {
    service.getAll().subscribe();

    const request = httpTesting.expectOne('http://localhost:3000/followUps');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('gets follow-ups for one client', () => {
    service.getByClientId('cl-001').subscribe();

    const request = httpTesting.expectOne(
      (candidate) =>
        candidate.url === 'http://localhost:3000/followUps' &&
        candidate.params.get('clientId') === 'cl-001',
    );
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('creates a follow-up', () => {
    const payload = {
      clientId: 'cl-001',
      title: 'Review dashboard expansion brief',
      dueDate: '2026-09-29',
      priority: 'High' as const,
      completed: false,
    };

    service.create(payload).subscribe();

    const request = httpTesting.expectOne('http://localhost:3000/followUps');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ ...payload, id: 'fu-001' });
  });

  it('updates a follow-up with PATCH', () => {
    service.update('fu-001', { completed: true }).subscribe();

    const request = httpTesting.expectOne('http://localhost:3000/followUps/fu-001');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ completed: true });
    request.flush({});
  });

  it('deletes a follow-up', () => {
    service.delete('fu-001').subscribe();

    const request = httpTesting.expectOne('http://localhost:3000/followUps/fu-001');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
