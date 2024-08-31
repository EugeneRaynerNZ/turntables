/***** START: Create Audio Context ******/

// Create a single AudioContext
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Create GainNodes for each track
const gainNode1 = audioContext.createGain();
const gainNode2 = audioContext.createGain();

// Create a master GainNode
const masterGainNode = audioContext.createGain();

// Connect the master GainNode to the destination
masterGainNode.connect(audioContext.destination);

// Connect track GainNodes to the master GainNode
gainNode1.connect(masterGainNode);
gainNode2.connect(masterGainNode);

// Value between 0 and 1
let track1GainValue = 1;
let track2GainValue = 1;

// Set initial volume for each track
gainNode1.gain.value = track1GainValue;
gainNode2.gain.value = track2GainValue;

/***** END: Create Audio Context ******/



/***** START: Create Filters for Each Track ******/

// Create Biquad Filters for Left (Track 1) and Right (Track 2)
const leftTrackFilter = audioContext.createBiquadFilter();
const rightTrackFilter = audioContext.createBiquadFilter();

// Set default filter types to lowpass; will switch based on interaction
leftTrackFilter.type = 'lowpass';
rightTrackFilter.type = 'lowpass';

// Connect each GainNode to its respective filter
gainNode1.connect(leftTrackFilter);
gainNode2.connect(rightTrackFilter);

// Connect filters to the master GainNode
leftTrackFilter.connect(masterGainNode);
rightTrackFilter.connect(masterGainNode);

/***** END: Create Filters for Each Track ******/

/***** START: Filter Handle Controls for Left Side ******/

// SVG Elements
const lowPassLeftHandle = document.querySelector('.lowpass-left');

// Variables to track dragging state
let isDraggingLeft = false;
let startAngleLeft = 0;
let currentAngleLeft = 0;
const maximumRotation = 110; // Maximum allowable rotation angle

// Function to handle drag start for the left filter
function startDragFilterLeft(event) {
    isDraggingLeft = true;

    const rect = lowPassLeftHandle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    startAngleLeft = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
    event.preventDefault(); // Prevent default drag behavior
}

// Function to handle dragging for the left filter
function handleDragFilterLeft(event) {
    if (!isDraggingLeft) return;

    const rect = lowPassLeftHandle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const newAngleLeft = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
    let angleDiffLeft = newAngleLeft - startAngleLeft;

    // Adjust angle difference to handle the rotation correctly
    if (angleDiffLeft < -180) angleDiffLeft += 360;
    if (angleDiffLeft > 180) angleDiffLeft -= 360;

    currentAngleLeft += angleDiffLeft;
    startAngleLeft = newAngleLeft;

    // Restrict rotation between -110 degrees and +110 degrees
    if (currentAngleLeft > maximumRotation) {
        currentAngleLeft = maximumRotation;
    } else if (currentAngleLeft < -maximumRotation) {
        currentAngleLeft = -maximumRotation;
    }

    // Activate filters based on rotation direction for the left filter
    if (currentAngleLeft < 0) {
        // If dragging counter-clockwise, activate lowpass filter
        leftTrackFilter.type = 'lowpass';
    } else if (currentAngleLeft > 0) {
        // If dragging clockwise, activate highpass filter
        leftTrackFilter.type = 'highpass';
    }

    // Map the rotation angle to filter frequency values
    const filterFrequencyLeft = ((currentAngleLeft + maximumRotation) / (2 * maximumRotation)) * 2000; // Frequency range from 0 to 2000 Hz
    leftTrackFilter.frequency.value = filterFrequencyLeft;

    // Rotate the handle visually
    lowPassLeftHandle.style.transform = `rotate(${currentAngleLeft}deg)`;
}

// Function to stop dragging for the left filter
function stopDragFilterLeft() {
    isDraggingLeft = false;
}

// Event listeners for the left handle
lowPassLeftHandle.addEventListener('mousedown', startDragFilterLeft);
document.addEventListener('mousemove', handleDragFilterLeft);
document.addEventListener('mouseup', stopDragFilterLeft);

/***** END: Filter Handle Controls for Left Side ******/



/***** START: Filter Handle Controls for Right Side ******/

// SVG Elements for Right Filter
const lowPassRightHandle = document.querySelector('.lowpass-right');

// Variables to track dragging state for the right filter
let isDraggingRight = false;
let startAngleRight = 0;
let currentAngleRight = 0;

