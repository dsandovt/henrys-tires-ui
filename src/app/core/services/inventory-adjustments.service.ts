import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  InventoryAdjustment,
  CreateBranchTransferRequest,
  CreateStockCorrectionRequest,
  AdjustmentType,
  InventoryAdjustmentStatus
} from '../models/inventory.models';
import { PaginatedResponse, PaginationParams } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InventoryAdjustmentsService {
  private readonly API_URL = `${environment.apiUrl}/v1/inventory-adjustments`;
  constructor(private http: HttpClient) {}

  getAdjustments(params?: PaginationParams & {
    adjustmentType?: AdjustmentType;
    status?: InventoryAdjustmentStatus;
    from?: string;
    to?: string;
  }): Observable<PaginatedResponse<InventoryAdjustment>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    if (params?.adjustmentType) httpParams = httpParams.set('adjustmentType', params.adjustmentType);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.from) httpParams = httpParams.set('from', params.from);
    if (params?.to) httpParams = httpParams.set('to', params.to);
    return this.http.get<{ success: boolean; data: PaginatedResponse<InventoryAdjustment> }>(this.API_URL, { params: httpParams }).pipe(map(response => response.data));
  }

  getAdjustmentById(id: string): Observable<InventoryAdjustment> {
    return this.http.get<{ success: boolean; data: InventoryAdjustment }>(`${this.API_URL}/${id}`).pipe(map(response => response.data));
  }

  createBranchTransfer(request: CreateBranchTransferRequest): Observable<InventoryAdjustment> {
    return this.http.post<{ success: boolean; data: InventoryAdjustment }>(`${this.API_URL}/branch-transfer`, request).pipe(map(response => response.data));
  }

  createStockCorrection(request: CreateStockCorrectionRequest): Observable<InventoryAdjustment> {
    return this.http.post<{ success: boolean; data: InventoryAdjustment }>(`${this.API_URL}/stock-correction`, request).pipe(map(response => response.data));
  }

  commitAdjustment(id: string): Observable<InventoryAdjustment> {
    return this.http.post<{ success: boolean; data: InventoryAdjustment }>(`${this.API_URL}/${id}/commit`, {}).pipe(map(response => response.data));
  }

  cancelAdjustment(id: string): Observable<InventoryAdjustment> {
    return this.http.post<{ success: boolean; data: InventoryAdjustment }>(`${this.API_URL}/${id}/cancel`, {}).pipe(map(response => response.data));
  }
}
