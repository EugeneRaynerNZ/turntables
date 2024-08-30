// const knob = document.querySelector("#knob");
// const knobHandle = document.querySelector("#knob-handle");
// const leftSide = document.querySelector("#circle-left");
// const rightSide = document.querySelector("#circle-right");
// const value = document.querySelector("#frequencyValue");
// const turntable = document.querySelector("#turntable");

// let isDragging = false;
// let isDraggingLeft = false; // Track if dragging to the left
// let isDraggingRight = false; // Track if dragging to the right
// let startAngle = 0;
// let currentAngle = 0;
// let counterClockwiseValue = 1000; // Starts at 1000 for anticlockwise rotation
// let clockwiseValue = 1000; // Starts at 1000 for clockwise rotation
// let percentageValue = 0; // Initialize the percentage from -100% to 100%
// let variableA = 1000; // Variable A mapped from percentage (-100% to 0%)
// let variableB = 1000; // Variable B mapped from percentage (0% to 100%)
// let maximumRotation = 140;
// let extendedValue = 2000;

// let audioPlaying = false;

// // knobHandle.addEventListener("mousedown", startDrag);
// // document.addEventListener("mousemove", handleDrag);
// // document.addEventListener("mouseup", stopDrag);

// {/* <audio autoplay="false" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/858/outfoxing.mp3" crossorigin="anonymous" ></audio> */}

// var leftTableAudio = new Audio("https://www.cineblueone.com/maskWall/audio/skylar.mp3"); //Celine Dion's "Ashes"
// var rightTableAudio = new Audio("https://s3-us-west-2.amazonaws.com/s.cdpn.io/858/outfoxing.mp3"); //Celine Dion's "Ashes"

// // For cross-browser support
// const AudioContext = window.AudioContext || window.webkitAudioContext;
// const audioCtx = new AudioContext();

// // Load some sound
// const audioElement = document.querySelector("audio");
// const track = audioCtx.createMediaElementSource(audioElement);

// // Create biquad filter and set initial value
// const biquadFilter = audioCtx.createBiquadFilter();
// biquadFilter.type = "lowpass";
// biquadFilter.frequency.value = extendedValue;

// function main() {
//   connectPlayButton();
//   track.connect(biquadFilter).connect(audioCtx.destination);
// }

// function connectPlayButton() {
//   const playButton = document.querySelector(".play");
//   playButton.addEventListener(
//     "click",
//     function () {
//       handlePlayButtonClick(this);
//     },
//     false
//   );
// }

// function handlePlayButtonClick(button) {
//   if (audioCtx.state === "suspended") {
//     audioCtx.resume();
//   }

//   if (!audioPlaying) {
//     audioElement.play();
//     turntable.classList.add("rotating");
//   } else {
//     audioElement.pause();
//     turntable.classList.remove("rotating");
//   }

//   audioPlaying = !audioPlaying;
// }

// function startDrag(event) {
//   isDragging = true;
//   isDraggingLeft = false; // Reset direction flags
//   isDraggingRight = false;

//   const rect = knob.getBoundingClientRect();
//   const centerX = rect.left + rect.width / 2;
//   const centerY = rect.top + rect.height / 2;
//   startAngle =
//     Math.atan2(event.clientY - centerY, event.clientX - centerX) *
//     (180 / Math.PI);
//   event.preventDefault(); // Prevent default drag behavior
// }

// function handleDrag(event) {
//   if (!isDragging) return;

//   const rect = knob.getBoundingClientRect();
//   const centerX = rect.left + rect.width / 2;
//   const centerY = rect.top + rect.height / 2;

//   const newAngle =
//     Math.atan2(event.clientY - centerY, event.clientX - centerX) *
//     (180 / Math.PI);

//   let angleDiff = newAngle - startAngle;

//   // Adjust angle difference to handle the rotation correctly
//   if (angleDiff < -180) angleDiff += 360;
//   if (angleDiff > 180) angleDiff -= 360;

//   // Determine direction of the drag
//   if (angleDiff < 0) {
//     isDraggingLeft = true;
//     isDraggingRight = false;
//   } else if (angleDiff > 0) {
//     isDraggingRight = true;
//     isDraggingLeft = false;
//   }

//   currentAngle += angleDiff;
//   startAngle = newAngle;

//   // Restrict rotation between -110 degrees and +110 degrees
//   if (currentAngle > maximumRotation) {
//     currentAngle = maximumRotation;
//   } else if (currentAngle < -maximumRotation) {
//     currentAngle = -maximumRotation;
//   }

