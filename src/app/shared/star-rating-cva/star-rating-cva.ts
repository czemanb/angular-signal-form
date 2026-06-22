import { ChangeDetectionStrategy, Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * UGYANAZ az egyedi control a RÉGI módon: `ControlValueAccessor`.
 *
 * Figyeld meg a kötelező kelléktárat, ami a Signal Forms verzióból eltűnik:
 *  - `NG_VALUE_ACCESSOR` provider `useExisting` + `forwardRef` + `multi: true`,
 *  - 4 interfész-metódus: `writeValue`, `registerOnChange`, `registerOnTouched`,
 *    `setDisabledState`,
 *  - kézzel tárolt `onChange` / `onTouched` callbackek, amiket nekünk kell hívni.
 *
 * Ez a Reactive Forms nézetben szerepel, hogy lássuk: a Signal Forms a régi
 * CVA-controlokkal is kompatibilis marad ([formField] 3. opció).
 */
@Component({
  selector: 'app-star-rating-cva',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StarRatingCva),
      multi: true,
    },
  ],
  template: `
    <div class="stars" role="radiogroup" aria-label="Értékelés">
      @for (star of stars; track star) {
        <button
          type="button"
          class="star"
          [class.filled]="star <= rating()"
          [disabled]="isDisabled()"
          (click)="select(star)"
          [attr.aria-label]="star + ' csillag'"
        >
          ★
        </button>
      }
      @if (rating() > 0 && !isDisabled()) {
        <button type="button" class="clear" (click)="select(0)">törlés</button>
      }
    </div>
  `,
  styles: `
    .stars {
      display: inline-flex;
      gap: 0.25rem;
      align-items: center;
    }
    .star {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.6rem;
      line-height: 1;
      padding: 0;
      color: #cbd5e1;
    }
    .star.filled {
      color: #f59e0b;
    }
    .star:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .clear {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.8rem;
      color: #64748b;
      margin-left: 0.5rem;
    }
  `,
})
export class StarRatingCva implements ControlValueAccessor {
  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly rating = signal(0);
  protected readonly isDisabled = signal(false);

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  protected select(value: number): void {
    if (this.isDisabled()) {
      return;
    }
    this.rating.set(value);
    this.onChange(value);
    this.onTouched();
  }

  // --- ControlValueAccessor: a kötelező 4 metódus ---
  writeValue(value: number): void {
    this.rating.set(value ?? 0);
  }
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
