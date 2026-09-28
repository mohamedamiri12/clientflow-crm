import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-follow-up-list',
  standalone: true,
  template: `
    <section class="feature-page">
      <h1>Follow-ups</h1>
      <p>Prioritize the next outreach actions, due dates, and outstanding customer touchpoints.</p>
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
export class FollowUpListComponent {}
