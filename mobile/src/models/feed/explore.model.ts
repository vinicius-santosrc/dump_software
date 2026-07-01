export interface ExploreTopic {
    id: string;
    label: string;
    slug?: string;
    icon?: string;
    hot?: boolean;
    postsRelated?: number;
    growthRate?: number;
    trendingScore?: number;
}

export interface ExploreLiveCard {
    id: string;
    username: string;
    title: string;
    watching: string;
    avatarUrl: string;
    accent: string;
}

export interface ExplorePostCard {
    id: string;
    title: string;
    author: string;
    meta: string;
    height: 'sm' | 'md' | 'lg' | 'xl';
    type: 'post' | 'video' | 'thread' | 'audio' | 'live';
    score: string;
    imageUrl?: string;
    media?: any;
    likes: number;
    comments: number;
    saves: number;
    shares: number;
    isLiked: boolean;
    isSaved: boolean;
}

export interface ExploreSection {
    id: string;
    title: string;
    icon: string;
    description: string;
    posts: ExplorePostCard[];
    expanded: boolean;
    loading?: boolean;
    empty?: boolean;
}

export interface ExploreInsight {
    id: string;
    title: string;
    value: string;
    description: string;
    icon: string;
}

export interface ExploreSticker {
    id: string;
    emoji: string;
    label: string;
    usage: string;
}

export interface ExploreCommunitySignal {
    id: string;
    user: string;
    action: string;
    postTitle: string;
    avatarUrl: string;
}

export interface ExploreState {
    topics: ExploreTopic[];
    liveCards: ExploreLiveCard[];
    insights: ExploreInsight[];
    sections: ExploreSection[];
    trendingStickers: ExploreSticker[];
    communitySignals: ExploreCommunitySignal[];
}