import { User } from "../user/user.model";

export interface Media {
    url: string;
    width?: string;
    height?: string;
    type: "image" | "video";
    thumbnail?: string;
    duration?: number;
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
    isDeleted: boolean;
}

export interface Location {
    name: string;
    lat: number;
    long: number;
}

export class Post {
    id?: string = '';
    user!: any;

    caption: string = '';
    media: Media[] = [];
    location!: Location;

    hashtags: string[] = [];
    mentions: User[] = [];

    likes: string[] = [];
    saves: string[] = [];
    comments: Comments[] | string[] = [];

    reports: string[] = [];

    visibility: 'public' | 'private' = 'public';

    ml!: PostML;

    createdAt: any = null;
    updatedAt: any = null;

    isDeleted: boolean = false;
    archived: boolean = false;

    constructor(init?: Partial<Post>) {
        Object.assign(this, init);
    }
}
