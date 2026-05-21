import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Notification } from "../../models/notification/notification.model";
import { API_CONFIG } from "../../config/api.config";
import { UserService } from "../user/user.service";

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly API = '/api/v1/notifications';

    constructor(private readonly http: HttpClient, private readonly userService: UserService) { }

getNotifications(): Observable<Notification[]> {
    const userId = this.userService.getUser().id;
    return this.http.get<Notification[]>(`${API_CONFIG.baseUrl}${this.API}?userId=${userId}`);
}

    markAsRead(notificationId: string): Observable<void> {
        return this.http.patch<void>(`${API_CONFIG.baseUrl}${this.API}/${notificationId}/read`, {});
    }
}
