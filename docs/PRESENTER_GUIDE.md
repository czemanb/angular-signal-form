# Angular Signal Forms – Előadói útmutató

> **Formátum:** 45–60 perc · középhaladó szint · Angular 22 · élő demó
>
> Minden fejezet egy git commitnak felel meg. Checkout-old a commitot, mutasd
> az appot, mondj el néhány mondatot, majd lépj a következőre.

---

## Gyors start

```bash
# Klónozás után:
npm install
ng serve          # → http://localhost:4200

# A demóbranch betöltése:
git checkout demo/signal-forms-eloadas

# A commitok listája (legrégebbitől a legújabbig):
git log --oneline --reverse
```

---

## A commitok és mit mondj hozzájuk

### 1. commit – App shell, navigáció, placeholder oldalak

```bash
git checkout HEAD~9   # vagy a konkrét hash
```

**Mit mutass:** Nyisd meg a böngészőt. Négy tab látható a tetején: Signal Forms,
Reactive, Template-driven, Összehasonlítás. Minden oldalon egy „Következő
commit…" placeholder van.

**Mit mondj:**

> „Ez az alkalmazás váza, amire a mai demót felépítjük. Négy oldalt fogunk
> megnézni, és minden egyes git commit egy újabb réteg hozzáad az alkalmazáshoz.
> Az architektúra egyszerű: lazy-loaded komponensek, Angular Router, és semmi
> más. Az érdekes rész a formokban lesz."

> „Az Angular 22 bare minimum-a: `ng new` után ez az, amit kapunk. Mielőtt
> beleugrunk a Signal Formsba, megnézzük a korábbi megoldásokat is — fontos,
> hogy legyen összehasonlítási alap."

---

### 2. commit – Közös adatmodell és service

```bash
git checkout HEAD~8
```

**Mit mutass:** Nyisd meg a `src/app/shared/registration.model.ts` és
`username-availability.service.ts` fájlokat az IDE-ben.

**Mit mondj:**

> „Mielőtt megírjuk a formokat, rögzítsük a közös alapot. Ez a `Registration`
> interface az az adatmodell, amit mind a három megközelítés ugyanúgy használ.
> Ez azért fontos, mert így az összehasonlítás igazságos: nem a modell
> bonyolultságán múlik, hogy mennyi kódot kell írni."

> „A `UsernameAvailabilityService` egy szimulált szerver: 600 milliszekundum
> késleltetéssel adja vissza, hogy egy felhasználónév foglalt-e. Ez az async
> validációt teszi jól láthatóvá a UI-on. A `TAKEN_USERNAMES` tömbben vannak az
> előre definiált foglalt nevek: admin, root, test, angular, demo."

---

### 3. commit – Template-driven regisztrációs form

```bash
git checkout HEAD~7
```

**Mit mutass:** Kattints a „Template-driven" tabra. Töltsd ki a formot, próbáld
ki a validációt. Mutasd meg a TypeScript fájlt — milyen kevés van benne.

**Mit mondj:**

> „Az első megközelítés: Template-driven Forms. A jellemzője, hogy a logika
> nagy része a sablonban él. A `[(ngModel)]` two-way data binding köti az inputot
> a komponens propertyjéhez. A validáció attribútumokkal történik a templateben:
> `required`, `email`, `minlength` — ezeket az Angular FormsModule direktívái
> értelmezik."

> „A TypeScript fájl meglepően kevés kódot tartalmaz. Ez az erőssége: kis
> formokhoz gyors és kevés boilerplate. De figyeld meg a cross-field validációt
> a jelszavaknál: sablon-összehasonlítással csináltuk, mert nincs jobb beépített
> módszer. Az async validáció még nehézkesebb: blur-eseményre fut a kézi
> ellenőrzés, mert beépített `AsyncValidator` direktíva nincs template-driven
> módban. Ezek a méretezési korlátok."

---

### 4. commit – Reactive Forms + ControlValueAccessor custom control

```bash
git checkout HEAD~6
```

