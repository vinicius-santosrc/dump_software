import { useEffect, useMemo, useRef, useState } from "react";
import GenericInput from "@/components/ui/generic-input";
import messagesService from "@/services/messages/messages.service";
import chatService from "@/services/messages/chat.service";
import { chatRealtimeService } from "@/services/messages/chat-realtime.service";
import { GlassView } from "expo-glass-effect";
import { SymbolView } from "expo-symbols";
import {
    FlatList,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobal } from "@/context/GlobalProvider";
import { useInboxStore } from "@/store/inbox.store";
import { useRouter } from "expo-router";
import ConversationItem from "@/components/messages/ConversationItem";

type ConversationUser = {
    id?: string;
    _id?: string;
    username?: string;
    fullName?: string;
    profilePictureUrl?: string;
};

type Conversation = {
    id?: string;
    _id?: string;
    participants?: ConversationUser[];
    lastMessage?: {
        text?: string;
        senderId?: string;
        createdAt?: string;
        type?: string;
        mediaType?: string | null;
        stickerUrl?: string | null;
    };
    unreadCount?: Record<string, number> | number;
    unreadCounts?: Record<string, number>;
    updatedAt?: string;
};

export default function InboxTab() {
    const ButtonGlass = Platform.OS === "ios" ? GlassView : View;
    const router = useRouter();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const realtimeStartedForUserRef = useRef<string | null>(null);
    const joinedConversationIdsRef = useRef<Set<string>>(new Set());

    const { user } = useGlobal();
    const currentUserId = user?.id;
    const storeConversations = useInboxStore(state => state.conversations);
    const activeMessages = useInboxStore(state => state.activeMessages);
    const typingMap = useInboxStore(state => state.typingMap);

    useEffect(() => {
        if (!currentUserId) {
            realtimeStartedForUserRef.current = null;
            joinedConversationIdsRef.current.clear();
            setConversations([]);
            return;
        }

        if (realtimeStartedForUserRef.current !== currentUserId) {
            realtimeStartedForUserRef.current = currentUserId;

            chatRealtimeService.setCurrentUser(user);
            chatRealtimeService.init(user).then(() => {
                joinLoadedConversations(conversations);
            }).catch((error) => {
                realtimeStartedForUserRef.current = null;
            });
        }

        loadConversations();
    }, [currentUserId]);

    useEffect(() => {
        if (!storeConversations || storeConversations.length === 0) {
            return;
        }

        setConversations(currentConversations => {
            const mergedById = new Map<string, Conversation>();

            currentConversations.forEach(conversation => {
                const conversationId = getConversationId(conversation);

                if (conversationId) {
                    mergedById.set(conversationId, conversation);
                }
            });

            storeConversations.forEach((conversation: Conversation) => {
                const conversationId = getConversationId(conversation);

                if (!conversationId) {
                    return;
                }

                const currentConversation = mergedById.get(conversationId);

                mergedById.set(conversationId, {
                    ...(currentConversation ?? {}),
                    ...conversation,
                    lastMessage: conversation.lastMessage ?? currentConversation?.lastMessage,
                    unreadCount: conversation.unreadCount ?? currentConversation?.unreadCount,
                    unreadCounts: conversation.unreadCounts ?? currentConversation?.unreadCounts,
                    updatedAt: conversation.updatedAt ?? currentConversation?.updatedAt
                });
            });

            return sortConversationsByLastActivity(Array.from(mergedById.values()));
        });
    }, [storeConversations]);

    useEffect(() => {
        if (!currentUserId || conversations.length === 0) {
            return;
        }

        joinLoadedConversations(conversations);
    }, [currentUserId, conversations]);

    useEffect(() => {
        if (activeMessages.length === 0) {
            return;
        }

        setConversations(currentConversations => {
            if (currentConversations.length === 0) {
                return currentConversations;
            }

            const nextConversations = currentConversations.map(conversation => {
                const conversationId = getConversationId(conversation);

                const lastRealtimeMessage = [...activeMessages]
                    .filter(message => getMessageConversationId(message) === conversationId)
                    .sort((a, b) => {
                        const dateA = new Date(a?.createdAt ?? 0).getTime();
                        const dateB = new Date(b?.createdAt ?? 0).getTime();
                        return dateB - dateA;
                    })[0];

                if (!lastRealtimeMessage) {
                    return conversation;
                }

                return buildConversationWithLastMessage(conversation, lastRealtimeMessage, currentUserId);
            });

            return sortConversationsByLastActivity(nextConversations);
        });
    }, [activeMessages, currentUserId]);

    async function loadConversations() {
        if (!currentUserId) {
            setConversations([]);
            return;
        }

        const response = await messagesService.getConversationsByUserId(currentUserId);

        const sorted = [...(response ?? [])].sort((a, b) => {
            const dateA = new Date(a?.updatedAt ?? a?.lastMessage?.createdAt ?? 0).getTime();
            const dateB = new Date(b?.updatedAt ?? b?.lastMessage?.createdAt ?? 0).getTime();

            return dateB - dateA;
        });

        setConversations(sorted);
        useInboxStore.getState().setConversations(sorted as any);
        joinLoadedConversations(sorted);
    }

    async function refresh() {
        if (!currentUserId) {
            return;
        }

        try {
            setRefreshing(true);
            setSelectedConversation(null);
            setConversations([]);
            useInboxStore.getState().setConversations([] as any);

            joinedConversationIdsRef.current.clear();

            await loadConversations();
        } catch (error: any) {
            console.warn("[INBOX] refresh conversations failed", error?.message ?? error);
        } finally {
            setRefreshing(false);
        }
    }

    function joinLoadedConversations(loadedConversations: Conversation[]) {
        if (!currentUserId || !loadedConversations?.length) {
            return;
        }

        chatRealtimeService.setCurrentUser(user);

        chatRealtimeService.init(user).then(() => {
            loadedConversations.forEach(conversation => {
                const conversationId = conversation.id ?? conversation._id;

                if (!conversationId || joinedConversationIdsRef.current.has(conversationId)) {
                    return;
                }

                joinedConversationIdsRef.current.add(conversationId);

                chatService.joinConversation(conversationId).then(() => {
                    console.log("[INBOX] joined conversation group", { conversationId });
                }).catch(error => {
                    joinedConversationIdsRef.current.delete(conversationId);
                    console.warn("[INBOX] join conversation failed", {
                        conversationId,
                        error: error?.message ?? error
                    });
                });
            });
        }).catch(error => {
            console.warn("[INBOX] join loaded conversations failed", error?.message ?? error);
        });
    }

    const filteredConversations = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return conversations;
        }

        return conversations.filter(conversation => {
            const name = getConversationName(conversation, currentUserId).toLowerCase();
            const username = getConversationUsername(conversation, currentUserId).toLowerCase();
            const lastMessage = getLastMessagePreview(conversation.lastMessage).toLowerCase();

            return name.includes(query) || username.includes(query) || lastMessage.includes(query);
        });
    }, [conversations, currentUserId, search]);

    function openConversation(conversation: Conversation) {
        const conversationId = getConversationId(conversation);

        if (!conversationId) {
            return;
        }

        setSelectedConversation(conversation);

        router.push({
            pathname: "/messages",
            params: {
                conversationId,
                conversation: JSON.stringify(conversation)
            }
        });
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerMessages}>
                <View style={styles.headerMessagesInside}>
                    <View>
                        <Text style={styles.headerMessagesTextWrapper}>Mensagens</Text>
                    </View>

                    <View style={styles.headerMessagesBtnsBox}>
                        <View style={styles.glassButtonClipper}>
                            <ButtonGlass
                                isInteractive={Platform.OS === "ios"}
                                tintColor=""
                                style={styles.headerBtn}
                            >
                                <Pressable style={styles.headerBtnPressable}>
                                    <SymbolView
                                        name="camera"
                                        size={24}
                                        tintColor="black"
                                        weight="regular"
                                    />
                                </Pressable>
                            </ButtonGlass>
                        </View>

                        <View style={styles.glassButtonClipper}>
                            <ButtonGlass
                                isInteractive={Platform.OS === "ios"}
                                tintColor=""
                                style={styles.headerBtn}
                            >
                                <Pressable style={styles.headerBtnPressable}>
                                    <SymbolView
                                        name="plus.message"
                                        size={24}
                                        tintColor="black"
                                        weight="regular"
                                    />
                                </Pressable>
                            </ButtonGlass>
                        </View>
                    </View>
                </View>

                <View style={styles.headerBottomSearch}>
                    <GenericInput
                        iconName="magnifyingglass"
                        label="Buscar por conversas"
                        value={search}
                        onValueChange={setSearch}
                    />
                </View>
            </View>

            {/* <Stories /> */}

            <View style={styles.sidebarWrapper}>
                <FlatList
                    data={filteredConversations}
                    extraData={{ conversations, storeConversations, activeMessages, typingMap }}
                    keyExtractor={(item, index) => item?.id ?? item?._id ?? `conversation-${index}`}
                    refreshing={refreshing}
                    onRefresh={refresh}
                    renderItem={({ item }) => (
                        <ConversationItem
                            conversation={item}
                            currentUserId={currentUserId}
                            typingMap={typingMap}
                            // selected={getConversationId(item) === getConversationId(selectedConversation)}
                            onPress={() => openConversation(item)}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateTitle}>Nenhuma conversa encontrada</Text>
                            <Text style={styles.emptyStateText}>Suas conversas aparecerão aqui</Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.conversationsListContent}
                />
            </View>
        </SafeAreaView>
    );
}
function getConversationId(conversation?: Conversation | null): string {
    return String(conversation?.id ?? conversation?._id ?? "");
}

