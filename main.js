const URL = "https://teachablemachine.withgoogle.com/models/64kdLVpfa/";

let model, labelContainer, maxPredictions;
let isUsingFrontCamera = true;

function updateDebugInfo(message) {
    console.log(message);
    const debugElement = document.getElementById('debug-info');
    if (debugElement) {
        debugElement.textContent += message + '\n';
    }
}

async function init() {
    updateDebugInfo('Initializing...');
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        updateDebugInfo('Model loaded successfully.');
        
        await setupWebcam();
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }
    } catch (error) {
        updateDebugInfo('Error initializing: ' + error.message);
    }
}

function setupWebcam() {
    return new Promise((resolve, reject) => {
        Webcam.set({
            width: 200,
            height: 200,
            image_format: 'jpeg',
            jpeg_quality: 90,
            constraints: {
                facingMode: isUsingFrontCamera ? "user" : "environment"
            }
        });

        Webcam.attach('#webcam-container');

        Webcam.on('error', function(err) {
            updateDebugInfo('Webcam error: ' + err);
            reject(err);
        });

        Webcam.on('live', function() {
            updateDebugInfo('Webcam is live!');
            resolve();
            loop();
        });
    });
}

async function switchCamera() {
    updateDebugInfo('Switching camera...');
    isUsingFrontCamera = !isUsingFrontCamera;
    Webcam.reset();
    await setupWebcam();
    updateDebugInfo('Camera switched to ' + (isUsingFrontCamera ? 'front' : 'rear'));
}

function loop() {
    predict();
    setTimeout(loop, 1000); // Predict every second
}

function predict() {
    Webcam.snap(function(data_uri) {
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
}

function handleDOMContentLoaded() {
    updateDebugInfo('DOM fully loaded. Setting up event listeners.');
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', init);
    } else {
        updateDebugInfo('Start button not found in the DOM.');
    }

    const switchButton = document.getElementById('switch-camera');
    if (switchButton) {
        switchButton.addEventListener('click', switchCamera);
    } else {
        updateDebugInfo('Switch camera button not found in the DOM.');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
} else {
    handleDOMContentLoaded();
}

updateDebugInfo('Script loaded and running.');