// Function to handle drag start for the right filter
function startDragFilterRight(event) {
    isDraggingRight = true;

    const rect = lowPassRightHandle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    startAngleRight = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
    event.preventDefault(); // Prevent default drag behavior
}

// Function to handle dragging for the right filter
function handleDragFilterRight(event) {
    if (!isDraggingRight) return;

    const rect = lowPassRightHandle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const newAngleRight = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
    let angleDiffRight = newAngleRight - startAngleRight;

    // Adjust angle difference to handle the rotation correctly
    if (angleDiffRight < -180) angleDiffRight += 360;
    if (angleDiffRight > 180) angleDiffRight -= 360;

    currentAngleRight += angleDiffRight;
    startAngleRight = newAngleRight;

    // Restrict rotation between -110 degrees and +110 degrees
    if (currentAngleRight > maximumRotation) {
        currentAngleRight = maximumRotation;
    } else if (currentAngleRight < -maximumRotation) {
        currentAngleRight = -maximumRotation;
    }

    // Activate filters based on rotation direction for the right filter
    if (currentAngleRight < 0) {
        // If dragging counter-clockwise, activate lowpass filter
        rightTrackFilter.type = 'lowpass';
    } else if (currentAngleRight > 0) {
        // If dragging clockwise, activate highpass filter
        rightTrackFilter.type = 'highpass';
    }

    // Map the rotation angle to filter frequency values
    const filterFrequencyRight = ((currentAngleRight + maximumRotation) / (2 * maximumRotation)) * 2000; // Frequency range from 0 to 2000 Hz
    rightTrackFilter.frequency.value = filterFrequencyRight;

    // Rotate the handle visually
    lowPassRightHandle.style.transform = `rotate(${currentAngleRight}deg)`;
}

// Function to stop dragging for the right filter
function stopDragFilterRight() {
    isDraggingRight = false;
}

// Event listeners for the right handle
lowPassRightHandle.addEventListener('mousedown', startDragFilterRight);
document.addEventListener('mousemove', handleDragFilterRight);
document.addEventListener('mouseup', stopDragFilterRight);

/***** END: Filter Handle Controls for Right Side ******/



/***** START: Initialize Global Variables ******/

// Elements
const audioFileInput1 = document.getElementById('audioFileInput1');
const audioFileInput2 = document.getElementById('audioFileInput2');
const toggleButton1 = document.querySelector('.left-table--start');
const toggleButton2 = document.querySelector('.right-table--start');
const leftDisk = document.querySelector('.left-table--disk');
const rightDisk = document.querySelector('.right-table--disk');

// Store the audio buffers globally
let audioBuffer1 = null;
let audioBuffer2 = null;

// State management
let source1 = null;
let source2 = null;
let startTime1 = 0;
let startTime2 = 0;
let pauseTime1 = 0;
let pauseTime2 = 0;
let isPlaying1 = false;
let isPlaying2 = false;
let rotationStartTime1 = 0;
let rotationStartTime2 = 0;
let rotationAngle1 = 0;
let rotationAngle2 = 0;

/***** END: Initialize Global Variables ******/



/***** START: Function to play the audio ******/

// Function to create and play audio source
function playAudio(buffer, pauseTime, gainNode) {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNode);
    source.start(0, pauseTime); // Start playing from the paused time
    return source;
}

/***** END: Function to play the audio ******/



// Function to stop and disconnect audio sources
function stopAudioSource(source, bufferNumber) {
    if (source) {
        source.stop();
        source.disconnect();
        if (bufferNumber === 1) {
            source1 = null;
        } else if (bufferNumber === 2) {
            source2 = null;
        }
    }
}


/***** START: Trigger audio play on toggle of start/stop button ******/

// Function to toggle audio play/pause
function toggleAudio(bufferNumber) {
    if (bufferNumber === 1) {
        if (!audioBuffer1) {
            console.warn('Please select Audio 1 file first.');
            return;
        }
        if (isPlaying1) {
            // Pause audio 1
            stopAudioSource(source1, 1);
            isPlaying1 = false;
            pauseTime1 += audioContext.currentTime - startTime1;
            rotationAngle1 += (pauseTime1 - rotationStartTime1) * 180; // Update rotation angle
        } else {
            // Resume or play audio 1
            source1 = playAudio(audioBuffer1, pauseTime1, gainNode1);
            startTime1 = audioContext.currentTime;
            rotationStartTime1 = audioContext.currentTime;
            isPlaying1 = true;
        }
    } else if (bufferNumber === 2) {
        if (!audioBuffer2) {
            console.warn('Please select Audio 2 file first.');
            return;
        }
        if (isPlaying2) {
            // Pause audio 2
            stopAudioSource(source2, 2);
            isPlaying2 = false;
            pauseTime2 += audioContext.currentTime - startTime2;
            rotationAngle2 += (pauseTime2 - rotationStartTime2) * 180; // Update rotation angle
        } else {
            // Resume or play audio 2
            source2 = playAudio(audioBuffer2, pauseTime2, gainNode2);
            startTime2 = audioContext.currentTime;
            rotationStartTime2 = audioContext.currentTime;
            isPlaying2 = true;
        }
    }
}

