import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

const API_URL = '/api/v1/auth/';

let isRefreshingToken = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const http = inject(HttpClient);
    const router = inject(Router);

    const token = localStorage.getItem('accessToken');
    const isAuthEndpoint = isAuthenticationEndpoint(req.url);

    const authReq = token && !isAuthEndpoint
        ? req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            },
            withCredentials: true
        })
        : req.clone({
            withCredentials: true
        });

    return next(authReq).pipe(
        catchError((error) => {
            if (error.status !== 401 || isAuthEndpoint || isRefreshRequest(req.url)) {
                return throwError(() => error);
            }

            if (isRefreshingToken) {
                return throwError(() => error);
            }

            isRefreshingToken = true;

            return http.post(`${API_CONFIG.baseUrl}${API_URL}refresh`, {}, {
                withCredentials: true
            }).pipe(
                switchMap((res: any) => {
                    isRefreshingToken = false;

                    const newAccessToken = res?.accessToken;

                    if (!newAccessToken) {
                        localStorage.removeItem('accessToken');
                        router.navigate(['/auth/login']);
                        return throwError(() => error);
                    }

                    localStorage.setItem('accessToken', newAccessToken);

                    const retryReq = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${newAccessToken}`
                        },
                        withCredentials: true
                    });

                    return next(retryReq);
                }),
                catchError((refreshError) => {
                    isRefreshingToken = false;
                    localStorage.removeItem('accessToken');
                    router.navigate(['/auth/login']);
                    return throwError(() => refreshError);
                })
            );
        })
    );
};

function isRefreshRequest(url: string): boolean {
    return url.includes('/auth/refresh');
}

function isAuthenticationEndpoint(url: string): boolean {
    return url.includes('/auth/signin')
        || url.includes('/auth/signup')
        || url.includes('/auth/forgotpassword')
        || url.includes('/auth/resetpassword')
        || url.includes('/auth/refresh');
}