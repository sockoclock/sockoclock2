/* MIDI IO */

// Enable WebMidi API and handle any errors if it fails to enable.
// This is necessary to work with MIDI devices in the web browser.
await WebMidi.enable();

// Initialize variables to store the first MIDI input and output devices detected.
// These devices can be used to send or receive MIDI messages.
let myInput = WebMidi.inputs[0];
let myOutput = WebMidi.outputs[0];

// Get the dropdown elements from the HTML document by their IDs.
// These dropdowns will be used to display the MIDI input and output devices available.
let dropIns = document.getElementById("Dropdown Inputs");
let dropOuts = document.getElementById("Dropdown Outputs");

// For each MIDI input device detected, add an option to the input devices dropdown.
// This loop iterates over all detected input devices, adding them to the dropdown.
WebMidi.inputs.forEach(function (input, num) {
  dropIns.innerHTML += `<option value=${num}>${input.name}</option>`;
});
//end

// Similarly, for each MIDI output device detected, add an option to the output devices dropdown.
// This loop iterates over all detected output devices, adding them to the dropdown.
WebMidi.outputs.forEach(function (output, num) {
  dropOuts.innerHTML += `<option value=${num}>${output.name}</option>`;
});
//end

const allChords = {
  //chord library
  Major: [0, 4, 7],
  Minor: [0, 3, 7],
  Diminished: [0, 3, 6],
  Augmented: [0, 4, 8],
  Major_7th: [0, 4, 7, 11],
  Minor_7th: [0, 3, 7, 10],
  Dominant_7th: [0, 4, 7, 10],
};

//console.log(Object.keys(allChords))

//chooses the intervals dependant on the chord quality then stores them somehow so they can be called when added to pitch later
let chordQuality = document.getElementById("chordQuality");
let qualityOptions = Object.keys(allChords); //function of an object that allows you to reference all of its properties. will automatically update as you add more properties
qualityOptions.forEach(function (item) {
  chordQuality.innerHTML += `<option value = ${item}>${item}</option>`;
});
//end

let currentChord = allChords.Major;
chordQuality.addEventListener("change", function () {
  console.log(`New chord quality, ${chordQuality.value}, selected!`);
  currentChord = allChords[chordQuality.value]; //accessing property of allChords
  console.log(currentChord);
  //example: if chorQuality.value == "Major" then this var == 7 (Perfect 5th). Then I can use this in the new Note Call of a specific midiNote
});
//end

let transposition = 0; //initializes transposition

/*MIDI Updating Process*/ //the midi is already there when the button is pressed. this code does not create it. it just cahnges it

//define MIDI processing function
const midiProcess = function (midiNoteInput) {
  let pitch = midiNoteInput.note.number;
  let velocity = midiNoteInput.note.rawAttack;

  let myNotes = [];
  currentChord.forEach(function (interval) {
    console.log(pitch);
    console.log(transposition);
    console.log(interval);
    let midiNote = new Note(pitch + parseInt(transposition) + interval, {
      rawAttack: velocity,
    });
    myNotes.push(midiNote);
  });

  return myNotes;
};

// Add an event listener for the 'change' event on the input devices dropdown.
// This allows the script to react when the user selects a different MIDI input device.
dropIns.addEventListener("change", function () {
  // Before changing the input device, remove any existing event listeners
  // to prevent them from being called after the device has been changed.
  if (myInput.hasListener("noteon")) {
    myInput.removeListener("noteon");
  }
  if (myInput.hasListener("noteoff")) {
    myInput.removeListener("noteoff");
  }

  // Change the input device based on the user's selection in the dropdown.
  myInput = WebMidi.inputs[dropIns.value];
  // myOutput = WebMidi.outputs[dropOuts.value];

  console.log(myInput);

  // chord.forEach(midiProcess);

  /*Sending MIDI*/

  // After changing the input device, add new listeners for 'noteon' and 'noteoff' events.
  // These listeners will handle MIDI note on (key press) and note off (key release) messages.
  myInput.addListener("noteon", function (someMIDI) {
    console.log(someMIDI);
    // When a note on event is received, send a note on message to the output device.
    // This can trigger a sound or action on the MIDI output device.
    myOutput.sendNoteOn(midiProcess(someMIDI));
  });

  myInput.addListener("noteoff", function (someMIDI) {
    console.log(someMIDI);
    // Similarly, when a note off event is received, send a note off message to the output device.
    // This signals the end of a note being played.

    myOutput.sendNoteOff(midiProcess(someMIDI));
  });
});
//end

// Add an event listener for the 'change' event on the output devices dropdown.
// This allows the script to react when the user selects a different MIDI output device.
dropOuts.addEventListener("change", function () {
  // Change the output device based on the user's selection in the dropdown.
  // The '.channels[1]' specifies that the script should use the first channel of the selected output device.
  // MIDI channels are often used to separate messages for different instruments or sounds.
  myOutput = WebMidi.outputs[dropOuts.value].channels[1];
});
//end

/*Transposition Selection*/ //updates transposition

//creates a variable for the transSlider
let transSlider = document.getElementById("transSlider");

//trans slider change event
transSlider.addEventListener("change", function () {
  let transDisplay = document.getElementById("transDisplay"); //var for semitone display container
  transDisplay.innerText = transSlider.value; //changes innertext of semitone display container to transSlider value
  console.log(transSlider.value);
  transposition = transSlider.value;
  // makeChord(60, "Major"); //placeholder chord
  // console.log(`This is a test where 60 is the MIDI Input and Major is the Quality. The makeChord funtion is called upon a change event of the Transposition Slider.`)
});

//let transAmount = transSlider.value     //this chosen transposition amount will be an input parameter for makeChord
