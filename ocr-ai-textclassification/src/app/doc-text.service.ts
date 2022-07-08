import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DocTextService {

  private docText:string = ""
  public textUpdate:EventEmitter<number>;

  constructor() {
    this.textUpdate = new EventEmitter();
   }

  setText(text:string) {
    this.docText = text;
    this.textUpdate.emit();
  }

  getText() {
    return this.docText;
  }

}
