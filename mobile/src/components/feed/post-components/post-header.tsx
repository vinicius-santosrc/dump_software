/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-17
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    ActionSheetIOS,
    Alert,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { GlassView } from 'expo-glass-effect';

import Avatar from '@/components/ui/avatar';
import { archivePost, deletePost } from '@/services/post.service';
import { useGlobal } from '@/context/GlobalProvider';
import { MenuView } from '@react-native-menu/menu';
import { SymbolView } from 'expo-symbols';

interface PostHeaderUser {
    id?: string;
    username?: string;
    fullName?: string;
    thumbnail?: string;
    profilePictureUrl?: string;
    verified?: boolean;
    isOnline?: boolean;
}

interface PostHeaderPost {
    id?: string;
    _id?: string;
    user?: PostHeaderUser;
    archived?: boolean;
    isDeleted?: boolean;
}

interface PostHeaderProps {
    user?: PostHeaderUser;
    post?: PostHeaderPost;
    caption?: string;
    theme?: 'dark' | 'light';
    isModal?: boolean;
    showOptions?: boolean;
    onPostArchived?: () => void;
    onPostDeleted?: () => void;
}

const MAX_CAPTION_CHARACTERS = 180;

function getUserId(user?: PostHeaderUser) {
    return user?.id ?? '';
}

function getPostId(post?: PostHeaderPost) {
    return post?.id ?? post?._id ?? '';
}

export default function PostHeader({
    user,
    post,
    caption = '',
    theme = 'light',
    showOptions = true,
    onPostArchived,
    onPostDeleted
}: PostHeaderProps) {
    const userGlobal = useGlobal();
    const currentUser = userGlobal?.user
    const [expanded, setExpanded] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const currentUserId = getUserId(currentUser);
    const postOwnerId = getUserId(post?.user ?? user);
    const postId = getPostId(post);
    const isOwner = Boolean(currentUserId && postOwnerId && currentUserId === postOwnerId);
    const textColor = theme === 'dark' ? '#ffffff' : '#111111';
    const secondaryTextColor = theme === 'dark' ? '#cfcfcf' : '#666666';

    function openProfile() {
        if (!user?.username) {
            return;
        }

        router.push(`/profile/${user.username}`);
    }

    async function handleArchive() {
        if (!postId || actionLoading) {
            return;
        }

        try {
            setActionLoading(true);
            await archivePost(postId);
            onPostArchived?.();
            Alert.alert('Pronto', 'Publicação arquivada.');
        } catch (error: any) {
            Alert.alert('Erro', error?.message ?? 'Não foi possível arquivar a publicação.');
        } finally {
            setActionLoading(false);
        }
    }

    async function handleDelete() {
        if (!postId || actionLoading) {
            return;
        }

        Alert.alert(
            'Excluir publicação',
            'Tem certeza que deseja excluir esta publicação?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setActionLoading(true);
                            await deletePost(postId);
                            onPostDeleted?.();
                            Alert.alert('Pronto', 'Publicação excluída.');
                        } catch (error: any) {
                            Alert.alert('Erro', error?.message ?? 'Não foi possível excluir a publicação.');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    }

    function showVisitorOptions() {
        Alert.alert('Opções', 'O que deseja fazer?', [
            { text: 'Ocultar publicação', onPress: () => undefined },
            { text: 'Denunciar', style: 'destructive', onPress: () => undefined },
            { text: 'Cancelar', style: 'cancel' }
        ]);
    }

    function showOwnerOptions() {
        Alert.alert('Opções', 'O que deseja fazer?', [
            {
                text: post?.archived ? 'Publicação já arquivada' : 'Arquivar publicação',
                onPress: post?.archived ? undefined : handleArchive
            },
            { text: 'Excluir publicação', style: 'destructive', onPress: handleDelete },
            { text: 'Cancelar', style: 'cancel' }
        ]);
    }

    function options() {
        if (actionLoading) {
            return;
        }

        if (Platform.OS === 'ios') {
            const options = isOwner
                ? [post?.archived ? 'Publicação já arquivada' : 'Arquivar publicação', 'Excluir publicação', 'Cancelar']
                : ['Ocultar publicação', 'Denunciar', 'Cancelar'];

            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options,
                    cancelButtonIndex: options.length - 1,
                    destructiveButtonIndex: isOwner ? 1 : 1
                },
                (buttonIndex) => {
                    if (isOwner) {
                        if (buttonIndex === 0 && !post?.archived) {
                            handleArchive();
                        }

                        if (buttonIndex === 1) {
                            handleDelete();
                        }

                        return;
                    }

                    if (buttonIndex === 0) {
                        return;
                    }

                    if (buttonIndex === 1) {
                        return;
                    }
                }
            );

            return;
        }

        if (isOwner) {
            showOwnerOptions();
            return;
        }

        showVisitorOptions();
    }

    return (
        <>
            <GlassView
                style={styles.postTitle}
                glassEffectStyle={Platform.OS === 'ios' ? 'regular' : undefined}
                isInteractive={Platform.OS === 'ios'}
                tintColor={theme === 'dark' ? 'rgba(18, 18, 18, 0.42)' : 'rgba(255, 255, 255, 0.34)'}
            >
                <View style={styles.accountPostDetail}>
                    <Pressable onPress={openProfile} style={styles.userArea}>
                        <Avatar
                            user={user}
                            width={48}
                            height={48}
                            redirectOnClick={false}
                        />

                        <View style={styles.userTexts}>
                            <View style={styles.nameRow}>
                                <Text numberOfLines={1} style={[styles.fullName, { color: textColor }]}>
                                    {user?.username}
                                </Text>

                                {user?.verified ? <Text style={styles.verified}>✓</Text> : null}
                            </View>

                            {/* <Text numberOfLines={1} style={[styles.username, { color: secondaryTextColor }]}>
                            </Text> */}
                        </View>
                    </Pressable>
                </View>
            </GlassView>

            <GlassView
                style={styles.postBtn}
                glassEffectStyle={Platform.OS === 'ios' ? 'regular' : undefined}
                isInteractive={Platform.OS === 'ios'}
                tintColor={theme === 'dark' ? 'rgba(18, 18, 18, 0.42)' : 'rgba(255, 255, 255, 0.34)'}
            >
                {/* {showOptions ? (
                    <Pressable
                        onPress={options}
                        disabled={actionLoading}
                        hitSlop={10}
                        style={({ pressed }) => [
                            styles.optionsButton,
                            { opacity: pressed || actionLoading ? 0.5 : 1 }
                        ]}
                    >
                        <Text style={[styles.optionsIcon, { color: textColor }]}>•••</Text>
                    </Pressable>
                ) : null} */}
                <MenuView

                    actions={[

                        { id: 'edit', title: 'Editar' },

                        { id: 'delete', title: 'Excluir', attributes: { destructive: true } },

                    ]}

                    onPressAction={({ nativeEvent }) => {

                        switch (nativeEvent.event) {

                            case 'edit':

                                // handleEdit();

                                break;

                            case 'delete':

                                handleDelete();

                                break;

                        }

                    }}

                >

                    <Pressable>

                        <SymbolView name="ellipsis" size={22} />

                    </Pressable>

                </MenuView>
            </GlassView>
        </>
    );
}

