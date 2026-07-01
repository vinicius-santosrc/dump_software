import { useEffect, useRef, useState } from "react";
import messagesService from "@/services/messages/messages.service";
import chatRealtimeService from "@/services/messages/chat-realtime.service";
import chatService from "@/services/messages/chat.service";
import { useInboxStore } from "@/store/inbox.store";
import { useGlobal } from "@/context/GlobalProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ChatBody from "@/components/messages/ChatBody";
import ChatHeader from "@/components/messages/ChatHeader";
import MessageComposer from "@/components/messages/MessageComposer";
import { getStoredAccessToken } from "@/services/auth.service";
import { API_CONFIG } from "@/config/api";


type ConversationUser = {
    id?: string;
    username?: string;
    fullName?: string;
    profilePictureUrl?: string;
};

type Conversation = {
    id?: string;
    participants?: ConversationUser[];
    lastMessage?: any;
};

type Message = {
    id?: string;
    tempId?: string;
    conversationId?: string;
    senderId?: string;
    sender?: ConversationUser;
    text?: string;
    type?: string;
    mediaType?: string;
    stickerUrl?: string;
    mediaUrl?: string;
    audioUrl?: string;
    createdAt?: string;
    readBy?: string[];
    status?: "sending" | "sent" | "error";
};


const PAGE_SIZE = 25;
const UPLOAD_API_URL = `${API_CONFIG.baseUrl}/api/v1/uploads`;


