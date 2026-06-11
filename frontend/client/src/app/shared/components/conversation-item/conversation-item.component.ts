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
    else {
      const othersUser = this.convo.participants.filter(
        (u: any) => u.id !== this.currentUser?.id
      );
      return othersUser;
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
    const lastMessage = this.convo?.lastMessage;

    if (!lastMessage) return '';

    const text = lastMessage.text ?? '';
    const type = lastMessage.type ?? '';
    const mediaType = lastMessage.mediaType ?? '';
    const mediaUrl = lastMessage.mediaUrl ?? '';
    const stickerUrl = lastMessage.stickerUrl ?? '';

    const isMine = lastMessage.senderId === this.currentUser?.id;
    const prefix = isMine
      ? `${this.translateService.instant('MESSAGES_INBOX.SIDEBAR.LAST_MESSAGE')}: `
      : '';

    // POST
    const postMatch = text.match(/\/p\/([a-zA-Z0-9-]+)/);

    // STORY
    const storyMatch = text.match(/\/memories\/([^\/]+)\/([a-zA-Z0-9-]+)/);

    if (postMatch || storyMatch) {
      return prefix + this.translateService.instant('MESSAGES_INBOX.SIDEBAR.LAST_MESSAGE_SENT_POST');
    }

    if (this.isImageLastMessage(type, mediaType, mediaUrl, text)) {
      return prefix + this.translateService.instant('MESSAGES_INBOX.SIDEBAR.LAST_MESSAGE_SENT_IMAGE');
    }

    if (this.isVideoLastMessage(type, mediaType, mediaUrl, text)) {
      return prefix + this.translateService.instant('MESSAGES_INBOX.SIDEBAR.LAST_MESSAGE_SENT_VIDEO');
    }

    if (this.isAudioLastMessage(type, mediaType, mediaUrl, text)) {
      return prefix + this.translateService.instant('MESSAGES_INBOX.SIDEBAR.LAST_MESSAGE_SENT_AUDIO');
    }

    if (this.isStickerLastMessage(type, stickerUrl, text)) {
      return prefix + this.translateService.instant('MESSAGES_INBOX.SIDEBAR.LAST_MESSAGE_SENT_STICKER');
    }

    if (this.convo.participants.length === 2) {
      return prefix + text;
    }

    return text;
  }

  private isImageLastMessage(type: string, mediaType: string, mediaUrl: string, text: string): boolean {
    const source = mediaUrl || text;

    return type === 'image'
      || mediaType.startsWith('image/')
      || source.startsWith('data:image');
  }

  private isVideoLastMessage(type: string, mediaType: string, mediaUrl: string, text: string): boolean {
    const source = mediaUrl || text;

    return type === 'video'
      || mediaType.startsWith('video/')
      || source.startsWith('data:video');
  }

  private isAudioLastMessage(type: string, mediaType: string, mediaUrl: string, text: string): boolean {
    const source = mediaUrl || text;

    return type === 'audio'
      || mediaType.startsWith('audio/')
      || source.startsWith('data:audio');
  }

  private isStickerLastMessage(type: string, stickerUrl: string, text: string): boolean {
    const source = stickerUrl || text;

    return type === 'sticker'
      || source.includes('/stickers/')
      || source.includes('assets/stickers/');
  }

  getUnreadCount(): number {
    if (!this.convo || !this.currentUser?.id) return 0;

    const unreadMap = this.convo.unreadCount ?? {};

    const count = unreadMap[this.currentUser.id] ?? 0;

    return count;
  }

  ngOnChanges() {
    // força atualização quando o objeto muda (realtime)
  }
}