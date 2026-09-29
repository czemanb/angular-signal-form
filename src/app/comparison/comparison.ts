import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Row {
  aspect: string;
  template: string;
  reactive: string;
  signal: string;
}

@Component({
  selector: 'app-comparison',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comparison.html',
  styleUrl: './comparison.scss',
})
export class Comparison {
  protected readonly cvaSnippet = `@Component({
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => StarRatingCva),
    multi: true,
  }],
})
export class StarRatingCva implements ControlValueAccessor {
  writeValue(v: number) { /* ... */ }
  registerOnChange(fn) { this.onChange = fn; }
  registerOnTouched(fn) { this.onTouched = fn; }
  setDisabledState(d: boolean) { /* ... */ }
  // + kézi onChange()/onTouched() hívások
}`;

  protected readonly signalSnippet = `@Component({ /* nincs provider */ })
export class StarRating implements FormValueControl<number> {
  readonly value = model<number>(0);
}`;

  protected readonly rows: Row[] = [
    {
      aspect: 'Forrás az igazságra',
      template: 'Komponens-property + sablon',
      reactive: 'FormGroup/FormControl fa',
      signal: 'Egyetlen signal modell',
    },
    {
      aspect: 'Struktúra',
      template: 'Implicit, a sablonból',
      reactive: 'FormGroup / FormControl / FormArray',
      signal: 'FieldTree a modell alakja szerint (nincs külön group/control)',
    },
    {
      aspect: 'Típusosság',
      template: 'Gyenge (ngModel any-szerű)',
      reactive: 'Typed forms (v14+), de bőbeszédű',
      signal: 'Teljes, a modell típusából levezetve',
    },
    {
      aspect: 'Validáció',
      template: 'Attribútumok a sablonban',
      reactive: 'Validators tömbök a TS-ben',
      signal: 'Deklaratív schema (required, email, validate…)',
    },
    {
      aspect: 'Cross-field',
      template: 'Sablon-összehasonlítás / direktíva',
      reactive: 'Csoport-szintű ValidatorFn',
      signal: 'validate() + ctx.valueOf(path) ugyanott',
    },
    {
      aspect: 'Async validáció',
      template: 'Nehézkes, saját direktíva kell',
      reactive: 'AsyncValidatorFn (Observable/Promise)',
      signal: 'validateAsync() resource-szal, debounce beépítve',
    },
    {
      aspect: 'Egyedi control',
      template: 'CVA (gyakorlatban Reactive-kal)',
      reactive: 'ControlValueAccessor + forwardRef + provider',
      signal: 'FormValueControl: csak value = model()',
    },
    {
      aspect: 'Állapot olvasása',
      template: '#ref="ngModel".touched/.errors',
      reactive: 'control.value/.errors/.touched (nem reaktív)',
      signal: 'Signalok: field().value()/.errors()/.pending()',
    },
    {
      aspect: 'Reaktivitás',
      template: 'Zone-alapú',
      reactive: 'valueChanges Observable',
      signal: 'Natív signal — computed/effect közvetlenül',
    },
    {
      aspect: 'Tesztelhetőség',
      template: 'DOM-központú, körülményes',
      reactive: 'Jó, de sok boilerplate',
      signal: 'model.set() → field().errors() — sync, kevés kód',
    },
    {
      aspect: 'Állapot',
      template: 'Stabil',
      reactive: 'Stabil',
      signal: 'Stabil, production-ready (Angular 22+)',
    },
  ];
}
