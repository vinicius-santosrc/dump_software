import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './shared/components/404-page/404.component';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./pages/pages-routing.module').then(m => m.PagesRoutingModule)
    },
    {
        path: 'pages/404',
        component: NotFoundComponent
    },
    {
        path: '**',
        redirectTo: 'pages/404'
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            onSameUrlNavigation: 'reload',
        })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }