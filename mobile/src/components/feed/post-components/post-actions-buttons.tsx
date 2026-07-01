import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';
import { Post } from '@/services/post.service';
import PostComments from './post-comments';

type PostActionsButtonsProps = {
    post?: Post;
    type?: 'post' | 'reel';
    showOptions?: boolean;
    theme?: 'light' | 'dark';
    liked?: boolean;
    saved?: boolean;
    onLike?: (postId?: string) => void | Promise<void>;
    onComment?: (post?: Post) => void | Promise<void>;
    onSend?: (post?: Post) => void | Promise<void>;
    onSave?: (post?: Post) => void | Promise<void>;
    onOptions?: (post?: Post) => void | Promise<void>;
};

const PostActionsButtons = ({
    post,
    type = 'post',
    showOptions = false,
    theme = 'light',
    liked = false,
    saved = false,
    onLike,
    onComment,
    onSend,
    onSave,
    onOptions
}: PostActionsButtonsProps) => {
    const likeAnimation = useRef(new Animated.Value(1)).current;
    const [commentsOpen, setCommentsOpen] = useState(false);
    const isReel = type === 'reel';
    const isDark = theme === 'dark';

    useEffect(() => {
        Animated.sequence([
            Animated.timing(likeAnimation, {
                toValue: liked ? 1.18 : 0.92,
                duration: 120,
                useNativeDriver: true
            }),
            Animated.spring(likeAnimation, {
                toValue: 1,
                friction: 4,
                tension: 140,
                useNativeDriver: true
            })
        ]).start();
    }, [liked, likeAnimation]);

    const iconColor = isDark || isReel ? '#ffffff' : '#111111';
    const textColor = isDark || isReel ? '#d9d9d9' : '#333333';
    const likeColor = liked ? '#1881E2' : iconColor;
    const saveColor = saved ? '#1881E2' : iconColor;
    const sharesCount = Number((post as any)?.sharesCount ?? 0);
    const buttonGlassTint = isDark || isReel ? 'rgba(18, 18, 18, 0.42)' : 'rgba(255, 255, 255, 0.34)';

    const renderSymbol = (name: string, color: string, size: number = 25) => (
        <SymbolView
            name={name as any}
            size={size}
            tintColor={color}
            weight="regular"
        />
    );

    function handleCommentPress() {
        setCommentsOpen(true);
        onComment?.(post);
    }

    return (
        <>
            <View
                style={[
                    styles.postActions,
                    isReel && styles.postActionsReel
                ]}
            >
                <GlassButton tintColor={buttonGlassTint}>
                    <Pressable style={[styles.actionButton, isReel && styles.actionButtonReel]} onPress={() => onLike?.(post?.id)}>
                        <Animated.View style={{ transform: [{ scale: likeAnimation }] }}>
                            {renderSymbol(liked ? 'heart.fill' : 'heart', likeColor, 26)}
                        </Animated.View>
                        <Text style={[styles.actionText, { color: textColor }]}>{post?.likes?.length ?? 0}</Text>
                    </Pressable>
                </GlassButton>

                <GlassButton tintColor={buttonGlassTint}>
                    <Pressable style={[styles.actionButton, isReel && styles.actionButtonReel]} onPress={handleCommentPress}>
                        {renderSymbol('message', iconColor, 25)}
                        <Text style={[styles.actionText, { color: textColor }]}>{post?.comments?.length ?? 0}</Text>
                    </Pressable>
                </GlassButton>

                <GlassButton tintColor={buttonGlassTint}>
                    <Pressable style={[styles.actionButton, isReel && styles.actionButtonReel]} onPress={() => onSend?.(post)}>
                        {renderSymbol('paperplane', iconColor, 25)}
                        {sharesCount > 0 && (
                            <Text style={[styles.actionText, { color: textColor }]}>{sharesCount}</Text>
                        )}
                    </Pressable>
                </GlassButton>

                <GlassButton tintColor={buttonGlassTint}>
                    <Pressable style={[styles.actionButton, isReel && styles.actionButtonReel]} onPress={() => onSave?.(post)}>
                        {renderSymbol(saved ? 'bookmark.fill' : 'bookmark', saveColor, 26)}
                    </Pressable>
                </GlassButton>

                {showOptions && (
                    <GlassButton tintColor={buttonGlassTint}>
                        <Pressable style={[styles.actionButton, isReel && styles.actionButtonReel]} onPress={() => onOptions?.(post)}>
                            {renderSymbol('ellipsis', iconColor, 28)}
                        </Pressable>
                    </GlassButton>
                )}
            </View>

            <PostComments
                post={post}
                caption={(post as any)?.caption ?? ''}
                visible={commentsOpen}
                onClose={() => setCommentsOpen(false)}
            />
        </>
    );
};

function GlassButton({ children, tintColor }: { children: React.ReactNode; tintColor: string }) {
    if (Platform.OS === 'ios') {
        return (
            <GlassView
                style={styles.glassButton}
                isInteractive
                tintColor={tintColor}
            >
                {children}
            </GlassView>
        );
    }

    return <View style={styles.glassButton}>{children}</View>;
}

const styles = StyleSheet.create({
    postActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        position: 'absolute',
        bottom: 12,
        left: 24
    },
    postActionsReel: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14
    },
    glassButton: {
        width: 54,
        minHeight: 54,
        borderRadius: 999,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(20, 20, 20, 0.62)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.24)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
        elevation: 8
    },
    actionButton: {
        width: '100%',
        minHeight: 54,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 1,
        paddingHorizontal: 6,
        paddingVertical: 6,
        borderRadius: 999
    },
    actionButtonReel: {
        gap: 2,
        paddingHorizontal: 4,
        paddingVertical: 4
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600'
    }
});

export default PostActionsButtons;