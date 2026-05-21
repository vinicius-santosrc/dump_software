import { User } from "../user/user.model";

export interface Notification {
    id: string;
    fromUser: User;
    type: 'like' | 'comment';
    postId: string;
    commentId?: string;
    isRead: boolean;
    createdAt: string;
}
