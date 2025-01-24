import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AIProctorComponent } from './ai-proctor.component';

describe('AIProctorComponent', () => {
  let component: AIProctorComponent;
  let fixture: ComponentFixture<AIProctorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AIProctorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AIProctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
