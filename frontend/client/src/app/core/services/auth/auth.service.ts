/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-17
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, tap, throwError } from "rxjs";
import { LoginDTO, RegisterDTO } from "../../models/auth/auth.dto";
import { API_CONFIG } from "../../config/api.config";
import { ErrorUtils } from "../../utils/error.utils";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly API = '/api/v1/auth';
    
    constructor(private readonly http: HttpClient) { }

    login(data: LoginDTO): Observable<any> {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}/login`, data, {
            withCredentials: true
        }).pipe(
            tap((response: any) => {
                localStorage.setItem('accessToken', response.accessToken);
            }),
            catchError((error) => {
                return throwError(() => ErrorUtils.parse(error));
            })
        );
    }

    register(data: RegisterDTO): Observable<any> {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}/register`, data).pipe(
            catchError((error) => {
                return throwError(() => ErrorUtils.parse(error));
            })
        );
    }

    forgotPassword(identifier: string): Observable<any> {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}/forgot-password`, {
            user_or_cellphone_or_email: identifier
        }).pipe(
            catchError((error) => {
                return throwError(() => ErrorUtils.parse(error));
            })
        );
    }

    logout(): void {
        localStorage.clear();
        this.http.post(`${API_CONFIG.baseUrl}${this.API}/logout`, {}, { withCredentials: true }).subscribe(() => {
            globalThis.location.href = '/';
        });
    }
}