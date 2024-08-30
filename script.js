// Create separate AudioContext instances for each audio
const audioContext1 = new (window.AudioContext || window.webkitAudioContext)();
const audioContext2 = new (window.AudioContext || window.webkitAudioContext)();

// Initialize track1GainValue
let track1GainValue = 1; // Default value for track1GainValue
let track2GainValue = 1; // Default value for track1GainValue

// Create a GainNode
const gainNode1 = audioContext1.createGain();
const gainNode2 = audioContext2.createGain();

// Connect the GainNode to the destination (speakers)
gainNode1.connect(audioContext1.destination);
gainNode2.connect(audioContext2.destination);

// Set the initial volume (0.5 is 50% volume, 1 is 100% volume)
gainNode1.gain.value = track1GainValue; // Use the initialized value
gainNode2.gain.value = track2GainValue;

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

// Define track boundaries for the new slider
const trackRight = document.querySelector('#VolumeRightTrack');
const handleRight = document.querySelector('#VolumeRightHandle');

const trackYRight1 = parseFloat(trackRight.getAttribute('y1')); // Top
const trackYRight2 = parseFloat(trackRight.getAttribute('y2')); // Bottom
const handleHeightRight = parseFloat(handleRight.getAttribute('height'));

// Select elements
const track = document.querySelector('#VolumeLeftTrack');
const handle = document.querySelector('#VolumeLeftHandle');

// Define track boundaries
const trackY1 = parseFloat(track.getAttribute('y1')); // Top
const trackY2 = parseFloat(track.getAttribute('y2')); // Bottom
const handleHeight = parseFloat(handle.getAttribute('height'));

// Calculate the initial offset of the handle relative to the mouse position
let initialMouseY = 0;
let initialHandleY = 0;

// Helper function to constrain values
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

// Function to update handle and output value
const updateHandleLeft = (y) => {
  if (!isNaN(y)) {
    // Constrain handle to the track boundaries
    const constrainedY = clamp(y, trackY2 - handleHeight, trackY1);
    handle.setAttribute('y', constrainedY);

    // Calculate and output the reversed normalized value (1 - normalizedValue)
    const normalizedValue = (constrainedY - (trackY2 - handleHeight)) / (trackY1 - (trackY2 - handleHeight));
    track1GainValue = 1 - normalizedValue;

    // Update the gain value for gainNode1
    gainNode1.gain.value = track1GainValue;
  }
};

// Function to update the handle and output value for the new slider
const updateHandleRight = (y) => {
    if (!isNaN(y)) {
      // Constrain handle to the track boundaries
      const constrainedY = clamp(y, trackYRight2 - handleHeightRight, trackYRight1);
      handleRight.setAttribute('y', constrainedY);
  
      // Calculate and output the reversed normalized value (1 - normalizedValue)
      const normalizedValue = (constrainedY - (trackYRight2 - handleHeightRight)) / (trackYRight1 - (trackYRight2 - handleHeightRight));
      track2GainValue = 1 - normalizedValue;
      
      // Update the gain value of the second audio context
      gainNode2.gain.value = track2GainValue;
    }
  };

// Initialize dragging
let isDraggingLeftVolume = false;

handle.addEventListener('mousedown', (e) => {
    isDraggingLeftVolume = true;
  initialMouseY = e.clientY;
  initialHandleY = parseFloat(handle.getAttribute('y'));
  e.preventDefault(); // Prevent default behavior for better dragging experience
});

document.addEventListener('mousemove', (e) => {
  if (isDraggingLeftVolume) {
    // Calculate the new handle position based on mouse movement
    const mouseY = e.clientY;
    const deltaY = mouseY - initialMouseY;
    const newHandleY = initialHandleY + deltaY;

    // Update handle position and output value
    updateHandleLeft(newHandleY);
  }
});

document.addEventListener('mouseup', () => {
    isDraggingLeftVolume = false;
});

// Initialize dragging for the new slider
let isDraggingRightVolume = false;

handleRight.addEventListener('mousedown', (e) => {
    isDraggingRightVolume = true;
  initialMouseY = e.clientY;
  initialHandleY = parseFloat(handleRight.getAttribute('y'));
  e.preventDefault(); // Prevent default behavior for better dragging experience
});

