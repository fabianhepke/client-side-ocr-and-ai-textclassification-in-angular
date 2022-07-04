import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTrainingDataComponent } from './create-training-data.component';

describe('CreateTrainingDataComponent', () => {
  let component: CreateTrainingDataComponent;
  let fixture: ComponentFixture<CreateTrainingDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTrainingDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTrainingDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
