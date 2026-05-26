import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SignInComponent } from "./auth/login/sign-in.component";
import { HomePage } from "./home/home.component";
import { authGuard, guestGuard } from "../core/guards/auth.guard";
import { ProfileComponent } from "./profile/profile.component";
import { PostPageComponent } from "./posts/postpage.component";
import { MessagesComponent } from "./messages/messages.component";
import { MemoriePageComponent } from "./memorie/memoriepage.component";
import { DumpPageComponent } from "./dump/dump-page.component";
import { ExplorePageComponent } from "./explore/explore-page.component";

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
                path: "messages",
                component: MessagesComponent,
                canActivate: [authGuard],
                children: [
                    {
                        path: 'inbox',
                        canActivate: [authGuard],
                        component: MessagesComponent,
                    }
                ]
            },
            {
                path: 'dumps',
                component: DumpPageComponent,
                canActivate: [authGuard]
            },
            {
                path: 'dumps/:postId',
                component: DumpPageComponent,
                canActivate: [authGuard]
            },
            {
                path: "explore",
                component: ExplorePageComponent
            },
            {
                path: ":username",
                component: ProfileComponent
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
            {
                path: "memories/:username/:memorieId",
                component: MemoriePageComponent
            },
            {
                path: "memories/:username",
                component: MemoriePageComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PagesRoutingModule { }