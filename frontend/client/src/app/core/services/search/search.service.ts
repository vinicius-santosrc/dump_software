import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';

@Injectable({ providedIn: 'root' })
export class SearchService {

    private readonly search$ = new Subject<string>();

    constructor(private readonly http: HttpClient) { }

    search(query: string) {
        this.search$.next(query);

        return this.search$.pipe(
            debounceTime(300),
            switchMap(q =>
                this.http.post(`${API_CONFIG.baseUrl}/graphql`, {
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
                    variables: { query: q }
                })
            )
        );
    }
}