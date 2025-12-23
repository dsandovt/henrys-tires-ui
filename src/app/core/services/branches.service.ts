import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Branch } from '../models/inventory.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BranchesService {
  private readonly API_URL = `${environment.apiUrl}/branches`;

  constructor(private http: HttpClient) {}

  getAllBranches(): Observable<Branch[]> {
    return this.http
      .get<{ success: boolean; data: Branch[] }>(this.API_URL)
      .pipe(map((response) => response.data));
  }
}
