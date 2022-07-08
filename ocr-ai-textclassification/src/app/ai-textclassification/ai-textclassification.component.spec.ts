import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiTextclassificationComponent } from './ai-textclassification.component';

describe('AiTextclassificationComponent', () => {
  let component: AiTextclassificationComponent;
  let fixture: ComponentFixture<AiTextclassificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AiTextclassificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AiTextclassificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
