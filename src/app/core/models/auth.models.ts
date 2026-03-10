// ============================================================================
// Authentication Models
// ============================================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  groupReferences: string[];
  roleCodes: string[];
  branchReferences: string[];
}

export interface CurrentUser {
  username: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  secondLastName?: string;
  email?: string;
  roleCodes: string[];
  groupReferences: string[];
  branchReferences: string[];
  branchCodes: string[];
  branchNames: string[];
  token: string;
}

export interface DecodedToken {
  nameid: string; // username
  firstName: string;
  lastName: string;
  middleName?: string;
  secondLastName?: string;
  email?: string;
  roleCodes: string | string[];
  groupReference: string | string[];
  branchReference: string | string[];
  branchCode: string | string[];
  branchName: string | string[];
  exp: number;
  iat: number;
}
