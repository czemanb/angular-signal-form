import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

interface LoginData {
  email: string;
  password: string;
}

/**
 * SIGNAL FORMS – 1. lépés: az alap.
 *
 * Három fogalom:
 *  1. `signal<LoginData>(...)` — ez a forrás; minden ebből jön.
 *  2. `form(model)` — FieldTree-t épít a modell alakja szerint.
 *  3. `[formField]` — köti az inputot a FieldTree csomópontjához.
 *
 * Még nincs validáció — csak a kötés és a reaktív értékolvasás.
 * Gépelj bele az e-mail mezőbe: a modell élőben frissül.
 */
@Component({
  selector: 'app-signal-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, JsonPipe],
  templateUrl: './signal-forms.html',
  styleUrl: '../shared/form.scss',
})
export class SignalForms {
  protected readonly loginModel = signal<LoginData>({ email: '', password: '' });
  protected readonly f = form(this.loginModel);
}
