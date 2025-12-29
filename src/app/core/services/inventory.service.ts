import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { InventorySummary } from '../models/inventory.models';
import { PaginatedResponse, PaginationParams } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly API_URL = `${environment.apiUrl}/v1/transactions/inventory`;

  constructor(private http: HttpClient) {}

  getInventorySummaries(
    params?: PaginationParams & { branchCode?: string; condition?: string },
  ): Observable<PaginatedResponse<InventorySummary>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.branchCode) httpParams = httpParams.set('branchCode', params.branchCode);
    if (params?.condition) httpParams = httpParams.set('condition', params.condition);

    return this.http
      .get<{
        success: boolean;
        data: PaginatedResponse<InventorySummary>;
      }>(this.API_URL, { params: httpParams })
      .pipe(map((response) => response.data));
  }

  getInventorySummaryByBranchAndItem(
    branchCode: string,
    itemCode: string,
  ): Observable<InventorySummary> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('branchCode', branchCode);
    httpParams = httpParams.set('itemCode', itemCode);

    return this.http
      .get<{
        success: boolean;
        data: InventorySummary;
      }>(`${this.API_URL}-summary`, { params: httpParams })
      .pipe(map((response) => response.data));
  }
}
