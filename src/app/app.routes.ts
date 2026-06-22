import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'signal' },
  {
    path: 'signal',
    title: 'Signal Forms',
    loadComponent: () =>
      import('./signal-forms/signal-forms').then((m) => m.SignalForms),
  },
  {
    path: 'reactive',
    title: 'Reactive Forms',
    loadComponent: () => import('./reactive/reactive').then((m) => m.Reactive),
  },
  {
    path: 'template',
    title: 'Template-driven Forms',
    loadComponent: () =>
      import('./template-driven/template-driven').then((m) => m.TemplateDriven),
  },
  {
    path: 'comparison',
    title: 'Összehasonlítás',
    loadComponent: () =>
      import('./comparison/comparison').then((m) => m.Comparison),
  },
  { path: '**', redirectTo: 'signal' },
];
