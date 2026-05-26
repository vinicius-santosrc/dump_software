export interface ChatSticker {
    id: string;
    name: string;
    url: string;
    packId?: string;
    packName?: string;
    isCustom?: boolean;
    isFavorite?: boolean;
    createdAt?: string;
}

export interface ChatStickerPack {
    id: string;
    name: string;
    stickers: ChatSticker[];
}