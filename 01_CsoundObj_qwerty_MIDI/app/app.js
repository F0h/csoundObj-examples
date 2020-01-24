// The MIDI protocol
let MIDI;
navigator.requestMIDIAccess({sysex : false}).then(onMIDISuccess,false);

function onMIDISuccess(MIDIAccess){
    MIDI = MIDIAccess;
    var inputs = MIDI.inputs.values();
    for(var input = inputs.next(); input && !input.done; input = inputs.next()){
        input.value.onmidimessage = sendMIDIToCsound;
    }
}

function sendMIDIToCsound(e){
    console.log(e.currentTarget.name,e.data)
    csound.midiMessage(e.data[0],e.data[1],e.data[2])
}
//
/// QWERTY
function sendQWERTYToCsound(e){
    var noteNumber = e.note[1] + 72;
    var velocity = e.note[0]*100;
    csound.midiMessage(144,noteNumber,velocity);
}
var qwerty = document.getElementById('qwerty');
qwerty.addEventListener('change', sendQWERTYToCsound );
////
function main(){

//Csound promise.
CsoundObj.importScripts("./app/").then( () => {
    
    document.getElementById("Engine").addEventListener('click',estadoCTX);
   
    CSOUND_AUDIO_CONTEXT.suspend();
   
    csound = new CsoundObj();
   
    csound.compileCSD(csd);
   
    csound.start(); //start and don´t stop until Engine Button

    window.addEventListener('unload', function(e){
        if (csound != null) csound.destroy();
    }, false);

    
   
});

}; //end of main

main();

//Gestión de los estados del audioContext para Csound///
let playing = false;
function estadoCTX(){
    if (playing == false){
        CSOUND_AUDIO_CONTEXT.resume(); console.log("se reinicia Csound");
        document.getElementById("Engine").value="pause"
        playing = true;
    } else {
        CSOUND_AUDIO_CONTEXT.suspend(); console.log("Cs suspendido again")
        document.getElementById("Engine").value="start"
        playing = false;
    }
    console.log("estadoCTX was called")
}


const csd =
`
<CsoundSynthesizer>
<CsOptions>
-n -d -+rtmidi=NULL -M0 -m0d --midi-key-cps=4 --midi-velocity-amp=5
</CsOptions>
<CsInstruments>
        massign 0, 1 ;all MIDI channell for instrument 1
; Initialize the global variables. 
ksmps = 32
nchnls = 2
0dbfs = 1

;instrument will be triggered by keyboard widget
        instr 1

kAEG    madsr .01, .001, .8, .01
a1      oscili  p5 * kAEG   ,   p4
        outs    a1          ,   a1
        endin

</CsInstruments>
<CsScore>
;causes Csound to run for about 7000 years...
f0 z
i   1   0   .25  880 .2
i   1   +   .25  440 .2
i   1   +   .25  660 .2

</CsScore>
</CsoundSynthesizer>

`