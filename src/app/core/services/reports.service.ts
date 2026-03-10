import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StockReport, Invoice, InventoryMovementsReport, SalesReport, DailyCloseReport, KardexReport, SalesByVolumeReport } from '../models/report.models';
import { ApiResponse } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/v1/report`;

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

  // Sales Report
  getSalesReport(params: { branchReference?: string; from: string; to: string; sortOrder?: string }): Observable<SalesReport> {
    let httpParams = new HttpParams()
      .set('from', params.from)
      .set('to', params.to);
    if (params.branchReference) httpParams = httpParams.set('branchReference', params.branchReference);
    if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);

    return this.http.get<ApiResponse<SalesReport>>(`${this.API_URL}/sales`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  downloadSalesReportExcel(params: { branchReference?: string; from: string; to: string; sortOrder?: string }): Observable<Blob> {
    let httpParams = new HttpParams()
      .set('from', params.from)
      .set('to', params.to);
    if (params.branchReference) httpParams = httpParams.set('branchReference', params.branchReference);
    if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);

    return this.http.get(`${this.API_URL}/sales/export`, {
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

  // Daily Close Report
  getDailyCloseReport(params: { branchReference: string; date: string; groupBy?: string }): Observable<DailyCloseReport> {
    let httpParams = new HttpParams()
      .set('branchReference', params.branchReference)
      .set('date', params.date);
    if (params.groupBy) httpParams = httpParams.set('groupBy', params.groupBy);

    return this.http.get<ApiResponse<DailyCloseReport>>(`${this.API_URL}/daily-close`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  downloadDailyCloseExcel(params: { branchReference: string; date: string; groupBy?: string }): Observable<Blob> {
    let httpParams = new HttpParams()
      .set('branchReference', params.branchReference)
      .set('date', params.date);
    if (params.groupBy) httpParams = httpParams.set('groupBy', params.groupBy);

    return this.http.get(`${this.API_URL}/daily-close/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  // Kardex Report
  getKardexReport(params: {
    itemCode: string;
    condition?: string;
    branchCode?: string;
    fromDate?: string;
    toDate?: string;
  }): Observable<KardexReport> {
    let httpParams = new HttpParams().set('itemCode', params.itemCode);
    if (params.condition) httpParams = httpParams.set('condition', params.condition);
    if (params.branchCode) httpParams = httpParams.set('branchCode', params.branchCode);
    if (params.fromDate) httpParams = httpParams.set('fromDate', params.fromDate);
    if (params.toDate) httpParams = httpParams.set('toDate', params.toDate);

    return this.http.get<ApiResponse<KardexReport>>(`${this.API_URL}/kardex`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  downloadKardexExcel(params: {
    itemCode: string;
    condition?: string;
    branchCode?: string;
    fromDate?: string;
    toDate?: string;
  }): Observable<Blob> {
    let httpParams = new HttpParams().set('itemCode', params.itemCode);
    if (params.condition) httpParams = httpParams.set('condition', params.condition);
    if (params.branchCode) httpParams = httpParams.set('branchCode', params.branchCode);
    if (params.fromDate) httpParams = httpParams.set('fromDate', params.fromDate);
    if (params.toDate) httpParams = httpParams.set('toDate', params.toDate);

    return this.http.get(`${this.API_URL}/kardex/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  // Sales by Volume Report
  getSalesByVolumeReport(params: { branchReference?: string; from: string; to: string }): Observable<SalesByVolumeReport> {
    let httpParams = new HttpParams()
      .set('from', params.from)
      .set('to', params.to);
    if (params.branchReference) httpParams = httpParams.set('branchReference', params.branchReference);

    return this.http.get<ApiResponse<SalesByVolumeReport>>(`${this.API_URL}/sales-by-volume`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  downloadSalesByVolumeExcel(params: { branchReference?: string; from: string; to: string }): Observable<Blob> {
    let httpParams = new HttpParams()
      .set('from', params.from)
      .set('to', params.to);
    if (params.branchReference) httpParams = httpParams.set('branchReference', params.branchReference);

    return this.http.get(`${this.API_URL}/sales-by-volume/export`, {
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
