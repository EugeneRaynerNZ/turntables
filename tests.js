/***** START: Create Audio Context ******/

// Create a single AudioContext
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Create GainNodes for each track
const gainNode1 = audioContext.createGain();
const gainNode2 = audioContext.createGain();

// Create a master GainNode
const masterGainNode = audioContext.createGain();

// Create an AnalyserNode for the main audio output
// const analyserNode = audioContext.createAnalyser();

// Connect the master GainNode to the destination
masterGainNode.connect(audioContext.destination);

// Connect the master GainNode to the AnalyserNode
// masterGainNode.connect(analyserNode);

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

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

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
  constructor(audioContext, buffer, gainNode, filterNode = null) {
      this.audioContext = audioContext;
      this.buffer = buffer;
      this.gainNode = gainNode;
      this.filterNode = filterNode;  // Add the filter node as an optional parameter
      this.isPlaying = false;
      this.startTime = 0;
      this.pauseTime = 0;
      this.source = null;
  }

  play() {
      if (this.isPlaying) return;
      
      this.source = this.audioContext.createBufferSource();
      this.source.buffer = this.buffer;

      // Connect the source to the filter if it exists, otherwise directly to gain node
      if (this.filterNode) {
          this.source.connect(this.filterNode);
          this.filterNode.connect(this.gainNode);
      } else {
          this.source.connect(this.gainNode);
      }
      
      this.gainNode.connect(this.audioContext.destination);

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

/***** END: Updated Custom Audio Player Class ******/




/***** START: Filter Control Classes ******/

class FilterControl {
    constructor(filterElement, audioFilter, filterType, channel, initialQ = 1) {
        this.filterElement = filterElement;
        this.audioFilter = audioFilter;
        this.filterType = filterType;
        this.channel = channel;
        this.isDragging = false;
        this.startAngle = 0;
        this.currentAngle = 0;
        this.maximumRotation = 110;
        this.initialQ = initialQ;

        this.initFilter();
        this.initEventListeners();
    }

    initFilter() {
        if (this.audioFilter && this.audioFilter.Q) {
            this.audioFilter.Q.value = this.initialQ;
        }
    }

    initEventListeners() {
        this.filterElement.addEventListener('mousedown', this.startDrag.bind(this));
        document.addEventListener('mousemove', this.handleDrag.bind(this));
        document.addEventListener('mouseup', this.stopDrag.bind(this));
    }

    startDrag(event) {
        this.isDragging = true;
        const rect = this.filterElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        this.startAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
        event.preventDefault();
    }

    handleDrag(event) {
        if (!this.isDragging) return;

        const rect = this.filterElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const newAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
        let angleDiff = newAngle - this.startAngle;

        if (angleDiff < -180) angleDiff += 360;
        if (angleDiff > 180) angleDiff -= 360;

        this.currentAngle += angleDiff;
        this.startAngle = newAngle;

        this.currentAngle = Math.max(-this.maximumRotation, Math.min(this.maximumRotation, this.currentAngle));

        this.updateFilter();
        this.rotateHandle();
    }

    stopDrag() {
        this.isDragging = false;
    }

    updateFilter() {
        // To be implemented in subclasses
    }

    rotateHandle() {
        this.filterElement.style.transform = `rotate(${this.currentAngle}deg)`;
    }
}

class HighShelfFilter extends FilterControl {
    constructor(filterElement, audioFilter, filterType, channel) {
        super(filterElement, audioFilter, filterType, channel);
        this.minFreq = 1000;  // 1kHz
        this.maxFreq = 20000; // 20kHz
        this.defaultFreq = 3000; // 3kHz
        // this.minGain = -40; // Minimum gain in dB
        // this.maxGain = 40;  // Maximum gain in dB
    }

    updateFilter() {
        const normalizedValue = (this.currentAngle + this.maximumRotation) / (2 * this.maximumRotation);
        const frequency = Math.exp(Math.log(this.minFreq) + normalizedValue * (Math.log(this.maxFreq) - Math.log(this.minFreq)));
        // const gain = this.minGain + normalizedValue * (this.maxGain - this.minGain);
        this.audioFilter.frequency.value = frequency;
        // this.audioFilter.gain.value = gain;

        console.log(`Frequency: ${this.audioFilter.frequency.value}`);
    }
}

class LowShelfFilter extends FilterControl {
    constructor(filterElement, audioFilter, filterType, channel) {
        super(filterElement, audioFilter, filterType, channel);
        this.minFreq = 20;   // 20Hz
        this.maxFreq = 1000; // 1kHz
        this.defaultFreq = 100; // 100Hz
        // this.minGain = -40; // Minimum gain in dB
        // this.maxGain = 40;  // Maximum gain in dB
    }

    updateFilter() {
        const normalizedValue = (this.currentAngle + this.maximumRotation) / (2 * this.maximumRotation);
        const frequency = Math.exp(Math.log(this.minFreq) + normalizedValue * (Math.log(this.maxFreq) - Math.log(this.minFreq)));
        // const gain = this.minGain + normalizedValue * (this.maxGain - this.minGain);
        this.audioFilter.frequency.value = frequency;
        // this.audioFilter.gain.value = gain;

        // console.log(`Frequency: ${this.audioFilter.frequency.value}, Gain: ${this.audioFilter.gain.value}`);
        console.log(`Frequency: ${this.audioFilter.frequency.value}`);
    }
}

class BandpassFilter extends FilterControl {
    constructor(filterElement, audioFilter, filterType, channel) {
        super(filterElement, audioFilter, filterType, channel);
        this.minFreq = 500;   // 500Hz
        this.maxFreq = 5000; // 5kHz
        this.defaultFreq = 1000; // 1kHz
        this.minQ = 0.1;
        this.maxQ = 10;
        this.defaultQ = 1;
    }

    updateFilter() {
        const normalizedValue = (this.currentAngle + this.maximumRotation) / (2 * this.maximumRotation);
        const frequency = Math.exp(Math.log(this.minFreq) + normalizedValue * (Math.log(this.maxFreq) - Math.log(this.minFreq)));
        const Q = this.minQ + normalizedValue * (this.maxQ - this.minQ);
        this.audioFilter.frequency.value = frequency;
        this.audioFilter.Q.value = Q;

        console.log(`Frequency: ${this.audioFilter.frequency.value}, Q: ${this.audioFilter.Q.value}`);
    }
}

class DualFilterControl extends FilterControl {
    constructor(filterElement, lowPassFilter, highPassFilter, channel) {
        super(filterElement, null, 'dual', channel);
        this.lowPassFilter = lowPassFilter;
        this.highPassFilter = highPassFilter;
        this.minFreq = 20;   // 20Hz
        this.maxFreq = 20000; // 20kHz
        this.defaultFreq = 1000; // 1kHz

        this.initFilter();
    }

    initFilter() {
        // Initialize the filters with default values
        if (this.lowPassFilter && this.highPassFilter) {
            this.lowPassFilter.frequency.value = this.defaultFreq;
            this.highPassFilter.frequency.value = this.maxFreq;
        }
    }

    updateFilter() {
        const normalizedValue = (this.currentAngle + this.maximumRotation) / (2 * this.maximumRotation);
        const frequency = Math.exp(Math.log(this.minFreq) + normalizedValue * (Math.log(this.maxFreq) - Math.log(this.minFreq)));

        if (this.currentAngle < 0) {
            // Increase low-pass filter
            this.lowPassFilter.frequency.value = frequency;
            this.highPassFilter.frequency.value = this.maxFreq;
        } else {
            // Increase high-pass filter
            this.highPassFilter.frequency.value = frequency;
            this.lowPassFilter.frequency.value = this.minFreq;
        }

        console.log(`Low-pass Frequency: ${this.lowPassFilter.frequency.value}, High-pass Frequency: ${this.highPassFilter.frequency.value}`);
    }
}

class VolumeControl extends FilterControl {
    constructor(filterElement, gainNode, channel) {
        super(filterElement, gainNode, 'volume', channel);
        this.minGain = 0;  // Minimum gain (mute)
        this.maxGain = 1;  // Maximum gain (full volume)
        this.defaultGain = 1; // Default gain
    }

    updateFilter() {
        const normalizedValue = (this.currentAngle + this.maximumRotation) / (2 * this.maximumRotation);
        const gain = this.minGain + normalizedValue * (this.maxGain - this.minGain);
        this.audioFilter.gain.value = gain;

        console.log(`Volume: ${this.audioFilter.gain.value}`);
    }
}


// Audio setup
// const audioContext = new (window.AudioContext || window.webkitAudioContext)();
// const gainNode1 = audioContext.createGain();
// Create high shelf filter for the left track
const highShelfFilterLeft = audioContext.createBiquadFilter();
highShelfFilterLeft.type = 'highshelf';

// Initialize HighShelfFilter control
const highShelfElementLeft = document.querySelector('.high-filter--left');
const highShelfControlLeft = new HighShelfFilter(highShelfElementLeft, highShelfFilterLeft, 'highshelf', 'left');

// When loading Audio 1 and creating player 1
if (!player1) {
    player1 = new CustomAudioPlayer(audioContext, audioBuffer1, gainNode1, highShelfFilterLeft);
}

// Toggle audio play/pause for player 1 with the filter connected
// toggleButton1.addEventListener('click', function() {
//     toggleAudio(1);
// });




// // Initialize the dual filter controls
// const dualFilterElementLeft = document.querySelector('.lp-hp--left');
// const dualFilterElementRight = document.querySelector('.lp-hp--right');
// const highShelfElementLeft = document.querySelector('.high-filter--left');
// const highShelfElementRight = document.querySelector('.high-filter--right');
// const lowShelfElementLeft = document.querySelector('.low-filter--left');
// const lowShelfElementRight = document.querySelector('.low-filter--right');
// const bandpassElementLeft = document.querySelector('.mid-filter--left');
// const bandpassElementRight = document.querySelector('.mid-filter--right');

// const lowPassFilterLeft = audioContext.createBiquadFilter();
// const highPassFilterLeft = audioContext.createBiquadFilter();
// const lowPassFilterRight = audioContext.createBiquadFilter();
// const highPassFilterRight = audioContext.createBiquadFilter();
// const highShelfFilterLeft = audioContext.createBiquadFilter();
// const highShelfFilterRight = audioContext.createBiquadFilter();
// const bandpassFilterLeft = audioContext.createBiquadFilter();
// const bandpassFilterRight = audioContext.createBiquadFilter();
// const lowShelfFilterLeft = audioContext.createBiquadFilter();
// const lowShelfFilterRight = audioContext.createBiquadFilter();

// lowPassFilterLeft.type = 'lowpass';
// highPassFilterLeft.type = 'highpass';
// lowPassFilterRight.type = 'lowpass';
// highPassFilterRight.type = 'highpass';
// highShelfFilterLeft.type = 'highshelf';
// highShelfFilterRight.type = 'highshelf';
// bandpassFilterLeft.type = 'bandpass';
// bandpassFilterRight.type = 'bandpass';
// lowShelfFilterLeft.type = 'lowshelf';
// lowShelfFilterRight.type = 'lowshelf';

// const dualFilterControlRight = new DualFilterControl(dualFilterElementRight, lowPassFilterRight, highPassFilterRight, 'right');
// const dualFilterControlLeft = new DualFilterControl(dualFilterElementLeft, lowPassFilterLeft, highPassFilterLeft, 'left');
// const highShelfControlLeft = new HighShelfFilter(highShelfElementLeft, highShelfFilterLeft, 'highshelf', 'left');
// const highShelfControlRight = new HighShelfFilter(highShelfElementRight, highShelfFilterRight, 'highshelf', 'right');
// const lowShelfControlLeft = new LowShelfFilter(lowShelfElementLeft, lowShelfFilterLeft, 'lowshelf', 'left');
// const lowShelfControlRight = new LowShelfFilter(lowShelfElementRight, lowShelfFilterRight, 'lowshelf', 'right');
// const bandpassControlLeft = new BandpassFilter(bandpassElementLeft, bandpassFilterLeft, 'bandpass', 'left');
// const bandpassControlRight = new BandpassFilter(bandpassElementRight, bandpassFilterRight, 'bandpass', 'right');


// gainNode1
//   .connect(lowShelfFilterLeft)
//   .connect(highShelfFilterLeft)
//   .connect(bandpassFilterLeft)
//   .connect(masterGainNode); 

// gainNode2
//   .connect(lowShelfFilterRight)
//   .connect(highShelfFilterRight)
//   .connect(bandpassFilterRight)
//   .connect(masterGainNode);


// // Routing for the left audio source (gainNode1)
// gainNode1
//   .connect(lowShelfFilterLeft)
//   .connect(highShelfFilterLeft)
//   .connect(bandpassFilterLeft)
//   .connect(lowPassFilterLeft)
//   .connect(highPassFilterLeft)
//   .connect(masterGainNode); // Ensure to connect the final filter to the master gain

// // Routing for the right audio source (gainNode2)
// gainNode2
//   .connect(lowShelfFilterRight)
//   .connect(highShelfFilterRight)
//   .connect(bandpassFilterRight)
//   .connect(lowPassFilterRight)
//   .connect(highPassFilterRight)
//   .connect(masterGainNode); // Ensure to connect the final filter to the master gain


// bandpassFilterLeft.frequency.value = 1000; 
// bandpassFilterLeft.Q.value = 1; 
// lowShelfFilterLeft.frequency.value = 100; 
// bandpassFilterRight.frequency.value = 1000; 
// bandpassFilterRight.Q.value = 1; 
// lowShelfFilterRight.frequency.value = 100; 

/***** END: Create Filters for Each Track ******/

// Create the volume control GainNode
const volumeControlGainNode = audioContext.createGain();
volumeControlGainNode.gain.value = 1; // Set initial volume to full

// Connect the volume control GainNode to the masterGainNode
volumeControlGainNode.connect(masterGainNode);

// Initialize the volume control
const volumeControlElement = document.querySelector('.gain--master');
const volumeControl = new VolumeControl(volumeControlElement, volumeControlGainNode, 'master');

// Create the dual filter GainNode
const masterLowPassFilter = audioContext.createBiquadFilter();
masterLowPassFilter.type = 'lowpass';
const masterHighPassFilter = audioContext.createBiquadFilter();
masterHighPassFilter.type = 'highpass';

// Connect the dual filters to the masterGainNode
masterGainNode.connect(masterLowPassFilter);
masterLowPassFilter.connect(masterHighPassFilter);
masterHighPassFilter.connect(audioContext.destination);

// Initialize the dual filter control
const masterDualFilterElement = document.querySelector('.lp-hp--master');
const masterDualFilterControl = new DualFilterControl(masterDualFilterElement, masterLowPassFilter, masterHighPassFilter, 'master');



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
        `File: ${fileName}`,
        `Size: ${fileSize} MB`,
        `Type: ${fileType}`
    ];

    // Set the correct translation based on the player number
    const translateX = playerNumber === 1 ? 17 : 943;

    infoTexts.forEach((text, index) => {
        const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textElement.setAttribute('x', '0');
        textElement.setAttribute('y', (index * 16 + 16).toString());
        textElement.setAttribute('fill', 'white');
        textElement.setAttribute('font-size', '14');
        textElement.setAttribute('transform', `translate(${translateX}, 12)`);
        textElement.textContent = text;
        infoContainer.appendChild(textElement);
    });
}

