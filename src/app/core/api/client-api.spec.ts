import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ClientApi } from './client-api';

describe('ClientApi', () => {
  let service: ClientApi;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClientApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('gets all clients', () => {
    service.getAll().subscribe();

    const request = httpTesting.expectOne('http://localhost:3000/clients');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('gets one client by id', () => {
    service.getById('cl-001').subscribe();

    const request = httpTesting.expectOne('http://localhost:3000/clients/cl-001');
    expect(request.request.method).toBe('GET');
    request.flush({});
  });

  it('finds clients by email', () => {
    service.findByEmail('amina@atlasanalytics.example').subscribe();

    const request = httpTesting.expectOne(
      (candidate) =>
        candidate.url === 'http://localhost:3000/clients' &&
        candidate.params.get('email') === 'amina@atlasanalytics.example',
    );
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('creates a client', () => {
    const payload = {
      fullName: 'Amina El Idrissi',
      company: 'Atlas Analytics',
      email: 'amina@atlasanalytics.example',
      phone: '+212 661 234 567',
      status: 'Lead' as const,
    };

    service.create(payload).subscribe();

    const request = httpTesting.expectOne('http://localhost:3000/clients');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ ...payload, id: 'cl-001', createdAt: '', updatedAt: '' });
  });

  it('updates a client with PATCH', () => {
    service.update('cl-001', { status: 'Active' }).subscribe();

    const request = httpTesting.expectOne('http://localhost:3000/clients/cl-001');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'Active' });
    request.flush({});
  });

  it('deletes a client', () => {
    service.delete('cl-001').subscribe();

    const request = httpTesting.expectOne('http://localhost:3000/clients/cl-001');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
