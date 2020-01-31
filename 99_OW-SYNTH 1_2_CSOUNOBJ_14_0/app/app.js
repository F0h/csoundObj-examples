const csoundChannels  = ["wf1" ,"swOsc1", "kbtrk1", "fine_1", "coarse_1","range_1", "portSw1","portTime1", "vol1","pan1"]
const csoundChannelsVal = ["wf1" ,  "fine_1", "coarse_1","range_1", "portTime1", "vol1","pan1"]
const csoundChannelsSw = ["swOsc1", "kbtrk1", "portSw1"]

let nKey=0, nVel=0;
let portTime1 = 0.0;
let vol1=0.6;
let pan1 = 0.5;

////////////////////////////
//   - Doc To Cound -    //
//////////////////////////
////   QWERTY //////
var qwertyBtn = document.getElementById('qwerty');
qwertyBtn.addEventListener('change', qwertyToCsound)
function qwertyToCsound(ev){
    var noteNumber = ev.note[1] + 60;
    var velocity   = ev.note[0]*100;
    console.log(noteNumber, velocity)
   csound.midiMessage(144,noteNumber,velocity )
}

//// HTLM CONTROLS /////

function panicBtnToCsound(){
 document.getElementById('Panic').addEventListener('click', function(){
   for(var i = 0; i < 128; i++){
       for(var j = 0; j < 16; j++){
        csound.midiMessage(144+j,i,0 )
       }
   }
 })
}
   

function continuousListener(id){
     document.getElementById(id).addEventListener('input',valueToCsound)
}

function switchListenerToCsound(id){
    var checkBox = document.getElementById(id);//.addEventListener('onchange',switchToCsound)
    checkBox.addEventListener('change', function(){
        if(this.checked){
            console.log('sw on', id)
            csound.setControlChannel(id, true);
        } else {
            console.log('sw off', id)
            csound.setControlChannel(id, false);
        }
    })
}

function valueToCsound(e){
    console.log(e.target.id, e.target.value)
    csound.setControlChannel(e.target.id, e.target.value);
}

//docElementsListener
for(var i = 0; i < csoundChannelsVal.length; i++){
    console.log(csoundChannelsVal[i])
    continuousListener(csoundChannelsVal[i]); 
}

for(var i = 0; i < csoundChannelsSw.length; i++){
    console.log(csoundChannelsSw[i])
    switchListenerToCsound(csoundChannelsSw[i]); 
}
panicBtnToCsound(); //Listening for panicButton
//// end HTML Controls//
////////////////////////////
//      - MIDI -         //
//////////////////////////
let MIDI = null;
navigator.requestMIDIAccess({sysex : false}).then(onMIDISuccess, false);
function onMIDISuccess(MIDIAccess){
    MIDI = MIDIAccess;
    var inputs=MIDI.inputs.values(); //for all MIDI Inputs
      for ( var input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = sendMIDIToCsound;
      }
}
function sendMIDIToCsound(e){
    console.log(e.currentTarget.name, e.data)
    csound.midiMessage(e.data[0],e.data[1],e.data[2])
}

////////////////////////////
//      - main -         //
//////////////////////////
function main(){
    //Csound Promise
    CsoundObj.importScripts('./app/').then( onCsoundSuccess, false);
}

function onCsoundSuccess(){
    
    document.getElementById('Engine').addEventListener('click',ctxState)
    
    CSOUND_AUDIO_CONTEXT.suspend();
    
    csound = new CsoundObj(); console.log('onCsSucces created: ',csound)
    
    csound.compileCSD(OW_Synth);
  

    csound.start(); console.log('onCsScc. csound start and wait Engine btn')
    initialParameters();
    
    
    //Garbage manager
    window.addEventListener('unload',function(e){
        if(csound != null) csound.destroy();
    })
    //
}

let playing = false;
function ctxState(){
   var engineBtn = document.getElementById('Engine')
    if( playing == false){
        CSOUND_AUDIO_CONTEXT.resume(); console.log(CSOUND_AUDIO_CONTEXT.state);
        playing = true;
        engineBtn.value = 'Pause engine'

        console.log('botón enable: ', playing)

    } else {
        CSOUND_AUDIO_CONTEXT.suspend(); console.log(CSOUND_AUDIO_CONTEXT.state);
        playing = false;
        engineBtn.value = 'Start engine'
        console.log('botón enable: ', playing)

    }
}

main();

