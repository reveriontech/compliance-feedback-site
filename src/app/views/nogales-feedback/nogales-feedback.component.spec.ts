import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NogalesFeedbackComponent } from './nogales-feedback.component';

describe('NogalesFeedbackComponent', () => {
  let component: NogalesFeedbackComponent;
  let fixture: ComponentFixture<NogalesFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NogalesFeedbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NogalesFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
