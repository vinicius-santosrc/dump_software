/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-15
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { Component, OnInit } from "@angular/core";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { BasicInputComponent } from "../../../shared/components/basic-input-component/basic-input.component";
import { FooterAuthComponent } from "../../../shared/components/footer-auth-component/footer-auth-component";
import { FormsModule } from '@angular/forms';
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth/auth.service";

@Component({
    selector: "app-sign-in",
    templateUrl: "./sign-in.component.html",
    imports: [BasicInputComponent, TranslateModule, FooterAuthComponent, FormsModule],
    styleUrl: "./sign-in.component.scss"
})

export class SignInComponent implements OnInit {
    public logo: string = "assets/app/media/anim/icon/splash-screen.svg";
    public googleIcon: string = "assets/app/media/anim/icon/google-icon.svg";
    public pageType: 'signin' | 'signup' | 'forgotpassword' = "signin";
    public router;

    constructor(
        public translateService: TranslateService,
        public angularRouter: Router,
        public authService: AuthService
    ) {
        this.router = angularRouter;
    }

    public sideImage: string = '';

    inputs: any = {
        user_or_cellphone_or_email: '',
        email_or_cellphone: '',
        password: '',
        full_name: '',
        date_of_birth: ''
    }

    fields: {
        name: string;
        label: string;
        type: 'text' | 'email' | 'password' | 'date' | 'tel';
        value: string;
        required: boolean;
        maxLength?: number;
        minLength?: number;
        regex?: string;
    }[] = [];

    ngOnInit(): void {
        switch (globalThis.location.href) {
            case globalThis.location.origin + '/accounts/signin':
                this.pageType = 'signin';
                break;
            case globalThis.location.origin + '/accounts/signup':
                this.pageType = 'signup';
                break;
            default:
                this.pageType = 'forgotpassword';
        }

        this.sideImage = this.pageType === 'signin'
            ? "assets/app/media/auth/login-image.webp"
            : "assets/app/media/auth/signup-image.webp";

        this.fields = this.getFormFields();
    }

    private getFormFields() {
        if (this.pageType === 'signin') {
            return [
                {
                    name: 'user_or_cellphone_or_email',
                    label: 'AUTH.INPUTS.EMAIL',
                    type: 'email' as const,
                    value: this.inputs.user_or_cellphone_or_email,
                    required: true,
                    maxLength: 120,
                },
                {
                    name: 'password',
                    label: 'AUTH.INPUTS.PASSWORD',
                    type: 'password' as const,
                    value: this.inputs.password,
                    required: true,
                    maxLength: 30,
                    minLength: 5,
                }
            ];
        } else if (this.pageType === 'signup') {
            return [
                {
                    name: 'email_or_cellphone',
                    label: 'AUTH.INPUTS.EMAIL_SIGN_UP',
                    type: 'email' as const,
                    value: this.inputs.email_or_cellphone,
                    required: true,
                    maxLength: 100,
                },
                {
                    name: 'full_name',
                    label: 'AUTH.INPUTS.FULL_NAME',
                    type: 'text' as const,
                    value: this.inputs.full_name,
                    required: true,
                    maxLength: 255,
                },
                {
                    name: 'date_of_birth',
                    label: 'AUTH.INPUTS.DATE_OF_BIRTH',
                    type: 'date' as const,
                    value: this.inputs.date_of_birth,
                    required: true
                },
                {
                    name: 'password',
                    label: 'AUTH.INPUTS.PASSWORD',
                    type: 'password' as const,
                    value: this.inputs.password,
                    required: true,
                    maxLength: 30,
                    minLength: 5,
                }
            ];
        } else {
            return [
                {
                    name: 'email_or_cellphone',
                    label: 'AUTH.INPUTS.EMAIL',
                    type: 'email' as const,
                    value: this.inputs.email_or_cellphone,
                    required: true,
                    maxLength: 100,
                }
            ];
        }
    }

    isButtonDisabled(): boolean {
        // iterate over configured fields
        for (const field of this.fields) {
            const value = this.inputs[field.name] || '';

            // required
            if (field.required && !value) {
                return true;
            }

            // maxLength
            if (field.maxLength && value.length > field.maxLength) {
                return true;
            }

            // minLength
            if (field.minLength && value.length < field.minLength) {
                return true;
            }
        }

        return false;
    }

    handlePressSign(): void {
        if (this.pageType === 'signin') {
            // Lógica para login
            this.authService.login({
                user_or_cellphone_or_email: this.inputs.user_or_cellphone_or_email,
                password: this.inputs.password
            }).subscribe({
                next: (res) => {
                    // this.authService.setToken(res.token);
                    console.log('Login sucesso', res);
                },
                error: (err) => {
                    console.error('Erro', err);
                }
            });
        } else if(this.pageType === 'signup') {
            this.authService.register({
                email_or_cellphone: this.inputs.email_or_cellphone,
                password: this.inputs.password,
                fullName: this.inputs.full_name,
                dateOfBirth: this.inputs.date_of_birth
            }).subscribe({
                next: (res) => {
                    // this.authService.setToken(res.token);
                },
                error: (err) => {
                    console.error('Erro', err);
                }
            });
            // Lógica para cadastro
        }
        else {
            //Logica forgot password
        }
    }

    redirectPage(forgot?: boolean): void {
        if (forgot) {
            this.router.navigate(['/accounts/forgotpassword']);
            return;
        }
        if (this.pageType === 'signin') {
            this.router.navigate(['/accounts/signup']);
        } else {
            this.router.navigate(['/accounts/signin']);
        }
    }
}