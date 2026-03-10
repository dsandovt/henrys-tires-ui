import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly API_URL = `${environment.apiUrl}/v1/config`;

  constructor(private http: HttpClient) {}

  async loadConfig(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.get<{ timezone: string }>(this.API_URL)
      );
      // Timezone is hardcoded to Eastern (UTC-5) in timezone.utils.ts
    } catch (err) {
      console.warn('Failed to load config:', err);
    }
  }
}
