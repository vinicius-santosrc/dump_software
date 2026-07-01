import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { router } from 'expo-router';
import { useGlobal } from '@/context/GlobalProvider';
import { UserService } from '@/services/user.service';

type GenericActionsUser = {
    id?: string;
    _id?: string;
    followers?: string[];
    username?: string;
    [key: string]: any;
};

type GenericActionButton = {
    label: string;
    type: 'primary' | 'glass';
    onPress: () => void;
};

type GenericActionsButtonsProps = {
    user?: GenericActionsUser | null;
    style?: StyleProp<ViewStyle>;
    onTalk?: (targetUser: GenericActionsUser) => Promise<void> | void;
    onEditProfile?: () => void;
    onArchived?: () => void;
};

function getUserId(user?: GenericActionsUser | null) {
    return user?.id ?? user?._id ?? '';
}

const GenericActionsButtons = ({
    user,
    style,
    onTalk,
    onEditProfile,
    onArchived
}: GenericActionsButtonsProps) => {
    const { user: currentUser } = useGlobal();
    const currentUserId = getUserId(currentUser as any);
    const targetUserId = getUserId(user);

    const [loading, setLoading] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);

    const isOwner = Boolean(currentUserId && targetUserId && currentUserId === targetUserId);

    useEffect(() => {
        if (!user || !currentUserId) {
            setIsFollowing(false);
            return;
        }

        setIsFollowing(Boolean(user.followers?.includes(currentUserId)));
    }, [user?.id, user?._id, user?.followers, currentUserId]);

    async function handleFollowButtonClick() {
        if (!user || loading) return;

        const nextFollowing = !isFollowing;
        setIsFollowing(nextFollowing);
        setLoading(true);

        try {
            await UserService.followUser(currentUserId, targetUserId);
            UserService.clearCache();
        } catch (error) {
            setIsFollowing(!nextFollowing);
            console.error('[GENERIC_ACTIONS_BUTTONS] erro ao seguir/deixar de seguir', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleTalkButtonClick() {
        if (!user || loading) return;

        setLoading(true);

        try {
            if (onTalk) {
                await onTalk(user);
                return;
            }

            router.push('/messages/inbox' as any);
        } catch (error) {
            console.error('[GENERIC_ACTIONS_BUTTONS] erro ao abrir conversa', error);
        } finally {
            setLoading(false);
        }
    }

    function handleEditProfile() {
        if (onEditProfile) {
            onEditProfile();
            return;
        }

        router.push('/profile/edit' as any);
    }

    function handleArchived() {
        if (onArchived) {
            onArchived();
            return;
        }

        router.push('/profile/archived' as any);
    }

    const buttons = useMemo<GenericActionButton[]>(() => {
        if (isOwner) {
            return [
                {
                    label: 'Editar perfil',
                    type: 'glass',
                    onPress: handleEditProfile
                },
                {
                    label: 'Arquivados',
                    type: 'glass',
                    onPress: handleArchived
                }
            ];
        }

        return [
            {
                label: isFollowing ? 'Seguindo' : 'Seguir',
                type: isFollowing ? 'glass' : 'primary',
                onPress: handleFollowButtonClick
            },
            {
                label: 'Conversar',
                type: 'glass',
                onPress: handleTalkButtonClick
            }
        ];
    }, [isOwner, isFollowing, loading, user?.id, user?._id]);

    if (!user || !targetUserId) {
        return null;
    }

    return (
        <View style={[styles.container, style]}>
            {buttons.map((button) => (
                <ActionButton
                    key={button.label}
                    label={button.label}
                    type={button.type}
                    disabled={loading}
                    onPress={button.onPress}
                />
            ))}
        </View>
    );
};

function ActionButton({
    label,
    type,
    disabled,
    onPress
}: {
    label: string;
    type: 'primary' | 'glass';
    disabled?: boolean;
    onPress: () => void;
}) {
    const isPrimary = type === 'primary';

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.buttonPressable,
                pressed && styles.buttonPressed,
                disabled && styles.buttonDisabled
            ]}
        >
            {isPrimary ? (
                <View style={styles.primaryButton}>
                    <Text style={styles.primaryText}>{label}</Text>
                </View>
            ) : Platform.OS === 'ios' ? (
                <GlassView isInteractive tintColor="rgba(255,255,255,0.18)" style={styles.glassButton}>
                    <Text style={styles.glassText}>{label}</Text>
                </GlassView>
            ) : (
                <View style={styles.fallbackGlassButton}>
                    <Text style={styles.glassText}>{label}</Text>
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: '100%'
    },
    buttonPressable: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden'
    },
    buttonPressed: {
        opacity: 0.75,
        transform: [{ scale: 0.98 }]
    },
    buttonDisabled: {
        opacity: 0.55
    },
    primaryButton: {
        minHeight: 38,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1881E2',
        borderWidth: 1,
        borderColor: '#1881E2',
        paddingHorizontal: 14,
        paddingVertical: 9
    },
    primaryText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700'
    },
    glassButton: {
        minHeight: 38,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 14,
        paddingVertical: 9,
        overflow: 'hidden'
    },
    fallbackGlassButton: {
        minHeight: 38,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.28)',
        paddingHorizontal: 14,
        paddingVertical: 9,
        overflow: 'hidden'
    },
    glassText: {
        color: '#111111',
        fontSize: 14,
        fontWeight: '700'
    }
});

export default GenericActionsButtons;