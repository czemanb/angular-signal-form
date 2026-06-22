/**
 * A demó-form közös adatmodellje. Mind a három megoldás (Template-driven,
 * Reactive és Signal Forms) UGYANEZT a modellt használja, hogy az
 * összehasonlítás tisztességes legyen.
 */
export interface Registration {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  country: string;
  newsletter: boolean;
  /** Egyedi control (csillagos értékelés) értéke: 0–5. */
  rating: number;
  /** Dinamikus lista – a FormArray / FieldArray ekvivalens bemutatásához. */
  tags: string[];
}

export const COUNTRIES = [
  'Magyarország',
  'Ausztria',
  'Németország',
  'Egyesült Királyság',
  'Egyéb',
] as const;

/** Üres kezdőállapot egy új regisztrációhoz. */
export function emptyRegistration(): Registration {
  return {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    country: '',
    newsletter: false,
    rating: 0,
    tags: [],
  };
}

/** Az async validáció demójához: ezek a felhasználónevek "foglaltak". */
export const TAKEN_USERNAMES = ['admin', 'root', 'test', 'angular', 'demo'];
