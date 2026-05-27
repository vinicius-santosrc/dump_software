import { UserService } from './../user/user.service';
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_CONFIG } from "../../config/api.config";
import { CommentsService } from "../comments/comments.service";
import { Post } from '../../models/feed/post.model';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PostsService {
    private readonly API = '/api/v1/posts';
    private readonly feedCache = new Map<string, Observable<any>>();
    private readonly dumpsCache = new Map<string, Observable<any>>();
    private readonly postMediaCache = new Map<string, Observable<any>>();

    constructor(private readonly http: HttpClient, private readonly commentsService: CommentsService, private readonly userService: UserService) { }

    public getByCurrentUser(
        id: string,
        cursor?: string,
        limit: number = 10
    ) {
        const normalizedCursor = cursor ?? 'first_page';

        const cacheKey = `${id}_${normalizedCursor}_${limit}`;

        if (this.feedCache.has(cacheKey)) {
            return this.feedCache.get(cacheKey)!;
        }

        const request = this.http.post(`${API_CONFIG.baseUrl}${this.API}/feed`, {
            id,
            cursor,
            limit
        }).pipe(
            shareReplay(1)
        );

        this.feedCache.set(cacheKey, request);

        return request;
    }

    public getDumpsByCurrentUser(
        id: string,
        cursor?: string,
        limit: number = 6
    ) {
        const normalizedCursor = cursor ?? 'first_page';
        const cacheKey = `${id}_${normalizedCursor}_${limit}`;

        if (this.dumpsCache.has(cacheKey)) {
            return this.dumpsCache.get(cacheKey)!;
        }

        const params: Record<string, string> = {
            limit: String(limit)
        };

        if (cursor) {
            params['cursor'] = cursor;
        }

        const request = this.http.get(
            `${API_CONFIG.baseUrl}${this.API}/dumps/getByUser/${id}`,
            { params }
        ).pipe(
            shareReplay(1)
        );

        this.dumpsCache.set(cacheKey, request);

        return request;
    }

    public getById(id: string) {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}/getById`, { id: id });
    }

    public getPostMedia(postId: string) {
        if (this.postMediaCache.has(postId)) {
            return this.postMediaCache.get(postId)!;
        }

        const request = this.http.get(
            `${API_CONFIG.baseUrl}${this.API}/${postId}/media`
        ).pipe(
            shareReplay(1)
        );

        this.postMediaCache.set(postId, request);

        return request;
    }

    public getByUser(id: string) {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}/getByUserProfile`, { id: id });
    }

    public handleLike(postId: string, likerId: string) {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}/handleLike`, { postId: postId, likerId: likerId });
    }

    public getArchivedByUser(id: string) {
        return this.http.get(`${API_CONFIG.baseUrl}${this.API}/archived/getByUser/${id}`);
    }

    public createPost(post: Post) {
        this.clearFeedCache();
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}`, post);
    }

    public archivePost(postId: string) {
        this.clearFeedCache();
        return this.http.patch(`${API_CONFIG.baseUrl}${this.API}/${postId}/archive`, {});
    }

    public unarchivePost(postId: string) {
        this.clearFeedCache();
        return this.http.patch(`${API_CONFIG.baseUrl}${this.API}/${postId}/unarchive`, {});
    }

    public deletePost(postId: string) {
        this.clearFeedCache();
        return this.http.delete(`${API_CONFIG.baseUrl}${this.API}/${postId}`);
    }

    public restorePost(postId: string) {
        this.clearFeedCache();
        return this.http.patch(`${API_CONFIG.baseUrl}${this.API}/${postId}/restore`, {});
    }

    public clearFeedCache() {
        this.feedCache.clear();
        this.dumpsCache.clear();
        this.postMediaCache.clear();
    }
}
