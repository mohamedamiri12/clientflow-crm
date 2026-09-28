import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-client-list',
  standalone: true,
  template: `
    <section class="feature-page">
      <h1>Clients</h1>
      <p>Review all client accounts, filter by status, and manage account details.</p>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientListComponent {}
