import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  DashboardData,
  DashboardQueryParams,
} from '../../features/dashboard/models/dashboard.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly API_URL = `${environment.apiUrl}/v1/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardData(params: DashboardQueryParams): Observable<DashboardData> {
    let httpParams = new HttpParams()
      .set('startDateUtc', params.startDateUtc)
      .set('endDateUtc', params.endDateUtc);

    if (params.branchCode) {
      httpParams = httpParams.set('branchCode', params.branchCode);
    }

    return this.http
      .get<{ success: boolean; data: DashboardData }>(this.API_URL, { params: httpParams })
      .pipe(map((response) => response.data));
  }
}
