const cameraSelect = document.getElementById("camera-select");
const videoEl = document.getElementById("camera-video");
let captureStream = null;

function updateCameras(cameraList) {
    console.log("Got camera list:", cameraList);
    cameraList.forEach(function (camera, i) {
        if (camera.kind === "videoinput") {
            const listEl = document.createElement("option");
            listEl.value = camera.deviceId;
            listEl.innerText = camera.label || "Camera " + i;
            cameraSelect.appendChild(listEl);
        }
    })
    cameraSelect.classList.remove("d-none");
}

async function startCapture(event) {
    const deviceId = event.target.value;
    const cameraConstraints = {
        video: {
            deviceId: {
                exact: deviceId
            },
            advanced: [
      { width: { exact: 2560 } },
      { width: { exact: 1920 } },
      { width: { exact: 1280 } },
      { width: { exact: 1024 } },
      { width: { exact: 900 } },
      { width: { exact: 800 } },
      { width: { exact: 640 } },
      { width: { exact: 320 } }
    ]
        },
        audio: false
    }
    captureStream = await navigator.mediaDevices.getUserMedia(cameraConstraints);
    if (!captureStream) {
        alert('There was an error!');
    }
    videoEl.srcObject = captureStream;
    videoEl.classList.remove("d-none")
    videoEl.play();
}

cameraSelect.addEventListener("change", function (event) {
    startCapture(event);
});

document.getElementById("start-camera-btn").addEventListener("click", function () {
    navigator.mediaDevices.enumerateDevices()
        .then(updateCameras)
        .catch(function (error) {
            console.error(error);
        });
})