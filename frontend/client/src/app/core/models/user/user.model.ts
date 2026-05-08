export interface User {
    id: string;
    username: string;
    fullName: string;
    email: string;
    email_verified: boolean;
    phoneNumber: string;
    password: string;
    verified: boolean;
    bio: string;
    profilePictureUrl: string;
    birthDate: Date;
    website: string;
    followers: string[];
    following: string[];
    posts: string[];
    moments: string[];
    isPrivate: boolean;
    createdAt: Date;
    updatedAt: Date;
    coverPhotoUrl: string;
    thumbnail: string;
    gender: "male" | "female" | "other" | "prefer_not_to_say";
}