import { TestBed } from '@angular/core/testing';
import { Registration } from '../shared/registration.model';
import { SignalForms } from './signal-forms';

/**
 * A SIGNAL FORMS tesztelésének lényege: a modell egy signal, a validációs
 * állapot pedig computed. Tehát `model.update()` után közvetlenül,
 * szinkron módon olvashatók az `errors()` / `valid()` signalok – nincs
 * `fixture.detectChanges()` tánc, nincs `valueChanges` feliratkozás.
 */
describe('SignalForms (logika)', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [SignalForms] });
    const fixture = TestBed.createComponent(SignalForms);
    // A `model` és `f` protected – tesztben szándékosan rányitunk.
    const cmp = fixture.componentInstance as unknown as {
      model: { update: (fn: (m: Registration) => Registration) => void };
      f: any;
    };
    return { fixture, cmp };
  }

  it('kezdetben érvénytelen a form', () => {
    const { cmp } = setup();
    expect(cmp.f().valid()).toBe(false);
  });

  it('a név required + minLength szabálya működik', () => {
    const { cmp } = setup();
    expect(cmp.f.fullName().invalid()).toBe(true); // required

    cmp.model.update((m) => ({ ...m, fullName: 'Jo' }));
    expect(cmp.f.fullName().invalid()).toBe(true); // túl rövid

    cmp.model.update((m) => ({ ...m, fullName: 'József' }));
    expect(cmp.f.fullName().valid()).toBe(true);
  });

  it('cross-field: a jelszó-megerősítés egyezést vár', () => {
    const { cmp } = setup();
    cmp.model.update((m) => ({
      ...m,
      password: 'password1',
      confirmPassword: 'password2',
    }));
    const errors = cmp.f.confirmPassword().errors();
    expect(errors.some((e: { kind: string }) => e.kind === 'passwordMismatch')).toBe(true);

    cmp.model.update((m) => ({ ...m, confirmPassword: 'password1' }));
    const after = cmp.f.confirmPassword().errors();
    expect(after.some((e: { kind: string }) => e.kind === 'passwordMismatch')).toBe(false);
  });

  it('az egyedi control mezője (rating) min 1 értéket vár', () => {
    const { cmp } = setup();
    expect(cmp.f.rating().invalid()).toBe(true);
    cmp.model.update((m) => ({ ...m, rating: 4 }));
    expect(cmp.f.rating().valid()).toBe(true);
  });

  it('a tags lista legalább egy elemet vár', () => {
    const { cmp } = setup();
    expect(cmp.f.tags().invalid()).toBe(true);
    cmp.model.update((m) => ({ ...m, tags: ['angular'] }));
    expect(cmp.f.tags().valid()).toBe(true);
  });
});
