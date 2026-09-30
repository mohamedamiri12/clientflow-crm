import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { Client } from '../../core/models/client.model';
import { ClientStore } from './client.store';
import { ClientDialogComponent, ClientDialogData } from './client-dialog.component';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [DatePipe, MatButtonModule],
  template: `
    <section class="feature-page client-details-page">
      @if (isLoading()) {
        <p role="status">Loading client…</p>
      } @else if (error()) {
        <div role="alert">
          <h1>Client unavailable</h1>
          <p>{{ error() }}</p>
          <button mat-button type="button" (click)="goToList()">Back to clients</button>
        </div>
      } @else if (client(); as selectedClient) {
        <header class="details-header">
          <div>
            <button class="back-link" mat-button type="button" (click)="goToList()">
              Back to clients
            </button>
            <p class="eyebrow">Client details</p>
            <h1>{{ selectedClient.fullName }}</h1>
            <p>{{ selectedClient.company }}</p>
          </div>
          <button
            class="delete-action"
            mat-stroked-button
            type="button"
            color="warn"
            [disabled]="isDeleting()"
            (click)="confirmDelete()"
          >
            {{ isDeleting() ? 'Deleting…' : 'Delete client' }}
          </button>
        </header>

        <section class="detail-section" aria-labelledby="contact-heading">
          <h2 id="contact-heading">Contact</h2>
          <dl>
            <div>
              <dt>Email</dt>
              <dd><a [href]="'mailto:' + selectedClient.email">{{ selectedClient.email }}</a></dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd><a [href]="'tel:' + selectedClient.phone">{{ selectedClient.phone }}</a></dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span class="status-badge status-badge--{{ selectedClient.status.toLowerCase() }}">
                  {{ selectedClient.status }}
                </span>
              </dd>
            </div>
          </dl>
        </section>

        @if (selectedClient.notes) {
          <section class="detail-section" aria-labelledby="notes-heading">
            <h2 id="notes-heading">Notes</h2>
            <p>{{ selectedClient.notes }}</p>
          </section>
        }

        <section class="detail-section record-dates" aria-label="Record dates">
          <p>Created {{ selectedClient.createdAt | date: 'mediumDate' }}</p>
          <p>Updated {{ selectedClient.updatedAt | date: 'mediumDate' }}</p>
        </section>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .client-details-page {
        display: grid;
        gap: 1.5rem;
      }

      .details-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 1.5rem;
      }

      .details-header h1 {
        margin: 0 0 0.35rem;
      }

      .details-header p {
        margin: 0;
      }

      .back-link {
        margin: 0 0 0.75rem -0.5rem;
      }

      .eyebrow {
        margin: 0 0 0.35rem;
        color: #64748b;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
      }

      .detail-section {
        display: grid;
        gap: 1rem;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 1.5rem;
      }

      .detail-section h2 {
        margin: 0;
        font-size: 1.1rem;
      }

      .detail-section p {
        margin: 0;
      }

      dl {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem 2rem;
        margin: 0;
      }

      dt {
        margin-bottom: 0.35rem;
        color: #64748b;
        font-size: 0.85rem;
      }

      dd {
        margin: 0;
        overflow-wrap: anywhere;
      }

      dd a {
        color: var(--clientflow-brand-indigo);
      }

      .record-dates {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem 2rem;
        border: 0;
        color: #64748b;
        font-size: 0.85rem;
      }

      .status-badge {
        display: inline-flex;
        border-radius: 999px;
        padding: 0.3rem 0.55rem;
        background: #f1f5f9;
        color: #334155;
        font-size: 0.8rem;
        font-weight: 600;
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

      @media (max-width: 640px) {
        .details-header {
          align-items: flex-start;
          flex-direction: column;
        }

        dl {
          grid-template-columns: minmax(0, 1fr);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientStore = inject(ClientStore);
  private readonly dialog = inject(MatDialog);

  readonly client = signal<Client | null>(null);
  readonly isLoading = signal(true);
  readonly isDeleting = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.isLoading.set(false);
      this.error.set('No client ID was provided.');
      return;
    }

    this.clientStore.getById(id).subscribe({
      next: (client) => {
        this.client.set(client);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('This client could not be loaded.');
      },
    });
  }

  goToList(): void {
    void this.router.navigate(['/clients']);
  }

  confirmDelete(): void {
    const client = this.client();
    if (!client || this.isDeleting()) {
      return;
    }

    const confirmation: ClientDialogData = {
      kind: 'confirm',
      title: 'Delete this client?',
      message: `${client.fullName} will be permanently removed.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    };

    this.dialog.open(ClientDialogComponent, { data: confirmation }).afterClosed().subscribe((confirmed) => {
      if (confirmed !== true) {
        return;
      }

      this.isDeleting.set(true);
      this.clientStore.remove(client.id).subscribe({
        next: () => {
          this.isDeleting.set(false);
          const success: ClientDialogData = {
            kind: 'message',
            title: 'Client deleted',
            message: `${client.fullName} was removed.`,
            confirmLabel: 'Close',
          };
          this.dialog
            .open(ClientDialogComponent, { data: success })
            .afterClosed()
            .subscribe(() => this.goToList());
        },
        error: () => {
          this.isDeleting.set(false);
          const failure: ClientDialogData = {
            kind: 'message',
            title: 'Could not delete client',
            message: 'The client could not be removed. Please try again.',
            confirmLabel: 'Close',
          };
          this.dialog.open(ClientDialogComponent, { data: failure });
        },
      });
    });
  }
}