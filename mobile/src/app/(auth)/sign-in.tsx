import { useState } from "react"
import { Image, StyleSheet, View, Text, TouchableOpacity } from "react-native"
import { ClipPath, Defs, G, Path, Rect, Svg } from "react-native-svg";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import DumpLogo from "../../assets/media/dump-logo.png";
import GenericButton from "@/components/ui/generic-button";
import GenericInput from "@/components/ui/generic-input";
import { login } from "@/services/auth.service";
import { useGlobal } from "@/context/GlobalProvider";

const SignInPage = () => {
    const [email, setEmail] = useState<string>();
    const [password, setPassword] = useState<string>();
    const global = useGlobal() as any;

    const handleLogin = async () => {
        try {
            const data = await login({
                user_or_cellphone_or_email: email ?? '',
                password: password ?? ""
            })
            if (data?.user) {
                global.setUser?.(data.user);
                global.setCurrentUser?.(data.user);
                global.updateUser?.(data.user);
            }

            if (data) {
                router.replace("/(tabs)");
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    return (
        <View style={styles.authPage}>
            <View style={styles.headerPage}>
                <Image
                    style={styles.imageDumpLogo}
                    source={DumpLogo}
                />
                <Text style={styles.textHeader}>Bem-vindo novamente! Faça sua autênticação para entrar no Dump.</Text>
            </View>
            <View style={styles.viewActionBtns}>
                <TouchableOpacity
                    style={styles.btnGoogle}
                >
                    <Svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <G clip-path="url(#clip0_307_59)">
                            <Path d="M10.1024 0.953755C7.20481 1.95894 4.70596 3.86682 2.97287 6.39715C1.23977 8.92748 0.363774 11.9469 0.473546 15.0119C0.583317 18.0769 1.67307 21.0259 3.58274 23.4257C5.49241 25.8256 8.12134 27.5498 11.0834 28.3452C13.4848 28.9648 16.0007 28.992 18.4149 28.4245C20.602 27.9332 22.624 26.8824 24.2829 25.3749C26.0095 23.7581 27.2627 21.7012 27.9079 19.4254C28.6092 16.9506 28.7339 14.348 28.2727 11.8174H14.7877V17.4113H22.5973C22.4412 18.3034 22.1067 19.1549 21.6139 19.9148C21.121 20.6747 20.48 21.3274 19.729 21.8338C18.7754 22.4646 17.7003 22.889 16.573 23.0799C15.4423 23.2901 14.2826 23.2901 13.1519 23.0799C12.0059 22.8429 10.9218 22.3699 9.96868 21.691C8.43746 20.6071 7.28772 19.0673 6.68353 17.2912C6.06912 15.4818 6.06912 13.5203 6.68353 11.7109C7.1136 10.4427 7.82457 9.28794 8.76337 8.3329C9.83771 7.2199 11.1979 6.42433 12.6946 6.03346C14.1913 5.64259 15.7668 5.67154 17.2481 6.11711C18.4053 6.47235 19.4636 7.093 20.3385 7.92961C21.219 7.05357 22.0981 6.17527 22.9756 5.29469C23.4288 4.82118 23.9227 4.37032 24.369 3.88547C23.0336 2.64272 21.466 1.67571 19.7562 1.03985C16.6425 -0.090721 13.2357 -0.121104 10.1024 0.953755Z" fill="white" />
                            <Path d="M10.1026 0.95388C13.2356 -0.12171 16.6425 -0.0921268 19.7564 1.03771C21.4666 1.67789 23.0334 2.64956 24.367 3.89693C23.9138 4.38177 23.4358 4.8349 22.9736 5.30615C22.0946 6.1837 21.2162 7.05823 20.3387 7.92974C19.4638 7.09313 18.4056 6.47247 17.2484 6.11724C15.7675 5.6701 14.1921 5.63948 12.695 6.02875C11.1978 6.41802 9.83687 7.21213 8.76135 8.32396C7.82255 9.279 7.11158 10.4337 6.6815 11.702L1.98486 8.06568C3.66598 4.73195 6.57672 2.1819 10.1026 0.95388Z" fill="#E33629" />
                            <Path d="M0.738451 11.668C0.990889 10.4169 1.40999 9.20534 1.98454 8.06567L6.68118 11.7111C6.06678 13.5204 6.06678 15.482 6.68118 17.2913C5.11639 18.4996 3.55085 19.714 1.98454 20.9344C0.546214 18.0714 0.107548 14.8093 0.738451 11.668Z" fill="#F8BD00" />
                            <Path d="M14.7876 11.8152H28.2726C28.7339 14.3457 28.6091 16.9483 27.9079 19.4232C27.2627 21.6989 26.0095 23.7558 24.2829 25.3727C22.7672 24.19 21.2447 23.0164 19.729 21.8338C20.4804 21.3269 21.1218 20.6735 21.6147 19.9128C22.1075 19.1521 22.4417 18.2997 22.5972 17.4067H14.7876C14.7854 15.5444 14.7876 13.6798 14.7876 11.8152Z" fill="#587DBD" />
                            <Path d="M1.98242 20.9344C3.54872 19.7261 5.11427 18.5117 6.67906 17.2913C7.28445 19.068 8.43584 20.6079 9.96875 21.6911C10.9249 22.3669 12.0113 22.836 13.1587 23.0686C14.2894 23.2788 15.4492 23.2788 16.5798 23.0686C17.7072 22.8778 18.7822 22.4533 19.7359 21.8225C21.2516 23.0052 22.7741 24.1788 24.2898 25.3614C22.6311 26.8697 20.6091 27.9213 18.4218 28.4132C16.0076 28.9808 13.4916 28.9536 11.0902 28.3339C9.19096 27.8268 7.41692 26.9328 5.8793 25.7081C4.25181 24.4159 2.92255 22.7876 1.98242 20.9344Z" fill="#319F43" />
                        </G>
                        <Defs>
                            <ClipPath id="clip0_307_59">
                                <Rect width="29" height="29" fill="white" />
                            </ClipPath>
                        </Defs>
                    </Svg>

                    <Text>Continuar com Google</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.spacer}>
                <Text>OU</Text>
            </View>
            <View style={styles.boxInpt}>
                <View style={styles.inputBox}>
                    <GenericInput
                        label="E-mail"
                        type="email"
                        value={email ?? ''}
                        required
                        iconName="envelope"
                        autoCapitalize="none"
                        onValueChange={setEmail}
                    />
                </View>
                <View style={styles.inputBox}>
                    <GenericInput
                        label="Senha"
                        type="password"
                        value={password ?? ''}
                        required
                        minLength={6}
                        iconName="lock"
                        onValueChange={setPassword}
                    />
                </View>
            </View>
            <View style={styles.buttonFinish}>
                <GenericButton label="Entrar" marginY={12} padding="12" onPress={handleLogin} />
                <View style={styles.bottomAccount}>
                    <Text style={styles.linkContent}>Ainda não tem uma conta? </Text>
                    <TouchableOpacity

                        onPress={() => router.replace("/sign-up")}
                    ><Text style={styles.linkPage}>Crie uma agora!</Text></TouchableOpacity>
                </View>
            </View>
            <StatusBar style="dark" />
        </View>
    )
}

const styles = StyleSheet.create({
    authPage: {
        backgroundColor: "#ffffff",
        height: "100%"
    },
    backButton: {
        marginTop: 50,
        paddingHorizontal: 20
    },
    headerPage: {
        marginTop: 40,
        flexDirection: "column",
        justifyContent: 'center',
        textAlign: "center",
        alignItems: 'center',
        paddingHorizontal: 20
    },
    imageDumpLogo: {
        width: 180,
        height: 62
    },
    textHeader: {
        fontSize: 16,
        textAlign: "center",
        marginVertical: 20
    },
    btnGoogle: {
        backgroundColor: "#F4F3F3",
        width: 300,
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderRadius: 17,
        justifyContent: "center",
        textAlign: "center",
    },
    viewActionBtns: {
        justifyContent: 'center',
        textAlign: "center",
        alignItems: "center"
    },
    spacer: {
        textAlign: "center",
        alignItems: "center",
        marginVertical: 20,
    },
    inputBox: {
        paddingHorizontal: 30,
        marginVertical: 10
    },
    buttonFinish: {
        marginHorizontal: 30
    },
    btnSign: {
        backgroundColor: "#7CC0FF",
        width: "100%",
        padding: 10,
        textAlign: "center",
        borderRadius: 20,
        color: "white",
        marginVertical: 10
    },
    linkContent: {
        color: 'lightGray',

    },
    bottomAccount: {
        flexDirection: "row",
        alignItems: "center",
        textAlign: "center",
        justifyContent: "center"
    },
    linkPage: {
        color: "#7CC0FF"
    }
})

export default SignInPage