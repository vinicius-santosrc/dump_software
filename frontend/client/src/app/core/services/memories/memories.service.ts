import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { API_CONFIG } from "../../config/api.config";

@Injectable({
    providedIn: 'root'
})
export class MemoriesService {
    private readonly API = '/api/v1/memories';
    private readonly userStoriesCache = new Map<string, any[]>();
    private readonly feedCache = new Map<string, any[]>();

    constructor(private readonly http: HttpClient) { }

    public async getFeed(currentUserId: string) {

        if (this.feedCache.has(currentUserId)) {
            return this.feedCache.get(currentUserId);
        }

        const response = await firstValueFrom(
            this.http.get<any[]>(`${API_CONFIG.baseUrl}${this.API}/feed/${currentUserId}`)
        );

        this.feedCache.set(
            currentUserId,
            response || []
        );

        return response;
    }

    public async getByUser(userId: string) {

        if (this.userStoriesCache.has(userId)) {
            return this.userStoriesCache.get(userId);
        }

        const response = await firstValueFrom(
            this.http.get<any[]>(`${API_CONFIG.baseUrl}${this.API}/user/${userId}`)
        );

        this.userStoriesCache.set(
            userId,
            response || []
        );

        return response;
    }

    public async getByUsername(username: string) {
        return await firstValueFrom(
            this.http.get<any[]>(`${API_CONFIG.baseUrl}${this.API}/username/${username}`)
        );
    }

    public async getById(id: string) {
        return await firstValueFrom(
            this.http.get(`${API_CONFIG.baseUrl}${this.API}/${id}`)
        );
    }
}
