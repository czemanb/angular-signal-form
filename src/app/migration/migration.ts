import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { email, FormField, minLength, required } from '@angular/forms/signals';
import { compatForm, extractValue, SignalFormControl } from '@angular/forms/signals/compat';

/**
 * MIGRÁCIÓ – két stratégia a fokozatos átállásra.
 *
 * A: TOP-DOWN (compatForm)
 *   A signal form a tetőn, de egyes részfák maradhatnak régi FormControl-ok.
 *   Tipikus eset: van egy komplex, vállalati validátorral rendelkező FormControl,
 *   amit nem akarunk újraírni. A compatForm beágyazza a meglévő control-t,
 *   és az összes Signal Forms API – f.password().errors(), f().valid() –
 *   átlátszóan proxy-l a FormControl állapotára.
 *
 * B: BOTTOM-UP (SignalFormControl)
 *   A meglévő FormGroup marad, de egyes levél-mezőket signal-alapúra cserélünk.
 *   A SignalFormControl kiterjeszt egy AbstractControl-t, ezért a FormGroup
 *   validitása és a markAllAsTouched() változatlanul működnek.
 *   A sablonban a [formField]="emailCtrl.fieldTree" adja a signal-os kötést,
 *   a többi mező marad formControlName-mel.
 */

// Szimulált "örökölt" vállalati jelszó-validátor.
function enterprisePasswordValidator() {
  return Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/);
}

@Component({
  selector: 'app-migration',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, ReactiveFormsModule],
  templateUrl: './migration.html',
  styleUrls: ['../shared/form.scss', './migration.scss'],
})
export class Migration {
  // ──────────────────────────────────────────────────────────────────────────
  // A: TOP-DOWN — compatForm
  // ──────────────────────────────────────────────────────────────────────────

  // A meglévő FormControl komplexebb validátorral, amit nem írunk újra.
  protected readonly legacyPasswordCtrl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(8),
      enterprisePasswordValidator(),
    ],
  });

  // A signal modell tartalmazza az új email mezőt ÉS a meglévő FormControl-t.
  protected readonly topDownModel = signal({
    email: '',
    password: this.legacyPasswordCtrl,
  });

  // compatForm: signal validátor csak az új email mezőre; a password marad a FormControl validátornál.
  protected readonly topDownForm = compatForm(this.topDownModel, (path) => {
    required(path.email, { message: 'Az e-mail kötelező' });
    email(path.email, { message: 'Érvénytelen e-mail cím' });
  });

  protected readonly topDownSubmitted = signal<{ email: string; password: string } | null>(null);

  protected onTopDownSubmit(event: Event): void {
    event.preventDefault();
    if (!this.topDownForm().valid()) {
      this.legacyPasswordCtrl.markAsTouched();
      return;
    }
    // extractValue kibontja a FormControl értékét nyers stringgé.
    const value = extractValue(this.topDownForm) as { email: string; password: string };
    this.topDownSubmitted.set(value);
  }

  // FormControl hibáiból olvasható üzenetek a sablonban.
  protected compatMessage(kind: string): string {
    return (
      {
        required: 'Kötelező mező',
        minlength: 'Legalább 8 karakter',
        pattern: 'Legalább egy nagybetű és egy szám szükséges',
      }[kind] ?? kind
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // B: BOTTOM-UP — SignalFormControl
  // ──────────────────────────────────────────────────────────────────────────

  // Az email mezőt Signal Forms szabályokkal cseréljük le a meglévő FormGroup-ban.
  protected readonly emailCtrl = new SignalFormControl('', (p) => {
    required(p, { message: 'Az e-mail kötelező' });
    email(p, { message: 'Érvénytelen e-mail cím' });
  });

  // A meglévő FormGroup változatlan – csak az email lett SignalFormControl.
  protected readonly bottomUpForm = new FormGroup({
    email: this.emailCtrl,
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  protected readonly bottomUpSubmitted = signal<{ email: string; password: string } | null>(null);

  protected onBottomUpSubmit(): void {
    if (this.bottomUpForm.invalid) {
      this.bottomUpForm.markAllAsTouched();
      this.bottomUpSubmitted.set(null);
      return;
    }
    this.bottomUpSubmitted.set(
      this.bottomUpForm.getRawValue() as { email: string; password: string },
    );
  }
}
