import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { GlassView } from 'expo-glass-effect';

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

type ChatHeaderProps = {
    conversation?: Conversation | null;
    currentUser?: any;
    onBack?: () => void;
    onAudioCallPress?: () => void;
    onVideoCallPress?: () => void;
};

const DEFAULT_AVATAR = '';

export default function ChatHeader({
    conversation,
    currentUser,
    onBack,
    onAudioCallPress,
    onVideoCallPress
}: ChatHeaderProps) {
    const currentUserId = normalizeId(currentUser?.id ?? currentUser?._id);
    const conversationName = getConversationName(conversation, currentUserId);
    const conversationUsername = getConversationUsername(conversation, currentUserId);
    const conversationAvatar = getConversationAvatar(conversation, currentUserId);

    const ButtonGlass = Platform.OS === 'ios' ? GlassView : View;
    const buttonGlassTint = 'rgba(255, 255, 255, 0.34)';

    return (
        <View style={styles.header}>
            <View style={styles.headerUserBox}>
                <GlassView
                    style={styles.glassButton}
                    isInteractive={Platform.OS === 'ios'}
                    glassEffectStyle={Platform.OS === 'ios' ? 'regular' : undefined}
                    tintColor={buttonGlassTint}
                >
                    <Pressable style={styles.backButton} onPress={onBack}>
                        <SymbolView
                            name="chevron.left"
                            size={22}
                            tintColor="#111"
                            weight="semibold"
                        />
                    </Pressable>
                </GlassView>

                <GlassView
                    style={[styles.glassButton, { width: '75%', paddingVertical: 4, paddingHorizontal: 4, gap: 4 }]}
                    isInteractive={Platform.OS === 'ios'}
                    glassEffectStyle={Platform.OS === 'ios' ? 'regular' : undefined}
                    tintColor={buttonGlassTint}
                >

                    <Image
                        source={conversationAvatar ? { uri: conversationAvatar } : { uri: DEFAULT_AVATAR }}
                        style={styles.avatar}
                    />

                    <View style={styles.headerTextBox}>
                        <Text style={styles.name} numberOfLines={1}>
                            {conversationName || 'Conversa'}
                        </Text>
                        <Text style={styles.username} numberOfLines={1}>
                            {conversationUsername}
                        </Text>
                    </View>
                </GlassView>
            </View>

            <View style={styles.headerActions}>
                <GlassView
                    style={styles.glassButton}
                    isInteractive={Platform.OS === 'ios'}
                    glassEffectStyle={Platform.OS === 'ios' ? 'regular' : undefined}
                    tintColor={buttonGlassTint}
                >
                    <Pressable style={styles.iconButton} onPress={onAudioCallPress}>
                        <SymbolView name="phone" size={22} tintColor="#111" weight="regular" />
                    </Pressable>
                </GlassView>
                <GlassView
                    style={styles.glassButton}
                    isInteractive={Platform.OS === 'ios'}
                    glassEffectStyle={Platform.OS === 'ios' ? 'regular' : undefined}
                    tintColor={buttonGlassTint}
                >
                    <Pressable style={styles.iconButton} onPress={onVideoCallPress}>
                        <SymbolView name="video" size={23} tintColor="#111" weight="regular" />
                    </Pressable>
                </GlassView>
            </View>
        </View>
    );
}

function normalizeId(value: any): string {
    return String(value ?? '');
}

function getOtherUser(conversation?: Conversation | null, currentUserId?: string): ConversationUser | undefined {
    const participants = conversation?.participants ?? [];

    if (participants.length === 0) {
        return undefined;
    }

    if (!currentUserId) {
        return participants[0];
    }

    return participants.find(user => normalizeId(user.id) !== normalizeId(currentUserId)) ?? participants[0];
}

function getConversationName(conversation?: Conversation | null, currentUserId?: string): string {
    const participants = conversation?.participants ?? [];

    if (participants.length === 0) {
        return '';
    }

    if (participants.length === 2) {
        return getOtherUser(conversation, currentUserId)?.fullName ?? '';
    }

    return participants
        .map(user => user.fullName)
        .filter(Boolean)
        .join(', ');
}

function getConversationUsername(conversation?: Conversation | null, currentUserId?: string): string {
    const username = getOtherUser(conversation, currentUserId)?.username ?? '';

    if (!username) {
        return '';
    }

    return username.startsWith('@') ? username : `@${username}`;
}

function getConversationAvatar(conversation?: Conversation | null, currentUserId?: string): string | undefined {
    return getOtherUser(conversation, currentUserId)?.profilePictureUrl;
}

const styles = StyleSheet.create({
    glassButton: {
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.18)',
    },
    header: {
        marginTop: -40,
        zIndex: 10,
        position: "absolute",
        top: 24,
        paddingTop: 74,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.84)'
        // borderBottomWidth: StyleSheet.hairlineWidth,
        // borderBottomColor: 'rgba(0,0,0,0.12)',
    },
    headerUserBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        minWidth: 0,
    },
    backButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e9e9e9'
    },
    headerTextBox: {
        flex: 1,
        minWidth: 0
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111'
    },
    username: {
        marginTop: 2,
        fontSize: 12,
        color: '#666'
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    iconButton: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center'
    }
});