document.addEventListener('mousemove', (e) => {
  if (isDraggingRightVolume) {
    // Calculate the new handle position based on mouse movement
    const mouseY = e.clientY;
    const deltaY = mouseY - initialMouseY;
    const newHandleY = initialHandleY + deltaY;

    // Update handle position and output value
    updateHandleRight(newHandleY);
  }
});

document.addEventListener('mouseup', () => {
    isDraggingRightVolume = false;
});

// Function to handle file input change
function handleFileInput(event, bufferNumber) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const arrayBuffer = e.target.result;

        if (bufferNumber === 1) {
            audioContext1.decodeAudioData(arrayBuffer, function(buffer) {
                audioBuffer1 = buffer;
                console.log(audioBuffer1);
                console.log('Audio 1 data decoded successfully');
            }, function(error) {
                console.error('Error decoding audio data:', error);
            });
        } else if (bufferNumber === 2) {
            audioContext2.decodeAudioData(arrayBuffer, function(buffer) {
                audioBuffer2 = buffer;
                console.log('Audio 2 data decoded successfully');
            }, function(error) {
                console.error('Error decoding audio data:', error);
            });
        }
    };
    reader.readAsArrayBuffer(file);
}

// Attach event listeners to file inputs
audioFileInput1.addEventListener('change', function(event) {
    handleFileInput(event, 1);
});

audioFileInput2.addEventListener('change', function(event) {
    handleFileInput(event, 2);
});

// Function to create and play audio source
function playAudio(audioContext, buffer, pauseTime, gainNode) {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNode).connect(audioContext.destination);
    source.start(0, pauseTime); // Start playing from the paused time
    return source;
}

// Function to update disk rotation
function updateDiskRotation(disk, angle) {
    disk.style.transform = `rotate(${angle}deg)`;
}

// Function to toggle audio play/pause
function toggleAudio(bufferNumber) {
    if (bufferNumber === 1) {
        if (!audioBuffer1) {
            console.warn('Please select Audio 1 file first.');
            return;
        }
        if (isPlaying1) {
            // Pause audio 1
            audioContext1.suspend().then(() => {
                isPlaying1 = false;
                pauseTime1 += audioContext1.currentTime - startTime1;
                rotationAngle1 += (pauseTime1 - rotationStartTime1) * 180; // Update rotation angle
            });
        } else {
            // Resume or play audio 1
            if (!source1) {
                source1 = playAudio(audioContext1, audioBuffer1, pauseTime1, gainNode1);
                rotationStartTime1 = audioContext1.currentTime;
            }
            audioContext1.resume().then(() => {
                isPlaying1 = true;
            });
        }
    } else if (bufferNumber === 2) {
        if (!audioBuffer2) {
            console.warn('Please select Audio 2 file first.');
            return;
        }
        if (isPlaying2) {
            // Pause audio 2
            audioContext2.suspend().then(() => {
                isPlaying2 = false;
                pauseTime2 += audioContext2.currentTime - startTime2;
                rotationAngle2 += (pauseTime2 - rotationStartTime2) * 180; // Update rotation angle
            });
        } else {
            // Resume or play audio 2
            if (!source2) {
                source2 = playAudio(audioContext2, audioBuffer2, pauseTime2, gainNode2);
                rotationStartTime2 = audioContext2.currentTime;
            }
            audioContext2.resume().then(() => {
                isPlaying2 = true;
            });
        }
    }
}

// Attach event listeners to toggle buttons
toggleButton1.addEventListener('click', function() {
    toggleAudio(1);
    console.log('spin table left');
});

toggleButton2.addEventListener('click', function() {
    toggleAudio(2);
    console.log('spin table right');
});

// Rotate the disks continuously
function animateDisks() {
    const currentTime1 = audioContext1.currentTime;
    if (isPlaying1) {
        rotationAngle1 += (currentTime1 - rotationStartTime1) * 180; // Degrees per second
        rotationStartTime1 = currentTime1;
        updateDiskRotation(leftDisk, rotationAngle1);
    }

    const currentTime2 = audioContext2.currentTime;
    if (isPlaying2) {
        rotationAngle2 += (currentTime2 - rotationStartTime2) * 180; // Degrees per second
        rotationStartTime2 = currentTime2;
        updateDiskRotation(rightDisk, rotationAngle2);
    }

    requestAnimationFrame(animateDisks);
}

// Start animation loop
animateDisks();
