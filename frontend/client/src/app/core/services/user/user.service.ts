import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "../../config/api.config";

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private readonly userSubject = new BehaviorSubject<any | null>(null);
    user$ = this.userSubject.asObservable();

    constructor(private readonly http: HttpClient) { }

    loadUser(): Observable<any> {
        return this.http.get(`${API_CONFIG.baseUrl}/api/v1/auth/me`).pipe(
            tap((user) => {
                this.userSubject.next(user);
            })
        );
    }

    getUser() {
        return this.userSubject.value;
    }

    clearUser() {
        this.userSubject.next(null);
    }
}