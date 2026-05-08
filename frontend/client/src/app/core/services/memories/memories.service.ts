import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { API_CONFIG } from "../../config/api.config";

@Injectable({
    providedIn: 'root'
})
export class MemoriesService {
    private readonly API = '/api/v1/memories';

    constructor(private readonly http: HttpClient) { }

    public async getFeed(currentUserId: string) {
        return await firstValueFrom(
            this.http.get<any[]>(`${API_CONFIG.baseUrl}${this.API}/feed/${currentUserId}`)
        );
    }

    public async getByUser(userId: string) {
        return await firstValueFrom(
            this.http.get<any[]>(`${API_CONFIG.baseUrl}${this.API}/user/${userId}`)
        );
    }

    public async getById(id: string) {
        return await firstValueFrom(
            this.http.get(`${API_CONFIG.baseUrl}${this.API}/${id}`)
        );
    }
}
