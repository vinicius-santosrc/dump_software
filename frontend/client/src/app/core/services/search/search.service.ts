import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';
import { SearchResponse } from '../../models/search/search.model';

@Injectable({ providedIn: 'root' })
export class SearchService {

    private readonly search$ = new Subject<string>();

    constructor(private readonly http: HttpClient) { }

    search(query: string): Observable<SearchResponse> {
        this.search$.next(query);

        return this.search$.pipe(
            debounceTime(300),
            switchMap(q => this.searchOnce(q))
        );
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
                        username: user.username,
                        avatarUrl: user.avatarUrl ?? user.thumbnail ?? user.profilePictureUrl ?? ''
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