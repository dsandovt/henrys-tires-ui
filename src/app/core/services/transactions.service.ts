import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  Transaction,
  CreateInTransactionRequest,
  CreateOutTransactionRequest,
  CreateAdjustTransactionRequest
} from '../models/inventory.models';
import { PaginatedResponse, PaginationParams } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private readonly API_URL = '/api/v1/transactions';

  constructor(private http: HttpClient) {}

  /**
   * Get paginated list of transactions
   */
  getTransactions(params?: PaginationParams): Observable<PaginatedResponse<Transaction>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<{ success: boolean; data: PaginatedResponse<Transaction> }>(this.API_URL, { params: httpParams }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get transaction by ID
   */
  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<{ success: boolean; data: Transaction }>(`${this.API_URL}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create IN transaction (draft)
   */
  createInTransaction(request: CreateInTransactionRequest): Observable<Transaction> {
    return this.http.post<{ success: boolean; data: Transaction }>(`${this.API_URL}/in`, request).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create OUT transaction (draft)
   */
  createOutTransaction(request: CreateOutTransactionRequest): Observable<Transaction> {
    return this.http.post<{ success: boolean; data: Transaction }>(`${this.API_URL}/out`, request).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create ADJUST transaction (draft)
   */
  createAdjustTransaction(request: CreateAdjustTransactionRequest): Observable<Transaction> {
    return this.http.post<{ success: boolean; data: Transaction }>(`${this.API_URL}/adjust`, request).pipe(
      map(response => response.data)
    );
  }

  /**
   * Commit transaction (make it permanent)
   */
  commitTransaction(id: string): Observable<Transaction> {
    return this.http.post<{ success: boolean; data: Transaction }>(`${this.API_URL}/${id}/commit`, {}).pipe(
      map(response => response.data)
    );
  }

  /**
   * Cancel draft transaction
   */
  cancelTransaction(id: string): Observable<void> {
    return this.http.post<{ success: boolean; data: void }>(`${this.API_URL}/${id}/cancel`, {}).pipe(
      map(response => response.data)
    );
  }
}
