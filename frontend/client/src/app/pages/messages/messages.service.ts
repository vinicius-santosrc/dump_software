import { Injectable } from "@angular/core";
import { UserService } from "../../core/services/user/user.service";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "../../core/config/api.config";

@Injectable({
    providedIn: "root",
})
export class MessagesService {
    constructor(
        private readonly userService: UserService,
        private readonly http: HttpClient
    ) { }

    loadMessages(conversationId: string): any {
        return this.http.get(`${API_CONFIG.baseUrl}/messages/${conversationId}`);
    }
}