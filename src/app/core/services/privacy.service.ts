import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'henrys_privacy_mode';

@Injectable({
  providedIn: 'root'
})
export class PrivacyService {
  private _isPrivate = signal<boolean>(this.loadState());

  readonly isPrivate = this._isPrivate.asReadonly();

  toggle(): void {
    const newValue = !this._isPrivate();
    this._isPrivate.set(newValue);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
  }

  private loadState(): boolean {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'true');
    } catch {
      return false;
    }
  }
}
