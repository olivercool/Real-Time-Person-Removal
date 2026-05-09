/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

/********************************************************************
 * Real-Time-Chair-Removal Created by Jason Mayes 2020.
 * Modified for chair detection using Teachable Machine.
 *
 * Get latest code on my Github:
 * https://github.com/jasonmayes/Real-Time-Person-Removal
 *
 * Got questions? Reach out to me on social:
 * Twitter: @jason_mayes
 * LinkedIn: https://www.linkedin.com/in/creativetech
 ********************************************************************/

const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const DEBUG = false;

// Teachable Machine model URL
const URL = "https://teachablemachine.withgoogle.com/models/VFee0ob5j/";

let model, labelContainer, maxPredictions;
var modelHasLoaded = false;

// Load the model from Teachable Machine
async function loadModel() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  
  try {
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    modelHasLoaded = true;
    console.log("Model loaded successfully!");
    console.log("Number of classes:", maxPredictions);
    
    // Show demo section now model is ready to use
    demosSection.classList.remove('invisible');
  } catch (error) {
    console.error("Failed to load model:", error);
  }
}

// Initialize the model on page load
window.addEventListener('load', function() {
  loadModel();
});

/********************************************************************
// Continuously grab image from webcam stream and classify it.
********************************************************************/

var previousDetectionComplete = true;

// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}

// Process chair detection and update background
function processChairDetection(canvas, predictions) {
  var ctx = canvas.getContext('2d');
  
  // Get data from our overlay canvas which is attempting to estimate background.
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;
  
  // Get data from the live webcam view which has all data.
  var liveData = videoRenderCanvasCtx.getImageData(0, 0, canvas.width, canvas.height);
  var dataL = liveData.data;
  
  // Find chair confidence (class 0 is "Chair", class 1 is "Background")
  let chairConfidence = 0;
  let chairIndex = -1;
  
  for (let i = 0; i < predictions.length; i++) {
    if (predictions[i].className === "Chair") {
      chairConfidence = predictions[i].probability;
      chairIndex = i;
      break;
    }
  }
  
  // Update predictions display
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction = predictions[i].className + ": " + predictions[i].probability.toFixed(4);
    if (labelContainer.childNodes[i]) {
      labelContainer.childNodes[i].innerHTML = classPrediction;
    }
  }
  
  // If chair is detected with high confidence, learn the background
  if (chairConfidence > 0.5) {
    // Update background from non-chair regions
    for (let i = 0; i < data.length; i += 4) {
      // Copy from live data to background model
      data[i] = dataL[i];         // R
      data[i + 1] = dataL[i + 1]; // G
      data[i + 2] = dataL[i + 2]; // B
      data[i + 3] = 255;          // A
    }
  } else {
    // No chair detected, update all pixels as background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = dataL[i];         // R
      data[i + 1] = dataL[i + 1]; // G
      data[i + 2] = dataL[i + 2]; // B
      data[i + 3] = 255;          // A
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

// This function will repeatedly call itself when the browser is ready to process
// the next frame from webcam.
async function predictWebcam() {
  if (previousDetectionComplete && modelHasLoaded) {
    // Copy the video frame from webcam to a temporary canvas in memory only (not in the DOM).
    videoRenderCanvasCtx.drawImage(video, 0, 0);
    previousDetectionComplete = false;
    
    try {
      // Get predictions from the model
      const predictions = await model.predict(videoRenderCanvas);
      processChairDetection(webcamCanvas, predictions);
    } catch (error) {
      console.error("Prediction error:", error);
    }
    
    previousDetectionComplete = true;
  }

  // Call this function again to keep predicting when the browser is ready.
  window.requestAnimationFrame(predictWebcam);
}

// Enable the live webcam view and start classification.
function enableCam(event) {
  if (!modelHasLoaded) {
    console.warn("Model is not loaded yet");
    return;
  }
  
  // Hide the button.
  event.target.classList.add('removed');  
  
  // getUsermedia parameters.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.addEventListener('loadedmetadata', function() {
      // Update widths and heights once video is successfully played otherwise
      // it will have width and height of zero initially causing classification
      // to fail.
      webcamCanvas.width = video.videoWidth;
      webcamCanvas.height = video.videoHeight;
      videoRenderCanvas.width = video.videoWidth;
      videoRenderCanvas.height = video.videoHeight;
      
      let webcamCanvasCtx = webcamCanvas.getContext('2d');
      webcamCanvasCtx.drawImage(video, 0, 0);
    });
    
    video.srcObject = stream;
    
    video.addEventListener('loadeddata', predictWebcam);
  }).catch(function(err) {
    console.error("Error accessing webcam:", err);
  });
}

// We will create a temporary canvas to render to store frames from 
// the web cam stream for classification.
var videoRenderCanvas = document.createElement('canvas');
var videoRenderCanvasCtx = videoRenderCanvas.getContext('2d');

// Lets create a canvas to render our findings to the DOM.
var webcamCanvas = document.createElement('canvas');
webcamCanvas.setAttribute('class', 'overlay');
liveView.appendChild(webcamCanvas);

// Setup label container for predictions
labelContainer = document.getElementById('label-container');
for (let i = 0; i < maxPredictions; i++) {
  labelContainer.appendChild(document.createElement('div'));
}

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  const enableWebcamButton = document.getElementById('webcamButton');
  enableWebcamButton.addEventListener('click', enableCam);
} else {
  console.warn('getUserMedia() is not supported by your browser');
}