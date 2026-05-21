import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
    const userService = inject(UserService);
    const router = inject(Router);

    const token = localStorage.getItem('accessToken');

    if (!token) {
        router.navigate(['/accounts/signin']);
        return false;
    }

    return userService.loadUser().pipe(
        map(() => true),
        catchError(() => {
            router.navigate(['/accounts/signin']);
            return of(false);
        })
    );
};

export const guestGuard: CanActivateFn = () => {
    const router = inject(Router);

    const token = localStorage.getItem('accessToken');

    if (token) {
        router.navigate(['/']);
        return false;
    }

    return true;
};