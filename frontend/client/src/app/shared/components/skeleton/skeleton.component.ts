import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-skeleton',
    standalone: true,
    templateUrl: './skeleton.component.html',
    styleUrl: './skeleton.component.scss'
})
export class SkeletonComponent {

    @Input() type: 'post' | 'user' | 'story' | 'comment' | 'commentSimple' | 'generic' = 'generic';

    // usado só no generic
    @Input() width: string = '100%';
    @Input() height: string = '100px';
}