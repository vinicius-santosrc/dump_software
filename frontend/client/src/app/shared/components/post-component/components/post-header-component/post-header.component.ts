import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericCardUserComponent } from '../../../generic-card-user/generic-card-user.component';
import { User } from '../../../../../core/models/user/user.model';

@Component({
    selector: 'app-post-header',
    standalone: true,
    imports: [CommonModule, GenericCardUserComponent],
    templateUrl: './post-header.component.html',
    styleUrl: './post-header.component.scss'
})
export class PostHeaderComponent {
    @Input() user: User | undefined;
    @Input() caption: string | undefined;
    @Input() theme: 'dark' | 'light' = 'light';
    @Input() isModal: boolean = false;
}