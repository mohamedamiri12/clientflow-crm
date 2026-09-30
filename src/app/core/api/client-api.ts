import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
} from '../models/client.model';

@Injectable({
  providedIn: 'root',
})
export class ClientApi {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${environment.apiBaseUrl}/clients`;

  getAll(): Observable<readonly Client[]> {
    return this.http.get<readonly Client[]>(this.resourceUrl);
  }

  getById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.resourceUrl}/${id}`);
  }

  findByEmail(email: string): Observable<readonly Client[]> {
    return this.http.get<readonly Client[]>(this.resourceUrl, {
      params: new HttpParams().set('email', email),
    });
  }

  create(payload: CreateClientPayload): Observable<Client> {
    const timestamp = new Date().toISOString();
    return this.http.post<Client>(this.resourceUrl, {
      ...payload,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  update(id: string, payload: UpdateClientPayload): Observable<Client> {
    return this.http.patch<Client>(`${this.resourceUrl}/${id}`, {
      ...payload,
      updatedAt: new Date().toISOString(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/${id}`);
  }
}
