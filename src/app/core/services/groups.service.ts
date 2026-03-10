import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Group, CreateGroupRequest, UpdateGroupRequest } from '../models/inventory.models';
import { PaginatedResponse, PaginationParams } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly API_URL = `${environment.apiUrl}/v1/group`;
  constructor(private http: HttpClient) {}

  getGroups(params?: PaginationParams): Observable<PaginatedResponse<Group>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<{ success: boolean; data: PaginatedResponse<Group> }>(this.API_URL, { params: httpParams }).pipe(map(response => response.data));
  }

  getAllGroups(): Observable<Group[]> {
    return this.http.get<{ success: boolean; data: PaginatedResponse<Group> }>(this.API_URL, { params: new HttpParams().set('pageSize', 1000) }).pipe(map(response => response.data.items));
  }

  getGroupById(id: string): Observable<Group> {
    return this.http.get<{ success: boolean; data: Group }>(`${this.API_URL}/${id}`).pipe(map(response => response.data));
  }

  createGroup(request: CreateGroupRequest): Observable<Group> {
    return this.http.post<{ success: boolean; data: Group }>(this.API_URL, request).pipe(map(response => response.data));
  }

  updateGroup(id: string, request: UpdateGroupRequest): Observable<Group> {
    return this.http.put<{ success: boolean; data: Group }>(`${this.API_URL}/${id}`, request).pipe(map(response => response.data));
  }

  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
