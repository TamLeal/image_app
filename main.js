const URL = "https://teachablemachine.withgoogle.com/models/64kdLVpfa/";

let model, webcam, labelContainer, maxPredictions;
let isFrontCamera = false; // Começamos com a câmera traseira

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    await setupCamera();
}

async function setupCamera() {
    const flip = false; // Não invertemos a imagem para a câmera traseira
    const constraints = {
        video: {
            facingMode: { exact: "environment" }, // Forçamos o uso da câmera traseira
            width: { ideal: 200 },
            height: { ideal: 200 }
        }
    };

    if (webcam) {
        webcam.stop();
    }

    try {
        webcam = new tmImage.Webcam(200, 200, flip);
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
        console.error("Erro ao configurar a câmera:", error);
        alert("Falha ao acessar a câmera traseira. Tentando configuração alternativa...");
        
        // Tentativa alternativa sem 'exact'
        try {
            const alternativeConstraints = {
                video: {
                    facingMode: "environment",
                    width: { ideal: 200 },
                    height: { ideal: 200 }
                }
            };
            await webcam.setup(alternativeConstraints);
            await webcam.play();
            window.requestAnimationFrame(loop);
        } catch (fallbackError) {
            console.error("Erro na configuração alternativa:", fallbackError);
            alert("Falha ao acessar a câmera. Por favor, verifique as permissões e tente novamente.");
        }
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
    isFrontCamera = !isFrontCamera;
    await setupCamera();
}

document.getElementById('start-button').addEventListener('click', init);
document.getElementById('switch-camera').addEventListener('click', switchCamera);