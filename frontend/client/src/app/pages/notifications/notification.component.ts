import { Component } from '@angular/core';
import { NotificationService } from '../../core/services/messages/notification.service';
import { CommonModule } from '@angular/common';
import {AvatarItem} from '../../shared/components/avatar-item/avatar-item.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss'],
    imports: [CommonModule, AvatarItem]
})
export class NotificationComponent {

    notifications$;

    constructor(private readonly notificationService: NotificationService, private readonly router: Router) {
        this.notifications$ = this.notificationService.notifications$;
    }

    handleClick(notification: any) {
        const newUrl = notification.redirect;
        this.router.navigate([newUrl]);
    }
}