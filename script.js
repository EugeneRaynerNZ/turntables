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
let player1 = null;
let player2 = null;
let rotationStartTime1 = 0;
let rotationStartTime2 = 0;
let rotationAngle1 = 0;
let rotationAngle2 = 0;

/***** END: Initialize Global Variables ******/



/***** START: Custom Audio Player Class ******/

class CustomAudioPlayer {
    constructor(audioContext, buffer, gainNode) {
        this.audioContext = audioContext;
        this.buffer = buffer;
        this.gainNode = gainNode;
        this.isPlaying = false;
        this.startTime = 0;
        this.pauseTime = 0;
        this.source = null;
    }

    play() {
        if (this.isPlaying) return;
        
        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.connect(this.gainNode);
        
        const offset = this.pauseTime;
        this.source.start(0, offset);
        this.startTime = this.audioContext.currentTime - offset;
        this.isPlaying = true;

        this.source.onended = () => {
            if (this.isPlaying) {
                this.pause();
                this.pauseTime = 0;
            }
        };
    }

    pause() {
        if (!this.isPlaying) return;
        
        const elapsed = this.audioContext.currentTime - this.startTime;
        this.pauseTime = elapsed;
        this.source.stop();
        this.isPlaying = false;
    }

    getCurrentTime() {
        if (this.isPlaying) {
            return this.audioContext.currentTime - this.startTime;
        }
        return this.pauseTime;
    }

    setCurrentTime(time) {
        if (this.isPlaying) {
            this.pause();
            this.pauseTime = time;
            this.play();
        } else {
            this.pauseTime = time;
        }
    }
}

/***** END: Custom Audio Player Class ******/



/***** START: Trigger audio play on toggle of start/stop button ******/

