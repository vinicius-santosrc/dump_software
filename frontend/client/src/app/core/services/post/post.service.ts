import { UserService } from './../user/user.service';
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_CONFIG } from "../../config/api.config";
import { CommentsService } from "../comments/comments.service";
import { Post } from '../../models/feed/post.model';

@Injectable({
    providedIn: 'root'
})
export class PostsService {
    private readonly API = '/api/v1/posts';

    constructor(private readonly http: HttpClient, private readonly commentsService: CommentsService, private userService: UserService) { }

    public getByCurrentUser(id: string) {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}/getByUser`, { id: id });
    }

    public getDumpsByCurrentUser(id: string) {
        return this.http.get(`${API_CONFIG.baseUrl}${this.API}/dumps/getByUser/${id}`);
    }

    public getById(id: string) {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}/getById`, { id: id });
    }

    public getByUser(id: string) {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}/getByUserProfile`, { id: id });
    }

    public handleLike(postId: string, likerId: string) {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}/handleLike`, { postId: postId, likerId: likerId });
    }

    public createPost(post: Post) {
        return this.http.post(`${API_CONFIG.baseUrl}${this.API}`, post);
    }

    public archivePost(postId: string) {
        return this.http.patch(`${API_CONFIG.baseUrl}${this.API}/${postId}/archive`, {});
    }

    public unarchivePost(postId: string) {
        return this.http.patch(`${API_CONFIG.baseUrl}${this.API}/${postId}/unarchive`, {});
    }

    public deletePost(postId: string) {
        return this.http.delete(`${API_CONFIG.baseUrl}${this.API}/${postId}`);
    }

    public restorePost(postId: string) {
        return this.http.patch(`${API_CONFIG.baseUrl}${this.API}/${postId}/restore`, {});
    }
}
