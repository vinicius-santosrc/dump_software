import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { authGuard, guestGuard } from "../core/guards/auth.guard";

export const routes: Routes = [
    {
        path: "",
        children: [
            {
                path: "",
                loadComponent: () => import('./home/home.component').then(m => m.HomePage),
                canActivate: [authGuard],
                pathMatch: "full",
            },
            {
                path: "p",
                children: [
                    {
                        path: ":postId",
                        loadComponent: () => import('./posts/postpage.component').then(m => m.PostPageComponent),
                    }
                ]
            },
            {
                path: "messages",
                loadComponent: () => import('./messages/messages.component').then(m => m.MessagesComponent),
                canActivate: [authGuard],
                children: [
                    {
                        path: 'inbox',
                        canActivate: [authGuard],
                        loadComponent: () => import('./messages/messages.component').then(m => m.MessagesComponent),
                    }
                ]
            },
            {
                path: "activity",
                loadComponent: () => import('../layout/sidebar/notifications-sidebar/notifications-sidebar.component').then(m => m.NotificationsSidebarComponent),
                canActivate: [authGuard],
                children: [
                    {
                        path: 'inbox',
                        canActivate: [authGuard],
                        loadComponent: () => import('../layout/sidebar/notifications-sidebar/notifications-sidebar.component').then(m => m.NotificationsSidebarComponent),
                    }
                ]
            },
            {
                path: 'dumps',
                loadComponent: () => import('./dump/dump-page.component').then(m => m.DumpPageComponent),
                canActivate: [authGuard]
            },
            {
                path: 'dumps/:postId',
                loadComponent: () => import('./dump/dump-page.component').then(m => m.DumpPageComponent),
                canActivate: [authGuard]
            },
            {
                path: "explore",
                loadComponent: () => import('./explore/explore-page.component').then(m => m.ExplorePageComponent)
            },
            {
                path: ":username",
                loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
            },
            {
                path: "accounts",
                canActivate: [guestGuard],
                children: [
                    {
                        path: "signin",
                        loadComponent: () => import('./auth/login/sign-in.component').then(m => m.SignInComponent),
                        pathMatch: "full",
                    },
                    {
                        path: "signup",
                        loadComponent: () => import('./auth/login/sign-in.component').then(m => m.SignInComponent),
                        pathMatch: "full",
                    },
                    {
                        path: "forgotpassword",
                        loadComponent: () => import('./auth/login/sign-in.component').then(m => m.SignInComponent),
                        pathMatch: "full",
                    }
                ]
            },
            {
                path: "memories/:username/:memorieId",
                loadComponent: () => import('./memorie/memoriepage.component').then(m => m.MemoriePageComponent)
            },
            {
                path: "memories/:username",
                loadComponent: () => import('./memorie/memoriepage.component').then(m => m.MemoriePageComponent)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PagesRoutingModule { }