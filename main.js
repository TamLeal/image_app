const URL = "https://teachablemachine.withgoogle.com/models/64kdLVpfa/";

let model, webcam, labelContainer, maxPredictions;
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

async function setupWebcam() {
    updateDebugInfo('Setting up webcam...');
    const flip = isUsingFrontCamera;
    const constraints = {
        video: {
            facingMode: isUsingFrontCamera ? "user" : "environment",
            width: { ideal: 200 },
            height: { ideal: 200 }
        }
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        updateDebugInfo('Got media stream.');

        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
            videoElement.play();
            updateDebugInfo('Video element is playing.');
        };

        webcam = new tmImage.Webcam(200, 200, flip);
        updateDebugInfo('tmImage.Webcam created.');

        if (!webcam.canvas) {
            updateDebugInfo('Webcam canvas is undefined. Creating a new canvas.');
            webcam.canvas = document.createElement('canvas');
        }

        webcam.canvas.width = 200;
        webcam.canvas.height = 200;

        function updateCanvas() {
            if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
                const ctx = webcam.canvas.getContext('2d');
                ctx.drawImage(videoElement, 0, 0, webcam.canvas.width, webcam.canvas.height);
            }
            requestAnimationFrame(updateCanvas);
        }
        updateCanvas();

        const webcamContainer = document.getElementById("webcam-container");
        if (webcamContainer) {
            webcamContainer.innerHTML = '';
            webcamContainer.appendChild(webcam.canvas);
            updateDebugInfo('Webcam canvas added to container.');
        } else {
            updateDebugInfo('Webcam container not found in DOM.');
        }

        window.requestAnimationFrame(loop);
        updateDebugInfo('Webcam setup complete.');
    } catch (error) {
        updateDebugInfo('Error setting up webcam: ' + error.message);
    }
}

async function switchCamera() {
    updateDebugInfo('Switching camera...');
    isUsingFrontCamera = !isUsingFrontCamera;
    await setupWebcam();
    updateDebugInfo('Camera switched to ' + (isUsingFrontCamera ? 'front' : 'rear'));
}

async function loop() {
    if (webcam && webcam.update) {
        webcam.update();
    }
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    if (webcam && webcam.canvas) {
        try {
            const prediction = await model.predict(webcam.canvas);
            for (let i = 0; i < maxPredictions; i++) {
                const classPrediction =
                    prediction[i].className + ": " + prediction[i].probability.toFixed(2);
                if (labelContainer && labelContainer.childNodes[i]) {
                    labelContainer.childNodes[i].innerHTML = classPrediction;
                }
            }
        } catch (error) {
            updateDebugInfo('Prediction error: ' + error.message);
        }
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