**Mit mutass:** Váltj a „Reactive" tabra. Próbáld ki a formot. Majd mutasd meg
egymás mellett a `reactive.ts`-t és a `star-rating-cva.ts`-t.

**Mit mondj:**

> „A második megközelítés: Reactive Forms. Ebben az esetben a TypeScript fájl
> tartalmaz mindent: explicit `FormGroup`, `FormControl`, `FormArray` fa,
> validátor-tömbök. A cross-field validátor most a csoportra van rakva —
> ez pontosabb, mint a template-megoldás, de a hiba a csoporton ül, nem a
> mezőn, ezért külön kell kiolvasni: `form.hasError('passwordMismatch')`."

> „Az async validáció is explicit: `AsyncValidatorFn` Observable-lal. Ez
> típusbiztos és tesztelhető, de figyelj rá, hogy mennyit kell írni: a
> `from()` + `pipe(map(...))` csak azért van, hogy a Promise-t Observable-lá
> alakítsuk."

> „Most a legjobb rész: a csillagos értékelés egyedi control. Nyisd meg a
> `star-rating-cva.ts`-t. Ez a `ControlValueAccessor` protokoll: `NG_VALUE_ACCESSOR`
> provider `forwardRef`-fel és `multi: true`-val, négy kötelező metódus —
> `writeValue`, `registerOnChange`, `registerOnTouched`, `setDisabledState` —
> és kézi callback-hívások minden egyes értékváltozásnál. Ezt minden Angular
> fejlesztő megírta már legalább egyszer. Jegyezd meg ezt a képet, mert
> mindjárt megnézzük, hogyan néz ki ez Signal Formsban."

---

### 5. commit – Az első Signal Form: signal(), form(), [formField]

```bash
git checkout HEAD~5
```

**Mit mutass:** Kattints a „Signal Forms" tabra. Gépelj bele az e-mail mezőbe
— a live preview alul azonnal frissül. Mutasd meg a `signal-forms.ts`-t.

**Mit mondj:**

> „Most jön a Signal Forms. Az alapötlet nagyon egyszerű: a forrás egyetlen
> writable signal — `loginModel = signal<LoginData>(...)`. A `form()` függvény
> ebből épít egy `FieldTree`-t: az `f.email` és `f.password` mezők
> automatikusan létrejönnek a modell típusa alapján — TypeScript inferálja őket."

> „A `[formField]` direktíva köti az inputot a FieldTree csomópontjához. Ez az
> egyetlen sablonszintű API, amit meg kell tanulni. Most gépelj bele az e-mail
> mezőbe és figyeld az alul lévő `loginModel()` kiíratást: a modell élőben
> frissül, reaktívan, Zone nélkül, natív Angular signal reaktivitással."

> „Az `f.email()` hívás egy `FieldState`-et ad vissza. Ebből olvasható a
> `value()`, a `valid()`, az `invalid()`, a `touched()`, a `dirty()`, a
> `pending()`, és az `errors()` — mindegyik signal. Ezeket használhatod
> `computed`-ban, `effect`-ben, bárhol."

---

### 6. commit – Beépített validátorok és hibaüzenetek

```bash
git checkout HEAD~4
```

**Mit mutass:** Kattints be az e-mail mezőbe, majd ki anélkül, hogy gépeltél
volna. Gépelj egy érvénytelen e-mailt. Mutasd meg, ahogy a hibák megjelennek
és eltűnnek.

**Mit mondj:**

> „Adjunk validációt. A `form()` második argumentuma a schema-függvény — ezt
> az Angular csak egyszer futtatja le, form-létrehozáskor. Ide kerülnek a
> validátor-deklarációk: `required`, `email`, `minLength`. Ezek nem tömbök és
> nem attribútumok — csak függvényhívások, amelyek deklarálják a szabályokat."

> „A hibaolvasás mintája a sablonban: `field().touched() && field().invalid()`
> — csak akkor mutasd a hibákat, ha a user már belekattintott a mezőbe.
> Az `@for` loopban iteráljuk a `field().errors()` tömböt, és minden hibának
> van egy `kind` és egy `message` tulajdonsága. Egy mezőn egyszerre több
> hiba is élhet — a validáció nem rövidzárlatolja az első hibánál."

