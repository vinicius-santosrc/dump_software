import { useEffect, useMemo, useRef } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassView } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';
import Avatar from '@/components/ui/avatar';
import GenericText from '@/components/ui/generic-text';
import { Post } from '@/services/post.service';

type PostCommentsProps = {
    post?: Post | any;
    caption?: string;
    visible?: boolean;
    onClose?: () => void;
};

const SCREEN_HEIGHT = Dimensions.get('window').height;
const TOP_DETENT = Math.max(SCREEN_HEIGHT * 0.08, 54);
const HALF_DETENT = SCREEN_HEIGHT * 0.46;
const CLOSED_DETENT = SCREEN_HEIGHT;

function getCommentId(comment: any, index: number) {
    return comment?.id ?? comment?._id ?? `${index}`;
}

function getCommentUser(comment: any) {
    return comment?.user ?? comment?.sender ?? comment?.createdBy;
}

function getCommentText(comment: any) {
    return comment?.content ?? comment?.text ?? comment?.comment ?? '';
}

const PostComments = ({ post, caption = '', visible = false, onClose }: PostCommentsProps) => {
    const translateY = useRef(new Animated.Value(CLOSED_DETENT)).current;
    const currentDetentRef = useRef(HALF_DETENT);

    const comments = useMemo(() => {
        const postComments = Array.isArray(post?.comments) ? post.comments : [];
        return postComments;
    }, [post?.comments]);

    const animateTo = (toValue: number, closeAfter = false) => {
        currentDetentRef.current = toValue;

        Animated.spring(translateY, {
            toValue,
            useNativeDriver: true,
            damping: 24,
            stiffness: 230,
            mass: 0.9
        }).start(() => {
            if (closeAfter) {
                onClose?.();
            }
        });
    };

    const closeSheet = () => {
        animateTo(CLOSED_DETENT, true);
    };

    useEffect(() => {
        if (visible) {
            translateY.setValue(CLOSED_DETENT);
            requestAnimationFrame(() => {
                animateTo(HALF_DETENT);
            });
        }
    }, [visible]);

    const panResponder = useMemo(() => PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 8,
        onPanResponderMove: (_, gesture) => {
            const nextValue = Math.min(
                CLOSED_DETENT,
                Math.max(TOP_DETENT, currentDetentRef.current + gesture.dy)
            );

            translateY.setValue(nextValue);
        },
        onPanResponderRelease: (_, gesture) => {
            const projectedPosition = currentDetentRef.current + gesture.dy + gesture.vy * 140;

            if (projectedPosition > SCREEN_HEIGHT * 0.72 || gesture.vy > 1.3) {
                closeSheet();
                return;
            }

            const distanceToTop = Math.abs(projectedPosition - TOP_DETENT);
            const distanceToHalf = Math.abs(projectedPosition - HALF_DETENT);

            if (distanceToTop < distanceToHalf || gesture.vy < -0.6) {
                animateTo(TOP_DETENT);
                return;
            }

            animateTo(HALF_DETENT);
        },
        onPanResponderTerminate: () => {
            animateTo(currentDetentRef.current);
        }
    }), [translateY]);

    return (
        <Modal
            visible={visible}
            transparent
            // animationType="none"
            statusBarTranslucent
            onRequestClose={closeSheet}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={closeSheet} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardWrapper}
                >
                    <Animated.View
                        style={[
                            styles.animatedSheet,
                            {
                                height: SCREEN_HEIGHT,
                                transform: [{ translateY }]
                            }
                        ]}
                    >
                        <SafeAreaView edges={['bottom']} style={styles.sheetWrapper}>
                            {Platform.OS === 'ios' ? (
                                <GlassView isInteractive tintColor="rgba(255,255,255,0.82)" style={styles.sheet}>
                                    <CommentsContent
                                        caption={caption || post?.caption || ''}
                                        comments={comments}
                                        onClose={closeSheet}
                                        panHandlers={panResponder.panHandlers}
                                    />
                                </GlassView>
                            ) : (
                                <View style={styles.sheetFallback}>
                                    <CommentsContent
                                        caption={caption || post?.caption || ''}
                                        comments={comments}
                                        onClose={closeSheet}
                                        panHandlers={panResponder.panHandlers}
                                    />
                                </View>
                            )}
                        </SafeAreaView>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

