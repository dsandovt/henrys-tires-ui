import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User, CreateUserRequest, UpdateUserRequest } from '../models/inventory.models';
import { PaginatedResponse, PaginationParams } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly API_URL = '/api/v1/users';

  constructor(private http: HttpClient) {}

  /**
   * Get paginated list of users
   */
  getUsers(params?: PaginationParams): Observable<PaginatedResponse<User>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<{ success: boolean; data: PaginatedResponse<User> }>(this.API_URL, { params: httpParams }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<{ success: boolean; data: User }>(`${this.API_URL}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create new user
   */
  createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<{ success: boolean; data: User }>(this.API_URL, request).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update existing user
   */
  updateUser(id: string, request: UpdateUserRequest): Observable<User> {
    return this.http.put<{ success: boolean; data: User }>(`${this.API_URL}/${id}`, request).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete user
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<{ success: boolean; data: void }>(`${this.API_URL}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Toggle user active status
   */
  toggleUserStatus(id: string): Observable<User> {
    return this.http.post<{ success: boolean; data: User }>(`${this.API_URL}/${id}/toggle-status`, {}).pipe(
      map(response => response.data)
    );
  }
}
