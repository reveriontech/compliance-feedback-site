import { Component, HostListener, Inject } from '@angular/core';
import { MailSendData, MailService } from 'ejflab-front-lib';

@Component({
  selector: 'app-nogales-feedback',
  templateUrl: './nogales-feedback.component.html',
  styleUrls: ['./scss/nogales-feedback.component.scss']
})
export class NogalesFeedbackComponent {
  submitted = false;
  buttonText = 'Submit';
  isDropdownOpen = false;
  isLoading = false;
  formData = {
    department: '',
    message: ''
  };

  constructor(
    public mailService: MailService,
    @Inject('emailRecipient') public emailRecipient: string,
  ) {

  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select')) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectDepartment(department: string) {
    this.formData.department = department;
    this.isDropdownOpen = false;
  }

  async onSubmit() {
    this.isLoading = true;
    this.buttonText = 'Submitting...';

    const request: MailSendData = {
      to: [this.emailRecipient],
      template: "/assets/templates/mails/test.html",
      subject: "This is my subject",
      params: {
        data: {
          title: "This is my title",
          content: "This is my content"
        }
      },
      //replyTo: this.renderingData.providerEmail,
    };

    await this.mailService.send(request);

    setTimeout(() => {
      this.buttonText = 'Submit';
      this.submitted = true;
      this.isLoading = false;
    }, 2000);
  }

  resetForm() {
    this.formData.department = '';
    this.formData.message = '';
    this.submitted = false;
    this.buttonText = 'Submit';
    this.isLoading = false;
  }
}