function getMessageConversationId(message: any): string {
    return String(
        message?.conversationId ??
        message?.conversation?.id ??
        message?.conversation?._id ??
        message?.conversation_id ??
        ""
    );
}

function getMessageSenderId(message: any): string {
    return String(
        message?.senderId ??
        message?.sender?.id ??
        message?.sender?._id ??
        message?.userId ??
        ""
    );
}

function buildConversationWithLastMessage(conversation: Conversation, message: any, currentUserId?: string): Conversation {
    const conversationId = getConversationId(conversation);
    const senderId = getMessageSenderId(message);
    const messageCreatedAt = message?.createdAt ?? new Date().toISOString();
    const isMyMessage = Boolean(currentUserId && senderId === currentUserId);
    const previousUnread = conversation.unreadCount ?? conversation.unreadCounts ?? {};
    const currentUnread = typeof previousUnread === "number"
        ? previousUnread
        : Number(previousUnread?.[currentUserId ?? ""] ?? 0);
    const nextUnread = isMyMessage || !currentUserId
        ? currentUnread
        : currentUnread + 1;

    return {
        ...conversation,
        id: conversation.id ?? conversationId,
        lastMessage: {
            text: message?.text ?? "",
            senderId,
            createdAt: messageCreatedAt,
            type: message?.type ?? "text",
            mediaType: message?.mediaType ?? null,
            stickerUrl: message?.stickerUrl ?? null
        },
        unreadCount: typeof previousUnread === "number"
            ? nextUnread
            : {
                ...(previousUnread ?? {}),
                [currentUserId ?? ""]: nextUnread
            },
        unreadCounts: {
            ...(conversation.unreadCounts ?? {}),
            [currentUserId ?? ""]: nextUnread
        },
        updatedAt: messageCreatedAt
    };
}

