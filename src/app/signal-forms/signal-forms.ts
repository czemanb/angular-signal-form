import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  min,
  minLength,
  required,
  validate,
  validateAsync,
} from '@angular/forms/signals';
import { UsernameAvailabilityService } from '../shared/username-availability.service';
import { StarRating } from '../shared/star-rating-signal/star-rating';

interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  rating: number;
}

/**
 * SIGNAL FORMS – 4. lépés: FormValueControl – signal-alapú custom control.
 *
 * A `StarRating` komponens a `FormValueControl<number>` interface-t valósítja meg.
 * A teljes szerződés egyetlen `value = model<number>(0)` sor — nincs `NG_VALUE_ACCESSOR`
 * provider, nincs `forwardRef`, nincs 4 kötelező metódus.
 *
 * Hasonlítsd össze a Reactive Forms tabban lévő `StarRatingCva`-val!
 */
@Component({
  selector: 'app-signal-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, StarRating],
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
    rating: 0,
  });

  protected readonly f = form(this.signupModel, (path) => {
    required(path.email, { message: 'Az e-mail kötelező' });
    email(path.email, { message: 'Érvénytelen e-mail cím' });

    required(path.password, { message: 'A jelszó kötelező' });
    minLength(path.password, 8, { message: 'Legalább 8 karakter' });

    required(path.confirmPassword, { message: 'Erősítsd meg a jelszót' });
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

    // Az egyedi control mezője ugyanúgy validálható, mint bármely más mező.
    min(path.rating, 1, { message: 'Adj értékelést (1–5 csillag)' });
  });

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (this.f().valid()) console.log('Regisztráció:', this.signupModel());
  }
}
