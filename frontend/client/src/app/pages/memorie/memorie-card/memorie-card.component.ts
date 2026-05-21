import { Component, Input } from '@angular/core';
import { BasicInputComponent } from "../../../shared/components/basic-input-component/basic-input.component";
import {AvatarItem} from '../../../shared/components/avatar-item/avatar-item.component';
import { formatDateToNow } from '../../../core/utils/format-date.util';
import { Router } from '@angular/router';
import { MatIcon } from "@angular/material/icon";
import { MatDialog } from '@angular/material/dialog';
import { SharePostComponent } from '../../../shared/components/share-post-component/share-post-component';
import { MatButtonModule } from "@angular/material/button";
import { PostMediaComponent } from "../../../shared/components/post-component/components/post-media-component/post-media.component";

@Component({
  selector: 'app-memorie-card',
  templateUrl: './memorie-card.component.html',
  styleUrls: ['./memorie-card.component.scss'],
  imports: [BasicInputComponent, AvatarItem, MatIcon, MatButtonModule, PostMediaComponent]
})
export class MemorieCardComponent {
  @Input() memorie: any;
  formatDateToNow = formatDateToNow;

  constructor(private readonly router: Router, private readonly dialog: MatDialog) { }

  get hasSeen(): boolean {
    return false;
  }

  closeStory() {
    globalThis.history.back();
  }

  handleSend() {
    try {
      this.dialog.open(SharePostComponent, {
        data: { storyId: `${this.memorie.user.username}/${this.memorie.id}` },
        width: '500px'
      });
    }
    catch (error) {
      console.error(error);
    }
  }
}
