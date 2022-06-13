import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OcrTesseractJsComponent } from './ocr-tesseract-js/ocr-tesseract-js.component';

@NgModule({
  declarations: [
    AppComponent,
    OcrTesseractJsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
