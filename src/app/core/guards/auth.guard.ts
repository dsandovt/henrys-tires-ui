import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Role } from '../models/auth.models';

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
 * Role guard factory - protects routes requiring specific roles
 */
export const roleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    if (authService.hasRole(allowedRoles)) {
      return true;
    }

    // User is authenticated but doesn't have required role
    // Redirect to their default page based on role
    const userRole = authService.userRole();
    if (userRole === Role.Admin) {
      router.navigate(['/dashboard']);
    } else {
      router.navigate(['/stock']);
    }
    return false;
  };
};

/**
 * Admin-only guard
 */
export const adminGuard: CanActivateFn = roleGuard([Role.Admin]);

/**
 * Admin or Supervisor guard (for price overrides)
 */
export const canOverridePricesGuard: CanActivateFn = roleGuard([Role.Admin, Role.Supervisor]);
