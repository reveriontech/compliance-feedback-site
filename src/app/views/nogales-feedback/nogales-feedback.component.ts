import { Component, HostListener, Inject } from '@angular/core';
import { MailSendData, MailService } from 'ejflab-front-lib';

@Component({
  selector: 'app-nogales-feedback',
  templateUrl: './nogales-feedback.component.html',
  styleUrls: ['./scss/_nogales-feedback.component.scss']
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

    // Format date as dd-MMM-yyyy
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    // Format message content to preserve line breaks
    const formattedMessage = this.formData.message.replace(/\n/g, '<br>');

        const request: MailSendData = {
          to: [this.emailRecipient],
          template: "/assets/templates/mails/test.html",
          subject: `Feedback from ${this.formData.department} - ${formattedDate}`,
          params: {
            data: {
              title: `Feedback for ${this.formData.department}`,
              content: formattedMessage
            }
          },
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
