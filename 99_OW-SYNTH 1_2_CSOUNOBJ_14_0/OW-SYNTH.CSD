<CsoundSynthesizer>
<CsOptions>
-n -d -+rtmidi=NULL -M0 -m0d --midi-key-cps=4 --midi-velocity-amp=5
</CsOptions>
<CsInstruments>
; Initialize the global variables. 
ksmps = 32
nchnls = 2
0dbfs = 1
gif1    ftgen   1,0,8192,10,1;sine
gif2    ftgen   2,0,8192, 7,-1,4096,1,4096,-1;tri
gif3    ftgen   3,0,8192, 7,1,8192,-1;rampa
gif4    ftgen   4,0,8192, 7,-1,8192,1;saw
gif5    ftgen   5,0,8192, 7,1,4096,1,0,-1,4096,-1;sqr
gif6    ftgen   6,0,8192, 7,1, 2048,1,0,-1;pulse

;;;;;; waveform selector ;;;;;;
giwf    init 1;

;;;tuner;;
gkfine    init 1;
gkcoarse  init 1;
gkrange   init 1;
;;; portamento;;;
giNote       init 261.626
giVel       init 0
giNewKey    init 60
giPortSw    init 0
giPortTime  init 0.25

            instr 1
giwf        chnget  "wf1"
gkfine      chnget  "fine1"
gkcoarse    chnget  "coarse1"
gkrange     chnget  "range1"
kPortSw     chnget  "portSw"
iPortTime   chnget  "portTime"
kVol1       chnget  "vol1"
kPan1       chnget  "pan1"
kfreq       init    261.62
ktuner   = pow(2, (gkfine + gkcoarse + gkrange*12) * .083); 

;;portamento
ioldNote = giNote
giNote   = p4
irateFq  = pow(2,  octcps(giNote) - octcps(ioldNote) ) 
kport   linseg   ioldNote, iPortTime, giNote

;;;; AEG Temporal Declick
kAEG    madsr  .005, .001, 1, .008


;;Select Waveform
if giwf == 7 then
a1          rand  p5 * kAEG
else
a1          oscili  p5 *kAEG ,(kPortSw==1? kport: p4)  * ktuner  ,   giwf
endif

            outs    a1 *kVol1 ,   a1 *kVol1
            endin

</CsInstruments>
<CsScore>
;causes Csound to run for about 7000 years...
;f0 z
</CsScore>
</CsoundSynthesizer>
