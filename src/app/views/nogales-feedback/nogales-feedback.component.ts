import { Component } from '@angular/core';

@Component({
  selector: 'app-nogales-feedback',
  templateUrl: './nogales-feedback.component.html',
  styleUrls: ['./scss/nogales-feedback.component.scss']
})
export class NogalesFeedbackComponent {
  submitted = false;
  buttonText = 'Submit';
  formData = {
    department: '',
    message: ''
  };

  onSubmit() {
    this.buttonText = 'Submitted!';
    setTimeout(() => {
      this.buttonText = 'Submit';
      this.submitted = true;
    }, 2000);
  }

  resetForm() {
    this.formData.department = '';
    this.formData.message = '';
    this.submitted = false;
    this.buttonText = 'Submit';
  }
}