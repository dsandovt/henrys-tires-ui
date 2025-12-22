import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ConsumableItemPrice, UpdatePriceRequest } from '../models/inventory.models';
import { PaginatedResponse, PaginationParams } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class PricesService {
  private readonly API_URL = '/api/v1/prices';

  constructor(private http: HttpClient) {}

  /**
   * Get paginated list of prices (client-side pagination)
   */
  getPrices(params?: PaginationParams): Observable<PaginatedResponse<ConsumableItemPrice>> {
    return this.http.get<{ success: boolean; data: ConsumableItemPrice[] }>(this.API_URL).pipe(
      map(response => {
        let items = response.data || [];

        // Client-side search filtering
        if (params?.search) {
          const searchLower = params.search.toLowerCase();
          items = items.filter(item =>
            item.itemCode.toLowerCase().includes(searchLower)
          );
        }

        const totalCount = items.length;
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 20;
        const startIndex = (page - 1) * pageSize;
        const paginatedItems = items.slice(startIndex, startIndex + pageSize);

        return {
          items: paginatedItems,
          totalCount,
          page,
          pageSize
        };
      })
    );
  }

  /**
   * Get price by item code
   */
  getPriceByItemCode(itemCode: string): Observable<ConsumableItemPrice> {
    return this.http.get<{ success: boolean; data: ConsumableItemPrice }>(`${this.API_URL}/${itemCode}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update price for item (by itemCode)
   */
  updatePrice(itemCode: string, request: UpdatePriceRequest): Observable<ConsumableItemPrice> {
    return this.http.put<{ success: boolean; data: ConsumableItemPrice }>(`${this.API_URL}/${itemCode}`, request).pipe(
      map(response => response.data)
    );
  }
}
