import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    private readonly _notifications = new BehaviorSubject<any[]>([]);
    private readonly recentNotificationKeys = new Set<string>();
    notifications$ = this._notifications.asObservable();

    show(notification: any) {
        const key = this.getNotificationKey(notification);

        if (this.recentNotificationKeys.has(key)) {
            return;
        }

        this.recentNotificationKeys.add(key);

        const current = this._notifications.value;
        this._notifications.next([notification, ...current]);

        setTimeout(() => {
            this.remove(notification);
            this.recentNotificationKeys.delete(key);
        }, 10000);
    }

    private getNotificationKey(notification: any): string {
        const id = notification?.id ?? notification?._id ?? notification?.messageId;

        if (id) {
            return `id:${id}`;
        }

        const type = notification?.type ?? '';
        const conversationId = notification?.conversationId ?? notification?.conversation?.id ?? '';
        const senderId = notification?.sender?.id ?? notification?.senderId ?? '';
        const createdAt = notification?.createdAt ?? '';
        const message = notification?.message ?? notification?.text ?? '';

        return `fallback:${type}:${conversationId}:${senderId}:${createdAt}:${message}`;
    }

    remove(notification: any) {
        const filtered = this._notifications.value.filter(n => n !== notification);
        this._notifications.next(filtered);
    }
}