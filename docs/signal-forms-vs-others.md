# Angular Signal Forms — összehasonlítás a korábbi megoldásokkal

> Készült az **Angular v22.0.1** ténylegesen telepített API-ja alapján
> (`@angular/forms/signals` típusdefiníciók), kiegészítve a lenti forrásokkal.
> A Signal Forms a v21-es developer preview után az **Angular 22-ben stabil,
> production-ready** lett (a `form()` és társai `@publicApi 22.0` jelölésűek).

## 1. Miről van szó?

Az Angularnak eddig két form-megoldása volt:

- **Template-driven** (`FormsModule`, `[(ngModel)]`) — a logika a sablonban él,
  kevés TS, de gyenge típusosság és nehézkes összetett validáció.
- **Reactive** (`ReactiveFormsModule`, `FormGroup`/`FormControl`/`FormArray`) —
  explicit, programozott form-fa, jó kontroll, de sok boilerplate.

A **Signal Forms** (Angular 21-ben developer preview, **22-ben stabil**) egy harmadik
út, amely a **signalokra** épül: a form forrása egyetlen writable signal modell, és a
`form()` köré épít egy reaktív `FieldTree`-t.

## 2. A mentális modell különbsége

| | Reactive | Signal Forms |
|---|---|---|
| Forrás | a `FormControl`-fa **maga** az állapot | a **modell-signal** az állapot |
| Irány | a fát építed, az értéket abból olvasod | a modellt definiálod, a form követi |
| Építőkövek | `FormGroup`, `FormControl`, `FormArray` | nincs — csak a **Field** fogalom |

A kulcs: Signal Formsban **nincs** külön `FormGroup`/`FormControl`/`FormArray`.
A `FieldTree` szerkezete a modell alakját tükrözi. Egy `FieldTree<{email: string}>`
automatikusan rendelkezik `.email` gyerek-mezővel, amelynek hívásával
(`form.email()`) megkapod a `FieldState`-et.

## 3. Alap-API (v22.0.1)

```ts
import { form, required, email, minLength, validate } from '@angular/forms/signals';

const model = signal({ email: '', password: '' });

const f = form(model, (path) => {
  required(path.email, { message: 'Kötelező' });
  email(path.email);
  minLength(path.password, 8);
});

f().valid();        // a teljes form érvényessége (signal)
f.email().value();  // egy mező értéke (signal)
f.email().errors(); // egy mező hibái (signal)
f.email().touched();
```

A sablonban a kötés a **`[formField]`** direktívával történik (figyelem: sok
korai blog még `[control]`-t ír — a v22-ben telepített selector `[formField]`):

```html
<input [formField]="f.email" />
@for (e of f.email().errors(); track e.kind) {
  <span class="error">{{ e.message }}</span>
}
```

## 4. Validáció

| Eset | Reactive | Signal Forms (v22) |
|---|---|---|
| Egyszerű | `Validators.required`, `Validators.email` | `required(path)`, `email(path)` |
| Beépítettek | `min/max/minLength/maxLength/pattern` | `min/max/minLength/maxLength/pattern` |
| Egyedi | saját `ValidatorFn` | `validate(path, ctx => ...)` |
| Cross-field | csoport-szintű `ValidatorFn` | `validate(path.b, ({valueOf}) => valueOf(path.a) ...)` |
| Fa-szintű | manuálisan | `validateTree(path, ...)` |
| Async | `AsyncValidatorFn` (Observable) | `validateAsync` / `validateHttp` (resource) |
| Feltételes | kézi enable/disable | `disabled`, `hidden`, `readonly`, `required({when})` |

A custom hiba sima objektum: `{ kind: 'passwordMismatch', message: '...' }`.

### Cross-field — egy helyen, típusosan

```ts
validate(path.confirmPassword, ({ value, valueOf }) =>
  value() !== valueOf(path.password)
    ? { kind: 'passwordMismatch', message: 'A jelszavak nem egyeznek' }
    : null,
);
```

Reactiveban ehhez a **csoportra** kell validátort tenni, és a hibát a csoportról
olvasni — kevésbé lokális.

### Async — resource + debounce beépítve

