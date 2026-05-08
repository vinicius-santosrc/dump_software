import { User } from "../user/user.model";

export class Memorie {
    id: string = "";

    user: User = {} as User;
    userId?: string;

    photoUrl: string = "";
    thumbnail: string = "";
    likes: [] = [];
    comments: [] = [];
    
    likesEnabled: boolean = true;
    commentsEnabled: boolean = true;

    circleFriends: boolean = false;

    availableUntil: any; 
    createdAt: any;
    updatedAt: any;
}

export interface IMemorie {
    id: string;

    user: User;

    photoUrl: string;
    thumbnail: string;
    likes: [];
    comments: [];

    likesEnabled: boolean;
    commentsEnabled: boolean;

    circleFriends: boolean;

    availableUntil: any;
    createdAt: any;
    updatedAt: any;
}