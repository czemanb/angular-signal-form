import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { from, map, Observable, of } from 'rxjs';
import {
  COUNTRIES,
  Registration,
} from '../shared/registration.model';
import { UsernameAvailabilityService } from '../shared/username-availability.service';
import { StarRatingCva } from '../shared/star-rating-cva/star-rating-cva';

/** Cross-field validátor: a két jelszó egyezzen. */
const passwordsMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pw = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pw === confirm ? null : { passwordMismatch: true };
};

/**
 * REACTIVE FORMS megoldás – a "klasszikus" megközelítés.
 *
 * Figyeld meg az összehasonlításhoz:
 *  - explicit `FormGroup` / `FormControl` / `FormArray` fa,
 *  - validátorok tömbökben (`Validators.required`, custom `ValidatorFn`),
 *  - külön `AsyncValidatorFn` az async ellenőrzéshez (Observable),
 *  - az egyedi control RÉGI `ControlValueAccessor` (`app-star-rating-cva`),
 *  - az érték/hiba olvasásához `.value`, `.errors`, `.touched` (nem signal).
 */
@Component({
  selector: 'app-reactive',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StarRatingCva, JsonPipe],
  templateUrl: './reactive.html',
  styleUrl: '../shared/form.scss',
})
export class Reactive {
  private readonly usernames = inject(UsernameAvailabilityService);

  protected readonly countries = COUNTRIES;
  protected readonly submitted = signal<Registration | null>(null);

  private usernameTaken(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const value = (control.value ?? '').trim().toLowerCase();
      if (!value) {
        return of(null);
      }
      return from(this.usernames.isTaken(value)).pipe(
        map((taken) => (taken ? { usernameTaken: true } : null)),
      );
    };
  }

  protected readonly form = new FormGroup(
    {
      fullName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      username: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
        asyncValidators: [this.usernameTaken()],
      }),
      country: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      newsletter: new FormControl(false, { nonNullable: true }),
      rating: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.min(1)],
      }),
      tags: new FormArray<FormControl<string>>([], {
        validators: [Validators.required, Validators.minLength(1)],
      }),
    },
    { validators: [passwordsMatch] },
  );

  constructor() {
    this.form.valueChanges.subscribe((v) => localStorage.setItem('registration-draft', JSON.stringify(v)));
  }

  protected get tags(): FormArray<FormControl<string>> {
    return this.form.controls.tags;
  }

  protected addTag(input: HTMLInputElement): void {
    const value = input.value.trim();
    if (value) {
      this.tags.push(new FormControl(value, { nonNullable: true }));
      input.value = '';
    }
  }

  protected removeTag(index: number): void {
    this.tags.removeAt(index);
  }

  protected onSubmit(event: any): void {
    event.preventDefault()
    if (this.form.invalid || this.form.pending) {
      this.form.markAllAsTouched();
      this.submitted.set(null);
      return;
    }
    this.submitted.set(this.form.getRawValue() as Registration);
  }
}
