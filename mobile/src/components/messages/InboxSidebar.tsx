import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useInboxStore } from '../../store/inbox.store';
import ConversationItem from './ConversationItem';

type InboxSidebarProps = {
    currentUser: any;
    onSelectConversation: (conversation: Conversation) => void;
};

export default function InboxSidebar({
    currentUser,
    onSelectConversation
}: InboxSidebarProps) {
    const conversations = useInboxStore(state => state.conversations);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Conversas</Text>

                <Pressable style={styles.newButton}>
                    <Text style={styles.newButtonText}>+</Text>
                </Pressable>
            </View>

            <FlatList
                data={conversations}
                keyExtractor={item => item.id ?? item._id ?? String(Math.random())}
                renderItem={({ item }) => (
                    <ConversationItem
                        conversation={item}
                        currentUser={currentUser}
                        onPress={() => onSelectConversation(item)}
                    />
                )}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 360,
        maxWidth: '100%',
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: '#ddd',
        backgroundColor: '#fff'
    },
    header: {
        height: 64,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    title: {
        fontSize: 22,
        fontWeight: '700'
    },
    newButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f1f1'
    },
    newButtonText: {
        fontSize: 24
    },
    listContent: {
        paddingBottom: 24
    }
});