export default function MessagesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        conversationId?: string;
        conversation?: string;
    }>();

    const { user } = useGlobal() as any;
    const currentUser = user;
    const currentUserId = normalizeId(currentUser?.id);

    const listRef = useRef<any>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const joinedConversationIdRef = useRef<string | null>(null);

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingInitialMessages, setIsLoadingInitialMessages] = useState(false);
    const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [oldestMessageCursor, setOldestMessageCursor] = useState<string | null>(null);

    const activeMessages = useInboxStore(state => state.activeMessages);
    const typingMap = useInboxStore(state => state.typingMap);

    const conversationId = params.conversationId ?? getConversationId(conversation);

    useEffect(() => {
        const parsedConversation = parseConversationParam(params.conversation);
        setConversation(parsedConversation);
    }, [params.conversation]);

    useEffect(() => {
        if (!currentUserId) {
            return;
        }

        chatRealtimeService.init(currentUser).catch(error => {
            console.warn("[MESSAGES] realtime init failed", error?.message ?? error);
        });
    }, [currentUserId]);

    useEffect(() => {
        if (!conversationId) {
            return;
        }

        setMessages([]);
        setOldestMessageCursor(null);
        setHasMoreMessages(true);
        loadInitialMessages(conversationId);
    }, [conversationId]);

    useEffect(() => {
        if (!conversationId) {
            return;
        }

        if (joinedConversationIdRef.current === conversationId) {
            return;
        }

        joinedConversationIdRef.current = conversationId;

        chatService.joinConversation(conversationId).catch(error => {
            joinedConversationIdRef.current = null;
            console.warn("[MESSAGES] join conversation failed", {
                conversationId,
                error: error?.message ?? error
            });
        });

        chatRealtimeService.setActiveConversation(conversationId);

        return () => {
            chatRealtimeService.setActiveConversation(null as any);
        };
    }, [conversationId]);

    useEffect(() => {
        if (!conversationId || activeMessages.length === 0) {
            return;
        }

        const realtimeMessages = activeMessages.filter(message => getMessageConversationId(message) === conversationId);

        if (realtimeMessages.length === 0) {
            return;
        }

        setMessages(currentMessages => {
            const merged = normalizeMessages([...currentMessages, ...realtimeMessages]);
            messagesService.updateMessagesCache(conversationId, merged);
            return merged;
        });

        setTimeout(() => {
            listRef.current?.scrollToEnd({ animated: true });
        }, 50);
    }, [activeMessages, conversationId]);

    async function loadInitialMessages(activeConversationId: string) {
        try {
            setIsLoadingInitialMessages(true);

            const response = await messagesService.getMessages(activeConversationId, {
                forceRefresh: true,
                before: null,
                limit: PAGE_SIZE
            });

            const normalized = normalizeMessages(response ?? []);

            setMessages(normalized);
            setOldestMessageCursor(normalized[0]?.createdAt ?? null);
            setHasMoreMessages(normalized.length >= PAGE_SIZE);
            messagesService.updateMessagesCache(activeConversationId, normalized);

            setTimeout(() => {
                listRef.current?.scrollToEnd({ animated: false });
            }, 80);
        } finally {
            setIsLoadingInitialMessages(false);
        }
    }

    async function loadOlderMessages() {
        if (
            !conversationId ||
            !oldestMessageCursor ||
            isLoadingOlderMessages ||
            isLoadingInitialMessages ||
            !hasMoreMessages
        ) {
            return;
        }

        try {
            setIsLoadingOlderMessages(true);

            const olderMessages = await messagesService.getMessages(conversationId, {
                forceRefresh: true,
                before: oldestMessageCursor,
                limit: PAGE_SIZE
            });

            const normalizedOlder = normalizeMessages(olderMessages ?? []);

            if (normalizedOlder.length === 0) {
                setHasMoreMessages(false);
                return;
            }

            const merged = normalizeMessages([...normalizedOlder, ...messages]);

            setMessages(merged);
            setOldestMessageCursor(merged[0]?.createdAt ?? null);
            setHasMoreMessages(normalizedOlder.length >= PAGE_SIZE);
            messagesService.updateMessagesCache(conversationId, merged);
        } finally {
            setIsLoadingOlderMessages(false);
        }
    }

    function handleTyping() {
        if (!conversationId || !currentUserId) {
            return;
        }

        chatRealtimeService.typing(conversationId).catch(() => undefined);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            chatRealtimeService.stopTyping(conversationId).catch(() => undefined);
        }, 1200);
    }

    function sendMessage(textValue: string) {
        const text = textValue.trim();

        if (!text || !conversationId || !currentUserId) {
            return;
        }

        const tempId = `temp-${Date.now()}`;
        const tempMessage: Message = {
            id: tempId,
            tempId,
            conversationId,
            senderId: currentUserId,
            sender: currentUser,
            text,
            type: "text",
            createdAt: new Date().toISOString(),
            readBy: [currentUserId],
            status: "sending"
        };

        const nextMessages = normalizeMessages([...messages, tempMessage]);

        setMessages(nextMessages);
        messagesService.upsertMessageInCache(conversationId, tempMessage);
        chatRealtimeService.stopTyping(conversationId).catch(() => undefined);

        setTimeout(() => {
            listRef.current?.scrollToEnd({ animated: true });
        }, 50);

        chatService.sendMessage({
            conversationId,
            userId: currentUserId,
            text,
            tempId
        }).catch(error => {
            console.warn("[MESSAGES] send message failed", error?.message ?? error);
            setMessages(currentMessages => currentMessages.map(message => {
                if (message.id !== tempMessage.id) {
                    return message;
                }

                return {
                    ...message,
                    status: "error"
                };
            }));
        });
    }


    function handleComposerSend(payload: any) {
        if (!payload || !conversationId || !currentUserId) {
            return;
        }

        if (payload.type === "text" && payload.text) {
            sendMessage(payload.text);
            return;
        }

        if (payload.type === "audio") {
            sendAudioMessage(payload);
        }
    }

    async function sendAudioMessage(payload: any) {
        const audioUri = payload.audioUri || payload.mediaUrl;
        const audioBlob = payload.blob as Blob | undefined;

        if (!audioBlob || !conversationId || !currentUserId) {
            return;
        }

        const tempId = `temp-${Date.now()}`;
        const localMediaType = normalizeAudioMimeType(audioBlob.type || "audio/x-m4a");
        const tempMessage: Message = {
            id: tempId,
            tempId,
            conversationId,
            senderId: currentUserId,
            sender: currentUser,
            text: audioUri || "",
            type: "audio",
            mediaUrl: audioUri || "",
            audioUrl: audioUri || "",
            mediaType: localMediaType,
            createdAt: new Date().toISOString(),
            readBy: [currentUserId],
            status: "sending"
        };

        const nextMessages = normalizeMessages([...messages, tempMessage]);

        setMessages(nextMessages);
        messagesService.upsertMessageInCache(conversationId, tempMessage);
        chatRealtimeService.stopTyping(conversationId).catch(() => undefined);

        setTimeout(() => {
            listRef.current?.scrollToEnd({ animated: true });
        }, 50);

        try {
            const uploadedMedia = await uploadChatMedia({
                uri: audioUri,
                fileName: `audio-${Date.now()}.m4a`,
                mimeType: localMediaType,
                userId: currentUserId
            });

            console.warn("[MESSAGES] sending audio url", {
                conversationId,
                tempId,
                url: uploadedMedia.url,
                mimeType: uploadedMedia.mimeType,
                sizeBytes: uploadedMedia.sizeBytes
            });

            await chatService.sendMessage({
                conversationId,
                userId: currentUserId,
                text: uploadedMedia.url,
                type: "audio",
                mediaUrl: uploadedMedia.url,
                mediaType: uploadedMedia.mimeType,
                tempId
            } as any);

            setMessages(currentMessages => currentMessages.map(message => {
                if (message.id !== tempId) {
                    return message;
                }

                return {
                    ...message,
                    text: uploadedMedia.url,
                    mediaUrl: uploadedMedia.url,
                    audioUrl: uploadedMedia.url,
                    mediaType: uploadedMedia.mimeType,
                    status: "sent"
                };
            }));
        } catch (error: any) {
            console.warn("[MESSAGES] send audio message failed", error?.message ?? error);
            setMessages(currentMessages => currentMessages.map(message => {
                if (message.id !== tempMessage.id) {
                    return message;
                }

                return {
                    ...message,
                    status: "error"
                };
            }));
        }
    }


    function handleMicrophonePress() {
        console.log("[MESSAGES] microphone pressed");
    }

    function handleImagePress() {
        console.log("[MESSAGES] image pressed");
    }

    function handleStickerPress() {
        console.log("[MESSAGES] sticker pressed");
    }

    function handleAudioCallPress() {
        console.log("[MESSAGES] audio call pressed", conversationId);
    }

    function handleVideoCallPress() {
        console.log("[MESSAGES] video call pressed", conversationId);
    }


    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']} >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ChatHeader
                    conversation={conversation}
                    currentUser={currentUser}
                    onBack={() => router.back()}
                    onAudioCallPress={handleAudioCallPress}
                    onVideoCallPress={handleVideoCallPress}
                />

                {isLoadingInitialMessages ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator />
                    </View>
                ) : (
                    <ChatBody
                        ref={listRef}
                        messages={messages}
                        conversation={conversation}
                        currentUser={currentUser}
                        isLoadingOlderMessages={isLoadingOlderMessages}
                        onLoadOlderMessages={loadOlderMessages}
                    />
                )}

                {isOtherUserTyping(typingMap, conversationId, currentUserId) && (
                    <Text style={styles.typingText}>Digitando...</Text>
                )}

                <MessageComposer
                    onSendText={sendMessage}
                    onSend={handleComposerSend}
                    onTyping={handleTyping}
                    onStopTyping={() => conversationId && chatRealtimeService.stopTyping(conversationId).catch(() => undefined)}
                    onToggleMicrophone={handleMicrophonePress}
                    onOpenImagePicker={handleImagePress}
                    onOpenStickerPicker={handleStickerPress}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


