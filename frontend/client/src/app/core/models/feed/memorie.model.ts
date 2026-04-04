import { User } from "../user/user.model";

export interface Memorie {
    id: string;

    user: User;

    photoUrl: string;
    likes: [];
    comments: [];
    
    likesEnabled: true;
    commentsEnabled: true;

    circleFriends: boolean;

    availableUntil: any; 
    createdAt: any;
    updatedAt: any;
}