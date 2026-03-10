import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { LoginRequest, LoginResponse, CurrentUser, DecodedToken } from '../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'henrys_auth_token';

  // Reactive state using signals
  private currentUserSignal = signal<CurrentUser | null>(null);

  // Public computed signals
  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly roleCodes = computed(() => this.currentUserSignal()?.roleCodes ?? []);
  readonly isAdmin = computed(() => this.hasRoleCode('ADMIN'));
  readonly isSupervisor = computed(() => this.hasRoleCode('SUPERVISOR'));
  readonly isSeller = computed(() => this.hasRoleCode('SELLER'));
  readonly branchCodes = computed(() => this.currentUserSignal()?.branchCodes ?? []);
  readonly branchNames = computed(() => this.currentUserSignal()?.branchNames ?? []);
  // For backward compatibility — return first branch code/name
  readonly branchCode = computed(() => this.currentUserSignal()?.branchCodes?.[0]);
  readonly branchName = computed(() => this.currentUserSignal()?.branchNames?.[0]);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  /**
   * Initialize auth state from stored token
   */
  private initializeAuthState(): void {
    const token = this.getStoredToken();
    if (token) {
      const user = this.decodeToken(token);
      if (user && !this.isTokenExpired(token)) {
        this.currentUserSignal.set(user);
      } else {
        this.clearAuth();
      }
    }
  }

  /**
   * Login with username and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<{ success: boolean; data: LoginResponse }>(`${this.API_URL}/login`, credentials).pipe(
      map(response => response.data),
      tap(loginData => {
        this.storeToken(loginData.token);
        const user = this.decodeToken(loginData.token);
        if (user) {
          this.currentUserSignal.set(user);
        }
      }),
      catchError(error => {
        console.error('Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout and clear auth state
   */
  logout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  /**
   * Check if user has a specific role code
   */
  hasRoleCode(code: string): boolean {
    return this.currentUserSignal()?.roleCodes?.includes(code) ?? false;
  }

  /**
   * Check if user has any of the required role codes
   */
  hasAnyRole(codes: string[]): boolean {
    const userRoles = this.currentUserSignal()?.roleCodes ?? [];
    return codes.some(code => userRoles.includes(code));
  }

  /**
   * Check if user can override prices (Admin or Supervisor)
   */
  canOverridePrices(): boolean {
    return this.hasAnyRole(['ADMIN', 'SUPERVISOR']);
  }

  /**
   * Get stored token from localStorage
   */
  getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Store token in localStorage
   */
  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Clear auth state
   */
  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSignal.set(null);
  }

  /**
   * Normalize a JWT claim that can be a single string or array
   */
  private normalizeClaimArray(value: string | string[] | undefined): string[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): CurrentUser | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = JSON.parse(atob(payload)) as DecodedToken;

      return {
        username: decoded.nameid,
        firstName: decoded.firstName || '',
        lastName: decoded.lastName || '',
        middleName: decoded.middleName,
        secondLastName: decoded.secondLastName,
        email: decoded.email,
        roleCodes: this.normalizeClaimArray(decoded.roleCodes),
        groupReferences: this.normalizeClaimArray(decoded.groupReference),
        branchReferences: this.normalizeClaimArray(decoded.branchReference),
        branchCodes: this.normalizeClaimArray(decoded.branchCode),
        branchNames: this.normalizeClaimArray(decoded.branchName),
        token: token
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true;
      }

      const payload = parts[1];
      const decoded = JSON.parse(atob(payload)) as DecodedToken;

      if (!decoded.exp) {
        return true;
      }

      const expirationDate = new Date(decoded.exp * 1000);
      return expirationDate <= new Date();
    } catch (error) {
      console.error('Failed to check token expiration:', error);
      return true;
    }
  }
}
