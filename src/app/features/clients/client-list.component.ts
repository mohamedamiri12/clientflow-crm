import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  AsyncValidatorFn,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, map, of } from 'rxjs';
import { RouterLink } from '@angular/router';

import { ClientApi } from '../../core/api/client-api';
import {
  CLIENT_STATUSES,
  Client,
  ClientStatus,
  CreateClientPayload,
} from '../../core/models/client.model';
import { ClientStore } from './client.store';
import { PhoneMaskDirective } from './phone-mask.directive';

@Component({
  selector: 'app-client-list',
  standalone: true,
  template: `
    <section class="feature-page client-list-page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Accounts</p>
          <h1>Clients</h1>
        </div>
        <button class="primary-action" type="button" (click)="openCreateForm()">Add client</button>
      </header>

      @if (isFormOpen()) {
        <section class="client-editor" aria-labelledby="client-form-title">
          <h2 id="client-form-title">{{ editingClient() ? 'Edit client' : 'New client' }}</h2>
          <form [formGroup]="clientForm" (ngSubmit)="saveClient()">
            <div class="form-grid">
              <label class="form-field">
                <span>Full name</span>
                <input formControlName="fullName" required />
                @if (clientForm.controls.fullName.touched && clientForm.controls.fullName.hasError('required')) {
                  <span class="field-error">Enter a name.</span>
                }
              </label>
              <label class="form-field">
                <span>Company</span>
                <input formControlName="company" required />
                @if (clientForm.controls.company.touched && clientForm.controls.company.hasError('required')) {
                  <span class="field-error">Enter a company.</span>
                }
              </label>
              <label class="form-field">
                <span>Email</span>
                <input formControlName="email" type="email" required />
                @if (clientForm.controls.email.touched && clientForm.controls.email.hasError('required')) {
                  <span class="field-error">Enter an email address.</span>
                } @else if (clientForm.controls.email.touched && clientForm.controls.email.hasError('email')) {
                  <span class="field-error">Enter a valid email address.</span>
                } @else if (clientForm.controls.email.touched && clientForm.controls.email.hasError('duplicateEmail')) {
                  <span class="field-error">That email is already used by another client.</span>
                } @else if (clientForm.controls.email.touched && clientForm.controls.email.hasError('emailCheckFailed')) {
                  <span class="field-error">Could not check this email. Try again.</span>
                } @else if (clientForm.controls.email.pending) {
                  <span role="status">Checking email…</span>
                }
              </label>
              <label class="form-field">
                <span>Phone</span>
                <input formControlName="phone" type="tel" appPhoneMask placeholder="+212 661 234 567" required />
                @if (clientForm.controls.phone.touched && clientForm.controls.phone.hasError('required')) {
                  <span class="field-error">Enter a phone number.</span>
                }
              </label>
              <label class="form-field">
                <span>Status</span>
                <select formControlName="status">
                  @for (status of clientStatuses; track status) {
                    <option [value]="status">{{ status }}</option>
                  }
                </select>
              </label>
              <label class="form-field form-field--notes">
                <span>Notes</span>
                <textarea formControlName="notes" rows="3"></textarea>
              </label>
            </div>

            @if (saveError()) {
              <p class="save-error" role="alert">{{ saveError() }}</p>
            }

            <div class="form-actions">
              <button type="button" (click)="closeForm()" [disabled]="isSaving()">Cancel</button>
              <button class="primary-action" type="submit" [disabled]="isSaving() || clientForm.pending">
                {{ isSaving() ? 'Saving…' : 'Save client' }}
              </button>
            </div>
          </form>
        </section>
      }

      <div class="toolbar">
        <label class="search-field">
          <span>Search</span>
          <input type="search" [value]="search()" (input)="onSearch($event)" placeholder="Search clients" />
        </label>

        <label class="status-field">
          <span>Status</span>
          <select [value]="statusFilter()" (change)="onStatusChange($event)">
            <option value="All">All</option>
            @for (status of statusOptions; track status) {
              <option [value]="status">{{ status }}</option>
            }
          </select>
        </label>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>
                <button type="button" (click)="toggleSort('company')">Company</button>
              </th>
              <th>Status</th>
              <th>Email</th>
              <th>Phone</th>
              <th><span class="visually-hidden">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            @for (client of pagedClients(); track client.id) {
              <tr>
                <td>{{ client.fullName }}</td>
                <td>{{ client.company }}</td>
                <td>
                  <span class="status-badge status-badge--{{ client.status.toLowerCase() }}">
                    {{ client.status }}
                  </span>
                </td>
                <td>{{ client.email }}</td>
                <td>{{ client.phone }}</td>
                <td class="row-actions">
                  <a class="details-link" [routerLink]="['/clients', client.id]">Details</a>
                  <button type="button" [attr.aria-label]="'Edit ' + client.fullName" (click)="openEditForm(client)">
                    Edit
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="pagination" aria-label="Client pagination">
        <button type="button" (click)="previousPage()" [disabled]="page() === 1">Previous</button>
        <span>Page {{ page() }} of {{ totalPages() }}</span>
        <button type="button" (click)="nextPage()" [disabled]="page() >= totalPages()">Next</button>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .client-list-page {
        display: grid;
        gap: 1.5rem;
      }

      .page-header h1 {
        margin: 0;
      }

      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .primary-action {
        border: 1px solid var(--clientflow-brand-indigo);
        border-radius: 0.5rem;
        padding: 0.65rem 0.9rem;
        background: var(--clientflow-brand-indigo);
        color: white;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
      }

      .primary-action:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .client-editor {
        display: grid;
        gap: 1rem;
        border-block: 1px solid #e2e8f0;
        padding-block: 1.25rem;
      }

      .client-editor h2 {
        margin: 0;
        font-size: 1.15rem;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      .form-field {
        display: grid;
        align-content: start;
        gap: 0.4rem;
        color: #475569;
        font-weight: 500;
      }

      .form-field input,
      .form-field select,
      .form-field textarea {
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
        border: 1px solid #cbd5e1;
        border-radius: 0.5rem;
        padding: 0.7rem 0.8rem;
        background: white;
        color: #0f172a;
        font: inherit;
      }

      .form-field--notes {
        grid-column: 1 / -1;
      }

      .field-error,
      .save-error {
        color: #b42318;
        font-size: 0.85rem;
      }

      .save-error {
        margin-top: 0.8rem;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1rem;
      }

      .form-actions button,
      .row-actions button {
        border: 1px solid #cbd5e1;
        border-radius: 0.5rem;
        padding: 0.6rem 0.8rem;
        background: white;
        color: #334155;
        font: inherit;
        cursor: pointer;
      }

      .details-link {
        margin-right: 0.75rem;
        color: var(--clientflow-brand-indigo);
        font-weight: 600;
        text-decoration: none;
      }

      .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
      }

      .eyebrow {
        margin: 0 0 0.35rem;
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #64748b;
        font-weight: 700;
      }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: end;
      }

      .search-field,
      .status-field {
        display: grid;
        gap: 0.4rem;
        color: #475569;
        font-weight: 500;
      }

      .search-field input,
      .status-field select {
        min-width: 220px;
        border: 1px solid #cbd5e1;
        border-radius: 0.75rem;
        padding: 0.7rem 0.85rem;
        background: white;
      }

      .table-wrap {
        overflow-x: auto;
        border: 1px solid #e2e8f0;
        border-radius: 1rem;
        background: white;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        text-align: left;
        padding: 0.9rem 1rem;
        border-bottom: 1px solid #e2e8f0;
      }

      th button {
        border: none;
        background: transparent;
        font: inherit;
        font-weight: 700;
        color: var(--clientflow-brand-indigo);
        cursor: pointer;
        padding: 0;
      }

      tbody tr:hover {
        background: #f8fafc;
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 0.35rem 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
      }

      .status-badge--active {
        background: #dcfce7;
        color: #166534;
      }

      .status-badge--lead {
        background: #e0f2fe;
        color: #075985;
      }

      .status-badge--inactive {
        background: #fef3c7;
        color: #92400e;
      }

      .status-badge--archived {
        background: #f3f4f6;
        color: #374151;
      }

      .pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        color: #475569;
      }

      .pagination button {
        border: 1px solid #cbd5e1;
        background: white;
        padding: 0.6rem 0.9rem;
        border-radius: 0.75rem;
        cursor: pointer;
      }

      .pagination button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      @media (max-width: 640px) {
        .page-header {
          align-items: flex-start;
        }

        .form-grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .form-field--notes {
          grid-column: auto;
        }
      }
    `,
  ],
  imports: [PhoneMaskDirective, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientListComponent implements OnInit {
  private readonly clientStore = inject(ClientStore);
  private readonly clientApi = inject(ClientApi);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly search = signal('');
  readonly statusFilter = signal<'All' | ClientStatus>('All');
  readonly page = signal(1);
  readonly sortBy = signal<'company' | 'fullName' | 'status'>('fullName');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly pageSize = 5;
  readonly statusOptions = ['All', ...CLIENT_STATUSES] as const;
  readonly clientStatuses = CLIENT_STATUSES;
  readonly isFormOpen = signal(false);
  readonly editingClient = signal<Client | null>(null);
  readonly isSaving = signal(false);
  readonly saveError = signal<string | null>(null);
  private readonly uniqueEmailValidator: AsyncValidatorFn = (control) => {
    const email = String(control.value ?? '').trim().toLowerCase();
    if (!email) {
      return of(null);
    }

    const editingClientId = this.editingClient()?.id;
    const duplicateInStore = this.clientStore.clients().some(
      (client) =>
        client.id !== editingClientId && client.email.trim().toLowerCase() === email,
    );
    if (duplicateInStore) {
      return of({ duplicateEmail: true });
    }

    return this.clientApi.findByEmail(email).pipe(
      map((clients) =>
        clients.some(
          (client) =>
            client.id !== editingClientId && client.email.trim().toLowerCase() === email,
        )
          ? { duplicateEmail: true }
          : null,
      ),
      catchError(() => of({ emailCheckFailed: true })),
    );
  };
  readonly clientForm = this.formBuilder.group({
    fullName: ['', Validators.required],
    company: ['', Validators.required],
    email: this.formBuilder.control('', {
      validators: [Validators.required, Validators.email],
      asyncValidators: [this.uniqueEmailValidator],
      updateOn: 'blur',
    }),
    phone: ['', Validators.required],
    status: this.formBuilder.control<ClientStatus>('Lead'),
    notes: [''],
  });

  readonly filteredClients = computed(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    const clients = this.clientStore.clients().filter((client) => {
      const matchesStatus = status === 'All' || client.status === status;
      const matchesSearch =
        !query ||
        [client.fullName, client.company, client.email, client.phone]
          .join(' ')
          .toLowerCase()
          .includes(query);

      return matchesStatus && matchesSearch;
    });

    return [...clients].sort((a, b) => {
      const multiplier = this.sortDirection() === 'asc' ? 1 : -1;

      const left =
        this.sortBy() === 'fullName'
          ? a.fullName
          : this.sortBy() === 'status'
            ? a.status
            : a.company;
      const right =
        this.sortBy() === 'fullName'
          ? b.fullName
          : this.sortBy() === 'status'
            ? b.status
            : b.company;

      return left.localeCompare(right) * multiplier;
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredClients().length / this.pageSize)));

  readonly pagedClients = computed(() => {
    const startIndex = (this.page() - 1) * this.pageSize;
    return this.filteredClients().slice(startIndex, startIndex + this.pageSize);
  });

  ngOnInit(): void {
    this.clientStore.load();
  }

  openCreateForm(): void {
    this.editingClient.set(null);
    this.clientForm.reset({ fullName: '', company: '', email: '', phone: '', status: 'Lead', notes: '' });
    this.saveError.set(null);
    this.isFormOpen.set(true);
  }

  openEditForm(client: Client): void {
    this.editingClient.set(client);
    this.clientForm.reset({
      fullName: client.fullName,
      company: client.company,
      email: client.email,
      phone: client.phone,
      status: client.status,
      notes: client.notes ?? '',
    });
    this.saveError.set(null);
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingClient.set(null);
    this.saveError.set(null);
  }

  saveClient(): void {
    if (this.isSaving()) {
      return;
    }
    if (this.clientForm.invalid || this.clientForm.pending) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const payload: CreateClientPayload = this.clientForm.getRawValue();
    const client = this.editingClient();
    const saveRequest = client
      ? this.clientStore.update(client.id, payload)
      : this.clientStore.create(payload);

    this.isSaving.set(true);
    this.saveError.set(null);
    saveRequest.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeForm();
      },
      error: () => {
        this.isSaving.set(false);
        this.saveError.set('Unable to save this client. Please try again.');
      },
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.search.set(target.value);
    this.page.set(1);
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const nextValue = target.value as 'All' | ClientStatus;
    this.statusFilter.set(nextValue);
    this.page.set(1);
  }

  toggleSort(field: 'company' | 'fullName' | 'status'): void {
    if (this.sortBy() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
      return;
    }

    this.sortBy.set(field);
    this.sortDirection.set('asc');
  }

  previousPage(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
    }
  }
}