function parseConversationParam(value?: string): Conversation | null {
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function normalizeId(value: any): string {
    return String(value ?? "");
}

function getConversationId(conversation?: Conversation | null): string {
    return normalizeId(conversation?.id ?? "");
}

function getMessageConversationId(message: any): string {
    return normalizeId(
        message?.conversationId ??
        message?.conversation?.id ??
        ""
    );
}

function getSenderId(message: any): string {
    return normalizeId(
        message?.senderId ??
        message?.sender?.id ??
        message?.userId ??
        ""
    );
}

function isOtherUserTyping(typingMap: Record<string, string[]>, conversationId: string, currentUserId: string): boolean {
    if (!conversationId || !currentUserId) {
        return false;
    }

    const typingUsers = typingMap?.[conversationId] ?? [];
    return typingUsers.some(userId => normalizeId(userId) !== normalizeId(currentUserId));
}


function normalizeMessages(messages: Message[]): Message[] {
    const uniqueMessages = new Map<string, Message>();

    messages.forEach(message => {
        const tempId = normalizeId(message?.tempId);

        if (tempId) {
            const tempKey = `id:${tempId}`;
            const tempIdKey = `temp:${tempId}`;
            const existingTempMessage = uniqueMessages.get(tempKey) ?? uniqueMessages.get(tempIdKey);

            if (existingTempMessage) {
                uniqueMessages.delete(tempKey);
                uniqueMessages.delete(tempIdKey);
                uniqueMessages.set(tempIdKey, {
                    ...existingTempMessage,
                    ...message,
                    status: message.status ?? "sent"
                });
                return;
            }

            uniqueMessages.set(tempIdKey, message);
            return;
        }

        const key = getMessageUniqueKey(message);
        uniqueMessages.set(key, message);
    });

    return Array.from(uniqueMessages.values()).sort((firstMessage, secondMessage) => {
        const firstDate = new Date(firstMessage?.createdAt ?? 0).getTime();
        const secondDate = new Date(secondMessage?.createdAt ?? 0).getTime();

        return firstDate - secondDate;
    });
}


function getMessageUniqueKey(message: Message): string {
    const tempId = normalizeId(message?.tempId);

    if (tempId) {
        return `temp:${tempId}`;
    }

    const id = message?.id;

    if (id) {
        return `id:${id}`;
    }

    const conversationId = getMessageConversationId(message);
    const senderId = getSenderId(message);
    const type = message?.type ?? "text";
    const text = message?.text ?? "";
    const createdAt = new Date(message?.createdAt ?? 0).getTime();

    return `message:${conversationId}:${senderId}:${type}:${text}:${createdAt}`;
}

// ---- Upload helpers

type UploadedMediaResponse = {
    id?: string;
    url: string;
    type?: string;
    mimeType?: string;
    fileName?: string;
    sizeBytes?: number;
};

async function uploadChatMedia({
    uri,
    fileName,
    mimeType,
    userId
}: {
    uri?: string;
    fileName: string;
    mimeType: string;
    userId: string;
}): Promise<UploadedMediaResponse> {
    if (!uri) {
        throw new Error("Upload uri is required");
    }

    const formData = new FormData();

    formData.append("userId", userId);
    formData.append("file", {
        uri,
        name: fileName,
        type: mimeType
    } as any);

    const accessToken = await getStoredAccessToken();

    const response = await fetch(UPLOAD_API_URL, {
        method: "POST",
        body: formData,
        headers: {
            Accept: "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        }
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();

    if (!result?.url) {
        throw new Error("Upload response without url");
    }

    return result;
}

function normalizeAudioMimeType(value?: string): string {
    const mimeType = String(value ?? "").trim().toLowerCase();

    if (!mimeType) {
        return "audio/m4a";
    }

    if (mimeType === "audio/x-m4a") {
        return "audio/m4a";
    }

    if (mimeType.includes("mpeg") || mimeType.includes("mp4")) {
        return "audio/m4a";
    }

    return mimeType;
}


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff"
    },
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    loadingBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    typingText: {
        paddingHorizontal: 18,
        paddingBottom: 4,
        fontSize: 12,
        color: "#777"
    }
});
