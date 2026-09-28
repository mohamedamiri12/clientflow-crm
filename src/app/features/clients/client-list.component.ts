import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { CLIENT_STATUSES, ClientStatus } from '../../core/models/client.model';
import { ClientStore } from './client.store';

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
      </header>

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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientListComponent implements OnInit {
  private readonly clientStore = inject(ClientStore);

  readonly search = signal('');
  readonly statusFilter = signal<'All' | ClientStatus>('All');
  readonly page = signal(1);
  readonly sortBy = signal<'company' | 'fullName' | 'status'>('fullName');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly pageSize = 5;
  readonly statusOptions = ['All', ...CLIENT_STATUSES] as const;

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
