import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OcrTesseractJsComponent } from './ocr-tesseract-js.component';

describe('OcrTesseractJsComponent', () => {
  let component: OcrTesseractJsComponent;
  let fixture: ComponentFixture<OcrTesseractJsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OcrTesseractJsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OcrTesseractJsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
