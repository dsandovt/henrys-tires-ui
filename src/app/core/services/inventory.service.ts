import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { InventorySummary } from '../models/inventory.models';
import { PaginatedResponse, PaginationParams } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly API_URL = `${environment.apiUrl}/v1/transaction/inventory`;

  constructor(private http: HttpClient) {}

  getInventorySummaries(
    params?: PaginationParams & { branchReference?: string; condition?: string },
  ): Observable<PaginatedResponse<InventorySummary>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.branchReference) httpParams = httpParams.set('branchReference', params.branchReference);
    if (params?.condition) httpParams = httpParams.set('condition', params.condition);

    return this.http
      .get<{
        success: boolean;
        data: PaginatedResponse<InventorySummary>;
      }>(this.API_URL, { params: httpParams })
      .pipe(map((response) => response.data));
  }

  getInventorySummaryByBranchAndItem(
    branchReference: string,
    itemCode: string,
  ): Observable<InventorySummary> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('branchReference', branchReference);
    httpParams = httpParams.set('itemCode', itemCode);

    const headers = new HttpHeaders().set('X-Skip-Error-Toast', 'true');

    return this.http
      .get<{
        success: boolean;
        data: InventorySummary;
      }>(`${this.API_URL}-summary`, { params: httpParams, headers })
      .pipe(map((response) => response.data));
  }
}
