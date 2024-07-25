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
    const flip = isUsingFrontCamera;
    const constraints = {
        facingMode: isUsingFrontCamera ? "user" : "environment",
        width: 200,
        height: 200
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: constraints });
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
            videoElement.play();
        };

        webcam = new tmImage.Webcam(200, 200, flip);
        webcam.canvas.width = 200;
        webcam.canvas.height = 200;

        function updateCanvas() {
            if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
                webcam.canvas.getContext('2d').drawImage(videoElement, 0, 0, webcam.canvas.width, webcam.canvas.height);
            }
            requestAnimationFrame(updateCanvas);
        }
        updateCanvas();

        const webcamContainer = document.getElementById("webcam-container");
        webcamContainer.innerHTML = '';
        webcamContainer.appendChild(webcam.canvas);

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
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    if (webcam.canvas) {
        const prediction = await model.predict(webcam.canvas);
        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction =
                prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;
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