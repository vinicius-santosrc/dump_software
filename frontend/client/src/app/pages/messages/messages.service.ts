import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "../../core/config/api.config";

@Injectable({
    providedIn: 'root'
})
export class MessagesService {

    constructor(private readonly http: HttpClient) { }

    getConversationsByUserId(userId: string) {
        return this.http.get(
            `${API_CONFIG.baseUrl}/messages/conversation/user/${userId}`
        );
    }

    getMessages(conversationId: string) {
        return this.http.get(
            `${API_CONFIG.baseUrl}/messages/${conversationId}`
        );
    }
}