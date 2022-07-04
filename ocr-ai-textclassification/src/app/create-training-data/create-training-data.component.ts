import { Component, OnInit } from '@angular/core';
import * as Tesseract from 'tesseract.js';

@Component({
  selector: 'app-create-training-data',
  templateUrl: './create-training-data.component.html',
  styleUrls: ['./create-training-data.component.css']
})
export class CreateTrainingDataComponent implements OnInit {

  fileInput: HTMLInputElement | undefined;
  canvas: HTMLCanvasElement | undefined;
  context: CanvasRenderingContext2D | null | undefined;
  pdfjsLib: any;
  pdfjsWorker: any;
  scheduler: Tesseract.Scheduler;
  trainJson: string;

  constructor() {
    this.scheduler = Tesseract.createScheduler();
    this.pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
    this.pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
    this.pdfjsLib.GlobalWorkerOptions.workerSrc = this.pdfjsWorker;
    this.trainJson = "";
    this.loadScheduler();
  }

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
    this.fileInput = <HTMLInputElement>document.getElementById('training-data');
    this.canvas = <HTMLCanvasElement>document.getElementById('training-canvas');
    this.context = this.canvas.getContext("2d");
  }

  public async loadScheduler() {
    for (let i = 0; i < 4; i++) {
      let worker = Tesseract.createWorker();
      await worker.load();
      await worker.loadLanguage('deu');
      await worker.initialize('deu');
      this.scheduler.addWorker(worker);
    }
    console.log('tesseract.js: scheduler is ready!');
  }

  public async createTrainingsDataset() {
    console.log("start creating dataset")
    let files = this.fileInput!.files;
    for (let i = 0; i < files?.length!; i++) {
      console.log("document" + i + 1);
      let file = files![i];
      let fr = new FileReader();

      fr.onloadend = async (e) => {
        await this.handleDocument(e)
      }
      fr.readAsArrayBuffer(file)
      await new Promise(f => setTimeout(f, 1000));

    }
    
  }

  public async handleDocument(e: ProgressEvent<FileReader>) {
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
    let page = await doc.getPage(1);
    let viewport = page.getViewport({ scale: 1.8 });

    this.setCanvasSize(viewport);
    await this.renderPage(page, viewport);

    this.recognizeText();

  }

  recognizeText() {
    this.scheduler.addJob('recognize', this.canvas?.toDataURL()!).then(result => {
      this.trainJson += `{ \"text\": \"${result["data"].text.replace(/[\r\n]+/g," ")}\", \"lable\": \"Kontoauszug\"},\n`;
    })
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

  public downloadTrainData() {
    var link = document.createElement('a');
    link.download = 'data.json';
    var blob = new Blob([this.trainJson], { type: 'text/plain' });
    link.href = window.URL.createObjectURL(blob);
    link.click();
  }

}
