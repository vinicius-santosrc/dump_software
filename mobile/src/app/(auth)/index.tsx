import GenericButton from "@/components/ui/generic-button";
import { Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import DumpLogo from "../../assets/media/dump-logo.png";
import AuthBackground from "../../assets/media/auth/auth-index.avif";
import { useRouter } from "expo-router";
export default function AuthPage() {
    const router = useRouter();
    return (
        <ImageBackground
            source={AuthBackground}
            style={styles.authContainer}
            resizeMode="cover"
        >
            <View style={styles.authCotainerInside}>
                <View style={styles.logoContainer}>
                    <Image style={styles.logoWrapper} source={DumpLogo} />
                </View>
                <Text style={styles.logoText}>Compartilhe sonhos e momentos.</Text>

                <View style={styles.buttonsContainer}>
                    <GenericButton
                        label='Criar conta'
                        variant='default'
                        width={161}
                        onPress={() => router.navigate('/(auth)/sign-up')}
                    />
                    <GenericButton
                        label='Entrar na sua conta'
                        variant='ghost'
                        width={161}
                        onPress={() => router.navigate('/(auth)/sign-in')}
                    />
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    logoContainer: {
        alignItems: 'baseline',
        justifyContent: 'center',
        marginTop: 80,
        marginBottom: 24,
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        gap: 12,
        marginTop: 45
    },
    authContainer: {
        flex: 1,
    },
    authCotainerInside: {
        width: '90%',
        marginTop: 62,
        alignSelf: 'center'
    },
    logoWrapper: {
        width: 210,
        height: 80,
    },
    logoText: {
        fontSize: 16,
        fontWeight: 600
    }
});