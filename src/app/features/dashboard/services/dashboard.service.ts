import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DashboardData, DashboardQueryParams } from '../models/dashboard.models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = `${environment.apiUrl}/v1/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Get dashboard data with filters
   */
  getDashboardData(queryParams: DashboardQueryParams): Observable<DashboardData> {
    let params = new HttpParams()
      .set('startDateUtc', queryParams.startDateUtc)
      .set('endDateUtc', queryParams.endDateUtc);

    if (queryParams.branchCode) {
      params = params.set('branchCode', queryParams.branchCode);
    }

    return this.http.get<{ success: boolean; data: DashboardData }>(this.API_URL, { params }).pipe(
      map(response => response.data)
    );
  }
}
