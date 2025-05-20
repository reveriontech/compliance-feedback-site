import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NogalesFeedbackComponent } from './nogales-feedback.component';

const routes: Routes = [{ path: '', component: NogalesFeedbackComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NogalesFeedbackRoutingModule { }
