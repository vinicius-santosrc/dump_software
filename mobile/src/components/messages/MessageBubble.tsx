import { Conversation, Message } from '@/models/messages/messages.model';
import { User } from '@/models/user/user.model';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import MessageAudioPlayer from './MessagesTypes/MessageAudioPlayer';

type MessageBubbleProps = {
    message: Message;
    isMine: boolean;
    isGroup: boolean;
    currentUser: any;
    conversation: Conversation;
    isLast?: boolean;
};

export default function MessageBubble({
    message,
    isMine,
    isGroup,
    conversation,
    isLast
}: MessageBubbleProps) {
    const senderId = message?.senderId ?? message?.sender?.id;
    const sender = conversation.participants?.find((user: User) => user.id === senderId) ?? message?.sender;
    const messageTime = getMessageTime(message);
    const statusText = getStatusText(message, isMine);

    return (
        <View style={[styles.row, isMine && styles.rowMine]}>
            {!isMine && (
                <Image
                    source={
                        sender?.profilePictureUrl
                            ? { uri: sender.profilePictureUrl }
                            : { uri: "" }
                    }
                    style={styles.avatar}
                />
            )}

            <View style={styles.messageWrapper}>
                <View style={[styles.bubble, isMine && styles.bubbleMine, getBubbleStyle(message)]}>
                    {isGroup && !isMine && (
                        <Text style={styles.senderName}>
                            {sender?.fullName ?? sender?.username}
                        </Text>
                    )}

                    {renderMessageContent(message, isMine, messageTime)}
                </View>

                {!!statusText && isLast && (
                    <Text style={[styles.status, isMine && styles.statusMine, message?.status === 'failed' && styles.statusFailed]}>
                        {statusText}
                    </Text>
                )}
            </View>
        </View>
    );
}

function renderMessageContent(message: Message | any, isMine: boolean, messageTime: string) {
    const text = message?.text ?? '';
    const type = resolveMessageType(message);

    if (type === 'image') {
        const uri = getMediaUrl(message);

        return (
            <View style={styles.mediaContainer}>
                <Image
                    source={{ uri }}
                    style={styles.imageMessage}
                />
                <Text style={[styles.time, styles.timeFloating, isMine && styles.timeMine]}>
                    {messageTime}
                </Text>
            </View>
        );
    }

    if (type === 'audio') {
        return (
            <MessageAudioPlayer
                src={getMediaUrl(message)}
                isMine={isMine}
                senderAvatar={message?.sender?.profilePictureUrl}
                showAvatar
            />
        );
    }

    if (type === 'sticker') {
        return (
            <View style={styles.mediaContainer}>
                <Image
                    source={{ uri: getStickerUrl(message) }}
                    style={styles.sticker}
                />
                <Text style={[styles.time, styles.timeFloating, isMine && styles.timeMine]}>
                    {messageTime}
                </Text>
            </View>
        );
    }

    if (type === 'post') {
        return renderPostPreview(message, isMine, messageTime);
    }

    if (type === 'story') {
        return renderStoryPreview(message, isMine, messageTime);
    }

    if (!text) {
        return (
            <Text style={[styles.deletedText, isMine && styles.textMine]}>
                Mensagem indisponível
            </Text>
        );
    }

    return (
        <View style={styles.textContainer}>
            <Text style={[styles.text, isMine && styles.textMine]}>
                {text}
            </Text>
            <Text style={[styles.time, isMine && styles.timeMine]}>
                {messageTime}
            </Text>
        </View>
    );
}

function renderPostPreview(message: Message | any, isMine: boolean, messageTime: string) {
    const post = message?.post;
    const media = post?.media?.[0];
    const imageUrl = media?.thumbnail || media?.url || post?.imageUrl;

    return (
        <View style={styles.sharedContainer}>
            <Text style={[styles.sharedLabel, isMine && styles.sharedLabelMine]}>
                Publicação compartilhada
            </Text>

            <Pressable style={styles.sharedCard}>
                {!!imageUrl && (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.sharedImage}
                    />
                )}

                <View style={styles.sharedInfo}>
                    <Text style={styles.sharedTitle} numberOfLines={1}>
                        {post?.user?.fullName ?? post?.user?.username ?? 'Publicação'}
                    </Text>
                    <Text style={styles.sharedCaption} numberOfLines={2}>
                        {post?.caption ?? 'Ver publicação'}
                    </Text>
                </View>
            </Pressable>

            <Text style={[styles.time, isMine && styles.timeMine]}>
                {messageTime}
            </Text>
        </View>
    );
}

function renderStoryPreview(message: Message | any, isMine: boolean, messageTime: string) {
    const story = message?.story;
    const imageUrl = story?.thumbnail || story?.photoUrl;

    return (
        <View style={styles.sharedContainer}>
            <Text style={[styles.sharedLabel, isMine && styles.sharedLabelMine]}>
                Story compartilhado
            </Text>

            <Pressable style={styles.sharedCard}>
                {!!imageUrl && (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.sharedImage}
                    />
                )}

                <View style={styles.sharedInfo}>
                    <Text style={styles.sharedTitle} numberOfLines={1}>
                        {story?.user?.username ?? story?.username ?? 'Story'}
                    </Text>
                    <Text style={styles.sharedCaption} numberOfLines={2}>
                        Ver story
                    </Text>
                </View>
            </Pressable>

            <Text style={[styles.time, isMine && styles.timeMine]}>
                {messageTime}
            </Text>
        </View>
    );
}

