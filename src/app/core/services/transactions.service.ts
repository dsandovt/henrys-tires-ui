import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Transaction } from '../models/inventory.models';
import { PaginatedResponse, PaginationParams } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private readonly API_URL = `${environment.apiUrl}/v1/transaction`;

  constructor(private http: HttpClient) {}

  /**
   * Get paginated list of transactions (read-only)
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
   * Get transaction by ID (read-only)
   */
  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<{ success: boolean; data: Transaction }>(`${this.API_URL}/${id}`).pipe(
      map(response => response.data)
    );
  }
}
