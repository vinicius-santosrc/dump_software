import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    private readonly _notifications = new BehaviorSubject<any[]>([]);
    notifications$ = this._notifications.asObservable();

    show(notification: any) {
        const current = this._notifications.value;
        this._notifications.next([notification, ...current]);
        // auto remove (tipo toast)
        setTimeout(() => this.remove(notification), 10000);
    }

    remove(notification: any) {
        const filtered = this._notifications.value.filter(n => n !== notification);
        this._notifications.next(filtered);
    }
}