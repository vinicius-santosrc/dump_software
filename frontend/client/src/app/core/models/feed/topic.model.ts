export interface Topic {
    id: string;

    slug?: string;

    title: string;

    postsRelated: number;

    trendingScore: number;

    growthRate: number;

    velocityScore?: number;

    mentionsCount?: number;

    engagementCount?: number;

    savesCount?: number;

    sharesCount?: number;

    language?: 'pt' | 'en' | 'es';

    lastActivityAt: Date;

    createdAt: Date;

    engagement: {
        likes: number;
        comments: number;
        shares: number;
        saves?: number;
    };

    category:
    | 'trending'
    | 'sports'
    | 'music'
    | 'tech'
    | 'memes'
    | 'news'
    | 'business'
    | 'gaming'
    | 'movies'
    | 'other';

    location?: {
        country?: string;
        city?: string;
        region?: string;
    };

    topPosts?: string[];
}