// ... existing code ...

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
                
                // Restart player 1 if it exists
                if (player1) {
                    player1.pause();
                    player1 = new CustomAudioPlayer(audioContext, audioBuffer1, gainNode1);
                    if (toggleButton1.classList.contains('playing')) {
                        player1.play();
                    }
                }
                
                // Log AudioContext and filter values
                console.log('AudioContext and filter values after loading Audio 1:');
                console.log('Sample rate:', audioContext.sampleRate);
                console.log('Current time:', audioContext.currentTime);
                console.log('State:', audioContext.state);
                console.log('Gain Node 1 value:', gainNode1.gain.value);
                console.log('Gain Node 2 value:', gainNode2.gain.value);
                console.log('Master Gain Node value:', masterGainNode.gain.value);
                console.log('High Shelf Filter Left:');
                console.log('  Frequency:', highShelfFilterLeft.frequency.value);
                console.log('  Gain:', highShelfFilterLeft.gain.value);
                console.log('Mid Filter Left:');
                console.log('  Frequency:', bandpassFilterLeft.frequency.value);
                console.log('  Q:', bandpassFilterLeft.Q.value);
                console.log('Low Filter Left:');
                console.log('  Frequency:', lowShelfFilterLeft.frequency.value);
                console.log('  Gain:', lowShelfFilterLeft.gain.value);
            }, function(error) {
                console.error('Error decoding audio data:', error);
            });
        } else if (bufferNumber === 2) {
            audioContext.decodeAudioData(arrayBuffer, function(buffer) {
                audioBuffer2 = buffer;
                console.log('Audio 2 data decoded successfully');
                toggleButton2.classList.remove('disabled');
                
                // Restart player 2 if it exists
                if (player2) {
                    player2.pause();
                    player2 = new CustomAudioPlayer(audioContext, audioBuffer2, gainNode2);
                    if (toggleButton2.classList.contains('playing')) {
                        player2.play();
                    }
                }
                
                // Log AudioContext and filter values
                console.log('AudioContext and filter values after loading Audio 2:');
                console.log('Sample rate:', audioContext.sampleRate);
                console.log('Current time:', audioContext.currentTime);
                console.log('State:', audioContext.state);
                console.log('Gain Node 1 value:', gainNode1.gain.value);
                console.log('Gain Node 2 value:', gainNode2.gain.value);
                console.log('Master Gain Node value:', masterGainNode.gain.value);
                console.log('High Shelf Filter Right:');
                console.log('  Frequency:', highShelfFilterRight.frequency.value);
                console.log('  Gain:', highShelfFilterRight.gain.value);
                console.log('Mid Filter Right:');
                console.log('  Frequency:', bandpassFilterRight.frequency.value);
                console.log('  Q:', bandpassFilterRight.Q.value);
                console.log('Low Filter Right:');
                console.log('  Frequency:', lowShelfFilterRight.frequency.value);
                console.log('  Gain:', lowShelfFilterRight.gain.value);
            }, function(error) {
                console.error('Error decoding audio data:', error);
            });
        }
    };
    reader.readAsArrayBuffer(file);
}

// ... rest of the code ...

/***** START: Create file inputs as SVG elements ******/

// Create hidden file input elements
const fileInput1 = document.createElement('input');
fileInput1.type = 'file';
fileInput1.accept = 'audio/*';
fileInput1.style.display = 'none'; // Keep it hidden
document.body.appendChild(fileInput1);

const fileInput2 = document.createElement('input');
fileInput2.type = 'file';
fileInput2.accept = 'audio/*';
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

/***** START: Visualize Audio Data ******/

function visualize(analyserNode, canvas) {
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);

        analyserNode.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];

            canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
            canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

            x += barWidth + 1;
        }
    }

    draw();
}

const canvas = document.querySelector('#visualizer');

// visualize(analyserNode, canvas);

/***** END: Visualize Audio Data ******/