import { forwardRef } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import MessageBubble from './MessageBubble';

type ConversationUser = {
    id?: string;
    username?: string;
    fullName?: string;
    profilePictureUrl?: string;
};

type Conversation = {
    id?: string;
    participants?: ConversationUser[];
    lastMessage?: any;
};

type Message = {
    id?: string;
    _id?: string;
    tempId?: string;
    conversationId?: string;
    senderId?: string;
    userId?: string;
    sender?: ConversationUser;
    text?: string;
    type?: string;
    mediaType?: string;
    stickerUrl?: string;
    createdAt?: string;
    readBy?: string[];
    status?: 'sending' | 'sent' | 'error' | 'failed';
};

type ChatBodyProps = {
    messages: Message[];
    conversation?: Conversation | null;
    currentUser: any;
    isLoadingOlderMessages?: boolean;
    onLoadOlderMessages?: () => void;
};

const ChatBody = forwardRef<FlatList<Message>, ChatBodyProps>(({
    messages,
    conversation,
    currentUser,
    isLoadingOlderMessages,
    onLoadOlderMessages
}, ref) => {
    const currentUserId = normalizeId(currentUser?.id ?? currentUser?._id);

    return (
        <FlatList
            ref={ref}
            data={messages}
            style={{paddingTop: 90}}
            keyExtractor={(item, index) => item.id ?? item._id ?? `message-${index}`}
            renderItem={({ item, index }) => {
                const senderId = getSenderId(item);
                const isMine = senderId === currentUserId;
                const isGroup = (conversation?.participants?.length ?? 0) > 2;

                return (
                    <>
                        {shouldShowDateSeparator(messages, index) && (
                            <View style={styles.dateSeparator}>
                                <Text style={styles.dateSeparatorText}>
                                    {getDateSeparatorLabel(item.createdAt)}
                                </Text>
                            </View>
                        )}

                        <MessageBubble
                            message={item}
                            isMine={isMine}
                            isGroup={isGroup}
                            currentUser={currentUser}
                            conversation={conversation as any}
                            isLast={index === messages.length - 1}
                        />
                    </>
                );
            }}
            onEndReached={onLoadOlderMessages}
            onEndReachedThreshold={0.2}
            ListHeaderComponent={
                isLoadingOlderMessages ? (
                    <ActivityIndicator style={styles.topLoader} />
                ) : null
            }
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
        />
    );
});

function normalizeId(value: any): string {
    return String(value ?? '');
}

function getSenderId(message: any): string {
    return normalizeId(
        message?.senderId ??
        message?.sender?.id ??
        message?.userId ??
        ''
    );
}

function shouldShowDateSeparator(messages: Message[], index: number): boolean {
    const current = messages[index];

    if (!current?.createdAt) {
        return false;
    }

    if (index === 0) {
        return true;
    }

    const previous = messages[index - 1];

    if (!previous?.createdAt) {
        return true;
    }

    return !isSameDay(previous.createdAt, current.createdAt);
}

function isSameDay(firstValue: string, secondValue: string): boolean {
    const firstDate = new Date(firstValue);
    const secondDate = new Date(secondValue);

    return firstDate.getFullYear() === secondDate.getFullYear()
        && firstDate.getMonth() === secondDate.getMonth()
        && firstDate.getDate() === secondDate.getDate();
}

function getDateSeparatorLabel(value?: string): string {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (isSameDay(value, today.toISOString())) {
        return 'Hoje';
    }

    if (isSameDay(value, yesterday.toISOString())) {
        return 'Ontem';
    }

    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric'
    }).format(date);
}

const styles = StyleSheet.create({
    messagesContent: {
        paddingHorizontal: 12,
        paddingVertical: 14,
        gap: 7
    },
    topLoader: {
        paddingVertical: 12
    },
    dateSeparator: {
        alignItems: 'center',
        marginVertical: 10
    },
    dateSeparatorText: {
        fontSize: 12,
        color: '#777',
        backgroundColor: '#f1f1f1',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 999
    }
});

export default ChatBody;