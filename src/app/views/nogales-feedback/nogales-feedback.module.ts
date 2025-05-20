import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NogalesFeedbackRoutingModule } from './nogales-feedback-routing.module';
import { NogalesFeedbackComponent } from './nogales-feedback.component';
import { MainComponent } from './components/main/main.component';


@NgModule({
  declarations: [
    NogalesFeedbackComponent,
    MainComponent
  ],
  imports: [
    CommonModule,
    NogalesFeedbackRoutingModule
  ]
})
export class NogalesFeedbackModule { }