function sortConversationsByLastActivity(conversations: Conversation[]): Conversation[] {
    return [...(conversations ?? [])].sort((firstConversation, secondConversation) => {
        const firstDate = new Date(firstConversation?.updatedAt ?? firstConversation?.lastMessage?.createdAt ?? 0).getTime();
        const secondDate = new Date(secondConversation?.updatedAt ?? secondConversation?.lastMessage?.createdAt ?? 0).getTime();

        return secondDate - firstDate;
    });
}

function getOtherUser(conversation?: Conversation | null, currentUserId?: string): ConversationUser | undefined {
    const participants = conversation?.participants ?? [];

    if (participants.length === 0) {
        return undefined;
    }

    if (!currentUserId) {
        return participants[0];
    }

    return participants.find(user => (user?.id ?? user?._id) !== currentUserId) ?? participants[0];
}

function getConversationName(conversation?: Conversation | null, currentUserId?: string): string {
    const participants = conversation?.participants ?? [];

    if (participants.length === 0) {
        return "";
    }

    if (participants.length === 2) {
        return getOtherUser(conversation, currentUserId)?.fullName ?? "";
    }

    return participants
        .map(user => user.fullName)
        .filter(Boolean)
        .join(", ");
}

function getConversationUsername(conversation?: Conversation | null, currentUserId?: string): string {
    const username = getOtherUser(conversation, currentUserId)?.username ?? "";

    if (!username) {
        return "";
    }

    return username.startsWith("@") ? username : `@${username}`;
}

