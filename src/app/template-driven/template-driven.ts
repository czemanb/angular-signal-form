import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {
  COUNTRIES,
  emptyRegistration,
  Registration,
} from '../shared/registration.model';
import { UsernameAvailabilityService } from '../shared/username-availability.service';

/**
 * TEMPLATE-DRIVEN megoldás – a legkevesebb TS, a legtöbb a sablonban.
 *
 * Tanulságok az összehasonlításhoz:
 *  - a logika a sablonban él (`[(ngModel)]`, `#ref="ngModel"`, attribútum-validátorok),
 *  - a cross-field (jelszó-egyezés) csak sablon-összehasonlítással kényelmes,
 *  - az ASYNC validáció a gyenge pont: saját direktíva kellene hozzá; itt
 *    egyszerű blur-időzített ellenőrzéssel pótoljuk (lásd a comparison oldalt),
 *  - nincs erős típusosság a form-állapotra.
 */
@Component({
  selector: 'app-template-driven',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, JsonPipe],
  templateUrl: './template-driven.html',
  styleUrl: '../shared/form.scss',
})
export class TemplateDriven {
  private readonly usernames = inject(UsernameAvailabilityService);
  private usernameCheckId = 0;

  protected readonly countries = COUNTRIES;
  protected readonly model: Registration = emptyRegistration();
  protected readonly submitted = signal<Registration | null>(null);

  // Az async ellenőrzés állapotát kézzel kell követni (nincs beépített async validátor).
  protected readonly usernameChecking = signal(false);
  protected readonly usernameTaken = signal(false);
  protected newTag = '';

  protected onUsernameChange(value: string): void {
    this.model.username = value;
    this.usernameCheckId++;
    this.usernameTaken.set(false);
    this.usernameChecking.set(false);
  }

  protected async checkUsername(): Promise<boolean> {
    const checkId = ++this.usernameCheckId;
    const username = this.model.username;
    const value = this.model.username.trim();
    this.usernameTaken.set(false);
    if (!value) {
      this.usernameChecking.set(false);
      return false;
    }
    this.usernameChecking.set(true);
    try {
      const taken = await this.usernames.isTaken(value);
      if (checkId !== this.usernameCheckId || username !== this.model.username) {
        return false;
      }
      this.usernameTaken.set(taken);
      return !taken;
    } finally {
      if (checkId === this.usernameCheckId) {
        this.usernameChecking.set(false);
      }
    }
  }

  protected addTag(): void {
    const value = this.newTag.trim();
    if (value) {
      this.model.tags.push(value);
      this.newTag = '';
    }
  }

  protected removeTag(index: number): void {
    this.model.tags.splice(index, 1);
  }

  protected async onSubmit(form: NgForm): Promise<void> {
    const usernameAvailable = await this.checkUsername();
    const valid =
      form.valid &&
      this.model.password === this.model.confirmPassword &&
      this.model.rating >= 1 &&
      this.model.tags.length >= 1 &&
      usernameAvailable;
    if (!valid) {
      Object.values(form.controls).forEach((c) => c.markAsTouched());
      this.submitted.set(null);
      return;
    }
    this.submitted.set(structuredClone(this.model));
  }
}
