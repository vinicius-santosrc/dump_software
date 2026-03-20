/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-17
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

export interface LoginDTO {
    user_or_cellphone_or_email: string;
    password: string;
}

export interface RegisterDTO {
    email_or_cellphone: string;
    password: string;
    fullName: string;
    dateOfBirth: string;
}