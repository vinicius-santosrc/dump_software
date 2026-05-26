import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { ChatSticker, ChatStickerPack } from '../../../models/messages/chat-sticker.model';
import { API_CONFIG } from '../../../config/api.config';

@Injectable({
    providedIn: 'root'
})
export class ChatStickerService {

    private readonly http = inject(HttpClient);
    private readonly apiUrl = '/api/v1/stickers';

    private readonly defaultPacks: ChatStickerPack[] = [
        {
            id: 'dump-default',
            name: 'Dump',
            stickers: [
                {
                    id: 'dump-1',
                    name: 'Sticker 1',
                    url: 'assets/stickers/sticker-1.webp',
                    packId: 'dump-default',
                    packName: 'Dump'
                },
                {
                    id: 'dump-2',
                    name: 'Sticker 2',
                    url: 'assets/stickers/sticker-2.webp',
                    packId: 'dump-default',
                    packName: 'Dump'
                },
                {
                    id: 'dump-3',
                    name: 'Sticker 3',
                    url: 'assets/stickers/sticker-3.webp',
                    packId: 'dump-default',
                    packName: 'Dump'
                },
                {
                    id: 'dump-4',
                    name: 'Sticker 4',
                    url: 'assets/stickers/sticker-4.webp',
                    packId: 'dump-default',
                    packName: 'Dump'
                }
            ]
        }
    ];

    private readonly customStickersSubject = new BehaviorSubject<ChatSticker[]>([]);
    private readonly recentStickersSubject = new BehaviorSubject<ChatSticker[]>([]);
    private readonly favoriteStickerIdsSubject = new BehaviorSubject<string[]>([]);

    readonly customStickers$ = this.customStickersSubject.asObservable();
    readonly recentStickers$ = this.recentStickersSubject.asObservable();
    readonly favoriteStickerIds$ = this.favoriteStickerIdsSubject.asObservable();

    loadStickers(): void {
        this.loadCustomStickers();
        this.loadRecentStickers();
        this.loadFavoriteStickerIds();
    }

    loadCustomStickers(): void {
        this.http.get<ChatSticker[]>(`${API_CONFIG.baseUrl}${this.apiUrl}/custom`)
            .pipe(catchError(() => of([])))
            .subscribe(stickers => this.customStickersSubject.next(stickers ?? []));
    }

    loadRecentStickers(): void {
        this.http.get<ChatSticker[]>(`${API_CONFIG.baseUrl}${this.apiUrl}/recent`)
            .pipe(catchError(() => of([])))
            .subscribe(stickers => this.recentStickersSubject.next(stickers ?? []));
    }

    loadFavoriteStickerIds(): void {
        this.http.get<string[]>(`${API_CONFIG.baseUrl}${this.apiUrl}/favorites`)
            .pipe(catchError(() => of([])))
            .subscribe(stickerIds => this.favoriteStickerIdsSubject.next(stickerIds ?? []));
    }

    getStickerPacks(): ChatStickerPack[] {
        return [
            ...this.defaultPacks,
            {
                id: 'custom',
                name: 'Meus stickers',
                stickers: this.customStickersSubject.value
            }
        ];
    }

    getAllStickers(): ChatSticker[] {
        return this.getStickerPacks().flatMap(pack => pack.stickers);
    }

    getRecentStickers(): ChatSticker[] {
        return this.recentStickersSubject.value;
    }

    getFavoriteStickers(): ChatSticker[] {
        const favoriteIds = this.favoriteStickerIdsSubject.value;

        return this.getAllStickers()
            .filter(sticker => favoriteIds.includes(sticker.id))
            .map(sticker => ({
                ...sticker,
                isFavorite: true
            }));
    }

    addRecentSticker(sticker: ChatSticker): void {
        const current = this.recentStickersSubject.value;

        const next = [
            sticker,
            ...current.filter(currentSticker => currentSticker.id !== sticker.id)
        ].slice(0, 24);

        this.recentStickersSubject.next(next);

        this.http.post<ChatSticker[]>(`${API_CONFIG.baseUrl}${this.apiUrl}/recent`, { stickerId: sticker.id, sticker })
            .pipe(catchError(() => of(next)))
            .subscribe(stickers => this.recentStickersSubject.next(stickers ?? next));
    }

    toggleFavorite(sticker: ChatSticker): void {
        const current = this.favoriteStickerIdsSubject.value;
        const exists = current.includes(sticker.id);

        const next = exists
            ? current.filter(id => id !== sticker.id)
            : [...current, sticker.id];

        this.favoriteStickerIdsSubject.next(next);

        this.http.post<string[]>(`${API_CONFIG.baseUrl}${this.apiUrl}/favorites/toggle`, { stickerId: sticker.id })
            .pipe(catchError(() => of(next)))
            .subscribe(stickerIds => this.favoriteStickerIdsSubject.next(stickerIds ?? next));
    }

    async createCustomSticker(file: File): Promise<ChatSticker> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name.replace(/\.[^/.]+$/, ''));

        return new Promise((resolve, reject) => {
            this.http.post<ChatSticker>(`${API_CONFIG.baseUrl}${this.apiUrl}/custom`, formData)
                .pipe(
                    tap(sticker => {
                        const next = [
                            sticker,
                            ...this.customStickersSubject.value.filter(currentSticker => currentSticker.id !== sticker.id)
                        ];

                        this.customStickersSubject.next(next);
                    })
                )
                .subscribe({
                    next: resolve,
                    error: reject
                });
        });
    }

    removeCustomSticker(stickerId: string): void {
        const previous = this.customStickersSubject.value;
        const next = previous.filter(sticker => sticker.id !== stickerId);

        this.customStickersSubject.next(next);

        this.http.delete<void>(`${API_CONFIG.baseUrl}${this.apiUrl}/custom/${stickerId}`)
            .pipe(
                catchError(() => {
                    this.customStickersSubject.next(previous);
                    return of(undefined);
                })
            )
            .subscribe();
    }
}