```ts
validateAsync(path.username, {
  params: ({ value }) => value().trim().toLowerCase() || undefined,
  factory: (name) => resource({
    params: () => name(),
    loader: async ({ params }) => params ? await api.isTaken(params) : false,
  }),
  onSuccess: (taken) => taken ? { kind: 'usernameTaken', message: 'Foglalt' } : null,
  onError: () => ({ kind: 'checkFailed', message: 'Hiba' }),
  debounce: 400,
});
```

A `pending()` signal jelzi a folyamatban lévő ellenőrzést; az async validáció csak
akkor fut, ha a szinkron validáció már átment.

## 5. Egyedi controlok — a legnagyobb egyszerűsödés

**Régen (ControlValueAccessor):** `NG_VALUE_ACCESSOR` provider, `forwardRef`,
`multi: true`, és 4 kötelező metódus (`writeValue`, `registerOnChange`,
`registerOnTouched`, `setDisabledState`), plusz a callbackek kézi hívása.

```ts
@Component({
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StarRating), multi: true }],
})
export class StarRating implements ControlValueAccessor {
  writeValue(v: number) { /* ... */ }
  registerOnChange(fn) { this.onChange = fn; }
  registerOnTouched(fn) { this.onTouched = fn; }
  setDisabledState(d: boolean) { /* ... */ }
}
```

**Signal Forms (`FormValueControl`):** a teljes szerződés egyetlen `model()`.

```ts
export class StarRating implements FormValueControl<number> {
  readonly value = model<number>(0);
}
```

Checkbox-szerű controlhoz `FormCheckboxControl` (`checked = model<boolean>()`).
Szám/parse-igényes inputhoz `transformedValue(value, { parse, format })`.

### Kompatibilitás

A `[formField]` direktíva háromféle controlt fogad: (1) natív input/textarea,
(2) `FormValueControl`/`FormCheckboxControl`, (3) **régi `ControlValueAccessor`** —
így a meglévő Reactive-controlok módosítás nélkül használhatók Signal Formban.
Reactive→Signal hídhoz létezik a `@angular/forms/signals/compat` (`SignalFormControl`).

## 6. Tesztelhetőség

Signal Formsban a modell signal, az állapot computed — így a teszt szinkron és rövid:

```ts
model.update((m) => ({ ...m, confirmPassword: 'eltér' }));
expect(f.confirmPassword().errors().some(e => e.kind === 'passwordMismatch')).toBe(true);
```

Nincs `fixture.detectChanges()` tánc és nincs `valueChanges` feliratkozás. Az egyedi
control tesztje sem igényel CVA-harnesst: `componentRef.setInput('value', 3)` (model→view),
illetve kattintás után `componentInstance.value()` (view→model). Lásd a demó
`*.spec.ts` fájljait.

## 7. Beküldés (submit)

```ts
await submit(f, {
  action: async (field) => { await api.save(field().value()); },
  onInvalid: () => { /* ... */ },
  ignoreValidators: 'pending', // alapértelmezett
});
```

A `<form [formRoot]="f">` direktíva beállítja a `novalidate`-et és elkapja a submitet.
A `f().submitting()` signal jelzi a folyamatban lévő beküldést.

## 8. Mikor melyiket?

- **Template-driven** — egyszerű, rövid életű formok, kevés validáció.
- **Reactive** — ma is ez az éles, stabil választás összetett formokra.
- **Signal Forms** — **v22-től stabil, production-ready**; signal-alapú kódbázisban az
  ajánlott irány új formokhoz (Material + Aria integrációval). A v21→v22 átmenetben az
  API a közösségi visszajelzések alapján megkeményedett.

## Források

- [Angular — Signal Forms / Custom controls](https://angular.dev/guide/forms/signals/custom-controls)
- [Angular CLI MCP Server](https://angular.dev/ai/mcp)
- [Angular Signal Forms — Everything You Need to Know (AngularArchitects)](https://www.angulararchitects.io/blog/all-about-angulars-new-signal-forms/)
- [Signal Forms in Angular 21 — Complete Guide (Angular.love)](https://angular.love/signal-forms-in-angular-21-complete-guide)
- [FormValueControl Deep Dive (Netanel Basal)](https://medium.com/netanelbasal/formvaluecontrol-deep-dive-into-angular-signal-forms-custom-controls-af68ce33df37)
- [Mastering Angular 21 Signal Forms (Código Tipado)](https://www.codigotipado.com/p/mastering-angular-21-signal-forms)
- Helyi forrás: `node_modules/@angular/forms/types/signals.d.ts` (v22.0.1)
