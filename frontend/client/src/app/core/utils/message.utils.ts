export const MESSAGE_PREVIEW_LABELS = {
    LAST_MESSAGE_SENT_POST: 'enviou um anexo',
    LAST_MESSAGE_SENT_IMAGE: 'enviou uma foto',
    LAST_MESSAGE_SENT_VIDEO: 'enviou um vídeo',
    LAST_MESSAGE_SENT_AUDIO: 'enviou um áudio',
    LAST_MESSAGE_SENT_STICKER: 'enviou um sticker'
} as const;

export function normalizeLastText(text: string = '', type?: string, mediaType?: string): string {
    const value = text?.trim() ?? '';
    const normalizedType = type?.toLowerCase() ?? '';
    const normalizedMediaType = mediaType?.toLowerCase() ?? '';

    if (!value && !normalizedType && !normalizedMediaType) {
        return '';
    }

    if (isSticker(value, normalizedType)) {
        return MESSAGE_PREVIEW_LABELS.LAST_MESSAGE_SENT_STICKER;
    }

    if (isAudio(value, normalizedType, normalizedMediaType)) {
        return MESSAGE_PREVIEW_LABELS.LAST_MESSAGE_SENT_AUDIO;
    }

    if (isVideo(value, normalizedType, normalizedMediaType)) {
        return MESSAGE_PREVIEW_LABELS.LAST_MESSAGE_SENT_VIDEO;
    }

    if (isImage(value, normalizedType, normalizedMediaType)) {
        return MESSAGE_PREVIEW_LABELS.LAST_MESSAGE_SENT_IMAGE;
    }

    if (isAttachment(value, normalizedType)) {
        return MESSAGE_PREVIEW_LABELS.LAST_MESSAGE_SENT_POST;
    }

    return value;
}

function isImage(value: string, type: string, mediaType: string): boolean {
    return type === 'image'
        || mediaType.startsWith('image/')
        || value.startsWith('data:image');
}

function isVideo(value: string, type: string, mediaType: string): boolean {
    return type === 'video'
        || mediaType.startsWith('video/')
        || value.startsWith('data:video');
}

function isAudio(value: string, type: string, mediaType: string): boolean {
    return type === 'audio'
        || mediaType.startsWith('audio/')
        || value.startsWith('data:audio');
}

function isSticker(value: string, type: string): boolean {
    return type === 'sticker'
        || value.includes('/stickers/')
        || value.includes('assets/stickers/')
        || value.startsWith('data:image/webp');
}

function isAttachment(value: string, type: string): boolean {
    return type === 'post'
        || type === 'story'
        || type === 'attachment'
        || value.startsWith('data:application/')
        || value.startsWith('data:');
}