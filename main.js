const URL = "https://teachablemachine.withgoogle.com/models/64kdLVpfa/";

let model, labelContainer, maxPredictions;
let isUsingFrontCamera = false;

function updateDebugInfo(message) {
    const debugElement = document.getElementById('debug-info');
    debugElement.innerHTML += message + '<br>';
    console.log(message);
}

async function init() {
    updateDebugInfo('Initializing...');
    if (typeof Webcam === 'undefined') {
        updateDebugInfo('Webcam.js is not loaded. Please check your internet connection.');
        return;
    }

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        updateDebugInfo('Loading model...');
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        updateDebugInfo('Model loaded successfully.');
        setupWebcam();
    } catch (error) {
        updateDebugInfo('Error loading the model: ' + error.message);
        if (error.name === 'OverconstrainedError') {
            updateDebugInfo('Trying with default camera settings.');
            isUsingFrontCamera = true;
            setupWebcam();
        }
    }
}

function setupWebcam() {
    updateDebugInfo('Setting up webcam...');
    const constraints = {
        width: 320,
        height: 240,
        image_format: 'jpeg',
        jpeg_quality: 90
    };

    if (!isUsingFrontCamera) {
        constraints.facingMode = { ideal: "environment" };
    }

    Webcam.set(constraints);

    Webcam.attach('#webcam-container');

    Webcam.on('error', function(err) {
        updateDebugInfo('Webcam error: ' + err);
    });

    Webcam.on('live', function() {
        updateDebugInfo('Webcam is live!');
        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = '';
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }
        setTimeout(predictLoop, 1000);
    });
}

async function switchCamera() {
    updateDebugInfo('Switching camera...');
    isUsingFrontCamera = !isUsingFrontCamera;
    Webcam.reset();
    setupWebcam();
}

async function predictLoop() {
    if (!Webcam.loaded) {
        updateDebugInfo('Webcam not ready, retrying...');
        setTimeout(predictLoop, 1000);
        return;
    }

    try {
        Webcam.snap(async function(data_uri) {
            const image = new Image();
            image.src = data_uri;
            image.onload = async function() {
                try {
                    const prediction = await model.predict(image);
                    for (let i = 0; i < maxPredictions; i++) {
                        const classPrediction =
                            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
                        labelContainer.childNodes[i].innerHTML = classPrediction;
                    }
                } catch (error) {
                    updateDebugInfo('Prediction error: ' + error.message);
                }
            };
        });
    } catch (error) {
        updateDebugInfo('Error in predict loop: ' + error.message);
    }

    setTimeout(predictLoop, 100);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('start-button').addEventListener('click', init);
    document.getElementById('switch-camera').addEventListener('click', switchCamera);
    updateDebugInfo('Page loaded. Click "Start" to begin.');
});