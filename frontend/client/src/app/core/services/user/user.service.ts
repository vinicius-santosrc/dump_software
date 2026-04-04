import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "../../config/api.config";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly API = '/api/v1/user';
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

    getUserByUsername(username: string) {
        return this.http.get(`${API_CONFIG.baseUrl}${this.API}/${username}`)
    }

    clearUser() {
        this.userSubject.next(null);
    }

    getRelatedByCurrentUser() {
        return this.http.get(`${API_CONFIG.baseUrl}${this.API}/getRelatedByCurrentUser/${this.userSubject.value.id}`);
    }

    followUser(currentUserId: string, targetUserId: string) {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}/follow`, {
            currentUserId,
            targetUserId
        });
    }
}