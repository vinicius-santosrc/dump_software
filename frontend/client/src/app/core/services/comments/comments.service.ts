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
}
