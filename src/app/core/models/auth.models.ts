// ============================================================================
// Authentication Models
// ============================================================================

export enum Role {
  Seller = 'Seller',
  Supervisor = 'Supervisor',
  Admin = 'Admin',
  StoreSeller = 'StoreSeller'
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  branchId?: string;
}

export interface CurrentUser {
  username: string;
  role: Role;
  branchId?: string;
  branchCode?: string;
  branchName?: string;
  token: string;
}

export interface DecodedToken {
  nameid: string; // username
  role: string;
  branchId?: string;
  branchCode?: string;
  branchName?: string;
  exp: number;
  iat: number;
}
