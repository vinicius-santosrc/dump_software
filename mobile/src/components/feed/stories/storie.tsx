import { GlassView } from "expo-glass-effect";
import { SymbolView } from "expo-symbols";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useGlobal } from "@/context/GlobalProvider";
import { User } from "@/models/user/user.model";

const MyStorieCard = () => {
    const { user } = useGlobal();
    const CardGlass = Platform.OS === 'ios' ? GlassView : View;
    const glassTint = 'rgba(255, 255, 255, 0.34)';
    return (
        <Pressable style={styles.containerStory}>
            <View style={styles.storyGlassClipper}>
                <CardGlass
                    style={styles.storyGlass}
                    isInteractive={Platform.OS === 'ios'}
                    tintColor={glassTint}
                >
                    <View style={styles.containerInside}>
                        <SymbolView
                            name="plus"
                            size={28}
                            tintColor="#030303"
                            weight="regular"
                        />
                    </View>
                </CardGlass>
            </View>

            <View style={styles.containerUser}>
                <Image style={styles.imageContainer} source={{ uri: user?.thumbnail }} />
                <Text style={styles.textContainer}>Adicionar memoria</Text>
            </View>
        </Pressable>
    )
}

const Storie = (user: User | any) => {
    const CardGlass = Platform.OS === 'ios' ? GlassView : View;
    const glassTint = 'rgba(255, 255, 255, 0.34)';
    return (
        <View>
            <Pressable style={styles.containerStory}>
                <View style={styles.storyGlassClipper}>
                    <CardGlass
                        style={styles.storyGlass}
                        isInteractive={Platform.OS === 'ios'}
                        tintColor={glassTint}
                    >
                        <View style={styles.containerInside}>
                            <SymbolView
                                name="plus.circle"
                                size={28}
                                tintColor="#030303"
                                weight="regular"
                            />
                        </View>
                    </CardGlass>
                </View>

                <View style={styles.containerUser}>
                    <Image style={styles.imageContainer} source={{ uri: user?.thumbnail }} />
                </View>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    containerStory: {
        width: 80,
        height: 120,
        position: 'relative',
        marginBottom: 48,
        alignItems: 'center'
    },
    storyGlassClipper: {
        width: 80,
        height: 120,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.18)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.28)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.14,
        shadowRadius: 14,
        elevation: 6
    },
    storyGlass: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.18)'
    },
    containerInside: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: 8
    },
    containerUser: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: -42,
    },
    imageContainer: {
        width: 32,
        height: 32,
        alignSelf: 'center',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#ffffff'
    },
    textContainer: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4
    }
})

export { Storie, MyStorieCard }