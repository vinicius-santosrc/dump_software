export interface Topic {
    id: string;
    title: string;
    postsRelated: number;
    trendingScore: number;
    growthRate: number;
    lastActivityAt: Date;
    createdAt: Date;
    engagement: {
        likes: number;
        comments: number;
        shares: number;
    };
    category: 'sports' | 'music' | 'tech' | 'memes' | 'news' | 'business' | 'other';
    location?: {
        country?: string;
        city?: string;
    };
    topPosts?: string[];
}