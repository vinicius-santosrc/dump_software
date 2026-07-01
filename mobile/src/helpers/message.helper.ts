import { Message } from "@/models/messages/messages.model";

export function normalizeMessages(messages: Message[]): Message[] {
    const uniqueMessages = new Map<string, Message>();

    messages.forEach(message => {
        uniqueMessages.set(getMessageUniqueKey(message), message);
    });

    return Array.from(uniqueMessages.values()).sort((a, b) => {
        const firstDate = new Date(a?.createdAt ?? 0).getTime();
        const secondDate = new Date(b?.createdAt ?? 0).getTime();

        return firstDate - secondDate;
    });
}

export function getMessageUniqueKey(message: Message): string {
    const id = message?.id ?? message?.id;

    if (id) {
        return `id:${id}`;
    }

    const conversationId = message?.conversationId ?? '';
    const senderId = message?.senderId ?? message?.senderId ?? '';
    const type = message?.type ?? 'text';
    const text = message?.text ?? '';
    const createdAt = new Date(message?.createdAt ?? 0).getTime();

    return `message:${conversationId}:${senderId}:${type}:${text}:${createdAt}`;
}

export function getLastMessagePreview(lastMessage: any): string {
    if (!lastMessage) {
        return '';
    }

    const type = lastMessage?.type ?? 'text';
    const text = lastMessage?.text ?? '';
    const mediaType = lastMessage?.mediaType ?? '';

    if (type === 'image' || mediaType.startsWith('image/') || text.startsWith('data:image')) {
        return '📷 Imagem';
    }

    if (type === 'audio' || mediaType.startsWith('audio/') || text.startsWith('data:audio')) {
        return '🎙️ Áudio';
    }

    if (
        type === 'sticker' ||
        lastMessage?.stickerUrl ||
        text.includes('/stickers/') ||
        text.includes('assets/stickers/')
    ) {
        return 'Sticker';
    }

    return text;
}

export function shouldShowDateSeparator(messages: Message[], index: number): boolean {
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

    return !isSameMessageDay(previous.createdAt, current.createdAt);
}

export function isSameMessageDay(firstValue: string | Date, secondValue: string | Date): boolean {
    const firstDate = new Date(firstValue);
    const secondDate = new Date(secondValue);

    return firstDate.getFullYear() === secondDate.getFullYear()
        && firstDate.getMonth() === secondDate.getMonth()
        && firstDate.getDate() === secondDate.getDate();
}