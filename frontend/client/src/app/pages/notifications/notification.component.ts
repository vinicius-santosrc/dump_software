import { Component } from '@angular/core';
import { NotificationService } from '../../core/services/messages/notification.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss'],
    imports: [CommonModule]
})
export class NotificationComponent {

    notifications$;

    constructor(private notificationService: NotificationService) {
        this.notifications$ = this.notificationService.notifications$;
    }
}