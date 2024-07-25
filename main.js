const URL = "https://teachablemachine.withgoogle.com/models/64kdLVpfa/";

let model, webcam, labelContainer, maxPredictions;
let isUsingFrontCamera = true;

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    await setupWebcam();
}

async function setupWebcam() {
    const flip = isUsingFrontCamera;
    const constraints = {
        video: {
            facingMode: isUsingFrontCamera ? "user" : { exact: "environment" }
        }
    };

    if (webcam) {
        webcam.stop();
    }

    webcam = new tmImage.Webcam(200, 200, flip);
    try {
        await webcam.setup(constraints);
        await webcam.play();
        window.requestAnimationFrame(loop);

        document.getElementById("webcam-container").innerHTML = '';
        document.getElementById("webcam-container").appendChild(webcam.canvas);

        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = '';
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }
    } catch (error) {
        console.error("Error setting up webcam:", error);
        alert("Failed to access the camera. Please make sure you've granted the necessary permissions.");
    }
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

async function switchCamera() {
    isUsingFrontCamera = !isUsingFrontCamera;
    await setupWebcam();
}

document.getElementById('start-button').addEventListener('click', init);
document.getElementById('switch-camera').addEventListener('click', switchCamera);