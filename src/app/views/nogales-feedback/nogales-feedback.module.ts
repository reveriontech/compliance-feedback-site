import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NogalesFeedbackRoutingModule } from './nogales-feedback-routing.module';
import { NogalesFeedbackComponent } from './nogales-feedback.component';


@NgModule({
  declarations: [
    NogalesFeedbackComponent
  ],
  imports: [
    CommonModule,
    NogalesFeedbackRoutingModule,
    FormsModule
  ]
})
export class NogalesFeedbackModule { }
