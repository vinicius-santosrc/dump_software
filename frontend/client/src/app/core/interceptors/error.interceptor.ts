import {
    HttpErrorResponse,
    HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

import { catchError, throwError } from 'rxjs';

import { ErrorUtils } from '../utils/error.utils';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

    const snackBar = inject(MatSnackBar);
    const router = inject(Router);
    const translateService = inject(TranslateService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            const isApiRequest = req.url.includes('/api');

            if (!isApiRequest) {
                return throwError(() => error);
            }

            const parsedError = ErrorUtils.parse(error);

            switch (error.status) {

                case 404:
                    return throwError(() => error);

                case 401:
                    localStorage.removeItem('accessToken');
                    router.navigate(['/auth/login']);
                    break;

                case 403:
                    showError(
                        snackBar,
                        translateService.instant('ERRORS.FORBIDDEN'),
                        translateService.instant('ERRORS.CLOSE')
                    );
                    break;

                case 500:
                    // showError(
                    //     snackBar,
                    //     translateService.instant('ERRORS.SERVER_ERROR'),
                    //     translateService.instant('ERRORS.CLOSE')
                    // );
                    break;

                default:
                    showError(
                        snackBar,
                        translateService.instant(parsedError.message),
                        translateService.instant('ERRORS.CLOSE')
                    );
                    break;
            }

            return throwError(() => parsedError);
        })
    );
};

function showError(
    snackBar: MatSnackBar,
    message: string,
    action: string
): void {

    snackBar.open(message, action, {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
    });
}