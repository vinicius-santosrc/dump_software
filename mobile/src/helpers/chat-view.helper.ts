import { Conversation } from "@/models/messages/messages.model";
import { User } from "@/models/user/user.model";

export function getConversationOtherUser(
    conversation?: Conversation | null,
    currentUserId?: string
): User | undefined {
    return conversation?.participants?.find((user: User) => user.id !== currentUserId);
}

export function getConversationName(
    conversation?: Conversation | null,
    currentUserId?: string
): string {
    if (!conversation?.participants?.length) {
        return '';
    }

    if (conversation.participants.length === 2) {
        return getConversationOtherUser(conversation, currentUserId)?.fullName ?? '';
    }

    return conversation.participants
        .map((user: User) => user.fullName)
        .filter(Boolean)
        .join(', ');
}

export function getConversationAvatar(
    conversation?: Conversation | null,
    currentUserId?: string
): string | undefined {
    if (!conversation?.participants?.length) {
        return undefined;
    }

    if (conversation.participants.length === 2) {
        return getConversationOtherUser(conversation, currentUserId)?.profilePictureUrl;
    }

    return undefined;
}

export function getConversationUsername(
    conversation?: Conversation | null,
    currentUserId?: string
): string {
    return getConversationOtherUser(conversation, currentUserId)?.username ?? '';
}