// Attach event listeners to toggle buttons
toggleButton1.addEventListener('click', function() {
    toggleAudio(1);
});

toggleButton2.addEventListener('click', function() {
    toggleAudio(2);
});

/***** END: Trigger audio play on toggle of start/stop button ******/




/***** START: Create file inputs as SVG elements ******/

// Create hidden file input elements
const fileInput1 = document.createElement('input');
fileInput1.type = 'file';
fileInput1.style.display = 'none'; // Keep it hidden
document.body.appendChild(fileInput1);

const fileInput2 = document.createElement('input');
fileInput2.type = 'file';
fileInput2.style.display = 'none'; // Keep it hidden
document.body.appendChild(fileInput2);

// Function to handle file input change
function handleFileInput(event, bufferNumber) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const arrayBuffer = e.target.result;

        if (bufferNumber === 1) {
            audioContext.decodeAudioData(arrayBuffer, function(buffer) {
                audioBuffer1 = buffer;
                console.log(audioBuffer1);
                console.log('Audio 1 data decoded successfully');
                toggleButton1.classList.remove('disabled');
                
            }, function(error) {
                console.error('Error decoding audio data:', error);
            });
        } else if (bufferNumber === 2) {
            audioContext.decodeAudioData(arrayBuffer, function(buffer) {
                audioBuffer2 = buffer;
                console.log('Audio 2 data decoded successfully');
                toggleButton2.classList.remove('disabled');
            }, function(error) {
                console.error('Error decoding audio data:', error);
            });
        }
    };
    reader.readAsArrayBuffer(file);
}

// Attach event listeners to the hidden file inputs
fileInput1.addEventListener('change', function(event) {
    handleFileInput(event, 1);
});

fileInput2.addEventListener('change', function(event) {
    handleFileInput(event, 2);
});

// Get the <g> elements
const addButton1 = document.querySelector('.left-table--add');
const addButton2 = document.querySelector('.right-table--add');

// Add click event listeners to the <g> elements to trigger the hidden file inputs
addButton1.addEventListener('click', function() {
    fileInput1.click();
});

addButton2.addEventListener('click', function() {
    fileInput2.click();
});

/***** END: Create file inputs as SVG elements ******/


/***** START: Handle Vertical & Horizontal Sliders ******/

// Define track boundaries for the sliders
const trackRight = document.querySelector('#VolumeRightTrack');
const handleRight = document.querySelector('#VolumeRightHandle');
const trackYRight1 = parseFloat(trackRight.getAttribute('y1')); // Top
const trackYRight2 = parseFloat(trackRight.getAttribute('y2')); // Bottom
const handleHeightRight = parseFloat(handleRight.getAttribute('height'));

const trackLeft = document.querySelector('#VolumeLeftTrack');
const handleLeft = document.querySelector('#VolumeLeftHandle');
const trackY1 = parseFloat(trackLeft.getAttribute('y1')); // Top
const trackY2 = parseFloat(trackLeft.getAttribute('y2')); // Bottom
const handleHeight = parseFloat(handleLeft.getAttribute('height'));

const faderTrack = document.querySelector('#FadeTrack');
const faderHandle = document.querySelector('#FadeHandle');
const faderTrackX1 = parseFloat(faderTrack.getAttribute('x1')); // Left
const faderTrackX2 = parseFloat(faderTrack.getAttribute('x2')); // Right
const faderHandleWidth = parseFloat(faderHandle.getAttribute('width'));

// Calculate the initial offset of the handle relative to the mouse position
let initialMouseY = 0;
let initialHandleY = 0;
let initialMouseX = 0;
let initialHandleX = 0;
let currentSlider = null; // To track which slider is being dragged

