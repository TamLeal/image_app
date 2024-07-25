const URL = "https://teachablemachine.withgoogle.com/models/64kdLVpfa/";

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Set up the webcam with constraints to use the rear camera
    const constraints = {
        video: {
            facingMode: { exact: "environment" } // Use the rear camera
        }
    };

    const flip = false; // Don't flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    try {
        await webcam.setup(constraints); // Pass constraints here
        await webcam.play();
        window.requestAnimationFrame(loop);

        // append elements to the DOM
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) { // and class labels
            labelContainer.appendChild(document.createElement("div"));
        }
    } catch (error) {
        console.error("Error setting up webcam:", error);
        alert("Failed to access the rear camera. Please make sure you've granted the necessary permissions and that your device has a rear camera.");
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}

// Use event listener to handle the button click
document.getElementById('start-button').addEventListener('click', init);