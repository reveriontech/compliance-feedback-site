import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NogalesFeedbackModule } from "./views/nogales-feedback/nogales-feedback.module";

//const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['']);
//const redirectLoggedInToHome = () => redirectLoggedInTo(['customers']);

const routes: Routes = [
  {
    path: '',
    loadChildren: () => NogalesFeedbackModule,
  },
  { path: 'nogales-feedback', loadChildren: () => import('./views/nogales-feedback/nogales-feedback.module').then(m => m.NogalesFeedbackModule) },
];


routes.push({
  path: '**',
  redirectTo: '',
  pathMatch: 'full',
});

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
