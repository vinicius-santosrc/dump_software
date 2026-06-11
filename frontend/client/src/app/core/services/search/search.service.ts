import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';
import { SearchResponse } from '../../models/search/search.model';

@Injectable({ providedIn: 'root' })
export class SearchService {

    constructor(private readonly http: HttpClient) { }

    search(query: string): Observable<SearchResponse> {
        return this.searchOnce(query);
    }

    searchOnce(query: string): Observable<SearchResponse> {
        return this.http.post<any>(`${API_CONFIG.baseUrl}/graphql`, {
            query: `
                query ($query: String!) {
                    search(query: $query) {
                        users {
                            id
                            fullName
                            username
                            thumbnail
                        }
                        posts {
                            id
                            media {
                                width
                                height
                                type
                                thumbnail
                                url
                            }
                            caption
                        }
                    }
                }
            `,
            variables: { query }
        }).pipe(
            map(response => {
                const data = response?.data?.search ?? response?.search ?? {};

                return {
                    users: (data.users ?? []).map((user: any) => ({
                        id: user.id,
                        fullName: user.fullName,
                        username: user.username,
                        thumbnail: user.thumbnail,
                        avatarUrl: user.thumbnail
                    })),
                    posts: (data.posts ?? []).map((post: any) => {
                        const firstMedia = Array.isArray(post.media) ? post.media[0] : post.media;

                        return {
                            id: post.id,
                            imageUrl: firstMedia?.thumbnail ?? firstMedia?.url ?? post.imageUrl ?? '',
                            media: post.media ?? [],
                            caption: post.caption ?? ''
                        };
                    })
                } as SearchResponse;
            })
        );
    }
}