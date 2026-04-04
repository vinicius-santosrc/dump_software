import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_CONFIG } from "../../config/api.config";

@Injectable({
    providedIn: 'root'
})
export class MemoriesService {
    private readonly API = '/api/v1/memories';

    constructor(private readonly http: HttpClient) { }

    public async getByUser(id: string) {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}/getByUser`, id);
    }
}
