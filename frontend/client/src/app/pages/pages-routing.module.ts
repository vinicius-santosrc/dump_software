import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SignInComponent } from "./auth/login/sign-in.component";
import { HomePage } from "./home/home.component";
import { authGuard, guestGuard } from "../core/guards/auth.guard";
import { ProfileComponent } from "./profile/profile.component";
import { PostPageComponent } from "./posts/postpage.component";
import { MessagesComponent } from "./messages/messages.component";

export const routes: Routes = [
    {
        path: "",
        children: [
            {
                path: "",
                component: HomePage,
                canActivate: [authGuard],
                pathMatch: "full",
            },
            {
                path: "p",
                children: [ 
                    {
                        path: ":postId",
                        component: PostPageComponent,
                    }
                ]
            },
            {
                path: ":username",
                component: ProfileComponent
            },
            {
                path: "messages",
                component: MessagesComponent,
                children: [
                    {
                        path: 'inbox',
                        component: MessagesComponent,
                    }
                ]
            },
            {
                path: "accounts",
                canActivate: [guestGuard],
                children: [
                    {
                        path: "signin",
                        component: SignInComponent,
                        pathMatch: "full",
                    },
                    {
                        path: "signup",
                        component: SignInComponent,
                        pathMatch: "full",
                    },
                    {
                        path: "forgotpassword",
                        component: SignInComponent,
                        pathMatch: "full",
                    }
                ]
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PagesRoutingModule { }