> „Figyeld meg, hogy a schema-függvény és a template mennyivel szimmetrikusabb,
> mint Reactive Formsban: a validáció egy helyen van, és nem kell `Validators.`
> prefixet írni, nincs `hasError('minlength')` string-alapú lekérdezés."

---

### 7. commit – Cross-field validáció és async username-ellenőrzés

```bash
git checkout HEAD~3
```

**Mit mutass:** Töltsd ki a jelszó mezőt, majd írj mást a megerősítésbe —
mutasd a hibát. Ezután gépelj `admin`-t a felhasználónévbe — mutasd a pending
állapotot és a hibát.

**Mit mondj:**

> „Cross-field validáció Signal Formsban: a `validate()` második argumentuma
> egy callback, ami `{ value, valueOf }` kontextet kap. A `valueOf(path.password)`
> reaktívan olvassa a jelszó mező aktuális értékét. Nem kell csoport-szintű
> validátort írni, és a hiba pontosan azon a mezőn ül, ahol meg akarjuk
> jeleníteni — nincs `form.hasError(...)` ugliness."

> „Az async validáció: `validateAsync()` egy Angular `resource`-t kap
> paraméterként. A `resource` az Angular 19-ben érkezett reactív adatlekérési
> primitív. A `debounce: 400` opció beépítve megakadályozza, hogy minden
> gombnyomásra elmegy egy HTTP-kérés. A `pending()` signal true, amíg a kérés
> fut — ezt mutatjuk a `Elérhetőség ellenőrzése…` felirattal. Fontos: `valid()`
> false, de `invalid()` is false pending közben. Ezért a submit gombot
> `!f().valid()`-dal tiltottuk le."

---

### 8. commit – FormValueControl: signal-alapú custom control

```bash
git checkout HEAD~2
```

**Mit mutass:** Görgess le a csillag-értékelőhöz. Kattints csillagokra. Mutasd
meg egymás mellett a `star-rating.ts` (FormValueControl) és a `star-rating-cva.ts`
(ControlValueAccessor) fájlokat.

**Mit mondj:**

> „Emlékszel, amit a Reactive Forms tabban mutattam? A `ControlValueAccessor`:
> provider, forwardRef, multi: true, négy metódus, kézi callback-hívás. Most
> nézzük meg, hogyan néz ki ugyanez Signal Formsban."

> „A `StarRating` implementálja a `FormValueControl<number>` interface-t. A
> teljes kód, amit ehhez meg kell írni: `readonly value = model<number>(0)`.
> Nincs provider, nincs forwardRef, nincs writeValue, nincs registerOnChange.
> Az Angular `model()` primitív kezeli a two-way data bindinget — a `[formField]`
> direktíva automatikusan felismeri és köti."

> „Ez az egyik legszebb egyszerűsítés az egész Signal Forms API-ban. A custom
> controlok írása, ami korábban bojler-plate-tömeg volt, most triviálissá vált.
> És visszafelé kompatibilis: a meglévő `ControlValueAccessor` alapú controlok
> is működnek `[formField]`-del."

---

### 9. commit – Teljes regisztrációs form: tags, [formRoot], submit flow

```bash
git checkout HEAD~1
```

**Mit mutass:** Töltsd ki az egész formot. Próbálj meg szubmittolni hibás
adatokkal — a hibák megjelennek. Töltsd ki jól, és mutasd a sikeres beküldést.

**Mit mondj:**

> „A teljes regisztrációs form. Két új dolog van itt, amit nem láttunk eddig."

> „Az első a dinamikus tag-lista, ami a `FormArray` Signal Forms megfelelője.
> De nincs `FormArray.push()` vagy `.removeAt()`: egyszerűen a modell signalt
> frissítjük az `update()` metódussal. `model.update(m => ({ ...m, tags: [...m.tags, value] }))`.
> Az Angular automatikusan reagál a signal-változásra és frissíti a UI-t."

