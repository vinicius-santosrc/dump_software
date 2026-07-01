/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-17
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { DeviceEventEmitter } from 'react-native';
import { api } from './api';

import { LoginDTO, RegisterDTO } from '@/models/auth/auth.dto';

const API = '/api/v1/auth';

export const AUTH_EVENTS = {
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout',
} as const;

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const;

function parseAuthError(error: any) {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Não foi possível concluir a operação.';

  return new Error(message);
}

export async function getStoredAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
}

export async function getStoredUser<T = unknown>(): Promise<T | null> {
  const storedUser = await SecureStore.getItemAsync(AUTH_STORAGE_KEYS.USER);

  if (!storedUser) {
    return null;
  }

  return JSON.parse(storedUser) as T;
}

export async function clearAuthStorage(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(AUTH_STORAGE_KEYS.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(AUTH_STORAGE_KEYS.REFRESH_TOKEN),
    SecureStore.deleteItemAsync(AUTH_STORAGE_KEYS.USER),
  ]);
  delete api.defaults.headers.common.Authorization;
}

export async function login(data: LoginDTO): Promise<any> {
  try {
    const response = await api.post(`${API}/login`, data);
    const authData = response.data;

    if (authData.accessToken) {
      await SecureStore.setItemAsync(AUTH_STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken);
      api.defaults.headers.common.Authorization = `Bearer ${authData.accessToken}`;
    }

    if (authData.refreshToken) {
      await SecureStore.setItemAsync(AUTH_STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
    }

    if (authData.user) {
      await SecureStore.setItemAsync(AUTH_STORAGE_KEYS.USER, JSON.stringify(authData.user));
    }

    DeviceEventEmitter.emit(AUTH_EVENTS.LOGIN, authData.user ?? null);

    return authData;
  } catch (error) {
    console.error(error)
    throw parseAuthError(error);
  }
}

export async function register(data: RegisterDTO): Promise<any> {
  try {
    const response = await api.post(`${API}/register`, data);
    return response.data;
  } catch (error) {
    throw parseAuthError(error);
  }
}

export async function forgotPassword(identifier: string): Promise<unknown> {
  try {
    const response = await api.post(`${API}/forgot-password`, {
      user_or_cellphone_or_email: identifier
    });

    return response.data;
  } catch (error) {
    throw parseAuthError(error);
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post(`${API}/logout`);
  } catch {
    // Mesmo se a API falhar, o app precisa limpar a sessão local.
  } finally {
    await clearAuthStorage();
    DeviceEventEmitter.emit(AUTH_EVENTS.LOGOUT);

    router.replace('/(auth)');
  }
}