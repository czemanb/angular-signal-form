import { TestBed } from '@angular/core/testing';
import { StarRating } from './star-rating';

/**
 * A SIGNAL FORMS egyedi control tesztje. Figyeld meg, milyen kevés a teendő:
 * a `value` egy sima `model()`, így a model→view és view→model szinkron
 * közvetlenül ellenőrizhető – nincs CVA-harness, nincs `registerOnChange` mock.
 */
describe('StarRating (FormValueControl)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StarRating] });
  });

  it('model → view: a value() alapján rajzolja ki a tele csillagokat', async () => {
    const fixture = TestBed.createComponent(StarRating);
    fixture.componentRef.setInput('value', 3);
    await fixture.whenStable();

    const filled = fixture.nativeElement.querySelectorAll('.star.filled');
    expect(filled.length).toBe(3);
  });

  it('view → model: csillagra kattintva frissül a value model', async () => {
    const fixture = TestBed.createComponent(StarRating);
    await fixture.whenStable();

    const stars = fixture.nativeElement.querySelectorAll('.star');
    (stars[3] as HTMLButtonElement).click(); // 4. csillag
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe(4);
  });
});
