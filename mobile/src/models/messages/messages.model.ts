import { Memorie } from "../feed/memorie.model";
import { Post } from "../feed/post.model";
import { User } from "../user/user.model";

export interface Conversation {
    id: string;
    participants: string[] | User[] | any,
    lastMessage: {
        text: string;
        senderId: string;
        createdAt: string;
    };
    updatedAt: string;
}

export interface ConversationMessages {
    id: string;
    participants: User[],
    lastMessage: {
        text: string;
        senderId: string;
        createdAt: string;
    };
    updatedAt: string;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    text: string;
    createdAt: string;
    readyBy: string[];
    post?: Post;
    story?: Memorie;
    type?: any;
}