import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Branch } from '../models/inventory.models';

@Injectable({
  providedIn: 'root'
})
export class BranchesService {
  private readonly API_URL = '/api/branches';

  constructor(private http: HttpClient) {}

  /**
   * Get all branches
   */
  getAllBranches(): Observable<Branch[]> {
    return this.http.get<{ success: boolean; data: Branch[] }>(this.API_URL).pipe(
      map(response => response.data)
    );
  }
}
