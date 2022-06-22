import { Component, OnInit } from '@angular/core';
import { createWorker } from 'tesseract.js';
import { pdfToPng } from 'pdf-to-png-converter';
import * as Tesseract from 'tesseract.js';
import * as pdfjs from 'pdfjs';
import { createCanvas } from 'canvas';
import { time } from 'console';


let worker = createWorker();
let isReady = false;

@Component({
  selector: 'app-ocr-tesseract-js',
  templateUrl: './ocr-tesseract-js.component.html',
  styleUrls: ['./ocr-tesseract-js.component.css']
})
export class OcrTesseractJsComponent implements OnInit {
  ocrText = "";

  constructor() { 
  this.loadWorker();
  }

  ngOnInit(): void {

  }

  public async loadWorker() {
    await worker.load();
    await worker.loadLanguage('deu');
    await worker.initialize('deu');
    isReady = true;
    console.log('worker is ready')
  }


  public async getUint8Array(pdf:File) {
    let fr = new FileReader();
    let pdfArrayBuffer:ArrayBuffer = new ArrayBuffer(1);
    fr.onloadend = function(e) {
      pdfArrayBuffer = e.target?.result as ArrayBuffer;
      let uint8Array = new Uint8Array(pdfArrayBuffer);
      console.log(uint8Array)
      return uint8Array;
    }
    fr.readAsArrayBuffer(pdf)
  }

  public async convertPdfToPng() {
    let doctext:string = "text:\n";
    let start = new Date();
    let inputField = <HTMLInputElement>document.getElementById("file-input");
    if (inputField.files == null) {
      return;
    }
    let pdf = inputField.files[0];
    let fr = new FileReader();
    let pdfArrayBuffer:ArrayBuffer = new ArrayBuffer(1);
    fr.onloadend = async function(e) {
      pdfArrayBuffer = e.target?.result as ArrayBuffer;
      let data = new Uint8Array(pdfArrayBuffer);

      const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
      const pdfjsWorker = await require('pdfjs-dist/build/pdf.worker.entry');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  
      let dataObj = {
        data,
        cMapUrl: "../../../node_modules/odfjs-dist/cmaps/",
        cMapPacked: true,
        standardFontDataUrl: "../../../node_modules/spdfjs-dist/standard_fonts/"};
      
      
      let doc = await pdfjsLib.getDocument(dataObj).promise;
      for (let i=1; i <= doc.numPages; i++) {
        console.log("page " + i + " of " + doc.numPages + " pages is in process!");
        let page = await doc.getPage(i);
        const viewport = page.getViewport({scale: 1});

        let canvas = <HTMLCanvasElement>document.getElementById("image-canvas");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        let context = canvas.getContext("2d");
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise; 

        // await Tesseract.recognize(canvas.toDataURL(), "deu").then(text => {
        //   doctext += text["data"].text;
        //   console.log(`time: ${(new Date().getTime() - start.getTime())/1000}s`);
        // });
        if (!isReady) {
          console.log('Worker isn\'t ready');
          return;
        }
        await worker.recognize(canvas.toDataURL()).then(result => {
          doctext += result["data"].text;
          console.log(`time: ${(new Date().getTime() - start.getTime())/1000}s`);
        });


        (<HTMLParagraphElement>document.getElementById('text')).innerHTML = doctext;
        (<HTMLParagraphElement>document.querySelector("p")).innerHTML = `time: ${(new Date().getTime() - start.getTime())/1000}s`;

      }
      console.log(`total execution time: ${(new Date().getTime() - start.getTime())/1000}s`);
    }
    fr.readAsArrayBuffer(pdf)
  }

  /* 
   * Code of the first Experiment:
  */

  // public recognizeText() {
  //   let startTime = new Date();
  //   let fileInput = <HTMLInputElement>document.getElementById("file-input");
  //   let files = fileInput.files;

  //   if (files == null) {
  //     console.log("No file selected!");
  //     return;
  //   }

  //   let file = files[0];

  //   Tesseract.recognize(file, "deu").then(result => {
  //     console.log(result);
  //     console.log(`Total execution time=${(new Date().getTime() - startTime.getTime()) / 1000}s`);
  //   });
  // }

}