// Function to toggle audio play/pause
function toggleAudio(playerNumber) {
    let player, toggleButton;
    
    if (playerNumber === 1) {
        if (!audioBuffer1) {
            console.warn('Please select Audio 1 file first.');
            return;
        }
        if (!player1) {
            player1 = new CustomAudioPlayer(audioContext, audioBuffer1, gainNode1);
        }
        player = player1;
        toggleButton = toggleButton1;
    } else if (playerNumber === 2) {
        if (!audioBuffer2) {
            console.warn('Please select Audio 2 file first.');
            return;
        }
        if (!player2) {
            player2 = new CustomAudioPlayer(audioContext, audioBuffer2, gainNode2);
        }
        player = player2;
        toggleButton = toggleButton2;
    }

    if (player.isPlaying) {
        player.pause();
        toggleButton.classList.remove('playing');
    } else {
        player.play();
        toggleButton.classList.add('playing');
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

const leftInfoContainer = document.querySelector('.left-table--information');
const rightInfoContainer = document.querySelector('.right-table--information');

function fileInformation(file, playerNumber) {
    // Determine which container to use based on the player number
    const infoContainer = playerNumber === 1 ? leftInfoContainer : rightInfoContainer;

    // Remove any existing file info for this player
    const existingInfo = infoContainer.querySelectorAll('text');
    existingInfo.forEach(el => el.remove());

    const fileName = file.name;
    const fileSize = (file.size / 1024 / 1024).toFixed(2); // Convert to MB and round to 2 decimal places
    const fileType = file.type;

    const infoTexts = [
        `Player ${playerNumber}`,
        `File: ${fileName}`,
        `Size: ${fileSize} MB`,
        `Type: ${fileType}`
    ];

    // Set the correct translation based on the player number
    const translateX = playerNumber === 1 ? 90 : 760;

    infoTexts.forEach((text, index) => {
        const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textElement.setAttribute('x', '10');
        textElement.setAttribute('y', (index * 20 + 20).toString());
        textElement.setAttribute('fill', 'white');
        textElement.setAttribute('font-size', '14');
        textElement.setAttribute('transform', `translate(${translateX}, 441)`);
        textElement.textContent = text;
        infoContainer.appendChild(textElement);
    });
}

// ... rest of your code ...

// Update the handleFileInput function
function handleFileInput(event, bufferNumber) {
    const file = event.target.files[0];
    if (!file) return;

    fileInformation(file, bufferNumber);

    const reader = new FileReader();
    reader.onload = function(e) {
        const arrayBuffer = e.target.result;

        if (bufferNumber === 1) {
            audioContext.decodeAudioData(arrayBuffer, function(buffer) {
                audioBuffer1 = buffer;
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



/***** Start: Animate both disks with reverse functionality ******/

// Function to update disk rotation
function updateDiskRotation(disk, angle) {
    disk.style.transform = `rotate(${angle}deg)`;
}

// Variables to track dragging state for both disks
let diskDraggingLeft = false;
let diskDraggingRight = false;
let lastAngleLeft = 0;
let lastAngleRight = 0;
let currentDiskAngleLeft = 0;
let currentDiskAngleRight = 0;
let reverseSpeed = 1; // Adjust this to change the reverse speed

// Function to calculate angle from mouse position
function calculateAngle(event, disk) {
    const rect = disk.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(event.clientY - centerY, event.clientX - centerX);
}

// Function to handle disk dragging
function handleDiskDrag(event) {
    if (diskDraggingLeft) {
        handleSingleDiskDrag(event, leftDisk, player1, 'left');
    } else if (diskDraggingRight) {
        handleSingleDiskDrag(event, rightDisk, player2, 'right');
    }
}

function handleSingleDiskDrag(event, disk, player, side) {
    const newAngle = calculateAngle(event, disk);
    let lastAngle = side === 'left' ? lastAngleLeft : lastAngleRight;
    let angleDiff = newAngle - lastAngle;

    // Normalize angle difference
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

    // Update current angle
    if (side === 'left') {
        currentDiskAngleLeft += angleDiff;
        lastAngleLeft = newAngle;
    } else {
        currentDiskAngleRight += angleDiff;
        lastAngleRight = newAngle;
    }

    // Update disk rotation
    updateDiskRotation(disk, (side === 'left' ? currentDiskAngleLeft : currentDiskAngleRight) * (180 / Math.PI));

    // Reverse audio if rotating anti-clockwise
    if (angleDiff < 0 && player) {
        const currentTime = player.getCurrentTime();
        const newTime = currentTime - (Math.abs(angleDiff) / Math.PI) * reverseSpeed;
        player.setCurrentTime(Math.max(0, newTime));
    }
}

// Rotate the disks continuously when playing forward
function animateDisks() {
    if (player1 && player1.isPlaying && !diskDraggingLeft) {
        currentDiskAngleLeft = (player1.getCurrentTime() * Math.PI) % (2 * Math.PI);
        updateDiskRotation(leftDisk, currentDiskAngleLeft * (180 / Math.PI));
    }
    if (player2 && player2.isPlaying && !diskDraggingRight) {
        currentDiskAngleRight = (player2.getCurrentTime() * Math.PI) % (2 * Math.PI);
        updateDiskRotation(rightDisk, currentDiskAngleRight * (180 / Math.PI));
    }
    requestAnimationFrame(animateDisks);
}

// Start animation loop
animateDisks();

// Event listeners for disk dragging
leftDisk.addEventListener('mousedown', (e) => {
    diskDraggingLeft = true;
    lastAngleLeft = calculateAngle(e, leftDisk);
    if (player1 && player1.isPlaying) {
        player1.pause();
    }
});

rightDisk.addEventListener('mousedown', (e) => {
    diskDraggingRight = true;
    lastAngleRight = calculateAngle(e, rightDisk);
    if (player2 && player2.isPlaying) {
        player2.pause();
    }
});

document.addEventListener('mousemove', handleDiskDrag);

document.addEventListener('mouseup', () => {
    if (diskDraggingLeft) {
        diskDraggingLeft = false;
        if (player1 && !player1.isPlaying && toggleButton1.classList.contains('playing')) {
            player1.play();
        }
    }
    if (diskDraggingRight) {
        diskDraggingRight = false;
        if (player2 && !player2.isPlaying && toggleButton2.classList.contains('playing')) {
            player2.play();
        }
    }
});

/***** END: Animate both disks with reverse functionality ******/






/***** START: Helper Functions ******/

// Helper function to constrain values
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

/***** END: Helper Functions ******/