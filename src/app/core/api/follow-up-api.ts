import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateFollowUpPayload,
  FollowUp,
  UpdateFollowUpPayload,
} from '../models/follow-up.model';

@Injectable({
  providedIn: 'root',
})
export class FollowUpApi {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${environment.apiBaseUrl}/followUps`;

  getAll(): Observable<readonly FollowUp[]> {
    return this.http.get<readonly FollowUp[]>(this.resourceUrl);
  }

  getByClientId(clientId: string): Observable<readonly FollowUp[]> {
    return this.http.get<readonly FollowUp[]>(this.resourceUrl, {
      params: new HttpParams().set('clientId', clientId),
    });
  }

  create(payload: CreateFollowUpPayload): Observable<FollowUp> {
    return this.http.post<FollowUp>(this.resourceUrl, payload);
  }

  update(id: string, payload: UpdateFollowUpPayload): Observable<FollowUp> {
    return this.http.patch<FollowUp>(`${this.resourceUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/${id}`);
  }
}