> „A második a `[formRoot]` direktíva és a `submit()` függvény. A `[formRoot]`
> két dolgot csinál: beállítja a `novalidate` attribútumot a formra, és elkapja
> a submit eseményt. A `submit()` függvény szekvenciálisan: érintetté teszi az
> összes interaktív mezőt — ezért jelennek meg a hibák a submit-ra —, majd ha
> minden érvényes, lefuttatja az `action` callbacket. Közben az `f().submitting()`
> signal true, amit a gomb disabled állapotához kötöttünk."

---

### 10. commit – Összehasonlítás táblázat

```bash
git checkout HEAD   # vagy a branch neve
```

**Mit mutass:** Kattints az „Összehasonlítás" tabra. Görgess végig a táblázaton.
Mutasd a CVA vs FormValueControl kódrészleteket.

**Mit mondj:**

> „Az összehasonlítás táblázatban összefoglalva láthatjuk a különbségeket.
> Három dolgot emelnék ki."

> „Az első: a forrás. Template-driven-ben a komponens propertyje az adat, és
> a sablon is tartalmaz állapotot — két igazság-forrás. Reactive-ban a
> FormGroup-fa az állapot, és a modell ebből deriválódik — szintén kettő.
> Signal Formsban egyetlen writable signal, minden más ebből van levezetve."

> „A második: az állapotolvasás. Reactive-ban a `control.value` és
> `control.errors` nem reaktív — ha `computed`-ban vagy `effect`-ben akarod
> használni, kézzel kell feliratkoznod a `valueChanges` Observable-re.
> Signal Formsban minden mező-állapot natív signal, ami a reaktív gráfba
> illeszkedik."

> „A harmadik: a tesztelhetőség. Megnézhetjük a spec fájlokat. Signal Formsban:
> `model.update(...)` után szinkron azonnal olvasható `field().errors()`. Nincs
> `fixture.detectChanges()`, nincs `valueChanges` feliratkozás, nincs
> `fakeAsync`. Ez a tesztelési boilerplate drasztikus csökkentése."

---

### 11. commit – FormRoot auto-submit refaktor (opcionális kitérő)

```bash
git checkout HEAD~2   # refactor(signal/5) commit
```

**Mit mutass:** Nyisd meg a `signal-forms.ts`-t. Mutasd meg a `form()` harmadik
argumentumát és a `submission` opciót.

**Mit mondj:**

> „Egy gyors kitérő a beküldési flow finomhangolásáról. Az előző commitban
> a `submit()` függvényt kézzel hívtuk egy `onSubmit()` metódusból. Az Angular
> 22 ajánlott módja másképp néz ki: a beküldési logikát a `form()` harmadik
> argumentumának `submission` opciójába tesszük. Az `action` az, ami érvényes
> form esetén fut le. Az `onInvalid` akkor hívódik, ha a validáció megbukott —
> itt a `focusBoundControl()` hívással a fókusz automatikusan az első hibás
> mezőre ugrik."

> „Ezzel a `[formRoot]` direktíva már mindent kezel magától: elkapja a submit
> eseményt, érintetté tesz minden mezőt, és lefuttatja a megfelelő callback-et.
> A sablonban nem kell `(submit)=\"onSubmit()\"` — ez a Zero-boilerplate submit
> flow."

---

### 12. commit – Migráció: compatForm (top-down) és SignalFormControl (bottom-up)

```bash
git checkout HEAD   # a branch teteje
```

**Mit mutass:** Kattints a „Migráció" tabra. Próbáld ki mindkét formot. Töltsd
ki jól a felső (compatForm) formot, majd a más stílusú alsót (SignalFormControl)
is. Mutasd az IDE-ben egymás mellett a két TypeScript blokkot a `migration.ts`-ben.

**Mit mondj:**

> „A nagy kérdés mindig az, hogy hogyan állunk át fokozatosan, ha van 50
> meglévő Reactive Forms formunk. Az Angular 22 két konkrét eszközt ad erre."

