import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  minLength,
  required,
  validate,
  validateAsync,
} from '@angular/forms/signals';
import { UsernameAvailabilityService } from '../shared/username-availability.service';

interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}

/**
 * SIGNAL FORMS – 3. lépés: cross-field és async validáció.
 *
 * Cross-field: a `validate()` callback `{ value, valueOf }` kontextet kap.
 * A `valueOf(path.password)` reaktívan olvassa a másik mezőt — újrafut,
 * ha bármelyik változik, anélkül hogy külön csoport-validátort kellene írni.
 *
 * Async: `validateAsync()` egy Angular `resource`-t kap. A `debounce: 400`
 * megakadályozza, hogy minden gombnyomásra HTTP-kérés menjen ki.
 * A `pending()` signal jelzi, amíg a kérés fut.
 */
@Component({
  selector: 'app-signal-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField],
  templateUrl: './signal-forms.html',
  styleUrl: '../shared/form.scss',
})
export class SignalForms {
  private readonly usernames = inject(UsernameAvailabilityService);

  protected readonly signupModel = signal<SignupData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });

  protected readonly f = form(this.signupModel, (path) => {
    required(path.email, { message: 'Az e-mail kötelező' });
    email(path.email, { message: 'Érvénytelen e-mail cím' });

    required(path.password, { message: 'A jelszó kötelező' });
    minLength(path.password, 8, { message: 'Legalább 8 karakter' });

    required(path.confirmPassword, { message: 'Erősítsd meg a jelszót' });
    // Cross-field: a valueOf(path.password) reaktívan olvassa a másik mezőt.
    validate(path.confirmPassword, ({ value, valueOf }) =>
      value() !== valueOf(path.password)
        ? { kind: 'passwordMismatch', message: 'A jelszavak nem egyeznek' }
        : null,
    );

    required(path.username, { message: 'A felhasználónév kötelező' });
    validateAsync(path.username, {
      params: ({ value }) => value().trim().toLowerCase() || undefined,
      factory: (name) =>
        resource({
          params: () => name(),
          loader: async ({ params }) =>
            params ? await this.usernames.isTaken(params) : false,
        }),
      onSuccess: (taken) =>
        taken ? { kind: 'usernameTaken', message: 'Ez a felhasználónév foglalt' } : null,
      onError: () => ({ kind: 'usernameCheckFailed', message: 'Az ellenőrzés nem sikerült' }),
      debounce: 400,
    });
  });

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (this.f().valid()) console.log('Regisztráció:', this.signupModel());
  }
}
