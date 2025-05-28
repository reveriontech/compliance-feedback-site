import { Component, HostListener, Inject, OnInit, NgZone } from '@angular/core';
import { MailSendData, MailService } from 'ejflab-front-lib';

@Component({
  selector: 'app-nogales-feedback',
  templateUrl: './nogales-feedback.component.html',
  styleUrls: ['./scss/_nogales-feedback.component.scss']
})
export class NogalesFeedbackComponent implements OnInit {
  submitted = false;
  buttonText = 'Submit';
  isDropdownOpen = false;
  isLoading = false;
  formData = {
    department: '',
    message: ''
  };
  countdown: number = 300;
  showNewSubmissionButton = false;
  intervalId: any;
  private readonly TIMER_KEY = 'nogales_feedback_timer';
  private readonly SUBMITTED_KEY = 'nogales_feedback_submitted';

  ngOnInit(): void {
    const savedCountdown = localStorage.getItem(this.TIMER_KEY);
    const savedSubmitted = localStorage.getItem(this.SUBMITTED_KEY);

    if (savedCountdown !== null) {
      this.countdown = parseInt(savedCountdown, 10);
    } else {
      this.countdown = 300;
    }

    this.submitted = savedSubmitted === 'true';

    this.startCountdown();
  }

  startCountdown(): void {
    this.showNewSubmissionButton = false;
    // Don't reset countdown here, it's loaded from ngOnInit

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.countdown--;
        localStorage.setItem(this.TIMER_KEY, this.countdown.toString());

        if (this.countdown <= 0) {
          clearInterval(this.intervalId);
          localStorage.removeItem(this.TIMER_KEY);
          localStorage.removeItem(this.SUBMITTED_KEY);
          this.ngZone.run(() => {
            this.showNewSubmissionButton = true;
          });
        } else {
          this.ngZone.run(() => {});
        }
      }, 1000);
    });
  }

  // This part is for countdown timer
   formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  constructor(
    public mailService: MailService,
    @Inject('emailRecipient') public emailRecipient: string,
    private ngZone: NgZone  // Add NgZone to constructor
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select')) {
      this.isDropdownOpen = false;
    }
  }

  // This part is for dropdown department
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectDepartment(department: string) {
    this.formData.department = department;
    this.isDropdownOpen = false;
  }


  // This part is for submit
  async onSubmit() {
    this.isLoading = true;
    this.buttonText = 'Submitting...';

    // This part is for date formatting
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    // Format message content to preserve line breaks
    const formattedMessage = this.formData.message.replace(/\n/g, '<br>');

    // Generate unique submission ID temporary..
    const submissionId = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Format date and time for email
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedDateTime = `${formattedDate} at ${hours}:${minutes}`;

    const request: MailSendData = {
      to: [this.emailRecipient],
      template: "/assets/templates/mails/test.html",
      subject: ` ${this.formData.department} - ${formattedDate}`,
      params: {
        data: {
          title: `${this.formData.department}`,
          content: formattedMessage,
          date: formattedDateTime,
          id: submissionId
        }
      },
    };

    // Handle submit loading and error
    try {
      await this.mailService.send(request);
      this.submitted = true;
      localStorage.setItem(this.SUBMITTED_KEY, 'true');
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      this.buttonText = 'Submit';
      this.isLoading = false;
    }
  }

  resetForm() {
    this.formData.department = '';
    this.formData.message = '';
    this.submitted = false;
    this.buttonText = 'Submit';
    this.isLoading = false;
    localStorage.removeItem(this.TIMER_KEY);
    localStorage.removeItem(this.SUBMITTED_KEY);
    this.countdown = 300;
    this.startCountdown();
  }
}
