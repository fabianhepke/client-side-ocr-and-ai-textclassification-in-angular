import { Component, OnInit } from '@angular/core';
import { createWorker, createScheduler } from 'tesseract.js';
import { pdfToPng } from 'pdf-to-png-converter';
import * as Tesseract from 'tesseract.js';
import * as pdfjs from 'pdfjs';
import { createCanvas } from 'canvas';
import { time } from 'console';



@Component({
  selector: 'app-ocr-tesseract-js',
  templateUrl: './ocr-tesseract-js.component.html',
  styleUrls: ['./ocr-tesseract-js.component.css']
})
export class OcrTesseractJsComponent implements OnInit {
  isReady:boolean = false;
  doctext: string;
  start: Date;
  timeDiff: number;
  pdfjsLib: any;
  pdfjsWorker: any;
  context: CanvasRenderingContext2D | null = null;
  canvas:HTMLCanvasElement | null = null;
  scheduler:any;
  results:Array<string> = new Array;
  
  constructor() { 
    this.scheduler = createScheduler();
    this.loadScheduler();
    this.timeDiff = 0;
    this.doctext = "";
    this.start = new Date();
    this.pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
    this.pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
    this.pdfjsLib.GlobalWorkerOptions.workerSrc = this.pdfjsWorker;
  }
  
  ngOnInit(): void {
    console.log('Component initialized');
  }
  
  ngAfterContentInit():void {
    console.log('Content initialized')
    this.canvas = <HTMLCanvasElement>document.getElementById('image-canvas');
    this.context = this.canvas.getContext("2d");
  }

  public async loadScheduler() {
    for (let i = 0; i < 4; i++) {
      let worker = createWorker();
      await worker.load();
      await worker.loadLanguage('deu');
      await worker.initialize('deu');
      this.scheduler.addWorker(worker);
    }
    this.isReady = true;
    console.log('tesseract.js: scheduler is ready!');
  }

  public async doOCR(): Promise<void> {
    this.start = new Date();
    this.timeDiff = 0;
    this.doctext = "";
    let pdf = this.getDocument()
    let fr = new FileReader();

    fr.onloadend = async (e) =>  {
      this.handleDocument(e)
    }
    fr.readAsArrayBuffer(pdf!)
  }
  
  async handleDocument(e:any): Promise<void> {
    let pdfArrayBuffer:ArrayBuffer = new ArrayBuffer(1);
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

  async iterateOverDocPages(doc:any) {
    this.results = new Array(doc.numPages);
    for (let i = 1; i <= doc.numPages; i++) {
      let page = await doc.getPage(i);
      let viewport = page.getViewport({ scale: 1 });

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
      console.log('page ' + currentPage + ' is ready!');
      console.log(this.results);
      this.timeDiff = (new Date().getTime() - this.start.getTime()) / 1000;
      this.results[currentPage] = result["data"].text;
      this.doctext = this.results.join(' ');
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
}