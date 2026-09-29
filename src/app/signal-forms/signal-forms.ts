import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import {
  debounce,
  email,
  form,
  FormField,
  FormRoot,
  min,
  minLength,
  required,
  submit,
  validate,
  validateAsync,
} from '@angular/forms/signals';
import {
  COUNTRIES,
  emptyRegistration,
  Registration,
} from '../shared/registration.model';
import { UsernameAvailabilityService } from '../shared/username-availability.service';
import { StarRating } from '../shared/star-rating-signal/star-rating';

/**
 * SIGNAL FORMS – 5. lépés: teljes regisztrációs form.
 *
 * Új elemek ehhez a commithoz:
 *  - `FormRoot` direktíva: `[formRoot]` beállítja a `novalidate`-et és
 *    elkapja a submit eseményt — nem kell `(submit)="onSubmit($event)"`.
 *  - `submit()` függvény: érintetté tesz minden mezőt, validál, majd
 *    lefuttatja az `action`-t. Közben `f().submitting()` true.
 *  - Dinamikus tag-lista: nincs `FormArray.push()` — a modell signal
 *    tömbjét frissítjük (`model.update(m => ...)`).
 *  - Teljes `Registration` modell: ország, hírlevél, értékelés, tag-ek.
 */
@Component({
  selector: 'app-signal-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, FormRoot, StarRating, JsonPipe],
  templateUrl: './signal-forms.html',
  styleUrl: '../shared/form.scss',
})
export class SignalForms {
  private readonly usernames = inject(UsernameAvailabilityService);

  protected readonly countries = COUNTRIES;
  protected readonly submitted = signal<Registration | null>(null);

  protected readonly model = signal<Registration>(emptyRegistration());

  protected readonly f = form(
    this.model,
    (path) => {
      required(path.fullName, { message: 'A név kötelező' });
      minLength(path.fullName, 3, { message: 'Legalább 3 karakter' });

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
            loader: async ({ params }) => (params ? await this.usernames.isTaken(params) : false),
          }),
        onSuccess: (taken) =>
          taken ? { kind: 'usernameTaken', message: 'Ez a felhasználónév foglalt' } : null,
        onError: () => ({
          kind: 'usernameCheckFailed',
          message: 'Az ellenőrzés nem sikerült',
        }),
        debounce: 400,
      });
      required(path.country, { message: 'Válassz országot' });

      min(path.rating, 1, { message: 'Adj értékelést' });

      minLength(path.tags, 1, { message: 'Adj meg legalább egy címkét' });
    },
    {
      submission: {
        //ignoreValidators: 'none',
        action: async (form) => {
          this.submitted.set(structuredClone(form().value()));
        },
        onInvalid: (field, detail) => {
          const first = detail.root().errorSummary()?.[0];
          first?.fieldTree()?.focusBoundControl?.();
        },
      },
    }
  );

  protected addTag(input: HTMLInputElement): void {
    const value = input.value.trim();
    if (value) {
      this.model.update((m) => ({ ...m, tags: [...m.tags, value] }));
      input.value = '';
    }
  }

  protected removeTag(index: number): void {
    this.model.update((m) => ({
      ...m,
      tags: m.tags.filter((_, i) => i !== index),
    }));
  }
}
