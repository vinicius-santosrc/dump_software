import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, shareReplay, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "../../config/api.config";
import { User } from "../../models/user/user.model";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly API = '/api/v1/user';
    private readonly userSubject = new BehaviorSubject<any | null>(null);
    private readonly profileCache = new Map<string, Observable<any>>();
    private readonly userByIdCache = new Map<string, Observable<any>>();
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

        if (this.profileCache.has(username)) {
            return this.profileCache.get(username)!;
        }

        const request = this.http.get(
            `${API_CONFIG.baseUrl}${this.API}/${username}`
        ).pipe(
            tap((user: any) => {
                if (this.userSubject.value?.username === user?.username) {
                    this.userSubject.next(user);
                }
            }),
            shareReplay(1)
        );

        this.profileCache.set(username, request);

        return request;
    }

    clearUser() {
        this.userSubject.next(null);
        this.profileCache.clear();
        this.userByIdCache.clear();
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

    getUserById(id: string) {

        if (this.userByIdCache.has(id)) {
            return this.userByIdCache.get(id)!;
        }

        const request = this.http.get(
            `${API_CONFIG.baseUrl}${this.API}/getById/${id}`
        ).pipe(
            shareReplay(1)
        );

        this.userByIdCache.set(id, request);

        return request;
    }

    updateUser(user: User) {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}/update`, user);
    }
}