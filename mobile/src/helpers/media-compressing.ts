export async function audioBlobToBase64(blob: Blob) {
    return new Promise<{ base64: string; mediaType: string; size: number }>((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            resolve({
                base64: String(reader.result),
                mediaType: normalizeAudioMimeType(blob.type),
                size: blob.size
            });
        };

        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export function normalizeAudioMimeType(value?: string): string {
    const mimeType = String(value ?? '').trim().toLowerCase();

    if (!mimeType) {
        return 'audio/m4a';
    }

    if (mimeType === 'audio/x-m4a') {
        return 'audio/m4a';
    }

    if (mimeType.includes('mpeg') || mimeType.includes('mp4')) {
        return 'audio/m4a';
    }

    return mimeType;
}