function CommentsContent({
    caption,
    comments,
    onClose,
    panHandlers
}: {
    caption: string;
    comments: any[];
    onClose?: () => void;
    panHandlers: any;
}) {
    return (
        <View style={styles.content}>
            <View style={styles.dragArea} {...panHandlers}>
                <View style={styles.handle} />
            </View>

            <View style={styles.header}>
                <View style={styles.headerSpacer} />
                <Text style={styles.title}>Comentários</Text>
                <Pressable onPress={onClose} style={styles.closeButton}>
                    <SymbolView name="xmark" size={17} tintColor="#111111" weight="semibold" />
                </Pressable>
            </View>

            <FlatList
                data={comments}
                keyExtractor={getCommentId}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    caption ? (
                        <View style={styles.captionWrapper}>
                            <GenericText
                                text={caption}
                                expandable
                                maxCharacters={180}
                                clickableMentions
                                clickableHashtags
                                clickableLinks
                            />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyWrapper}>
                        <Text style={styles.emptyTitle}>Nenhum comentário ainda</Text>
                        <Text style={styles.emptyText}>Seja o primeiro a comentar</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const user = getCommentUser(item);
                    const text = getCommentText(item);

                    return (
                        <View style={styles.commentItem}>
                            <Avatar user={user} width={34} height={34} />

                            <View style={styles.commentBody}>
                                <Text style={styles.commentUsername}>
                                    {user?.username ?? user?.fullName ?? 'usuário'}
                                </Text>
                                <Text style={styles.commentText}>{text}</Text>
                            </View>
                        </View>
                    );
                }}
            />

            <View style={styles.inputWrapper}>
                <TextInput
                    placeholder="Adicionar comentário..."
                    placeholderTextColor="rgba(17,17,17,0.48)"
                    style={styles.input}
                />
                <Pressable style={styles.sendButton}>
                    <SymbolView name="paperplane.fill" size={18} tintColor="#1881E2" weight="semibold" />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.28)'
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject
    },
    keyboardWrapper: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    animatedSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0
    },
    sheetWrapper: {
        flex: 1,
        width: '100%'
    },
    sheet: {
        flex: 1,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden'
    },
    sheetFallback: {
        flex: 1,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
        backgroundColor: '#ffffff'
    },
    content: {
        flex: 1,
        backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.28)' : '#ffffff'
    },
    dragArea: {
        height: 24,
        alignItems: 'center',
        justifyContent: 'center'
    },
    handle: {
        width: 44,
        height: 5,
        borderRadius: 999,
        backgroundColor: 'rgba(17,17,17,0.22)'
    },
    header: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(17,17,17,0.12)'
    },
    headerSpacer: {
        width: 38
    },
    title: {
        color: '#111111',
        fontSize: 16,
        fontWeight: '800'
    },
    closeButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(17,17,17,0.06)'
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
        flexGrow: 1
    },
    captionWrapper: {
        paddingBottom: 14,
        marginBottom: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(17,17,17,0.1)'
    },
    commentItem: {
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 10
    },
    commentBody: {
        flex: 1
    },
    commentUsername: {
        color: '#111111',
        fontSize: 13,
        fontWeight: '800',
        marginBottom: 2
    },
    commentText: {
        color: '#242424',
        fontSize: 14,
        lineHeight: 19
    },
    emptyWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 90
    },
    emptyTitle: {
        color: '#111111',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4
    },
    emptyText: {
        color: 'rgba(17,17,17,0.55)',
        fontSize: 13,
        fontWeight: '500'
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(17,17,17,0.12)'
    },
    input: {
        flex: 1,
        minHeight: 40,
        borderRadius: 20,
        paddingHorizontal: 14,
        backgroundColor: 'rgba(17,17,17,0.06)',
        color: '#111111',
        fontSize: 14
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(24,129,226,0.1)'
    }
});

export default PostComments;