const styles = StyleSheet.create({
    postTitle: {
        position: 'absolute',
        top: 12,
        left: 24,
        right: 12,
        zIndex: 10,
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 32,
        overflow: 'hidden',
        backgroundColor: Platform.OS === 'ios' ? 'rgba(9, 9, 9, 0)' : 'rgba(20, 20, 20, 0.72)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.24)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 8,
        width: 200
    },
    accountPostDetail: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    userArea: {
        flex: 1,
        minWidth: 0,
        flexDirection: 'row',
        alignItems: 'center'
    },
    userTexts: {
        flex: 1,
        minWidth: 0,
        marginLeft: 10
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    fullName: {
        flexShrink: 1,
        fontSize: 14,
        fontWeight: '700'
    },
    username: {
        marginTop: 2,
        fontSize: 12
    },
    verified: {
        marginLeft: 4,
        color: '#1881E2',
        fontSize: 12,
        fontWeight: '800'
    },
    optionsButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center'
    },
    optionsIcon: {
        fontSize: 22,
        lineHeight: 22,
        fontWeight: '700',
        transform: [{ translateY: -3 }]
    },
    postMediaCaption: {
        marginTop: 12,
        marginBottom: 2
    },
    captionText: {
        fontSize: 14,
        lineHeight: 20
    },
    expandText: {
        marginTop: 4,
        fontSize: 13,
        fontWeight: '600'
    },
    postBtn: {
        position: 'absolute',
        top: 12,
        right: 24,
        zIndex: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 32,
        overflow: 'hidden',
        backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0)' : 'rgba(20, 20, 20, 0.72)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.24)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 8,
    }
});