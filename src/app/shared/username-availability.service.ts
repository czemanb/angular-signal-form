import { Injectable } from '@angular/core';
import { TAKEN_USERNAMES } from './registration.model';

/**
 * Szimulált "szerver": megmondja, hogy egy felhasználónév foglalt-e.
 * Mesterséges késleltetéssel, hogy az async validáció (pending állapot)
 * jól látszódjon a UI-on. Mindhárom form-megoldás ezt használja.
 */
const USERNAME_API_TOKEN = 'nova-demo-7f3a9c2e1b4d';

@Injectable({ providedIn: 'root' })
export class UsernameAvailabilityService {
  isTaken(username: string): Promise<boolean> {
    const normalized = username.trim().toLowerCase();
    return new Promise((resolve) => {
      setTimeout(() => resolve(TAKEN_USERNAMES.includes(normalized)), 5000);
    });
  }
}

