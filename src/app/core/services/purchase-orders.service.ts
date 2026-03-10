import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PurchaseOrder, PurchaseOrderListResponse, CreatePurchaseOrderRequest } from '../models/inventory.models';
import { PaginatedResponse, PaginationParams } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PurchaseOrdersService {
  private readonly API_URL = `${environment.apiUrl}/v1/purchase-order`;
  constructor(private http: HttpClient) {}

  getPurchaseOrders(params?: PaginationParams): Observable<PaginatedResponse<PurchaseOrderListResponse>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<{ success: boolean; data: PaginatedResponse<PurchaseOrderListResponse> }>(this.API_URL, { params: httpParams }).pipe(map(response => response.data));
  }

  getPurchaseOrderById(id: string): Observable<PurchaseOrder> {
    return this.http.get<{ success: boolean; data: PurchaseOrder }>(`${this.API_URL}/${id}`).pipe(map(response => response.data));
  }

  createPurchaseOrder(request: CreatePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http.post<{ success: boolean; data: PurchaseOrder }>(this.API_URL, request).pipe(map(response => response.data));
  }

  receivePurchaseOrder(id: string): Observable<PurchaseOrder> {
    return this.http.post<{ success: boolean; data: PurchaseOrder }>(`${this.API_URL}/${id}/receive`, {}).pipe(map(response => response.data));
  }

  cancelPurchaseOrder(id: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/cancel`, {});
  }
}
