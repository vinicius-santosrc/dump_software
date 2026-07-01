

/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-17
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@dump:access_token',
  REFRESH_TOKEN: '@dump:refresh_token',
  USER: '@dump:user'
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];