////////////////////////////
//      - CSD File -     //
//////////////////////////

const OW_Synth = 
`   
<CsoundSynthesizer>
<CsOptions>
-n -d -+rtmidi=NULL -M0 -m0d --midi-key-cps=4 --midi-velocity-amp=5
</CsOptions>
<CsInstruments>

massign   -1, 1 ;assign all (-1) MIDI channels to instrument 1    

;;;;;;;;;;;; GLOBAL VARIABLES;;;;;;;;;
gif1    ftgen   1,0,8192,10,1;sine
gif2    ftgen   2,0,8192, 7,-1,4096,1,4096,-1;tri
gif3    ftgen   3,0,8192, 7,1,4096,1,0,-1,4096,-1;sqr
gif4    ftgen   4,0,8192, 7,1, 2048,1,0,-1;pulse
gif5    ftgen   5,0,8192, 7,1,8192,-1;rampa
gif6    ftgen   6,0,8192, 7,-1,8192,1;saw


;;;;;; waveform selector ;;;;;;
giwf    init 1;

;;;tuner;;
gkfine    init 1;
gkcoarse  init 1;
gkrange   init 1;
;;; portamento;;;
gioldNote   init 261.626
giNote       init 261.626
giVel       init 0
giNewKey    init 60
giPortSw    init 0
giPortTime1  init 0.25
;;; Teclado qwerty
gknKey     init 60
gknVel     init  1

;;;;;;;;;;; querty     ;;;;;;;;;;;;;;;;;;;;;;;


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
        instr 1

giwf        chnget  "wf1"
;;borrar luego ;;;;;;;;;;;;;;
if (giwf == 0) then
giwf = 1
endif
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
kwfSw1      chnget  "swOsc1"
kkbtrk1     chnget  "kbtrk1"
gkfine      chnget  "fine_1"
gkcoarse    chnget  "coarse_1"
gkrange     chnget  "range_1"
kPortSw1     chnget  "portSw1"
giPortTime1  chnget  "portTime1"
kVol1       chnget  "vol1"
kPan1       chnget  "pan1"
kfreq       init    261.62
ktuner   = pow(2, (gkfine + gkcoarse + gkrange*12) * .083); 
;;portamento
gioldNote = giNote
giNote     = p4
irateFq  = pow(2,  octcps(giNote) - octcps(gioldNote) ) 
kport   linseg   gioldNote, giPortTime1, giNote 

;;;; Temporal AEG  Declick
kAEG    madsr  .005, .001, 1, .1








;;;;keyboard Tracker
if kkbtrk1 == 1 then
kcps = 440
else
kcps = k(p4) 
endif

;;Select Waveform
if giwf == 7 then
a1          rand  p5 * kAEG
aqwerty     rand  p5 * kAEG
else
;a1     oscili  p5 * kAEG ,(kPortSw1==1? kport: kcps)  * ktuner  , giwf


;aqwerty oscili iampQwerty * kAEG, (kPortSw1==1? kport: iFqQwerty) * ktuner, giwf
a1      oscili p5 * kAEG, (kPortSw1==1? kport: kcps) * ktuner, giwf
endif



aMIDIL  = ( a1 * kwfSw1 * kVol1 ) * (1 - kPan1) 
aMIDIR  = ( a1  * kwfSw1 * kVol1 ) *  kPan1      

aTL     sum  aMIDIL
aTR     sum  aMIDIR
        outs  aTL  , aTR
        endin



</CsInstruments>
<CsScore>
;causes Csound to run for about 7000 years...
f0 z
i   1   0   .25  84 100
i   1   0   .25  84 0


</CsScore>
</CsoundSynthesizer>

   
;schedule(1, 0, -1)`


 ////// csd test /////
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
gkvol1  init    .6
;instrument will be triggered by keyboard widget
        instr 1
kVol1   chnget "vol1"
kPan1       chnget  "pan1"

kAEG    madsr .01, .001, .8, .01
a1      oscili  p5 * kAEG   ,   p4
        outs    a1   * kVol1  * (1 - kPan1)     ,   a1 * kVol1 *  kPan1
        endin

</CsInstruments>
<CsScore>
;causes Csound to run for about 7000 years...
f0 z
i   1   .5   .25  880 .2
i   1   +   .25  440 .2
i   1   +   .25  660 .2
i   1   +   .25  990 .2

</CsScore>
</CsoundSynthesizer>

`  
   