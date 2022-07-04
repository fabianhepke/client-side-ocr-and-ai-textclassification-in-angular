import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OcrTesseractJsComponent } from './ocr-tesseract-js/ocr-tesseract-js.component';
import { CreateTrainingDataComponent } from './create-training-data/create-training-data.component';

@NgModule({
  declarations: [
    AppComponent,
    OcrTesseractJsComponent,
    CreateTrainingDataComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
