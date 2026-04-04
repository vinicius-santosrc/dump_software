import { User } from "../user/user.model";

export interface Media {
    url: string;
    width: string;
    height: string;
    type: "image" | "video"
}

export interface PostML {
    engagementScore: number;
    relevanceScore: number;
    qualityScore: number;

    userInteractionScore: {
        likes: number;
        comments: number;
        shares: number;
        saves: number;
        watchTime: number;
    }
    contentFeatures: {
        hasFace: boolean;
        hasText: boolean;
        brightness: number;
        colorfulness: number;
    }
    topics: string[],
    language: 'pt' | 'en' | 'es'
}

export interface Comments {
    id: string;
    user: User;
    content: string;
    likes: string[];
    parentId: string | null;
    responses: Comments[];
    mentions: string[];
    isPinned: boolean;
    reports: string[];
    ml: {
        toxicityScore: number;
        spamScore: number;
        sentiment: 'positive' | 'neutral' | 'negative';
    };
    createdAt: any;
    updatedAt: any;
    postReference: string;
}

export interface Location {
    name: string;
    lat: number;
    long: number;
}

export interface Post {
    id: string;
    user: User;

    caption: string;
    media: Media[];
    location: Location;

    hashtags: string[];
    mentions: User[];

    likes: string[];
    saves: string[];
    comments: Comments[] | string[];

    reports: string[];

    visibility: 'public' | 'private'

    ml: PostML

    createdAt: any;
    updatedAt: any;
}
