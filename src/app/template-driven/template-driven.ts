import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-template-driven',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Template-driven Forms</h2>
    <p class="note">Következő commit… (a form itt fog megjelenni)</p>
  `,
  styles: [
    `:host { display: block; }
    .note { font-size: 0.85rem; color: #64748b; background: #f8fafc;
      border-left: 3px solid #94a3b8; padding: 0.5rem 0.75rem; border-radius: 0 6px 6px 0; }`,
  ],
})
export class TemplateDriven {}
