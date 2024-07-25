const URL = "https://teachablemachine.withgoogle.com/models/64kdLVpfa/";

let model, webcam, labelContainer, maxPredictions;
let currentStream = null;

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    await setupWebcam();
}

async function setupWebcam(deviceId = null) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
        video: deviceId ? {deviceId: {exact: deviceId}} : true
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = stream;
        
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
            videoElement.play();
        };

        webcam = new tmImage.Webcam(200, 200, true); // flip width and height
        webcam.canvas.width = 200;
        webcam.canvas.height = 200;

        function updateCanvas() {
            if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
                webcam.canvas.getContext('2d').drawImage(videoElement, 0, 0, webcam.canvas.width, webcam.canvas.height);
            }
            requestAnimationFrame(updateCanvas);
        }
        updateCanvas();

        document.getElementById("webcam-container").innerHTML = '';
        document.getElementById("webcam-container").appendChild(webcam.canvas);

        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = '';
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }

        window.requestAnimationFrame(loop);
    } catch (error) {
        console.error("Error setting up webcam:", error);
        alert("Failed to access the camera. Please make sure you've granted the necessary permissions.");
    }
}

async function loop() {
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

async function switchCamera() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length < 2) {
            alert("No additional camera found on this device.");
            return;
        }
        
        let currentDeviceId = currentStream.getVideoTracks()[0].getSettings().deviceId;
        let nextDevice = videoDevices.find(device => device.deviceId !== currentDeviceId);
        
        if (nextDevice) {
            await setupWebcam(nextDevice.deviceId);
        } else {
            alert("Failed to switch camera. Please try again.");
        }
    } catch (error) {
        console.error("Error switching camera:", error);
        alert("An error occurred while trying to switch the camera.");
    }
}

document.getElementById('start-button').addEventListener('click', init);
document.getElementById('switch-camera').addEventListener('click', switchCamera);