> „Az első stratégia a top-down: a Signal Form a tetőn, de egyes részfák
> maradhatnak régi FormControl-ok. Ehhez a `compatForm` függvényt használjuk
> a `@angular/forms/signals/compat` csomagból. A modell signal tartalmazza
> a meglévő `FormControl` példányt — a `compatForm` áthidalja. Figyeld meg
> a sablont: mindkét mező `[formField]`-del van kötve. A `topDownForm.password().errors()`
> signal mögött valójában a `FormControl.errors` van proxy-zva. A végén az
> `extractValue()` utility kibontja a raw értékeket."

> „A második stratégia a bottom-up: a meglévő `FormGroup` marad, de egyes
> levél-mezőket `SignalFormControl`-ra cserélünk. A `SignalFormControl` extends
> `AbstractControl`, tehát a `FormGroup` nem tud róla, hogy az nem hagyományos
> `FormControl`. A `form.valid`, a `markAllAsTouched()` mind változatlan.
> A sablonban az email mezőhöz `[formField]=\"emailCtrl.fieldTree\"`-t használunk —
> ez adja a signal kötést. A jelszó mező marad `formControlName`-mel."

> „Melyiket mikor? Ha egy nagy, komplex formot akarsz átírni felülről lefelé,
> válaszd a `compatForm`-ot — a legkényesebb részfák maradhatnak régi módra.
> Ha egy meglévő `FormGroup`-hierarchiában csak néhány leaf-mezőt akarsz
> signal-alapúra cserélni, válaszd a `SignalFormControl`-t. A kettő
> kombinálható is."

---

## Zárszó (Q&A előtt)

> „Összefoglalva: a Signal Forms nem a régi formok cseréje, hanem egy új
> réteg, ami a signals-alapú Angularhoz igazodik. Az Angular 22-ben vált
> stabillá, ami azt jelenti, hogy production-ready, semver-rel védett API.
> A migrációhoz két stratégia van: top-down a `compatForm`-mal, ha egy nagy
> meglévő Reactive formot fokozatosan akarsz átírni, és bottom-up a
> `SignalFormControl`-lal, ha egy meglévő FormGroup-hierarchiában csak egyes
> mezőket akarsz signal-alapúra cserélni. A custom controlokhoz a
> `FormValueControl` interface visszafelé kompatibilis a régi Reactive és
> Template-driven formokkal is."

> „A kérdés nem az, hogy mikor írjátok át a régi formokat — hanem az, hogy
> az új funkciókhoz, az új képernyőkhöz Signal Formst választotok-e. Én azt
> javaslom: igen."

---

## Hasznos parancsok demó közben

```bash
# Melyik commiton vagyok most?
git log --oneline -1

# Ugrás a következő commitra (legrégebbitől a legújabb felé):
git log --oneline --reverse | head -10   # lista
git checkout <hash>

# Vissza a branch tetejére:
git checkout demo/signal-forms-eloadas

# Ha véletlenül módosítasz valamit:
git checkout -- .
```

---

## Commit-lista gyorsan

| # | Commit üzenet | Mit mutat |
|---|---|---|
| 1 | `feat(shell)` | App váz, navigáció |
| 2 | `feat(shared)` | Adatmodell, service |
| 3 | `feat(template-driven)` | Template-driven form |
| 4 | `feat(reactive)` | Reactive form + CVA |
| 5 | `feat(signal/1)` | signal() + form() + [formField] |
| 6 | `feat(signal/2)` | Beépített validátorok |
| 7 | `feat(signal/3)` | Cross-field + async |
| 8 | `feat(signal/4)` | FormValueControl |
| 9 | `feat(signal/5)` | Teljes form, [formRoot], submit |
| 10 | `feat(comparison)` | Összehasonlítás táblázat |
| 11 | `docs` | Előadói útmutató |
| 12 | `refactor(signal/5)` | FormRoot auto-submit, focusBoundControl |
| 13 | `feat(migration)` | compatForm (top-down) + SignalFormControl (bottom-up) |
