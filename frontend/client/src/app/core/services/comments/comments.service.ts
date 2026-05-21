import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_CONFIG } from "../../config/api.config";

@Injectable({
    providedIn: 'root'
})
export class CommentsService {
    private readonly API = '/api/v1/comments';

    constructor(private readonly http: HttpClient) { }

    public getByPostId(id: string) {
        return this.http.get(`${API_CONFIG.baseUrl}${this.API}/getByPost/${id}`, {});
    }

    public removeComment(id: string) {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}/remove/${id}`, {});
    }

    public reportComment(id: string, userId: string) {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}/report/${id}?userId=${userId}`, {});
    }
}
