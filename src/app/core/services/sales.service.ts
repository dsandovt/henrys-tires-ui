import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sale, CreateSaleRequest, SaleListResponse } from '../models/inventory.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/v1/sales`;

  createSale(request: CreateSaleRequest): Observable<Sale> {
    return this.http.post<Sale>(this.API_URL, request);
  }

  postSale(saleId: string): Observable<Sale> {
    return this.http.post<Sale>(`${this.API_URL}/${saleId}/post`, {});
  }

  getSaleById(saleId: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.API_URL}/${saleId}`);
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

    return this.http.get<SaleListResponse>(this.API_URL, { params: httpParams });
  }
}