//   // Calculate the counterclockwise and clockwise values based on currentAngle
//   if (isDraggingLeft) {
//     // Map currentAngle (-110 to 0) to (1000 to 0) for anticlockwise
//     counterClockwiseValue = Math.round(
//       1000 - (currentAngle + maximumRotation) * (1000 / maximumRotation)
//     );
//   } else if (isDraggingRight) {
//     // Map currentAngle (0 to 110) to (1000 to 0) for clockwise
//     clockwiseValue = Math.round(1000 - currentAngle * (1000 / maximumRotation));
//   }

//   // Calculate variables A and B based on the percentage value
//   if (percentageValue < 0) {
//     // Map percentage (-100% to 0%) to variableA (1000 to 0)
//     variableA = Math.round(1000 + percentageValue * (180 / 100)); // percentageValue is negative, so it adds up to 1000
//     variableB = 1000; // Reset variableB to 0
//   } else {
//     // Map percentage (0% to 100%) to variableB (1000 to 0)
//     variableB = Math.round(1000 - percentageValue * (180 / 100));
//     variableA = 1000; // Reset variableA to 0
//   }

//   percentageValue = Math.floor((currentAngle / maximumRotation) * 100);

//   // Calculate the extended value based on the currentAngle
//   filtervalue =
//     ((currentAngle + maximumRotation) / (2 * maximumRotation)) * 2000;
//   biquadFilter.frequency.value = filtervalue;

//   // Update biquad filter frequency value

//   // Rotate the entire knob container
//   knob.style.transform = `rotate(${currentAngle}deg)`;
//   leftSide.style.strokeDashoffset = variableB;
//   rightSide.style.strokeDashoffset = variableA;
//   value.innerHTML = `${percentageValue}%`;

//   console.log(isDragging);
// }

// function stopDrag() {
//   isDragging = false;
//   isDraggingLeft = false;
//   isDraggingRight = false;
// }

// main();

// const slider = document.getElementById("volume-left-slider");
// const sliderHandle = document.getElementById("sliderHandle");
// const sliderTrack = document.getElementById("sliderTrack");
// let sliderIsDragging = false;

// sliderHandle.addEventListener("mousedown", (e) => {
//   sliderIsDragging = true;
// });

// slider.addEventListener("mousemove", (e) => {
//   if (!sliderIsDragging) return;

//   const rect = slider.getBoundingClientRect();
//   let newX = e.clientX - rect.left - sliderHandle.width.baseVal.value / 2;
//   newX = Math.max(0, Math.min(newX, 285 - sliderHandle.width.baseVal.value)); // Ensure the handle stays within bounds

//   sliderHandle.setAttribute("x", newX);
// });

// slider.addEventListener("mouseup", () => {
//   sliderIsDragging = false;
// });

// slider.addEventListener("mouseleave", () => {
//   sliderIsDragging = false;
// });

const volumeLeft = document.querySelector(".volume-left-slider");
const volumeLeftTrack = document.querySelector("#VolumeLeftTrack");
const volumeLeftHandle = document.querySelector("#VolumeLeftHandle");

// const svgHeight = volumeLeft.clientHeight;
// const trackHeight =
//   parseFloat(volumeLeftTrack.getAttribute("y2")) -
//   parseFloat(volumeLeftTrack.getAttribute("y1"));

// let isDraggingVolumeLeft = false;

// function updateHandlePosition(y) {
//   // Limit handle position to within the track
//   const handleY = Math.max(2, Math.min(y, svgHeight - 20)); // 20 is handle height
//   volumeLeftHandle.setAttribute("y", handleY);

//   // Calculate the slider value
//   const value = ((svgHeight - handleY) / trackHeight) * 100;
//   console.log("Slider Value:", Math.round(value));
// }

// volumeLeft.addEventListener("mousedown", (e) => {
//   isDraggingVolumeLeft = true;
//   updateHandlePosition(e.clientY - volumeLeft.getBoundingClientRect().top);
// });

// volumeLeft.addEventListener("mousemove", (e) => {
//   if (isDraggingVolumeLeft) {
//     updateHandlePosition(e.clientY - volumeLeft.getBoundingClientRect().top);
//   }
// });

// volumeLeft.addEventListener("mouseup", () => {
//   isDraggingVolumeLeft = false;
// });

// volumeLeft.addEventListener("mouseleave", () => {
//   isDraggingVolumeLeft = false;
// });

// Create separate AudioContext instances for each audio
const audioContext1 = new (window.AudioContext || window.webkitAudioContext)();
const audioContext2 = new (window.AudioContext || window.webkitAudioContext)();

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
function playAudio(audioContext, buffer, pauseTime) {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
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
                source1 = playAudio(audioContext1, audioBuffer1, pauseTime1);
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
                source2 = playAudio(audioContext2, audioBuffer2, pauseTime2);
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



