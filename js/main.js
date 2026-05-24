const cameraSelect = document.getElementById("camera-select");
const videoEl = document.getElementById("camera-video");
const permissionEl = document.getElementById("camera-permission-alert");
let captureStream = null;
const defaultCameraConstraints = {
    video: {
        advanced: [
            { width: { exact: 2560 } },
            { width: { exact: 1920 } },
            { width: { exact: 1280 } },
            { width: { exact: 1024 } },
            { width: { exact: 900 } },
            { width: { exact: 800 } },
            { width: { exact: 640 } },
            { width: { exact: 320 } },
            { framerate: { exact: 240 } },
            { framerate: { exact: 144 } },
            { framerate: { exact: 120 } },
            { framerate: { exact: 90 } },
            { framerate: { exact: 60 } },
            { framerate: { exact: 40 } },
            { framerate: { exact: 30 } }
        ]
    },
    audio: false
};

function updateCameras(cameraList) {
    console.log("Got camera list:", cameraList);
    // Clear existing list
    cameraSelect.replaceChildren();
    // Create new list
    cameraList.forEach(function (camera, i) {
        // Add each camera as menu option
        if (camera.kind === "videoinput") {
            const listEl = document.createElement("option");
            listEl.value = camera.deviceId;
            listEl.innerText = camera.label || "Camera " + i;
            listEl.dataset.label = camera.label || "";
            cameraSelect.appendChild(listEl);
        }
    })
    // Change selection to current device
    if (captureStream?.getVideoTracks()[0]?.label) {
        const optionMatch = cameraSelect.querySelector("option[data-label='" + captureStream.getVideoTracks()[0].label + "']");
        if (optionMatch) {
            cameraSelect.value = optionMatch.getAttribute("value");
        }
    }
}

async function startCapture(deviceId = null) {
    let cameraConstraints = defaultCameraConstraints;
    // Change device ID if provided
    if (deviceId) {
        cameraConstraints.video.deviceId = {
            exact: deviceId
        }
    }
    // Get camera video stream
    navigator.mediaDevices.getUserMedia(cameraConstraints)
        .then(function (stream) {
            captureStream = stream;
            videoEl.srcObject = captureStream;
            videoEl.classList.remove("d-none");
            if (captureStream?.getVideoTracks()[0]) {
                const cameraProperties = captureStream.getVideoTracks()[0].getSettings();
                console.log("Camera properties:", cameraProperties);
                document.title = `${captureStream.getVideoTracks()[0].label} - ${cameraProperties.width} × ${cameraProperties.height} - ${Math.round(cameraProperties.frameRate)} FPS`
            }
            // Update list of cameras
            navigator.mediaDevices.enumerateDevices()
                .then(updateCameras)
                .catch(function (error) {
                    console.error(error);
                });
        })
        .catch(async function (error) {
            // Show errror
            console.error("Error accessing media devices:", error);
            permissionEl.classList.remove("d-none");
            // Wait for camera permission to be granted, then try again
            const status = await navigator.permissions.query({ name: "camera" });
            status.addEventListener("change", function (event) {
                startCapture();
            }, { once: true });
        });
}

cameraSelect.addEventListener("change", function (event) {
    startCapture(event.target.value);
});

document.getElementById("fullscreen-btn").addEventListener("click", function () {
    videoEl.requestFullscreen();
})

document.getElementById("new-window-btn").addEventListener("click", function () {
    const targetUrl = new URL(document.location);
    targetUrl.searchParams.set("utm_source", "Installed App");
    targetUrl.searchParams.set("utm_medium", "New Window Button");
    window.open(targetUrl.href, "new-window", "width=1280,height=720");
})

// Try to automatically start camera capture
startCapture();