import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Item, CreateItemRequest, UpdateItemRequest } from '../models/inventory.models';
import { PaginatedResponse, PaginationParams } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private readonly API_URL = `${environment.apiUrl}/v1/items`;

  constructor(private http: HttpClient) {}

  /**
   * Get paginated list of items
   */
  getItems(params?: PaginationParams & { classification?: string }): Observable<PaginatedResponse<Item>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.classification) httpParams = httpParams.set('classification', params.classification);

    return this.http.get<{ success: boolean; data: any }>(this.API_URL, { params: httpParams }).pipe(
      map(response => ({
        items: response.data.items,
        totalCount: response.data.totalCount,
        page: response.data.page,
        pageSize: response.data.pageSize
      }))
    );
  }

  /**
   * Get item by ID
   */
  getItemById(id: string): Observable<Item> {
    return this.http.get<{ success: boolean; data: Item }>(`${this.API_URL}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get item by code
   */
  getItemByCode(code: string): Observable<Item> {
    return this.http.get<{ success: boolean; data: Item }>(`${this.API_URL}/code/${code}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get all items (for dropdowns)
   */
  getAllItems(): Observable<Item[]> {
    return this.http.get<{ success: boolean; data: Item[] }>(`${this.API_URL}/all`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create new item
   */
  createItem(request: CreateItemRequest): Observable<Item> {
    return this.http.post<{ success: boolean; data: Item }>(this.API_URL, request).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update existing item (by itemCode)
   */
  updateItem(itemCode: string, request: UpdateItemRequest): Observable<Item> {
    return this.http.put<{ success: boolean; data: Item }>(`${this.API_URL}/${itemCode}`, request).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete item (by itemCode)
   */
  deleteItem(itemCode: string): Observable<string> {
    return this.http.delete<{ success: boolean; data: string }>(`${this.API_URL}/${itemCode}`).pipe(
      map(response => response.data)
    );
  }
}
