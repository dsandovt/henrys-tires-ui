import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Auth guard - protects routes requiring authentication
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

/**
 * Role guard factory - protects routes requiring specific role codes
 */
export const roleGuard = (allowedRoleCodes: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    if (authService.hasAnyRole(allowedRoleCodes)) {
      return true;
    }

    // User is authenticated but doesn't have required role
    router.navigate(['/stock']);
    return false;
  };
};

/**
 * Admin-only guard
 */
export const adminGuard: CanActivateFn = roleGuard(['ADMIN']);

/**
 * Admin or Supervisor guard (for price overrides)
 */
export const canOverridePricesGuard: CanActivateFn = roleGuard(['ADMIN', 'SUPERVISOR']);
