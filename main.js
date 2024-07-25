const URL = "https://teachablemachine.withgoogle.com/models/64kdLVpfa/";

let model, labelContainer, maxPredictions;
let isUsingFrontCamera = true;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        
        await setupWebcam();
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }
    } catch (error) {
        console.error('Error initializing:', error);
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
            console.error('Webcam error:', err);
            reject(err);
        });

        Webcam.on('live', function() {
            resolve();
            loop();
        });
    });
}

async function switchCamera() {
    isUsingFrontCamera = !isUsingFrontCamera;
    Webcam.reset();
    await setupWebcam();
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
                console.error('Prediction error:', error);
            }
        };
    });
}

function handleDOMContentLoaded() {
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', init);
    }

    const switchButton = document.getElementById('switch-camera');
    if (switchButton) {
        switchButton.addEventListener('click', switchCamera);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
} else {
    handleDOMContentLoaded();
}