import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

/**
 * Egyedi control SIGNAL FORMS módra.
 *
 * Nincs `ControlValueAccessor`, nincs `forwardRef`, nincs `NG_VALUE_ACCESSOR`
 * provider, nincs `onChange`/`onTouched` kézi hívogatás. A teljes szerződés
 * egyetlen `value = model<number>()`. A `[formField]` direktíva ezt két-irányban
 * a mező értékéhez köti.
 *
 * Hasonlítsd össze a `StarRatingCva`-val ugyanebben a mappában!
 */
@Component({
  selector: 'app-star-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stars" role="radiogroup" aria-label="Értékelés">
      @for (star of stars; track star) {
        <button
          type="button"
          class="star"
          [class.filled]="star <= value()"
          (click)="value.set(star)"
          [attr.aria-label]="star + ' csillag'"
        >
          ★
        </button>
      }
      @if (value() > 0) {
        <button type="button" class="clear" (click)="value.set(0)">törlés</button>
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
      transition: color 0.1s;
    }
    .star.filled {
      color: #f59e0b;
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
export class StarRating implements FormValueControl<number> {
  /** A SIGNAL FORMS szerződés egyetlen kötelező tagja. */
  readonly value = model<number>(0);

  protected readonly stars = [1, 2, 3, 4, 5];
}
