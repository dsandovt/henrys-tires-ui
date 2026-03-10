import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Role, CreateRoleRequest, UpdateRoleRequest } from '../models/inventory.models';
import { PaginatedResponse, PaginationParams } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly API_URL = `${environment.apiUrl}/v1/role`;
  constructor(private http: HttpClient) {}

  getRoles(params?: PaginationParams): Observable<PaginatedResponse<Role>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<{ success: boolean; data: PaginatedResponse<Role> }>(this.API_URL, { params: httpParams }).pipe(map(response => response.data));
  }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<{ success: boolean; data: PaginatedResponse<Role> }>(this.API_URL, { params: new HttpParams().set('pageSize', 1000) }).pipe(map(response => response.data.items));
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<{ success: boolean; data: Role }>(`${this.API_URL}/${id}`).pipe(map(response => response.data));
  }

  createRole(request: CreateRoleRequest): Observable<Role> {
    return this.http.post<{ success: boolean; data: Role }>(this.API_URL, request).pipe(map(response => response.data));
  }

  updateRole(id: string, request: UpdateRoleRequest): Observable<Role> {
    return this.http.put<{ success: boolean; data: Role }>(`${this.API_URL}/${id}`, request).pipe(map(response => response.data));
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
