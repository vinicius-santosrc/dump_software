/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-17
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { useInboxStore } from '@/store/inbox.store';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    DimensionValue,
    Image,
    ImageStyle,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle
} from 'react-native';

interface AvatarUser {
    id?: string;
    _id?: string;
    username?: string;
    fullName?: string;
    thumbnail?: string;
    profilePictureUrl?: string;
    verified?: boolean;
    isOnline?: boolean;
}

interface AvatarProps {
    user?: AvatarUser;
    multipleUsers?: AvatarUser[];
    src?: string;
    width?: number;
    height?: number;
    redirectURL?: string;
    redirectOnClick?: boolean;
    seenMemorie?: boolean;
    showOnlineIndicator?: boolean;
    style?: StyleProp<ViewStyle>;
    imageStyle?: StyleProp<ImageStyle>;
}

function getInitials(user?: AvatarUser) {
    const name = user?.fullName || user?.username || '?';
    const parts = name.trim().split(' ').filter(Boolean);

    if (parts.length === 0) {
        return '?';
    }

    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }

    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function getImageUrl(user?: AvatarUser, src?: string) {
    if (src && src.trim() !== '') {
        return src;
    }

    return user?.thumbnail || user?.profilePictureUrl || '';
}


export default function Avatar({
    user,
    multipleUsers,
    src = '',
    width = 32,
    height = 32,
    redirectURL = '',
    redirectOnClick = true,
    seenMemorie = false,
    showOnlineIndicator,
    style,
    imageStyle
}: AvatarProps) {
    const hasMultipleUsers = Boolean(multipleUsers && multipleUsers.length > 1);
    const onlineUsers = useInboxStore(state => state.onlineUsers);

    function getOnlineStatus(avatarUser?: AvatarUser, forcedOnline?: boolean) {
        if (typeof forcedOnline === 'boolean') {
            return forcedOnline;
        }

        const userId = avatarUser?.id ?? avatarUser?._id;

        if (!userId) {
            return Boolean(avatarUser?.isOnline);
        }

        return onlineUsers.has(userId) || Boolean(avatarUser?.isOnline);
    }

    function handlePress() {
        if (!redirectOnClick) {
            return;
        }

        if (redirectURL) {
            router.push(redirectURL as any);
            return;
        }

        if (seenMemorie && user?.username) {
            router.replace(`/memories/${user.username}` as any);
        }
    }


    if (hasMultipleUsers) {
        return (
            <Pressable
                onPress={handlePress}
                style={[
                    styles.multipleWrapper,
                    {
                        width: Math.max(width + 20, 52),
                        height: Math.max(height + 20, 52)
                    },
                    style
                ]}
            >
                <AvatarImage
                    user={multipleUsers?.[0]}
                    src={src}
                    width={Math.max(width - 2, 30)}
                    height={Math.max(height - 2, 30)}
                    seenMemorie={seenMemorie}
                    isOnline={getOnlineStatus(multipleUsers?.[0], showOnlineIndicator)}
                    wrapperStyle={styles.multipleFirstAvatar}
                    imageStyle={imageStyle}
                />

                <AvatarImage
                    user={multipleUsers?.[1]}
                    src={src}
                    width={Math.max(width - 2, 30)}
                    height={Math.max(height - 2, 30)}
                    seenMemorie={seenMemorie}
                    isOnline={getOnlineStatus(multipleUsers?.[1], showOnlineIndicator)}
                    wrapperStyle={styles.multipleSecondAvatar}
                    imageStyle={imageStyle}
                />
            </Pressable>
        );
    }

    if (!user?.id && !user?._id && !src) {
        return null;
    }

    return (
        <Pressable onPress={handlePress} style={style}>
            <AvatarImage
                user={user}
                src={src}
                width={width}
                height={height}
                seenMemorie={seenMemorie}
                isOnline={getOnlineStatus(user, showOnlineIndicator)}
                imageStyle={imageStyle}
            />
        </Pressable>
    );
}

interface AvatarImageProps {
    user?: AvatarUser;
    src?: string;
    width: number;
    height: number;
    seenMemorie?: boolean;
    isOnline?: boolean;
    wrapperStyle?: StyleProp<ViewStyle>;
    imageStyle?: StyleProp<ImageStyle>;
}

function AvatarImage({
    user,
    src,
    width,
    height,
    seenMemorie = false,
    isOnline = false,
    wrapperStyle,
    imageStyle
}: AvatarImageProps) {
    const [imageError, setImageError] = useState(false);

    const imageUrl = useMemo(() => getImageUrl(user, src), [src, user]);
    const shouldShowImage = imageUrl && !imageError;
    const sizeStyle = { width: width as DimensionValue, height: height as DimensionValue };
    const borderRadius = Math.min(width, height) / 2;

    return (
        <View
            style={[
                styles.avatarOuter,
                sizeStyle,
                {
                    borderRadius,
                    padding: seenMemorie ? 3 : 0,
                    backgroundColor: seenMemorie ? '#d62976' : 'transparent'
                },
                wrapperStyle
            ]}
        >
            <View
                style={[
                    styles.avatarInner,
                    {
                        borderRadius,
                        backgroundColor: shouldShowImage ? 'transparent' : '#e5e5e5'
                    }
                ]}
            >
                {shouldShowImage ? (
                    <Image
                        source={{ uri: imageUrl }}
                        resizeMode="cover"
                        onError={() => setImageError(true)}
                        style={[
                            styles.avatarImage,
                            {
                                borderRadius,
                                width: '100%',
                                height: '100%'
                            },
                            imageStyle
                        ]}
                    />
                ) : (
                    <Text style={styles.initials}>{getInitials(user)}</Text>
                )}
            </View>

            {/* {user?.verified ? <View style={styles.verifiedBadge} /> : null} */}

            {isOnline ? <View style={styles.onlineStatus} /> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    avatarOuter: {
        position: 'relative',
        overflow: 'visible',
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarInner: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarImage: {
        overflow: 'hidden'
    },
    initials: {
        color: '#555555',
        fontSize: 12,
        fontWeight: '700'
    },
    onlineStatus: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#05a35a',
        borderWidth: 2,
        borderColor: '#ffffff'
    },
    verifiedBadge: {
        position: 'absolute',
        right: -1,
        top: -1,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#1881E2',
        borderWidth: 1,
        borderColor: '#ffffff'
    },
    multipleWrapper: {
        position: 'relative',
        overflow: 'visible'
    },
    multipleFirstAvatar: {
        position: 'absolute',
        top: 0,
        left: 0
    },
    multipleSecondAvatar: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        zIndex: 2
    }
});