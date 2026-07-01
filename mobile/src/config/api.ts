

/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-17
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { environment } from "@/environments/environments";
import { environment_prod } from "@/environments/environments.prod";

const LOCAL_API_URL = environment.apiUrl;
const DEVICE_API_URL = 'http://192.168.15.10:5207';
// const PRODUCTION_API_URL = environment_prod.apiUrl;

export const API_CONFIG = {
  baseUrl: LOCAL_API_URL,
  deviceBaseUrl: DEVICE_API_URL,
  timeout: 15000
} as const;