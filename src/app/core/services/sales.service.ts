import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sale, CreateSaleRequest, SaleListResponse } from '../models/inventory.models';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/sale';

  createSale(request: CreateSaleRequest): Observable<Sale> {
    return this.http.post<Sale>(this.apiUrl, request);
  }

  postSale(saleId: string): Observable<Sale> {
    return this.http.post<Sale>(`${this.apiUrl}/${saleId}/post`, {});
  }

  getSaleById(saleId: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/${saleId}`);
  }

  getSales(params?: {
    branchId?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }): Observable<SaleListResponse> {
    let httpParams = new HttpParams();

    if (params?.branchId) httpParams = httpParams.set('branchId', params.branchId);
    if (params?.from) httpParams = httpParams.set('from', params.from);
    if (params?.to) httpParams = httpParams.set('to', params.to);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<SaleListResponse>(this.apiUrl, { params: httpParams });
  }
}
