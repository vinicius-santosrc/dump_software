import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "../../../core/config/api.config";

@Injectable({
    providedIn: 'root'
})
export class CreateConversationService {
    private readonly API = '/messages/conversation'
    constructor(private readonly http: HttpClient) { }

    createConversation(participants: any) {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}`, { participants: participants });
    }
}