import { Component, HostListener, Inject, OnInit, NgZone } from '@angular/core';
import { MailSendData, MailService } from 'ejflab-front-lib';
import { CaptchaService } from './services/captcha.service';

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
  showCaptcha = false;
  captchaChecked = false;
  captchaError = false;
  isVerifying = false;
  verificationSuccess = false;

  ngOnInit(): void {
    const savedCountdown = localStorage.getItem(this.TIMER_KEY);
    const savedSubmitted = localStorage.getItem(this.SUBMITTED_KEY);

    this.submitted = savedSubmitted === 'true';

    if (this.submitted && savedCountdown !== null) {
      this.countdown = parseInt(savedCountdown, 10);
      this.startCountdown();
    } else {
      this.countdown = 300;
    }
  }

  startCountdown(): void {
    this.showNewSubmissionButton = false;

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
    private ngZone: NgZone,
    private captchaService: CaptchaService
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
    // First click - show captcha
    if (!this.showCaptcha) {
      this.showCaptcha = true;
      this.captchaService.reset();
      return;
    }

    // If captcha is shown but not verified, don't proceed
    if (!this.verificationSuccess) {
      this.captchaError = true;
      return;
    }

    // If we get here, captcha is verified, proceed with submission
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

    try {
      await this.mailService.send(request);
      this.submitted = true;
      localStorage.setItem(this.SUBMITTED_KEY, 'true');
      this.countdown = 300;
      localStorage.setItem(this.TIMER_KEY, this.countdown.toString());
      this.startCountdown();
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      this.buttonText = 'Submit';
      this.isLoading = false;
    }
  }

  async onCaptchaCheck(event: any) {
    this.captchaChecked = event.target.checked;
    this.captchaError = false;

    if (this.captchaChecked) {
      this.isVerifying = true;
      this.captchaService.trackFormInteraction('checkbox_checked');

      // Collect more data before verification
      await new Promise(resolve => setTimeout(resolve, 1000));

      const isHuman = this.captchaService.analyzeBehavior();
      this.verificationSuccess = isHuman;

      if (!isHuman) {
        this.captchaChecked = false;
        this.captchaError = true;
      }

      this.isVerifying = false;
    } else {
      this.verificationSuccess = false;
    }
  }

  resetForm() {
    this.formData.department = '';
    this.formData.message = '';
    this.submitted = false;
    this.buttonText = 'Submit';
    this.isLoading = false;
    this.showCaptcha = false;
    this.captchaChecked = false;
    this.verificationSuccess = false;
    this.captchaError = false;
    localStorage.removeItem(this.TIMER_KEY);
    localStorage.removeItem(this.SUBMITTED_KEY);
    this.countdown = 300;
    this.showNewSubmissionButton = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
