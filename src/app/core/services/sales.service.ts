import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Sale, CreateSaleRequest, SaleListResponse } from '../models/inventory.models';
import { ApiResponse } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/v1/sales`;

  createSale(request: CreateSaleRequest): Observable<Sale> {
    return this.http.post<ApiResponse<Sale>>(this.API_URL, request)
      .pipe(map(response => response.data));
  }

  postSale(saleId: string): Observable<Sale> {
    return this.http.post<ApiResponse<Sale>>(`${this.API_URL}/${saleId}/post`, {})
      .pipe(map(response => response.data));
  }

  getSaleById(saleId: string): Observable<Sale> {
    return this.http.get<ApiResponse<Sale>>(`${this.API_URL}/${saleId}`)
      .pipe(map(response => response.data));
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

    return this.http.get<ApiResponse<SaleListResponse>>(this.API_URL, { params: httpParams })
      .pipe(map(response => response.data));
  }
}
