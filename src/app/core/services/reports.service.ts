import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StockReport, Invoice, InventoryMovementsReport } from '../models/report.models';
import { ApiResponse } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/v1/reports`;

  // Stock Report
  getStockReport(branchId?: string): Observable<StockReport> {
    let httpParams = new HttpParams();
    if (branchId) httpParams = httpParams.set('branchId', branchId);

    return this.http.get<ApiResponse<StockReport>>(`${this.API_URL}/stock`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  downloadStockReportExcel(branchId?: string): Observable<Blob> {
    let httpParams = new HttpParams();
    if (branchId) httpParams = httpParams.set('branchId', branchId);

    return this.http.get(`${this.API_URL}/stock/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  // Sale Invoice
  getSaleInvoice(saleId: string): Observable<Invoice> {
    return this.http.get<ApiResponse<Invoice>>(`${this.API_URL}/sales/${saleId}/invoice`)
      .pipe(map(response => response.data));
  }

  downloadSaleInvoicePdf(saleId: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/sales/${saleId}/invoice/pdf`, {
      responseType: 'blob'
    });
  }

  // Transaction Invoice
  getTransactionInvoice(transactionId: string): Observable<Invoice> {
    return this.http.get<ApiResponse<Invoice>>(`${this.API_URL}/transactions/${transactionId}/invoice`)
      .pipe(map(response => response.data));
  }

  downloadTransactionInvoicePdf(transactionId: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/transactions/${transactionId}/invoice/pdf`, {
      responseType: 'blob'
    });
  }

  // Inventory Movements Report
  getInventoryMovements(params?: {
    fromDate?: string;
    toDate?: string;
    branchCode?: string;
    transactionType?: string;
    status?: string;
  }): Observable<InventoryMovementsReport> {
    let httpParams = new HttpParams();

    if (params?.fromDate) httpParams = httpParams.set('fromDate', params.fromDate);
    if (params?.toDate) httpParams = httpParams.set('toDate', params.toDate);
    if (params?.branchCode) httpParams = httpParams.set('branchCode', params.branchCode);
    if (params?.transactionType) httpParams = httpParams.set('transactionType', params.transactionType);
    if (params?.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<ApiResponse<InventoryMovementsReport>>(`${this.API_URL}/inventory-movements`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  downloadInventoryMovementsExcel(params?: {
    fromDate?: string;
    toDate?: string;
    branchCode?: string;
    transactionType?: string;
    status?: string;
  }): Observable<Blob> {
    let httpParams = new HttpParams();

    if (params?.fromDate) httpParams = httpParams.set('fromDate', params.fromDate);
    if (params?.toDate) httpParams = httpParams.set('toDate', params.toDate);
    if (params?.branchCode) httpParams = httpParams.set('branchCode', params.branchCode);
    if (params?.transactionType) httpParams = httpParams.set('transactionType', params.transactionType);
    if (params?.status) httpParams = httpParams.set('status', params.status);

    return this.http.get(`${this.API_URL}/inventory-movements/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  // Utility method to trigger file download
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
