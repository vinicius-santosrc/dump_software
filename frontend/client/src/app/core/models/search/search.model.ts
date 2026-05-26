export interface SearchUser {
    id: string;
    username: string;
    avatarUrl: string;
}

export interface SearchPost {
    id: string;
    imageUrl: string;
    media: any;
    caption?: string;
}

export interface SearchResponse {
    users: SearchUser[];
    posts: SearchPost[];
}