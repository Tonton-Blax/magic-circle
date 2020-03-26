<script>

    export let update = false;
    export let pos = 1;
    import { ChordBox } from 'vexchords';
    import { onMount } from 'svelte';
    import * as g from "./chords.js"
    import "chota";
    import {Row, Col, Container, Button } from 'svelte-chota';
    import wheel from './wheel.js';
    import pianissimo from 'pianissimo';

    let chord;
    let chordTones;
    let chordName = 'CΔ';
    let chordQuality = 4;

    let audioContext; let synth;  let seq;

    import { 	
		currentTonic, 
		currentScale, 
		currentMode, 
        selectedProps,
        bottomUpdateMode,
        playNotes
    } from './mobilevar';
    
 	$: if (update) { 
        
        switch ($bottomUpdateMode) {
            case 'init' : update = false; break

            case 'hydrate' || 'update' : updateChord(); break;

            case 'chord' : 
                chordQuality == 3 ? chordQuality = 4 : chordQuality == 4 ? chordQuality = 5 : chordQuality = 3; 
                updateChord(); break;
        }
       
        update = false;
    }

    onMount(async () => {
      
        let c = transChord(wheel[`_chords${chordQuality}`][$selectedProps.currentWheel || 0][$selectedProps.currentIndex || 0].findBestName());
        
        chordName = `${$currentTonic}${c}`;
        
        c = findChord($currentTonic, c);
        
        c  = c.positions[pos];

        for (let i = 0 ; i < c.frets.length ; i++) {
            if (c.frets[i] == -1) c.frets[i] = 'x';
        }

        chordTones =  'C | E | G | B';

        $playNotes = [48,52,55,59];

        chord = new ChordBox(`#selector${pos}`, {

            width: 220, height: 240, circleRadius: 5, 

            numStrings: 6, numFrets: 5, showTuning: true, 

            defaultColor: '#2D3336', bgColor: '#FFF', strokeColor: '#2D3336', textColor: '#2D3336',
            stringColor: '#2D3336',  fretColor: '#2D3336', labelColor: '#fff', fretWidth: 1, 
            stringWidth: 1, fontFamily : 'Fira Sans', fontSize : '18px',
            fontWeight: 700, fontStyle: 'normal', labelWeight: 700 

        });

        chord.draw({

            chord: [
                [6, c.frets[0], c.fingers[0], 'A'], [5, c.frets[1], c.fingers[1], 'A'], [4, c.frets[2], c.fingers[2], 'A'],
                [3, c.frets[3], c.fingers[3], 'A'], [2, c.frets[4], c.fingers[4], 'A'], [1, c.frets[5], c.fingers[5], 'A']
            ],

            position: c.baseFret,
        
            barres: [
                { fromString: 6, toString: 1, fret: c.barres[0] },
            ],
            
            tuning: ['E', 'A', 'D', 'G', 'B', 'E']
        });
    });

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function updateChord () {
        let wIdx = $selectedProps.currentWheel || 0;
        let idx = $selectedProps.currentIndex || 0;

        let c = transChord(wheel[`_chords${chordQuality}`][wIdx][idx].findBestName());

        let currentRoot = wheel[`_chords${chordQuality}`][wIdx][idx].getTonic().getRoot();

        chordName = `${currentRoot}${c}`;
        c = findChord(currentRoot, c);

        const visual = document.getElementById(`selector${pos}`);

        while (visual.hasChildNodes()) {
            visual.removeChild(visual.lastChild);
        }
        c  = c.positions[pos];

        for (let i = 0 ; i < c.frets.length ; i++) {
            if (c.frets[i] == -1) c.frets[i] = 'x';
        }
        
        chord = new ChordBox(`#selector${pos}`, {

            width: 220, height: 240, circleRadius: 5, 

            numStrings: 6, numFrets: 5, showTuning: true, 

            defaultColor: '#2D3336', bgColor: '#FFF', strokeColor: '#2D3336', textColor: '#2D3336',
            stringColor: '#2D3336',  fretColor: '#2D3336', labelColor: '#2D3336', fretWidth: 1, 
            stringWidth: 1, fontFamily : 'Fira Sans', fontSize : '18px',
            fontWeight: 700, fontStyle: 'normal', labelWeight: 700 

        });

        chord.draw({

            chord: [
                [6, c.frets[0], c.fingers[0]], [5, c.frets[1], c.fingers[1]], [4, c.frets[2], c.fingers[2]],
                [3, c.frets[3], c.fingers[3]], [2, c.frets[4], c.fingers[4]], [1, c.frets[5], c.fingers[5]]
            ],

            position: c.baseFret, 
        
            barres: [
                { fromString: 6, toString: 1, fret: c.barres[0] },
            ],
            
            tuning: ['E', 'A', 'D', 'G', 'B', 'E']
        });

        chordTones = wheel[`_chords${chordQuality}`][$selectedProps.currentWheel || 0][$selectedProps.currentIndex || 1].getNotesName();
        chordTones = chordTones.join(' | ');
        chordTones = chordTones.replace(/[0-9]/g,'');

        $playNotes = [];
        $playNotes = [...c.midi];
        update = false;
    }

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function findChord (root, quality) {
   
   if (!quality) quality = 'major';
        root = root.replace (/[0-9]/g,'');

    if (root[2]) 
        root = wheel.alterRootDic[root];
    else if (root[1] && !root[2]) {
        root = wheel.chordRootDic[root];
    }

    let c = g.default[root];
    let i = 0;
    while (c[i].suffix != quality) {i++;}
    c = c[i];
    return c;
}

function transChord (chordname) {
    if (chordname == wheel.placeHolder) return;
    let t = [...chordname];
    t = t.slice(1);
    while (t[0] == '#' || t[0] == 'b') {
        t = t.slice(1);
    }
    if (t[0] == '+' && t[1] == '/')
        t = 'aug';
    else if (t == '') t = 'major';
    else t = t.join('');
    
    if (wheel.chordDic[t] == undefined) 
    {return t} else {return wheel.chordDic[t]}
}



</script>

    <div class = "is-left">
        <div id="selector{pos}"></div>
        <div id="metawrap">
        	{!$selectedProps.currentWheel ? "Scale" : "Mode"}
					<strong>{$currentTonic} {$selectedProps.currentScaleName[$selectedProps.currentWheel]}</strong>
            <div class="name"><strong>Chord : </strong>{chordName}<br>{chordTones}</div>
        </div>
    </div> 

<style>
.name {
    position : relative;
    padding-top : 0px;
    margin-bottom : 30px;
}

#metawrap {
    word-break: break-word;    
    overflow-wrap: break-word;
    overflow:visible!important;
}

</style>