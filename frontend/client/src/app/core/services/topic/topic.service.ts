import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { Topic } from "../../models/feed/topic.model";
import { API_CONFIG } from "../../config/api.config";

@Injectable({
    providedIn: 'root'
})
export class TopicService {

    private readonly API = '/api/v1/topics';

    constructor(
        private readonly http: HttpClient
    ) { }

    getTrending(limit: number = 10): Observable<Topic[]> {

        return this.http
            .get<any[]>(`${API_CONFIG.baseUrl}${this.API}/trending?limit=${limit}`)
            .pipe(
                map((topics) => {

                    return (topics || []).map(topic => ({
                        id: topic.id,
                        slug: topic.slug,
                        title: topic.displayName,
                        postsRelated: topic.postsCount || 0,
                        trendingScore: topic.score || 0,
                        growthRate: topic.velocityScore || 0,
                        velocityScore: topic.velocityScore || 0,
                        mentionsCount: topic.mentionsCount || 0,
                        engagementCount: topic.engagementCount || 0,
                        savesCount: topic.savesCount || 0,
                        sharesCount: topic.sharesCount || 0,
                        language: topic.language || 'pt',
                        lastActivityAt: new Date(topic.lastActivityAt),
                        createdAt: new Date(topic.lastActivityAt),
                        engagement: {
                            likes: topic.engagementCount || 0,
                            comments: 0,
                            shares: topic.sharesCount || 0,
                            saves: topic.savesCount || 0
                        },
                        category: 'trending',
                        location: {
                            country: 'GLOBAL'
                        },
                        topPosts: topic.relatedPostIds || []
                    } as Topic));
                })
            );
    }
}