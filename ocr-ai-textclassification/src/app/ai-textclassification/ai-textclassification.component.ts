import { Component, OnInit } from '@angular/core';
import * as tfEncoder from "@tensorflow-models/universal-sentence-encoder";
import { DocTextService } from '../doc-text.service';
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import trainData from "../../assets/train-data-copy.json";

@Component({
  selector: 'app-ai-textclassification',
  templateUrl: './ai-textclassification.component.html',
  styleUrls: ['./ai-textclassification.component.css']
})
export class AiTextclassificationComponent implements OnInit {

  public docClass: string = "";
  public encoder: any = null;
  public docText: string = "";
  public model: any;
  public MODEL_NAME: string = "doc-classification-model";

  constructor(private _docTextService: DocTextService) {
    this.model = this.loadModel();
    this._docTextService.textUpdate.subscribe(() => {
      this.classifyDocument();
    })
  }

  private classifyDocument() {
    this.docText = this._docTextService.getText();
    this.predictDocClass(this.model, this.encoder, this.docText, 0.6).then(text => {
      this.docClass = text;
    });
  }

  ngOnInit(): void {
  }

  async loadModel() {
    this.encoder = await tfEncoder.load();
    this.model = await this.trainModel(this.encoder);
    console.log("model is ready!")
  }

  async trainModel(encoder: any) {
    try {
      const loadedModel = await tf.loadLayersModel(
        `localstorage://${this.MODEL_NAME}`
      );
      console.log("Using existing model");
      return loadedModel;
    } catch (e) {
      console.log("Training new model");
    }

    const xTrain = await this.encodeData(encoder, trainData);
    console.log("xData encoded");
    const yTrain = tf.tensor2d(
      trainData.map(t => [t.lable === "Rechnung" ? 1 : 0, t.lable === "Kontoauszug" ? 1 : 0, t.lable === "Neujahrsansprache" ? 1 :0])
    );
    console.log("xData encoded");

    const model = tf.sequential();

    model.add(
      tf.layers.dense({
        inputShape: [xTrain.shape[1]],
        activation: "relu",
        units: 50
      })
    );
    model.add(
      tf.layers.dropout({
        rate: 0.6
      })
    );
    model.add(
      tf.layers.dense({
        activation: 'softmax',
        units: 3
      })
    );
    model.compile({
      loss: "categoricalCrossentropy",
      optimizer: tf.train.adam(0.01),
      metrics: ["accuracy"]
    });
    console.log("model compiled");
    let statsContainer = document.getElementById("tf-stats-container");

    await model.fit(xTrain, yTrain, {
      batchSize: 12,
      validationSplit: 0.15,
      shuffle: true,
      epochs: 150,
      callbacks: tfvis.show.fitCallbacks(
        statsContainer!,
        ["loss", "val_loss", "acc", "val_acc"],
        {
          callbacks: ["onEpochEnd"]
        }
      )
    });
    model.summary();

    await model.save(`localstorage://${this.MODEL_NAME}`);

    return model;
  }

  async encodeData(encoder: any, data: any) {
    const sentences = data.map((t: any) => t.text.toLowerCase());
    return encoder.embed(sentences);
  }

  async predictDocClass(model:any, encoder:any, docText:any, threshold:any) {
    const xPredict = await this.encodeData(encoder, [{ "text": docText }]);

    const prediction = await model.predict(xPredict).data();
    console.log(prediction);
    if (prediction[0] > threshold) {
      return "Rechnung";
    } else if (prediction[1] > threshold) {
      return "Kontoauszug";
    } else if (prediction[2] > threshold) {
      return "Neujahrsansprache";
    } else {
      return "Konnte nicht zugeordnet werden!";
    }
  }

}
