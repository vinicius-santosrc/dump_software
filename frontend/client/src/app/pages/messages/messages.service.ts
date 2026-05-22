import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, shareReplay, tap } from "rxjs";
import { API_CONFIG } from "../../core/config/api.config";

@Injectable({
    providedIn: 'root'
})
export class MessagesService {

    private readonly conversationsCache = new Map<string, any[]>();
    private readonly messagesCache = new Map<string, any[]>();

    constructor(private readonly http: HttpClient) { }

    getConversationsByUserId(userId: string): Observable<any> {

        const cached = this.conversationsCache.get(userId);

        if (cached) {
            return of(cached);
        }

        return this.http.get<any[]>(
            `${API_CONFIG.baseUrl}/messages/conversation/user/${userId}`
        ).pipe(
            tap((response) => {
                this.conversationsCache.set(userId, response ?? []);
            }),
            shareReplay(1)
        );
    }

    getMessages(conversationId: string, forceRefresh: boolean = false): Observable<any> {

        const cached = this.messagesCache.get(conversationId);

        if (cached && !forceRefresh) {
            return of(cached);
        }

        return this.http.get<any[]>(
            `${API_CONFIG.baseUrl}/messages/${conversationId}`
        ).pipe(
            tap((response) => {
                this.messagesCache.set(conversationId, response ?? []);
            }),
            shareReplay(1)
        );
    }

    updateMessagesCache(conversationId: string, messages: any[]) {
        this.messagesCache.set(conversationId, messages ?? []);
    }

    addMessageToCache(conversationId: string, message: any) {

        const current = this.messagesCache.get(conversationId) ?? [];

        this.messagesCache.set(conversationId, [
            ...current,
            message
        ]);
    }

    clearMessagesCache(conversationId?: string) {

        if (conversationId) {
            this.messagesCache.delete(conversationId);
            return;
        }

        this.messagesCache.clear();
    }
}