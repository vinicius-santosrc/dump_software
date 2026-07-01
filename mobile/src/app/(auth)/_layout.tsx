import React from 'react';
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useGlobal } from '../../context/GlobalProvider';

const AuthLayout = () => {
    const { isLoadingUser, isAuthenticated } = useGlobal();

    if (!isLoadingUser && isAuthenticated) return <Redirect href="/(tabs)" />;

    return (
        <>
            <Stack>
                <Stack.Screen
                    name='index'
                    options={{
                        title: 'Sign In',
                        headerShown: false,
                        headerBackButtonMenuEnabled: true,
                        headerBackVisible: true,
                    }}
                />
                <Stack.Screen
                    name="sign-in"
                    options={{
                        title: 'Sign In',
                        headerShown: true,
                        headerTitle: '',
                        headerBackButtonMenuEnabled: true,
                        headerBackVisible: true,
                        headerBackTitle: 'Voltar',
                        headerTintColor: '#7CC0FF',
                    }}
                />
                <Stack.Screen
                    name="sign-up"
                    options={{
                        title: 'Sign Up',
                        headerBackTitleVisible: true,
                        headerTitle: '',
                        headerShown: true,
                        headerBackButtonMenuEnabled: true,
                        headerBackVisible: true,
                        headerBackTitle: 'Voltar',
                        headerTintColor: '#7CC0FF',
                    }}
                />
            </Stack>

            <StatusBar style="dark" />
        </>
    );
};

export default AuthLayout;