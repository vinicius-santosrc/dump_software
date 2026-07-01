import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StyleSheet} from 'react-native'
import { GlobalProvider } from '@/context/GlobalProvider'

const AppLayout = () => {
    return (
        <GlobalProvider>
            <GestureHandlerRootView>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{
                        title: "Página Principal",
                        headerShown: false,
                    }} />
                    <Stack.Screen name="(auth)" options={{
                        title: "Authenticação",
                        headerShown: false,
                    }} />
                    <Stack.Screen name="profile/[username]" options={{
                        headerShown: true,
                        headerTitle: '',
                        headerBackTitle: "Voltar",
                        headerTransparent: true,
                    }} />
                    <Stack.Screen name="post/[id]" options={{
                        headerShown: true,
                        headerTitle: 'Postagem',
                        headerBackTitle: "Voltar",
                    }} />
                    <Stack.Screen name="messages/index" options={{
                        headerShown: false,
                        headerTitle: 'Mensagens',
                        headerBackTitle: "Voltar",
                    }} />
                </Stack>

            </GestureHandlerRootView>
        </GlobalProvider>
    )
}

const styles = StyleSheet.create({
    title: {
        textAlign: "left",
        justifyContent: "left",

    }
})

export default AppLayout