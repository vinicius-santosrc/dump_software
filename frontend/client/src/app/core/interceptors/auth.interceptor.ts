import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const http = inject(HttpClient);

    const token = localStorage.getItem('accessToken');

    let authReq = req;

    if (token) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            },
            withCredentials: true
        });
    } else {
        authReq = req.clone({
            withCredentials: true
        });
    }

    return next(authReq).pipe(
        catchError((error) => {
            if (error.status === 401) {
                return http.post('http://localhost:5207/api/v1/auth/refresh', {}, {
                    withCredentials: true
                }).pipe(
                    switchMap((res: any) => {
                        localStorage.setItem('accessToken', res.accessToken);

                        const newReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${res.accessToken}`
                            },
                            withCredentials: true
                        });

                        return next(newReq);
                    }),
                    catchError((err) => {
                        // logout se refresh falhar
                        localStorage.clear();
                        return throwError(() => err);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};