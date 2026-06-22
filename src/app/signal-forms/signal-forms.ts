import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { email, form, FormField, minLength, required } from '@angular/forms/signals';

interface LoginData {
  email: string;
  password: string;
}

/**
 * SIGNAL FORMS – 2. lépés: beépített validátorok és hibaüzenetek.
 *
 * A `form()` második argumentuma a **schema-függvény** — ez egyszer fut le,
 * és deklaratívan rögzíti a szabályokat. Az állapot mind signal:
 *  - `f.email().touched()` — belemaszkolt-e a user?
 *  - `f.email().invalid()` — van-e hiba?
 *  - `f.email().errors()` — `{ kind, message }[]` tömb
 *
 * A minta: csak `touched() && invalid()` esetén mutasd a hibákat.
 */
@Component({
  selector: 'app-signal-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField],
  templateUrl: './signal-forms.html',
  styleUrl: '../shared/form.scss',
})
export class SignalForms {
  protected readonly loginModel = signal<LoginData>({ email: '', password: '' });

  protected readonly f = form(this.loginModel, (path) => {
    required(path.email, { message: 'Az e-mail kötelező' });
    email(path.email, { message: 'Érvénytelen e-mail cím' });
    required(path.password, { message: 'A jelszó kötelező' });
    minLength(path.password, 8, { message: 'Legalább 8 karakter' });
  });

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (this.f().valid()) console.log('Bejelentkezés:', this.loginModel());
  }
}
