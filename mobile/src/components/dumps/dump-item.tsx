import React, { useMemo } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { GlassView } from 'expo-glass-effect';

import { Post } from '@/services/post.service';
import PostHeader from '@/components/feed/post-components/post-header';
import PostMedia from '@/components/feed/post-components/post-media';
import PostActionsButtons from '@/components/feed/post-components/post-actions-buttons';

type DumpItemProps = {
    reel: Post | any;
    isActive?: boolean;
    theme?: 'light' | 'dark';
    showOptions?: boolean;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth <= 760;

const DumpItem = ({
    reel,
    isActive = false,
    theme = 'dark',
    showOptions = true
}: DumpItemProps) => {
    const firstMedia = reel?.media?.[0];

    const isHorizontalVideo = useMemo(() => {
        const width = Number(firstMedia?.width || 0);
        const height = Number(firstMedia?.height || 0);

        return width > height;
    }, [firstMedia?.height, firstMedia?.width]);

    const GlassContainer = Platform.OS === 'ios' ? GlassView : View;
    const glassTint = theme === 'dark' ? 'rgba(18, 18, 18, 0.42)' : 'rgba(255, 255, 255, 0.34)';

    if (!reel) {
        return null;
    }

    return (
        <View style={[styles.dump, isHorizontalVideo && styles.dumpHorizontalVideo]}>
            {!isHorizontalVideo && !isSmallScreen && (
                <View style={styles.dumpHeaderSide}>
                    <View style={styles.glassPanelClipper}>
                        <GlassContainer
                            style={styles.glassPanel}
                            isInteractive={Platform.OS === 'ios'}
                            tintColor={glassTint}
                        >
                            <PostHeader
                                user={reel.user}
                                post={reel}
                                caption={reel.caption ?? ''}
                                showOptions={false}
                                theme={theme}
                            />
                        </GlassContainer>
                    </View>
                </View>
            )}

            <View style={[styles.dumpInside, isHorizontalVideo && styles.dumpInsideHorizontal]}>
                <View style={[styles.dumpContent, isHorizontalVideo && styles.dumpContentHorizontal]}>
                    <View style={[styles.dumpMedia, isHorizontalVideo && styles.dumpMediaHorizontal]}>
                        <PostMedia
                            postId={reel?.id ?? reel?._id}
                            media={reel?.media ?? []}
                            isVisible={isActive}
                            // resizeMode={isHorizontalVideo ? 'contain' : 'cover'}
                        />
                    </View>

                    {!isHorizontalVideo && isSmallScreen && (
                        <View style={styles.dumpHeaderMobile}>
                            <PostHeader
                                user={reel.user}
                                post={reel}
                                caption={reel.caption ?? ''}
                                showOptions={false}
                                theme={theme}
                            />
                        </View>
                    )}

                    {isHorizontalVideo && (
                        <View style={styles.dumpBottomHeader}>
                            <View style={styles.glassPanelClipper}>
                                <GlassContainer
                                    style={styles.glassPanel}
                                    isInteractive={Platform.OS === 'ios'}
                                    tintColor={glassTint}
                                >
                                    <PostHeader
                                        user={reel.user}
                                        post={reel}
                                        caption={reel.caption ?? ''}
                                        showOptions={false}
                                        theme={theme}
                                    />
                                </GlassContainer>
                            </View>
                        </View>
                    )}
                </View>
            </View>

            <View style={[styles.dumpActionButtons, !isHorizontalVideo && styles.actionsVerticalVideo]}>
                <View style={styles.actionButton}>
                    <PostActionsButtons
                        post={reel}
                        type="reel"
                        showOptions={showOptions}
                        theme={theme}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    dump: {
        width: '100%',
        maxWidth: '100%',
        height: screenHeight,
        minHeight: screenHeight,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        position: 'relative',
        gap: 16,
        backgroundColor: '#000'
    },
    dumpHorizontalVideo: {
        alignItems: 'center'
    },
    dumpHeaderSide: {
        width: '33%',
        height: '87%',
        justifyContent: 'flex-end',
        paddingBottom: '13%'
    },
    glassPanelClipper: {
        width: '100%',
        borderRadius: 26,
        overflow: 'hidden',
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(20, 20, 20, 0.62)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.22)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 8
    },
    glassPanel: {
        width: '100%',
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(20, 20, 20, 0.62)'
    },
    dumpInside: {
        position: 'relative',
        height: screenHeight,
        width: Math.min(screenWidth, 430),
        maxWidth: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0
    },
    dumpInsideHorizontal: {
        width: Math.min(screenWidth, 430)
    },
    dumpContent: {
        width: '100%',
        height: screenHeight,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        gap: 12
    },
    dumpContentHorizontal: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16
    },
    dumpMedia: {
        width: '100%',
        height: screenHeight,
        minHeight: screenHeight,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 0,
        backgroundColor: '#000'
    },
    dumpMediaHorizontal: {
        width: '100%',
        height: undefined,
        minHeight: undefined,
        maxHeight: screenHeight * 0.72,
        aspectRatio: 16 / 9,
        borderRadius: 16,
        overflow: 'hidden'
    },
    dumpHeaderMobile: {
        position: 'absolute',
        left: 12,
        right: 76,
        bottom: 26,
        zIndex: 5
    },
    dumpBottomHeader: {
        width: '100%',
        maxWidth: '100%',
        paddingBottom: 24
    },
    dumpActionButtons: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
    actionsVerticalVideo: {
        width: isSmallScreen ? 72 : '33%',
        position: isSmallScreen ? 'absolute' : 'relative',
        right: isSmallScreen ? 8 : undefined,
        bottom: isSmallScreen ? 28 : undefined,
        alignItems: isSmallScreen ? 'flex-end' : 'center',
        justifyContent: isSmallScreen ? 'flex-end' : 'center'
    },
    actionButton: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        paddingHorizontal: isSmallScreen ? 0 : 12,
        paddingVertical: 6
    }
});

export default DumpItem;