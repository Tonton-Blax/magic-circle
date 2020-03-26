<script>
  import "chota";
  import {Container, Row, Button} from 'svelte-chota';
  import { onMount, createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();

  import pianissimo from 'pianissimo';

  import { bottomUpdateMode, selectedProps, currentTonic, currentScale, currentMode, playNotes} from './mobilevar';
  import wheel from './wheel.js';

  import {	
		mdiArrowUpDown, 
		mdiPlayCircleOutline, 
		mdiStopCircleOutline, 
		mdiClose,
		mdiNumeric4Box, mdiNumeric3Box, mdiNumeric5Box
	} from '@mdi/js';
  
  export let update = false;

  	$: if (update) { 
        switch ($bottomUpdateMode) {
        case 'hydrate' : updateChord();break;
        case 'update' : updateteKeyboard ();break;  
		  }
	  }

  let chord = [,];
  let init = false;
  let currentInvertedChord = []; 
  let currentChordTones = []; let currentIntervals = [];
  let chordQuality = 3; let currentChordIcon = mdiNumeric3Box;
  let chordInit = false;
  let chordName = '';
  let scale = {};
  let minOffset = 0;

  let noteArray = ['C3', 'C#3','D3', 'D#3','E3','F3', 'F#3','G3', 'G#3','A3', 'A#3','B3','C4', 'C#4','D4', 'D#4','E4']; 

  let notes = [

      { note: 'C3', sharp: false, isOn: false, isScale: false, midi: 48 , tone: 'C' , altTone: 'C' , interval: undefined },
      { note: 'C#3', sharp: true, isOn: false, isScale: false, midi: 49 , tone: 'C#', altTone: 'Db', interval: undefined },
      { note: 'D3', sharp: false, isOn: false, isScale: false, midi: 50 , tone: 'D' , altTone: 'D' , interval: undefined },
      { note: 'D#3', sharp: true, isOn: false, isScale: false, midi: 51 , tone: 'D#', altTone: 'Eb', interval: undefined },
      { note: 'E3', sharp: false, isOn: false, isScale: false, midi: 52 , tone: 'E' , altTone: 'E' , interval: undefined },
      { note: 'F3', sharp: false, isOn: false, isScale: false, midi: 53 , tone: 'F' , altTone: 'F' , interval: undefined },
      { note: 'F#3', sharp: true, isOn: false, isScale: false, midi: 54 , tone: 'F#', altTone: 'Gb', interval: undefined },
      { note: 'G3', sharp: false, isOn: false, isScale: false, midi: 55 , tone: 'G' , altTone: 'G' , interval: undefined },
      { note: 'G#3', sharp: true, isOn: false, isScale: false, midi: 56 , tone: 'G#', altTone: 'Ab', interval: undefined },
      { note: 'A3', sharp: false, isOn: false, isScale: false, midi: 57 , tone: 'A' , altTone: 'A' , interval: undefined },
      { note: 'A#3', sharp: true, isOn: false, isScale: false, midi: 58 , tone: 'A#', altTone: 'Bb', interval: undefined },
      { note: 'B3', sharp: false, isOn: false, isScale: false, midi: 59 , tone: 'B' , altTone: 'B' , interval: undefined },
      { note: 'C4', sharp: false, isOn: false, isScale: false, midi: 60 , tone: 'C' , altTone: 'C' , interval: undefined },
      { note: 'C#4', sharp: true, isOn: false, isScale: false, midi: 61 , tone: 'C#', altTone: 'Db', interval: undefined },
      { note: 'D4', sharp: false, isOn: false, isScale: false, midi: 62 , tone: 'D' , altTone: 'D' , interval: undefined },
      { note: 'D#4', sharp: true, isOn: false, isScale: false, midi: 63 , tone: 'D#', altTone: 'Eb', interval: undefined },
      { note: 'E4', sharp: false, isOn: false, isScale: false, midi: 64 , tone: 'E' , altTone: 'E' , interval: undefined },
      { note: 'F4', sharp: false, isOn: false, isScale: false, midi: 65 , tone: 'F' , altTone: 'F' , interval: undefined },
      { note: 'F#4', sharp: true, isOn: false, isScale: false, midi: 66 , tone: 'F#', altTone: 'Gb', interval: undefined },
      { note: 'G4', sharp: false, isOn: false, isScale: false, midi: 67 , tone: 'G' , altTone: 'G' , interval: undefined },
      { note: 'G#4', sharp: true, isOn: false, isScale: false, midi: 68 , tone: 'G#', altTone: 'Ab', interval: undefined },
      { note: 'A4', sharp: false, isOn: false, isScale: false, midi: 69 , tone: 'A' , altTone: 'A' , interval: undefined },
      { note: 'A#4',sharp: true,  isOn: false, isScale: false, midi: 70,  tone: 'A#', altTone: 'Bb', interval: undefined },
      { note: 'B4', sharp: false, isOn: false, isScale: false, midi: 71 , tone: 'B' , altTone: 'B' , interval: undefined },
      { note: 'C5', sharp: false, isOn: false, isScale: false, midi: 72 , tone: 'C' , altTone: 'C' , interval: undefined },
      { note: 'C#5', sharp: true, isOn: false, isScale: false, midi: 73 , tone: 'C#', altTone: 'Db', interval: undefined },
      { note: 'D5', sharp: false, isOn: false, isScale: false, midi: 74 , tone: 'D' , altTone: 'D' , interval: undefined },
      { note: 'D#5', sharp: true, isOn: false, isScale: false, midi: 75 , tone: 'D#', altTone: 'Eb', interval: undefined },
      { note: 'E5', sharp: false, isOn: false, isScale: false, midi: 76 , tone: 'E' , altTone: 'E' , interval: undefined },
      { note: 'F5', sharp: false, isOn: false, isScale: false, midi: 77 , tone: 'F' , altTone: 'F' , interval: undefined },
      { note: 'F#5', sharp: true, isOn: false, isScale: false, midi: 78 , tone: 'F#', altTone: 'Gb', interval: undefined },
      { note: 'G5', sharp: false, isOn: false, isScale: false, midi: 79 , tone: 'G' , altTone: 'G' , interval: undefined },
      { note: 'G#5', sharp: true, isOn: false, isScale: false, midi: 80 , tone: 'G#', altTone: 'Ab', interval: undefined },
      { note: 'A5', sharp: false, isOn: false, isScale: false, midi: 81 , tone: 'A' , altTone: 'A' , interval: undefined },
      { note: 'A#5',sharp: true,  isOn: false, isScale: false, midi: 82,  tone: 'A#', altTone: 'Bb', interval: undefined },
      { note: 'B5', sharp: false, isOn: false, isScale: false, midi: 83 , tone: 'B' , altTone: 'B' , interval: undefined },
      { note: 'C6', sharp: false, isOn: false, isScale: false, midi: 84 , tone: 'C' , altTone: 'C' , interval: undefined },
      
   ];
     
  let minNote = 48;

  let hintChar = ['●','	○'];
  let charIdx = 0;
  let activeKey = false;

  let audioContext;
  let synth;
  let seq;
  let stop = false;

  onMount(async () => 
  {

    activeKey=false;
    let n = $selectedProps.scale[1].getNotesName();
    n.push($selectedProps.scale[1].getNotes()[0].plusInterval('P8').getName());
    for (let i = 0; i < notes.length; i++) {
      for (let x = 0; x < n.length; x++) {
        if (notes[i].note == n[x]) {
          notes[i].isScale = true;
        }
      }
    }

    init = true;

  });

  function updateteKeyboard () {

    for (let i = 0; i < notes.length; i++) {
      notes[i].isScale = false;
      notes[i].isOn = false;
    }
    let wIdx = $selectedProps.currentWheel || 0;
    scale = pianissimo.scale($currentTonic, $currentScale, (wIdx ? $currentMode : 1) );
    minNote = scale.getNotes()[0].getMidiNumber();
    let tmp;
    
      for (let i = (minNote - 48); i <= (minNote - 48) + 12; i++) {
        for (let x = 0; x < scale.getNotes().length; x++) {
          if (notes[i].midi == scale.getNotes()[x].getMidiNumber())
            notes[i].isScale = true;
      }
    }
    // starts keyboard vue one note late if first note is black for design purppose
    notes[minNote-48].sharp ? minOffset = 1 : minOffset = 0; 
    notes[minNote-48 + 12].isScale = true; //doubles the tonic up
    update = false;
  }

  function updateChord (mode) {

    if (!init) {return;}
    let wIdx = $selectedProps.currentWheel;
    let chordIndex =  $selectedProps.currentIndex; 
    $playNotes = []; currentChordTones = [];
    chordInit = true;

    for (let i = 0; i < notes.length; i++) {
      notes[i].isOn = false;
    }
    
    if (mode != 'invert') {

      chord = [,];
      chord = [...wheel[`_chords${chordQuality}`][wIdx]];
      chord = chord[chordIndex];
      currentIntervals = [];
      chord.getIntervals().forEach(interval => currentIntervals.push(interval.getName()));
      chordName = chord.findBestName();
      chord.getNotes()
        .forEach(note => $playNotes.push(note.getMidiNumber() ) );

    } else if (mode == 'invert') {
   
        chord.invert();
        if (chord.getNotes()[0].getMidiNumber() > minNote + 12); {
          chord.transpose('P8','-');
        }
        
        chord.getNotes()
          .forEach(note => $playNotes.push(note.getMidiNumber() ) );
        // rotate array once more since tonic tends to stay low with current code
        if (chordQuality > 3) $playNotes.push($playNotes.shift()); 
     }

    for (let i = 0; i < notes.length; i++) {
      for (let x = 0; x < $playNotes.length; x++) {
        if (notes[i].midi == $playNotes[x]) {
          notes[i].isOn = true;
          notes[i].interval = chord.getIntervals()[x].getName();
          currentChordTones.push((chord.getNotes()[x].getName()).replace(/[0-9]/g,''));
        }
      } 
    }   
    currentChordTones = currentChordTones.join(' | ');

    update = false;
  }

  let toggleChordQuality = () => {
    	switch (chordQuality) {
			case 3 : chordQuality = 4; currentChordIcon = mdiNumeric4Box; break;
			case 4 : chordQuality = 5; currentChordIcon = mdiNumeric5Box; break;
			case 5 : chordQuality = 3; currentChordIcon = mdiNumeric3Box; break;
    }
    updateChord();
  }   

  let clear = () => {
                    
    $playNotes = [];
    chordInit = false;

    for (let i = 0; i < notes.length; i++) {
      if (notes[i].isOn) {
        notes[i].isOn = false;
      }
    } 
  }   
  

/* 	▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ 
▶ ■ ▶ ■ ▶ ■ ▶ ■  PLAY STOP		▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■
▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ */


  
  function handleNoteClick (index) {
    if (!init) return;
    notes[index].isOn ? playChord() : playNote(notes[index].midi);
  }

	function play() {
    
    dispatch('message', {text: 'scale'});

  }
  
  function playNote (note) {
    $playNotes = [];
    $playNotes[0] = note;
    dispatch('message', {text: 'note'});
    //seq.setInstrument(0,1);

  }

  function playChord() {
 
    dispatch('message', {text: 'chord'});

	}

</script> 

<Row class="is-horizontal-align">
			<p class = "spaceupdown">
				{!$selectedProps.currentWheel ? "Scale" : "Mode"}
					<strong>{$currentTonic} {$selectedProps.currentScaleName[$selectedProps.currentWheel]}</strong>
				{#if chordInit}
					 | Chord : <strong>{chordName}</strong> 
				{/if}
			</p>
</Row>

    <div id="wrap">
      <div id="kbd">
        <div class="keys">

          {#each notes as note,i}
            {#if note.midi >= minNote - minOffset && note.midi <= minNote -minOffset +24}
              {#if note.sharp == true}
                <div on:click={() => handleNoteClick(i)} data-key={note.note} class="note sharp" 
                 class:active={activeKey} class:isonup={note.isOn} 
               >

                  {#if note.isOn}
                    <div class="hints alter">{note.interval}</div>
                  {/if}
                  {#if note.isScale}
                    <div class="scaletone alt" class:tonic={note.midi == minNote}>●</div>
                  {/if}
                  </div>
              {:else}
                <div on:click={() => handleNoteClick(i)} data-key={note.note} class="note white" 
                 class:active={activeKey} class:ison={note.isOn} 
                >
                  {#if note.isOn}
                    <div class="hints">{note.interval}</div>
                  {/if}
                  {#if note.isScale}
                    <div class="scaletone" class:tonic={note.midi == minNote || note.midi == minNote + 12}>●</div>
                  {/if}
                </div>
              {/if}
            {/if}
          {/each}
          
        </div>
      </div>
    </div>

  <Row class="is-horizontal-align">
			<div id="currentchordtones">
				{#if chordInit}
					Chord Tones: <strong>{currentChordTones}</strong>
				{/if}
			</div>
  </Row>

	<Row class="is-horizontal-align">
		<div id="boutongroup">

			<Button icon-only disabled=
				{chordInit ? false : true} 
				secondary icon={mdiArrowUpDown} on:click={()=> updateChord('invert')}/>

			<Button icon-only disabled=
				{chordInit ? false : true} 
				secondary icon={mdiClose} on:click={clear}/>

			<Button icon-only disabled=
				{chordInit ? false : true} 
				secondary icon={currentChordIcon}  
				on:click={ toggleChordQuality }/>

			<Button icon-only error icon={mdiPlayCircleOutline} 
				on:click={()=> play()} />
				<div class="activate-audio"></div>
		</div>
  </Row>


<style>


    .spaceupdown {
        margin-top:20px;
        margin-bottom:10px;
      }

    #boutongroup {
      position:fixed;
      bottom:18px;
    }

    #wrap {
      width: 380px;
      height: 120px;
      display: flex;
      margin-left:10px;
    }

    #kbd {
      height: 100%;
      padding: 1%;
      flex-flow: column;
      display: flex;
      flex: 4;
    }

    .keys {
      height: 100%;
      display: flex;
      flex: 8;
      justify-content: space-around;
    }

    .note {
      flex: 1;
      display: inline-flex;
      align-items: center;
     }

    .sharp {
      justify-content: space-around;
      position: relative;
      height: 70%;
      background-color: #474747;
      color: white;
      width: 8%;
      margin: 0 -10px;
    }

    .white {
      flex-flow: column;
      justify-content: flex-end;
      outline: 2px solid #474747;
      color: #474747;
      background-color: #ffffff;
      padding-bottom: 1%;
    }

    .hints {
      opacity: 0;
      transition: opacity .3s ease-out;
      font-size: 12px;
      color:white;
      margin-bottom:-6px;
    }

    .alter {
      margin-right:-8px!important;    
    }

    .keys:hover .hints {
      opacity: 1;
    }

    .note:active {
      background: #084!important;
    }

    .ison {
      background-color:#006989;
    }

    .isonup {
      box-shadow:inset 1px 0px 1px 0px #333!important;
      background-color:#006989;
    }

    .scaletone:not(.alt) {
      margin-bottom: -10px;
      color:black;
      align-self: center;
    }

    .alt {
      margin-top: 40px;
      color: white;
      align-self: center;
    }

    .tonic {
      color : #C43835!important
    }

    #currentchordtones {
      margin-top:10px!important;
      margin-bottom:15px;
	  }
</style>