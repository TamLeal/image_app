const URL = "https://teachablemachine.withgoogle.com/models/64kdLVpfa/";

let model, labelContainer, maxPredictions;
let isUsingFrontCamera = false;

async function init() {
    if (typeof Webcam === 'undefined') {
        console.error('Webcam.js is not loaded. Please check your internet connection and try again.');
        alert('Failed to load necessary resources. Please check your internet connection and try again.');
        return;
    }

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        setupWebcam();
    } catch (error) {
        console.error('Error loading the model:', error);
        alert('Failed to load the model. Please try again later.');
    }
}

function setupWebcam() {
    Webcam.set({
        width: 320,
        height: 240,
        image_format: 'jpeg',
        jpeg_quality: 90,
        constraints: {
            facingMode: isUsingFrontCamera ? "user" : { exact: "environment" }
        }
    });

    Webcam.attach('#webcam-container');

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ''; // Clear existing content
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    // Start prediction loop
    setTimeout(predictLoop, 1000); // Give some time for the camera to initialize
}

async function switchCamera() {
    isUsingFrontCamera = !isUsingFrontCamera;
    Webcam.reset();
    setupWebcam();
}

async function predictLoop() {
    if (!Webcam.loaded) {
        setTimeout(predictLoop, 1000);
        return;
    }

    Webcam.snap(async function(data_uri) {
        const image = new Image();
        image.src = data_uri;
        image.onload = async function() {
            const prediction = await model.predict(image);
            for (let i = 0; i < maxPredictions; i++) {
                const classPrediction =
                    prediction[i].className + ": " + prediction[i].probability.toFixed(2);
                labelContainer.childNodes[i].innerHTML = classPrediction;
            }
        };
    });

    // Call this function again after a short delay
    setTimeout(predictLoop, 100);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('start-button').addEventListener('click', init);
    document.getElementById('switch-camera').addEventListener('click', switchCamera);
});