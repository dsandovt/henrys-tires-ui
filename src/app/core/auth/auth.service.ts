import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { LoginRequest, LoginResponse, CurrentUser, DecodedToken, Role } from '../models/auth.models';
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
  readonly userRole = computed(() => this.currentUserSignal()?.role);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === Role.Admin);
  readonly isSupervisor = computed(() => this.currentUserSignal()?.role === Role.Supervisor);
  readonly isSeller = computed(() => this.currentUserSignal()?.role === Role.Seller);
  readonly branchId = computed(() => this.currentUserSignal()?.branchId);
  readonly branchCode = computed(() => this.currentUserSignal()?.branchCode);
  readonly branchName = computed(() => this.currentUserSignal()?.branchName);

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
   * Check if user has required role
   */
  hasRole(requiredRole: Role | Role[]): boolean {
    const userRole = this.currentUserSignal()?.role;
    if (!userRole) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(userRole);
  }

  /**
   * Check if user can override prices (Admin or Supervisor)
   */
  canOverridePrices(): boolean {
    return this.hasRole([Role.Admin, Role.Supervisor]);
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
        role: this.mapRole(decoded.role),
        branchId: decoded.branchId,
        branchCode: decoded.branchCode,
        branchName: decoded.branchName,
        token: token
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Map role string to Role enum
   */
  private mapRole(roleString: string): Role {
    switch (roleString) {
      case 'Admin':
        return Role.Admin;
      case 'Supervisor':
        return Role.Supervisor;
      case 'Seller':
      default:
        return Role.Seller;
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
