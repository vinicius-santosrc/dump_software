import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AvatarItem } from '../avatar-item/avatar-item.component';

@Component({
  selector: 'app-conversation-item',
  standalone: true,
  imports: [CommonModule, AvatarItem],
  templateUrl: './conversation-item.component.html',
  styleUrls: ['./conversation-item.component.scss']
})
export class ConversationItemComponent {

  @Input() convo: any;
  @Input() currentUser: any;
  @Input() typingMap: any;

  @Input() variant: 'default' | 'circular' = 'default';

  @Input() selected: boolean = false;

  @Output() clicked = new EventEmitter<void>();

  constructor(private readonly translateService: TranslateService) { }

  onClick() {
    this.clicked.emit();
  }

  getConversationName(): string {
    if (!this.convo || !this.convo.participants) return '';

    if (this.convo.participants.length === 2) {
      const otherUser = this.convo.participants.find(
        (u: any) => u.id !== this.currentUser?.id
      );
      return otherUser?.fullName || '';
    }

    return this.convo.participants.map((u: any) => u.fullName).join(', ');
  }

  getConversationAvatar(): string {
    if (!this.convo || !this.convo.participants) {
      return '/assets/app/media/default-avatar.webp';
    }

    if (this.convo.participants.length === 2) {
      const otherUser = this.convo.participants.find(
        (u: any) => u.id !== this.currentUser?.id
      );
      return (
        otherUser?.profilePictureUrl ||
        '/assets/app/media/default-avatar.webp'
      );
    }

    return '/assets/app/media/default-avatar.webp';
  }

  getConversationUser(): Object {
    if (!this.convo || !this.convo.participants) {
      return {};
    }

    if (this.convo.participants.length === 2) {
      const otherUser = this.convo.participants.find(
        (u: any) => u.id !== this.currentUser?.id
      );
      return (
        otherUser
      );
    }

    return {};
  }

  isTyping(): boolean {
    if (!this.typingMap || !this.convo?.id) return false;

    const users = this.typingMap[this.convo.id] ?? [];
    if (users.length == 1 && users[0] === this.currentUser.id) {
      return false;
    }
    return users.length > 0;
  }

  getLastMessage(): string {
    if (!this.convo?.lastMessage) return '';

    // POST
    const postMatch = this.convo.lastMessage.text.match(/\/p\/([a-zA-Z0-9-]+)/);

    // STORY
    const storyMatch = this.convo.lastMessage.text.match(/\/memories\/([^\/]+)\/([a-zA-Z0-9-]+)/);

    if (postMatch || storyMatch) {
      return this.translateService.instant('MESSAGES_INBOX.SIDEBAR.LAST_MESSAGE_SENT_POST')
    }

    if (this.convo.participants.length === 2) {
      if (this.convo.lastMessage.senderId === this.currentUser?.id) {
        return this.translateService.instant('MESSAGES_INBOX.SIDEBAR.LAST_MESSAGE') + ': ' + this.convo.lastMessage.text;
      }
      return this.convo.lastMessage.text;
    }

    return '';
  }

  getUnreadCount(): number {
    if (!this.convo || !this.currentUser?.id) return 0;

    // 🔥 garante que unreadCount existe
    const unreadMap = this.convo.unreadCount ?? {};

    const count = unreadMap[this.currentUser.id] ?? 0;

    return count;
  }

  ngOnChanges() {
    // força atualização quando o objeto muda (realtime)
  }
}