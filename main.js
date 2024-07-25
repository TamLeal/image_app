const URL = "https://teachablemachine.withgoogle.com/models/64kdLVpfa/";

let model, labelContainer, maxPredictions;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Configurar Webcam.js
    Webcam.set({
        width: 320,
        height: 240,
        constraints: {
            facingMode: "environment"
        }
    });

    Webcam.attach('#webcam-container');

    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    // Iniciar loop de predição
    window.requestAnimationFrame(loop);
}

async function loop() {
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    // Capturar imagem atual da webcam
    Webcam.snap(async function(data_uri) {
        const image = new Image();
        image.src = data_uri;
        
        // Esperar a imagem carregar
        await new Promise((resolve) => {
            image.onload = resolve;
        });

        // Fazer a predição
        const prediction = await model.predict(image);
        
        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction =
                prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }
    });
}

document.getElementById('start-button').addEventListener('click', init);