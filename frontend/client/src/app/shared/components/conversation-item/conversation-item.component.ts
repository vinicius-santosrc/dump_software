import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conversation-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conversation-item.component.html',
  styleUrls: ['./conversation-item.component.scss']
})
export class ConversationItemComponent {

  @Input() convo: any;
  @Input() currentUser: any;
  @Input() typingMap: any;

  @Input() variant: 'default' | 'circular' = 'default';

  @Output() clicked = new EventEmitter<void>();

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

  isTyping(): boolean {
    if (!this.typingMap || !this.convo?.id) return false;

    const users = this.typingMap[this.convo.id] ?? [];
    return users.length > 0;
  }

  getLastMessage(): string {
    if (!this.convo?.lastMessage) return '';

    if (this.convo.participants.length === 2) {
      if (this.convo.lastMessage.senderId === this.currentUser?.id) {
        return 'Você: ' + this.convo.lastMessage.text;
      }
      return this.convo.lastMessage.text;
    }

    return '';
  }

  getUnreadCount(): number {
    if (!this.convo?.unreadCount || !this.currentUser?.id) return 0;

    return this.convo.unreadCount[this.currentUser.id] ?? 0;
  }
}