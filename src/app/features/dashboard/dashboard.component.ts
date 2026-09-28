import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';

import { ClientStore } from '../clients/client.store';
import { FollowUpStore } from '../follow-ups/follow-up.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <section class="feature-page dashboard-page">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">Overview</p>
          <h1>Dashboard</h1>
        </div>
      </header>

      @if (isLoading()) {
        <div class="state-card state-card--loading">
          <p>Loading dashboard…</p>
        </div>
      } @else if (hasError()) {
        <div class="state-card state-card--error">
          <h2>Something went wrong</h2>
          <p>{{ errorMessage() }}</p>
        </div>
      } @else if (isEmpty()) {
        <div class="state-card state-card--empty">
          <h2>No data yet</h2>
          <p>There are no clients or follow-ups to display right now.</p>
        </div>
      } @else {
        <div class="stat-grid">
          @for (metric of metrics(); track metric.label) {
            <article class="stat-card">
              <p class="stat-card__label">{{ metric.label }}</p>
              <p class="stat-card__value">{{ metric.value }}</p>
              <p class="stat-card__meta">{{ metric.meta }}</p>
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .dashboard-page {
        display: grid;
        gap: 1.5rem;
      }

      .dashboard-header h1 {
        margin: 0;
      }

      .eyebrow {
        margin: 0 0 0.4rem;
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #64748b;
        font-weight: 700;
      }

      .state-card,
      .stat-card {
        background: linear-gradient(180deg, #ffffff, #f8fafc);
        border: 1px solid #e2e8f0;
        border-radius: 1rem;
        padding: 1.25rem 1.5rem;
      }

      .state-card--loading,
      .state-card--empty {
        color: #475569;
      }

      .state-card--error {
        border-color: #fecaca;
        background: #fff7f7;
      }

      .state-card--error h2,
      .state-card--empty h2 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }

      .state-card--error p,
      .state-card--empty p,
      .state-card--loading p {
        margin: 0;
      }

      .stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
      }

      .stat-card {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .stat-card__label {
        margin: 0;
        color: #64748b;
        font-size: 0.82rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .stat-card__value {
        margin: 0;
        font-size: clamp(1.8rem, 4vw, 2.5rem);
        font-weight: 700;
        color: var(--clientflow-brand-indigo);
      }

      .stat-card__meta {
        margin: 0;
        color: #475569;
        font-size: 0.88rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly clientStore = inject(ClientStore);
  private readonly followUpStore = inject(FollowUpStore);

  readonly isLoading = computed(
    () => this.clientStore.isLoading() || this.followUpStore.isLoading(),
  );

  readonly hasError = computed(
    () => Boolean(this.clientStore.error()) || Boolean(this.followUpStore.error()),
  );

  readonly errorMessage = computed(
    () => this.clientStore.error() ?? this.followUpStore.error() ?? 'Please try again later.',
  );

  readonly isEmpty = computed(
    () => this.clientStore.clientCount() === 0 && this.followUpStore.followUpCount() === 0,
  );

  readonly metrics = computed(() => [
    {
      label: 'Total clients',
      value: this.clientStore.clientCount(),
      meta: 'Across all client accounts',
    },
    {
      label: 'Active clients',
      value: this.clientStore.activeClientCount(),
      meta: 'Currently in good standing',
    },
    {
      label: 'Open follow-ups',
      value: this.followUpStore.openFollowUpCount(),
      meta: 'Still needing attention',
    },
    {
      label: 'Overdue',
      value: this.followUpStore.overdueFollowUpCount(),
      meta: 'Past due actions',
    },
  ]);

  ngOnInit(): void {
    this.clientStore.load();
    this.followUpStore.load();
  }
}