function resolveMessageType(message: Message | any): 'text' | 'post' | 'story' | 'image' | 'audio' | 'sticker' {
    const explicitType = message?.type;
    const text = message?.text ?? '';

    if (explicitType === 'image' || isImageMessage(message)) return 'image';
    if (explicitType === 'audio' || isAudioMessage(message)) return 'audio';
    if (explicitType === 'sticker' || isStickerMessage(message)) return 'sticker';
    if (explicitType === 'post' || !!message?.post || /\/p\/([a-zA-Z0-9-]+)/.test(text)) return 'post';
    if (explicitType === 'story' || !!message?.story || /\/memories\/([^/]+)\/([a-zA-Z0-9-]+)/.test(text)) return 'story';

    return 'text';
}

function isImageMessage(message: Message | any): boolean {
    const mediaType = message?.mediaType ?? '';
    const source = getMediaUrl(message);

    return mediaType.startsWith('image/') || source.startsWith('data:image');
}

function isAudioMessage(message: Message | any): boolean {
    const mediaType = message?.mediaType ?? '';
    const source = getMediaUrl(message).toLowerCase();

    const isAudioFile = source.endsWith('.m4a')
        || source.endsWith('.mp3')
        || source.endsWith('.aac')
        || source.endsWith('.wav')
        || source.endsWith('.webm')
        || source.includes('/audio/');

    return mediaType.startsWith('audio/')
        || source.startsWith('data:audio')
        || source.startsWith('file://') && isAudioFile
        || source.startsWith('http://') && isAudioFile
        || source.startsWith('https://') && isAudioFile
        || source.includes('/expoaudio/recording-');
}

function isStickerMessage(message: Message | any): boolean {
    const source = getStickerUrl(message);

    return source.includes('/stickers/') || source.includes('assets/stickers/');
}

function getMediaUrl(message: Message | any): string {
    return message?.mediaUrl || message?.imageUrl || message?.audioUrl || message?.videoUrl || message?.text || '';
}

function getStickerUrl(message: Message | any): string {
    return message?.stickerUrl || message?.text || '';
}

function getMessageTime(message: Message | any): string {
    const dateValue = message?.createdAt ?? message?.updatedAt;

    if (!dateValue) return '';

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function getStatusText(message: Message | any, isMine: boolean): string {
    if (!isMine) return '';

    const id = String(message?.id ?? '');

    if (message?.status === 'failed') return 'Falha ao enviar';
    if (message?.status === 'sending' || id.startsWith('temp-')) return 'Enviando...';

    return '';
}

function getBubbleStyle(message: Message | any) {
    const type = resolveMessageType(message);

    if (type === 'image') return styles.bubbleMedia;
    if (type === 'audio') return styles.bubbleAudio;
    if (type === 'sticker') return styles.bubbleSticker;
    if (type === 'post' || type === 'story') return styles.bubbleShared;

    return null;
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        alignSelf: 'flex-start',
        maxWidth: '82%',
        marginVertical: 3
    },
    rowMine: {
        alignSelf: 'flex-end'
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#eee'
    },
    messageWrapper: {
        gap: 3
    },
    bubble: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: '#f1f1f1',
        overflow: 'hidden'
    },
    bubbleMine: {
        backgroundColor: '#1881E2'
    },
    bubbleMedia: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        backgroundColor: 'transparent'
    },
    bubbleAudio: {
        paddingHorizontal: 12,
        paddingVertical: 9
    },
    bubbleSticker: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        backgroundColor: 'transparent'
    },
    bubbleShared: {
        paddingHorizontal: 10,
        paddingVertical: 10
    },
    senderName: {
        fontSize: 11,
        fontWeight: '700',
        color: '#666',
        marginBottom: 4
    },
    textContainer: {
        gap: 4
    },
    text: {
        fontSize: 15,
        lineHeight: 20,
        color: '#111'
    },
    textMine: {
        color: '#fff'
    },
    deletedText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#777'
    },
    time: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.45)',
        alignSelf: 'flex-end'
    },
    timeMine: {
        color: 'rgba(255,255,255,0.78)'
    },
    timeFloating: {
        position: 'absolute',
        right: 8,
        bottom: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.35)',
        color: '#fff'
    },
    status: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.45)',
        alignSelf: 'flex-start',
        marginHorizontal: 8
    },
    statusMine: {
        alignSelf: 'flex-end'
    },
    statusFailed: {
        color: '#d93025'
    },
    mediaContainer: {
        position: 'relative'
    },
    imageMessage: {
        width: 210,
        height: 260,
        borderRadius: 14,
        backgroundColor: '#ddd'
    },
    sticker: {
        width: 120,
        height: 120,
        resizeMode: 'contain'
    },
    sharedContainer: {
        width: 230,
        gap: 8
    },
    sharedLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#555'
    },
    sharedLabelMine: {
        color: 'rgba(255,255,255,0.9)'
    },
    sharedCard: {
        borderRadius: 14,
        backgroundColor: '#fff',
        overflow: 'hidden'
    },
    sharedImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#ddd'
    },
    sharedInfo: {
        padding: 10,
        gap: 3
    },
    sharedTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111'
    },
    sharedCaption: {
        fontSize: 12,
        color: '#555'
    }
});