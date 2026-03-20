/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-17
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { LoginDTO, RegisterDTO } from "../../models/auth/auth.dto";
import { API_CONFIG } from "../../config/api.config";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly API = '/api/v1/auth';
    
    constructor(private readonly http: HttpClient) { }

    // 🔐 LOGIN
    login(data: LoginDTO): Observable<any> {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}/login`, data, { withCredentials: true }).pipe(
            tap((response: any) => {
                localStorage.setItem('accessToken', response.accessToken);
                const router = inject(Router);
                router.navigate(["/"])
            })
        );
    }

    // 📝 REGISTER
    register(data: RegisterDTO): Observable<any> {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}/register`, data);
    }

    // 🚪 LOGOUT
    logout(): void {
        localStorage.removeItem('accessToken');
        this.http.post(`${API_CONFIG.baseUrl}${this.API}/logout`, {}, { withCredentials: true }).subscribe();
    }
}