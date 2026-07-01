import { Image, Platform, Pressable, StyleSheet, View } from "react-native"
import DumpLogo from "../assets/media/dump-logo.png"
import { GlassView } from 'expo-glass-effect';
import { SymbolView } from "expo-symbols";

const Header = () => {
    const ButtonGlass = Platform.OS === 'ios' ? GlassView : View;
    const buttonGlassTint = 'rgba(255, 255, 255, 0.34)';
    return (
        <View style={styles.header}>
            <View style={styles.glassButtonClipper}>
                <ButtonGlass
                    style={styles.glassButton}
                    isInteractive={Platform.OS === 'ios'}
                    tintColor={buttonGlassTint}
                >
                    <Pressable style={styles.buttonPressable}>
                        <SymbolView
                            name={'plus'}
                            size={24}
                            tintColor={'black'}
                            weight="regular"
                        />
                    </Pressable>
                </ButtonGlass>
            </View>
            <View style={styles.headerLogoContainer}>
                <Image style={styles.headerLogo} source={DumpLogo} />
                <SymbolView name="chevron.down" size={12} tintColor="#000" weight="semibold" />
            </View>
            <View style={styles.headerButtonsContainer}>
                <View style={styles.glassButtonClipper}>
                    <ButtonGlass
                        style={styles.glassButton}
                        isInteractive={Platform.OS === 'ios'}
                        tintColor={buttonGlassTint}
                    >
                        <Pressable style={styles.buttonPressable}>
                            <SymbolView
                                name={'bell'}
                                size={24}
                                tintColor={'black'}
                                weight="regular"
                            />
                        </Pressable>
                    </ButtonGlass>
                </View>
            </View>
        </View >
    )
}

export default Header;

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 18,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLogoContainer: {
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'row',
        alignItems: "center",
        gap: 4
    },
    headerLogo: {
        width: 110,
        height: 42,
    },
    headerButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    glassButtonClipper: {
        width: 46,
        height: 46,
        borderRadius: 84,
        overflow: 'hidden',
        backgroundColor: Platform.OS === 'ios' ? 'rgba(151, 151, 151, 0.7)' : 'rgba(255, 255, 255, 0.18)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.28)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.22,
        shadowRadius: 14,
        elevation: 6,
    },
    glassButton: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.18)',
    },
    buttonPressable: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        overflow: 'hidden',
    }
})