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
  rating: number;
  tags: string[];
}

export const COUNTRIES = [
  'Magyarország',
  'Ausztria',
  'Németország',
  'Egyesült Királyság',
  'Egyéb',
] as const;

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

export const TAKEN_USERNAMES = ['admin', 'root', 'test', 'angular', 'demo'];