function getLastMessagePreview(lastMessage?: Conversation["lastMessage"]): string {
    if (!lastMessage) {
        return "";
    }

    const type = lastMessage?.type ?? "text";
    const text = lastMessage?.text ?? "";
    const mediaType = lastMessage?.mediaType ?? "";

    if (type === "image" || mediaType.startsWith("image/") || text.startsWith("data:image")) {
        return "📷 Imagem";
    }

    if (type === "audio" || mediaType.startsWith("audio/") || text.startsWith("data:audio")) {
        return "🎙️ Áudio";
    }

    if (
        type === "sticker" ||
        lastMessage?.stickerUrl ||
        text.includes("/stickers/") ||
        text.includes("assets/stickers/")
    ) {
        return "Sticker";
    }

    return text;
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff"
    },
    headerMessages: {
        padding: 12
    },
    headerMessagesInside: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    headerMessagesTextWrapper: {
        fontSize: 26,
        color: "#1881e2",
        fontWeight: "700"
    },
    headerMessagesBtnsBox: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center"
    },
    headerBtn: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Platform.OS === "ios" ? "transparent" : "rgba(255, 255, 255, 0.18)"
    },
    headerBtnPressable: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center"
    },
    glassButtonClipper: {
        width: 46,
        height: 46,
        borderRadius: 23,
        overflow: "hidden",
        backgroundColor: Platform.OS === "ios" ? "rgba(151, 151, 151, 0.7)" : "rgba(255, 255, 255, 0.18)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255, 255, 255, 0.28)",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6
        },
        shadowOpacity: 0.22,
        shadowRadius: 14,
        elevation: 6
    },
    headerBottomSearch: {
        paddingVertical: 12
    },
    sidebarWrapper: {
        flex: 1,
        paddingTop: 8
    },
    conversationsListContent: {
        paddingHorizontal: 12,
        paddingBottom: 24
    },
    conversationItem: {
        minHeight: 74,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 18
    },
    conversationItemSelected: {
        backgroundColor: "rgba(24, 129, 226, 0.1)"
    },
    conversationAvatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: "#e9e9e9"
    },
    conversationContent: {
        flex: 1,
        minWidth: 0
    },
    conversationTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8
    },
    conversationName: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
        color: "#111"
    },
    conversationPreview: {
        marginTop: 4,
        fontSize: 13,
        color: "#6f6f6f"
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        paddingHorizontal: 6,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1881e2"
    },
    unreadBadgeText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "700"
    },
    emptyState: {
        paddingHorizontal: 18,
        paddingVertical: 32,
        alignItems: "center"
    },
    emptyStateTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#111"
    },
    emptyStateText: {
        marginTop: 4,
        fontSize: 13,
        color: "#777"
    }
});