import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'clients/:id',
    loadComponent: () =>
      import('./features/clients/client-details.component').then((m) => m.ClientDetailsComponent),
  },
  {
    path: 'clients',
    loadComponent: () =>
      import('./features/clients/client-list.component').then((m) => m.ClientListComponent),
  },
  {
    path: 'follow-ups',
    loadComponent: () =>
      import('./features/follow-ups/follow-up-list.component').then((m) => m.FollowUpListComponent),
  },
];
