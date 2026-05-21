import { User } from "../../../core/models/user/user.model";

export class ChatViewHelper {

    static getConversationName(conversation: any, currentUserId: string): string {
        if (!conversation?.participants) return '';

        if (conversation.participants.length === 2) {
            const other = conversation.participants.find(
                (u: User) => u.id !== currentUserId
            );

            return other?.fullName || '';
        }

        return conversation.participants
            .map((u: User) => u.fullName)
            .join(', ');
    }

    static getConversationAvatar(conversation: any, currentUserId: string): string {
        if (!conversation?.participants) {
            return '/assets/app/media/default-avatar.webp';
        }

        if (conversation.participants.length === 2) {
            const other = conversation.participants.find(
                (u: User) => u.id !== currentUserId
            );

            return other?.profilePictureUrl || '/assets/app/media/default-avatar.webp';
        }

        return '/assets/app/media/default-avatar.webp';
    }

    static getConversationUser(conversation: any, currentUserId: string): string {
        if (!conversation?.participants) return '';

        if (conversation.participants.length === 2) {
            const other = conversation.participants.find(
                (u: User) => u.id !== currentUserId
            );

            return other?.email || '';
        }

        return `${conversation.participants.length} members`;
    }

    static getLastMessagePreview(conversation: any, currentUserId: string): string {
        if (!conversation?.lastMessage) return '';

        if (conversation.participants.length === 2) {
            if (conversation.lastMessage.senderId === currentUserId) {
                return 'Você: ' + conversation.lastMessage.text;
            }

            return conversation.lastMessage.text;
        }

        return conversation.lastMessage.text;
    }
}