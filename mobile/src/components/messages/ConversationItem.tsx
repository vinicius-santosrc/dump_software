import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
    getConversationAvatar,
    getConversationName,
    getConversationUsername
} from '@/helpers/chat-view.helper';
import { getLastMessagePreview } from '@/helpers/message.helper';
import { Conversation } from '@/models/messages/messages.model';

export default function ConversationItem({
    conversation,
    currentUserId,
    typingMap,
    selected,
    onPress
}: {
    conversation: Conversation;
    currentUserId?: string;
    typingMap: Record<string, string[]>;
    selected?: boolean;
    onPress: () => void;
}) {
    const avatar = getConversationAvatar(conversation, currentUserId);
    const name = getConversationName(conversation, currentUserId);
    const username = getConversationUsername(conversation, currentUserId);
    const unreadCount = getUnreadCount(conversation, currentUserId);
    const isMine = conversation?.lastMessage?.senderId === currentUserId;
    const lastMessagePreview = getLastMessagePreview(conversation?.lastMessage);
    const conversationId = getConversationId(conversation);
    const typingUsers = getTypingUsers(typingMap, conversationId);
    const isTyping = typingUsers.some(userId => String(userId) !== String(currentUserId));

    return (
        <Pressable
            style={[styles.conversationItem, selected && styles.conversationItemSelected]}
            onPress={onPress}
        >
            <Image
                source={avatar ? { uri: avatar } : { uri: "" }}
                style={styles.conversationAvatar}
            />

            <View style={styles.conversationContent}>
                <View style={styles.conversationTopRow}>
                    <Text style={styles.conversationName} numberOfLines={1}>
                        {name || username || "Conversa"}
                    </Text>

                    {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.conversationPreview} numberOfLines={1}>
                    {isTyping ? "Digitando..." : `${isMine ? "Você: " : ""}${lastMessagePreview || username || "Toque para abrir a conversa"}`}
                </Text>
            </View>
        </Pressable>
    );
}

function getConversationId(conversation?: Conversation | null): string {
    return String((conversation as any)?.id ?? (conversation as any)?._id ?? "");
}

function getTypingUsers(typingMap: Record<string, string[]>, conversationId: string): string[] {
    if (!conversationId) {
        return [];
    }

    const directTypingUsers = typingMap?.[conversationId];

    if (Array.isArray(directTypingUsers)) {
        return directTypingUsers.map(String);
    }

    const matchedEntry = Object.entries(typingMap ?? {}).find(([key]) => String(key) === conversationId);

    if (!matchedEntry || !Array.isArray(matchedEntry[1])) {
        return [];
    }

    return matchedEntry[1].map(String);
}

function getUnreadCount(conversation: Conversation, userId?: string): number {
    if (!userId) {
        return 0;
    }

    const unreadCount = conversation.unreadCount ?? conversation.unreadCounts ?? {};

    if (typeof unreadCount === 'number') {
        return unreadCount;
    }

    return Number(unreadCount[userId] ?? 0);
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 14,
        paddingVertical: 12,
        alignItems: 'center',
        gap: 12
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#eee'
    },
    content: {
        flex: 1
    },
    top: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    name: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: '#111'
    },
    preview: {
        marginTop: 4,
        fontSize: 13,
        color: '#666'
    },
    badge: {
        minWidth: 20,
        height: 20,
        paddingHorizontal: 6,
        borderRadius: 10,
        backgroundColor: '#1881E2',
        alignItems: 'center',
        justifyContent: 'center'
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700'
    },
    conversationsListContent: {
        paddingHorizontal: 12,
        paddingBottom: 24
    },
    conversationItem: {
        minHeight: 74,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 18
    },
    conversationItemSelected: {
        backgroundColor: "rgba(24, 129, 226, 0.1)"
    },
    conversationAvatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: "#e9e9e9"
    },
    conversationContent: {
        flex: 1,
        minWidth: 0
    },
    conversationTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8
    },
    conversationName: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
        color: "#111"
    },
    conversationPreview: {
        marginTop: 4,
        fontSize: 13,
        color: "#6f6f6f"
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        paddingHorizontal: 6,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1881e2"
    },
    unreadBadgeText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "700"
    },
    emptyState: {
        paddingHorizontal: 18,
        paddingVertical: 32,
        alignItems: "center"
    },
    emptyStateTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#111"
    },
    emptyStateText: {
        marginTop: 4,
        fontSize: 13,
        color: "#777"
    }
});