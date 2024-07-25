const URL = "https://teachablemachine.withgoogle.com/models/64kdLVpfa/";

let model, webcam, labelContainer, maxPredictions;

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

async function setupWebcam() {
    const flip = true;
    webcam = new tmImage.Webcam(200, 200, flip);
    await webcam.setup();
    await webcam.play();
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    window.requestAnimationFrame(loop);
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
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
        switchButton.addEventListener('click', () => {
            updateDebugInfo('Switch camera functionality not implemented yet.');
        });
    } else {
        updateDebugInfo('Switch camera button not found in the DOM.');
    }
}

// Wait for the DOM to be fully loaded before setting up event listeners
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
} else {
    handleDOMContentLoaded();
}

// Immediately invoke to log any early errors
updateDebugInfo('Script loaded and running.');