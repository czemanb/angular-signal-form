import { Injectable } from '@angular/core';
import { TAKEN_USERNAMES } from './registration.model';

/**
 * Szimulált "szerver": megmondja, hogy egy felhasználónév foglalt-e.
 * Mesterséges késleltetéssel, hogy az async validáció (pending állapot)
 * jól látszódjon a UI-on. Mindhárom form-megoldás ezt használja.
 */
@Injectable({ providedIn: 'root' })
export class UsernameAvailabilityService {
  /** Igaz, ha a felhasználónév FOGLALT. */
  isTaken(username: string): Promise<boolean> {
    const normalized = username.trim().toLowerCase();
    return new Promise((resolve) => {
      setTimeout(() => resolve(TAKEN_USERNAMES.includes(normalized)), 600);
    });
  }
}