// Function to update handle and output value for the left volume slider
const updateHandleLeft = (y) => {
    if (!isNaN(y)) {
        const constrainedY = clamp(y, trackY2 - handleHeight, trackY1);
        handleLeft.setAttribute('y', constrainedY);
        const normalizedValue = (constrainedY - (trackY2 - handleHeight)) / (trackY1 - (trackY2 - handleHeight));
        track1GainValue = 1 - normalizedValue;
        gainNode1.gain.value = track1GainValue;
    }
};

// Function to update handle and output value for the right volume slider
const updateHandleRight = (y) => {
    if (!isNaN(y)) {
        const constrainedY = clamp(y, trackYRight2 - handleHeightRight, trackYRight1);
        handleRight.setAttribute('y', constrainedY);
        // const normalizedValue = (constrainedY - (trackYRight2 - handleHeightRight)) / (trackYRight1 - (trackYRight2 - handleHeight));
        const normalizedValue = (constrainedY - (trackYRight2 - handleHeightRight)) / (trackYRight1 - (trackYRight2 - handleHeightRight));
        track2GainValue = 1 - normalizedValue;
        gainNode2.gain.value = track2GainValue;
    }
};

// Function to update handle and output value for the crossfader
const updateFader = (x) => {
    if (!isNaN(x)) {
        // Constrain the handle's position within the track's boundaries
        const constrainedX = clamp(x, faderTrackX1, faderTrackX2 - faderHandleWidth);
        faderHandle.setAttribute('x', constrainedX);

        // Normalize the constrained handle position to a value between 0 and 1
        const normalizedValue = (constrainedX - faderTrackX1) / (faderTrackX2 - faderTrackX1 - faderHandleWidth);

        // Set gain values for the left and right audio sources based on fader position
        gainNode1.gain.value = 1 - normalizedValue;  // Left track fades out as the handle moves right
        gainNode2.gain.value = normalizedValue;    // Right track fades in as the handle moves right
    }
};


// Event handlers for dragging sliders
const onMouseMove = (e) => {
    if (currentSlider) {
        const mouseY = e.clientY;
        const mouseX = e.clientX;
        const deltaY = mouseY - initialMouseY;
        const deltaX = mouseX - initialMouseX;
        const newHandleY = initialHandleY + deltaY;
        const newHandleX = initialHandleX + deltaX;

        if (currentSlider === 'left') {
            updateHandleLeft(newHandleY);
        } else if (currentSlider === 'right') {
            updateHandleRight(newHandleY);
        } else if (currentSlider === 'fader') {
            updateFader(newHandleX);
        }
    }
};

const onMouseUp = () => {
    currentSlider = null;
};

handleLeft.addEventListener('mousedown', (e) => {
    currentSlider = 'left';
    initialMouseY = e.clientY;
    initialHandleY = parseFloat(handleLeft.getAttribute('y'));
    e.preventDefault();
});

handleRight.addEventListener('mousedown', (e) => {
    currentSlider = 'right';
    initialMouseY = e.clientY;
    initialHandleY = parseFloat(handleRight.getAttribute('y'));
    e.preventDefault();
});

faderHandle.addEventListener('mousedown', (e) => {
    currentSlider = 'fader';
    initialMouseX = e.clientX;
    initialHandleX = parseFloat(faderHandle.getAttribute('x'));
    e.preventDefault();
});

document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', onMouseUp);

/***** END: Handle Vertical Volume Sliders ******/



/***** Start: Animate the disks on play ******/

// Function to update disk rotation
function updateDiskRotation(disk, angle) {
    disk.style.transform = `rotate(${angle}deg)`;
}

// Rotate the disks continuously
function animateDisks() {
    const currentTime1 = audioContext.currentTime;
    if (isPlaying1) {
        rotationAngle1 += (currentTime1 - rotationStartTime1) * 180; // Degrees per second
        rotationStartTime1 = currentTime1;
        updateDiskRotation(leftDisk, rotationAngle1);
    }

    const currentTime2 = audioContext.currentTime;
    if (isPlaying2) {
        rotationAngle2 += (currentTime2 - rotationStartTime2) * 180; // Degrees per second
        rotationStartTime2 = currentTime2;
        updateDiskRotation(rightDisk, rotationAngle2);
    }

    requestAnimationFrame(animateDisks);
}

// Start animation loop
animateDisks();

/***** END: Animate the disks on play ******/






/***** START: Helper Functions ******/

// Helper function to constrain values
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

/***** END: Helper Functions ******/