import { Component, OnInit } from '@angular/core';
import { createWorker, createScheduler } from 'tesseract.js';
import { DocTextService } from '../doc-text.service';

@Component({
  selector: 'app-ocr-tesseract-js',
  templateUrl: './ocr-tesseract-js.component.html',
  styleUrls: ['./ocr-tesseract-js.component.css']
})
export class OcrTesseractJsComponent implements OnInit {
  public isReady: boolean = false;
  public isFileSelected:boolean = false;
  public isLoading:boolean = false;
  public doctext: string;
  public disable:string = "disable";
  public filename:string = "Keine Datei "
  public timeDiff: number = 0;
  public currentWorkerNum:number = 0;
  public start: Date = new Date();
  public results: Array<string> = new Array;
  public context: CanvasRenderingContext2D | null = null;
  public canvas: HTMLCanvasElement | null = null;
  public pdfjsLib: any;
  public pdfjsWorker: any;
  public scheduler: any;

  public WORKER_NUM:number = 1;
  public PAGES:number = 1;

  constructor(private _docTextService: DocTextService) {
    this.scheduler = createScheduler();
    this.loadScheduler();
    this.doctext = "";
    this.pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
    this.pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
    this.pdfjsLib.GlobalWorkerOptions.workerSrc = this.pdfjsWorker;
  }

  ngOnInit(): void {
    console.log('Component initialized');
  }

  ngAfterContentInit(): void {
    console.log('Content initialized')
    this.canvas = <HTMLCanvasElement>document.getElementById('image-canvas');
    this.context = this.canvas.getContext("2d");
  }

  public changeFile() {
    let inputElement = (<HTMLInputElement>document.getElementById("file-input"));
    if (inputElement.files?.length! > 1) {
      this.filename = inputElement.files?.length + " Dateien ";
    }
    else if (inputElement.files?.length! === 1){
      this.filename = inputElement.files![0].name;
    }
    else {
      this.filename = "Keine Datei "
    }

    this.isFileSelected = true;

    if (this.isReady) {
      this.disable = "";
    }
  }

  public async loadScheduler() {
    for (let i = 0; i < this.WORKER_NUM; i++) {
      let worker = createWorker();
      await worker.load();
      await worker.loadLanguage('deu');
      await worker.initialize('deu');
      this.scheduler.addWorker(worker);
      this.currentWorkerNum++;
    }
    this.isReady = true;

    if (this.isFileSelected) {
      this.disable = "";
    }
    console.log('tesseract.js: scheduler is ready!');
  }

  public async doOCR(): Promise<void> {
    this.isLoading = true;
    this.disable = "disable"
    this.start = new Date();
    this.timeDiff = 0;
    this.doctext = "";
    let pdf = this.getDocument()
    let fr = new FileReader();

    fr.onloadend = async (e) => {
      this.handleDocument(e)
    }
    fr.readAsArrayBuffer(pdf!)
  }

  async handleDocument(e: any): Promise<void> {
    let pdfArrayBuffer: ArrayBuffer = new ArrayBuffer(1);
    pdfArrayBuffer = e.target?.result as ArrayBuffer;
    let data = new Uint8Array(pdfArrayBuffer);

    let dataObj = {
      data,
      cMapUrl: "../../../node_modules/odfjs-dist/cmaps/",
      cMapPacked: true,
      standardFontDataUrl: "../../../node_modules/spdfjs-dist/standard_fonts/"
    };

    let doc = await this.pdfjsLib.getDocument(dataObj).promise;

    this.iterateOverDocPages(doc);
  }

  async iterateOverDocPages(doc: any) {
    this.results = new Array(doc.numPages);
    for (let i = 1; i <= this.PAGES; i++) {
      let page = await doc.getPage(i);
      let viewport = page.getViewport({ scale: 1.4 });

      this.setCanvasSize(viewport);
      await this.renderPage(page, viewport);

      if (!this.isReady) {
        console.log('Worker isn\'t ready yet');
        return;
      }
      this.recognizeText(i - 1);
    }
  }

  private recognizeText(currentPage: number) {
    if (this.canvas == null) {
      return;
    }
    this.scheduler.addJob('recognize', this.canvas.toDataURL()).then((result: any) => {
      console.log('page ' + (currentPage + 1) + ' is ready!');
      this.timeDiff = (new Date().getTime() - this.start.getTime()) / 1000;
      this.results[currentPage] = result["data"].text;
      this.doctext = this.results.join(' ');
      this._docTextService.setText(this.prepareText(this.doctext));
      if (!this.results.includes("")){
        this.isLoading = false;
      }
    });
  }

  private setCanvasSize(viewport: any) {
    if (this.canvas == null) {
      return;
    }
    this.canvas.height = viewport.height;
    this.canvas.width = viewport.width;
  }

  private async renderPage(page: any, viewport: any) {
    await page.render({
      canvasContext: this.context,
      viewport: viewport
    }).promise;
  }

  getDocument() {
    let inputField = <HTMLInputElement>document.getElementById("file-input");
    if (inputField.files == null) {
      return;
    }
    return inputField.files[0];
  }

  prepareText(text:string):string {
    let blacklist = "!§&/()=?\\\'#+*;[]{}@_,"
    for (let i = 0; i < blacklist.length; i++) {
      text = text.replace(blacklist.charAt(i), " ");
    }
    return text;
  }

}