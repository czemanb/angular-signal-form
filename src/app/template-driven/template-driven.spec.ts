import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { UsernameAvailabilityService } from '../shared/username-availability.service';
import { TemplateDriven } from './template-driven';

describe('TemplateDriven username validation', () => {
  let fixture: ComponentFixture<TemplateDriven>;
  let element: HTMLElement;
  let requests: Array<(taken: boolean) => void>;

  beforeEach(async () => {
    requests = [];
    TestBed.configureTestingModule({
      imports: [TemplateDriven],
      providers: [{
        provide: UsernameAvailabilityService,
        useValue: {
          isTaken: vi.fn(() => new Promise<boolean>((resolve) => requests.push(resolve))),
        },
      }],
    });
    fixture = TestBed.createComponent(TemplateDriven);
    element = fixture.nativeElement;
    await fixture.whenStable();
    const form = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);
    form.setValue({
      fullName: 'Test User', email: 'test@example.com', password: 'password123',
      confirmPassword: 'password123', username: 'available', country: 'Magyarország',
      rating: 3, newTag: 'angular', newsletter: false,
    });
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.tag-input button')!.click();
    await fixture.whenStable();
  });

  function submit(): void {
    element.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
  }

  async function resolveRequest(index: number, taken: boolean): Promise<void> {
    requests[index](taken);
    await Promise.resolve();
    await fixture.whenStable();
  }

  async function changeUsername(value: string): Promise<void> {
    const input = element.querySelector<HTMLInputElement>('#t-username')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  it.each([true, false])('waits for a fresh check without blur (taken: %s)', async (taken) => {
    submit();
    await fixture.whenStable();
    expect(requests).toHaveLength(1);
    expect(element.querySelector('.result')).toBeNull();
    await resolveRequest(0, taken);
    expect(element.querySelector('.result') !== null).toBe(!taken);
    expect(element.textContent?.includes('Ez a felhasználónév foglalt')).toBe(taken);
  });

  it('ignores an older blur response while the submit check is pending', async () => {
    element.querySelector('#t-username')!.dispatchEvent(new Event('blur'));
    submit();
    expect(requests).toHaveLength(2);
    await resolveRequest(0, false);
    expect(element.querySelector('.pending')).not.toBeNull();
    expect(element.querySelector('.result')).toBeNull();
    await resolveRequest(1, true);
    expect(element.querySelector('.pending')).toBeNull();
    expect(element.querySelector('.result')).toBeNull();
    expect(element.textContent).toContain('Ez a felhasználónév foglalt');
  });

  it('does not let a late blur response overwrite a newer result', async () => {
    element.querySelector('#t-username')!.dispatchEvent(new Event('blur'));
    submit();
    await resolveRequest(1, true);
    await resolveRequest(0, false);
    expect(element.textContent).toContain('Ez a felhasználónév foglalt');
    expect(element.querySelector('.result')).toBeNull();
  });

  it('clears a taken result when the username changes', async () => {
    element.querySelector('#t-username')!.dispatchEvent(new Event('blur'));
    await resolveRequest(0, true);
    expect(element.textContent).toContain('Ez a felhasználónév foglalt');
    await changeUsername('another-user');
    expect(element.textContent).not.toContain('Ez a felhasználónév foglalt');
  });

  it('rejects a pending submission after editing away and back to the same username', async () => {
    submit();
    await changeUsername('another-user');
    await changeUsername('available');
    await resolveRequest(0, false);
    expect(element.querySelector('.result')).toBeNull();
    submit();
    await resolveRequest(1, false);
    expect(element.querySelector('.result')).not.toBeNull();
  });

  it('rejects an empty username without requesting availability', async () => {
    await changeUsername('');
    submit();
    await fixture.whenStable();
    expect(requests).toHaveLength(0);
    expect(element.querySelector('.result')).toBeNull();
  });
});
