<script>

	export let update = false;
	import { onMount, createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();

	import pianissimo from 'pianissimo';
	import abcjs from "abcjs";

	import "chota";
	import {Row, Col, Container, Button } from 'svelte-chota';

	import {	
		mdiArrowUpDown, mdiArrowDownBox, mdiArrowUpBox,
		mdiPlayCircleOutline, mdiStopCircleOutline, mdiClose,
		mdiNumeric3Box, mdiNumeric4Box, mdiNumeric5Box
	} from '@mdi/js';

	import { currentTonic, selectedProps, bottomUpdateMode, playNotes, transpose } from './mobilevar';

	import wheel from './wheel.js';

	let staffDisplayMode = 0;
	let currentNotes = [[],[]]; let currentInvertedChord = []; let currentChordTones = [];
	let chordQuality = 3; let currentChordIcon = mdiNumeric3Box;
	let doNotRefresh = true;
	let staffIndex; let isChord;

	let iconDic = {3 : mdiNumeric3Box, 4 : mdiNumeric4Box, 5 : mdiNumeric5Box};

	let colors;

	let staffParams = {
		clickListener: clickListener,
		scale:1.5, 
		staffwidth: window.innerWidth - 10,
		paddingtop: 0, paddingbottom: 0, paddingright: 0, paddingleft: 0,
		add_classes: true,
		viewportHorizontal : false,
		midiTranspose: $transpose,
		visualTranspose: $transpose
	}


	$: if (update) { 
		switch ($bottomUpdateMode) {
			case 'hydrate' : updateChord(); break;
			case 'update' : updateStaff (); break;
		}
	}
	
	onMount(async () => 
	{
		$selectedProps.chordObject = '';
		let index = $selectedProps.currentWheel; let buffer = [,];
		currentNotes[0] = [...$selectedProps.scale[0].getNotes()];
		currentNotes[0].push(currentNotes[0][0].plusInterval('P8','+'));

		currentNotes[1] = [...$selectedProps.scale[1].getNotes()];
		currentNotes[1].push(currentNotes[1][0].plusInterval('P8','+'));

		currentNotes[0] = wheel.matchAbcString(currentNotes[0]);
		currentNotes[1] = wheel.matchAbcString(currentNotes[1]);
		
		const staff = document.getElementById('staff');
		while (staff.hasChildNodes()) {
			staff.removeChild(staff.lastChild);
		}
		
		abcjs.renderAbc("staff", `L:4/4\nK:C\n${currentNotes[0].toString().replace(/,/g,'')}`, staffParams);

		document.getElementById("staff").querySelectorAll(".abcjs-note").forEach((el) => {
		if (el.getAttribute("fill"))
			el.setAttribute("fill", "#333");
		if (el.getAttribute("stroke"))
			el.setAttribute("stroke", "#333");

		});
		
	});
	
	function clickListener(abcElem, tuneNumber, classes) {

		// gets the clicked note/chord scale index via class name... weird but works
		staffIndex = classes.match(/abcjs-n\d+/).toString().slice(-1);

		let pitches = [];
		Object.values(abcElem.pitches).forEach(pit => pitches.push ([pit.pitch, pit.accidental]));
		let colors = [,]
		colors = [...wheel._colors];
	
		colors[$selectedProps.currentWheel] = wheel.matchColorsFromStaff(pitches , $selectedProps.currentWheel);

		dispatch('message', {text: 'colors', chordColors : colors});

		currentChordTones = [];	$playNotes = [];

		if(!pitches[1]) {// If selected item is a note, as opposed to a chord

			isChord = false;
			// handles click on artificially doubled up tonic (last note)
			if (staffIndex == $selectedProps.scale[$selectedProps.currentWheel].getNotes().length) {
				currentChordTones = $selectedProps.scale[$selectedProps.currentWheel].getNotes()[0].getName();
				$playNotes[0] = $selectedProps.scale[$selectedProps.currentWheel].getNotes()[0].getMidiNumber() + 12;
			}
			else {
				isChord = true;
				currentChordTones = $selectedProps.scale[$selectedProps.currentWheel].getNotes()[staffIndex].getName();
				$playNotes[0] = $selectedProps.scale[$selectedProps.currentWheel].getNotes()[staffIndex].getMidiNumber();
			}

			dispatch('message', {text: 'note'});
		}

		else if (currentChordTones != undefined) {
			isChord = true;
			chordQuality = abcElem.pitches.length;
			
			currentChordIcon = iconDic[chordQuality];
			let clickedChord = [...wheel[`_chords${chordQuality}`][$selectedProps.currentWheel]];


			clickedChord[staffIndex].getNotes()
				.forEach((note, idx) => currentChordTones[idx] = note.getRootName()+ note.getAlteration());

			currentChordTones = currentChordTones.join(' / ');

			clickedChord[staffIndex].getNotes()
				.forEach((note) => $playNotes.push(note.getMidiNumber()));

			$selectedProps.chordObject = clickedChord[staffIndex].getName();

		    dispatch('message', {text: 'chord'});
		}

		doNotRefresh = false;
    }

	function play () {
		dispatch('message', {text: 'scale'});
	}


/* 	♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯
♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯  STAFF STUFF	♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯
♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ ♯ ♭ */
	
	function updateStaff ()
	{
		let index = $selectedProps.currentWheel;	
		currentNotes[index] = [];	
		$selectedProps.chordObject = ''; 
		currentNotes[index] = [...$selectedProps.scale[index].getNotes()];
		currentNotes[index].push(currentNotes[index][0].plusInterval('P8','+'));
		currentNotes[index] = wheel.matchAbcString(currentNotes[index]);
		renderStaff(currentNotes[index]);

	}

	function updateChord (chordIndex) {

		let index = $selectedProps.currentWheel
		if (!chordIndex) chordIndex = $selectedProps.currentIndex; 
		console.log(chordIndex);
		currentInvertedChord = [...wheel[`_chords${chordQuality}`][index]];  
		currentChordTones = [];

		currentNotes[index][chordIndex] = 
			`[${wheel.matchAbc(currentInvertedChord[chordIndex]).toString()
			.toUpperCase()
			.replace(/,/g,'')
			}]`;
		
		
		renderStaff(currentNotes[index]);

		$selectedProps.chordObject = currentInvertedChord[chordIndex].getName();

		currentInvertedChord[chordIndex].getNotes()
			.forEach((note, idx) => currentChordTones[idx] = note.getRootName()+ note.getAlteration());

		currentChordTones = currentChordTones.join(' / ');
		doNotRefresh = false;
	}

	function invertChord () {

		let index = $selectedProps.currentWheel
		let chordIndex = staffIndex != undefined ? staffIndex : $selectedProps.currentIndex; 
		currentInvertedChord = [...wheel[`_chords${chordQuality}`][index]];
		currentInvertedChord = currentInvertedChord[chordIndex].invert();

		currentChordTones = [...currentInvertedChord.getNotes()];
		currentInvertedChord = wheel.matchAbc(currentInvertedChord);
		
		currentChordTones.forEach((note, idx) => currentChordTones[idx] = note.getRootName()+ note.getAlteration()) + '\xa0';
		currentChordTones = currentChordTones.join(' / ');

		currentNotes[index][chordIndex] = `[${currentInvertedChord.toString()
			.toLowerCase()}]`;

		renderStaff(currentNotes[index]);
		doNotRefresh = false;
	}
	

	function renderStaff (notes) {

		const staff = document.getElementById('staff');
		notes = notes.join('');

		while (staff.hasChildNodes()) {
			staff.removeChild(staff.lastChild);
		}
		abcjs.renderAbc("staff", `L:4/4\nK:C\n${notes}`, staffParams)
		
		staff.querySelectorAll(".abcjs-note").forEach((el) => {
		if (el.getAttribute("mark"))
			el.setAttribute("mark", '#C43835');
		});

		staff.querySelectorAll(`.abcjs-n${staffIndex}`).forEach((el) => {
		if (el.getAttribute("fill"))
			el.setAttribute("fill", "#C43835");
		if (el.getAttribute("stroke"))
			el.setAttribute("stroke", "#C43835");
		});

		update = false;
	}

/* 	⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ 
⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤  BUTTONS STATE	⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  
⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ */

	function toggleScaleName () {
		if ($selectedProps.currentWheel == 0) {
			return $selectedProps.scale[$selectedProps.currentWheel].getName() || 'C major' ;
		}
		else return $selectedProps.currentModeName;
	}

	function toggleChordQuality () {
		switch (chordQuality) {
			case 3 : chordQuality = 4; currentChordIcon = mdiNumeric4Box; break;
			case 4 : chordQuality = 5; currentChordIcon = mdiNumeric5Box; break;
			case 5 : chordQuality = 3; currentChordIcon = mdiNumeric3Box; break;
			default : break;
		}

		updateChord(staffIndex);
	}

	function clear () {
		currentNotes[1]=[];currentNotes[0]=[];
		updateStaff();
		doNotRefresh ? doNotRefresh : dispatch('message', {text: 'refresh'});
		doNotRefresh = true;
	}

	function shiftOctave () {
		$transpose += 12;
		staffParams.visualTranspose = $transpose;
		let index = $selectedProps.currentWheel
		renderStaff(currentNotes[index]);
	}

	function unshiftOctave () {
		$transpose += -12;
		staffParams.visualTranspose = $transpose;
		let index = $selectedProps.currentWheel
		renderStaff(currentNotes[index]);
	}

</script>

		<Row class="is-horizontal-align">
			<p class = "spaceupdown">
				{!$selectedProps.currentWheel ? "Scale" : "Mode"}
					<strong>{$currentTonic} {$selectedProps.currentScaleName[$selectedProps.currentWheel]}</strong>
				{#if $selectedProps.chordObject != ''}
					 | Chord : <strong>{$selectedProps.chordObject }</strong> 
				{/if}
				{#if $selectedProps.chordObject != ''}
					<br>Chord Tones: <strong>{currentChordTones}</strong>
				{/if}
				
			</p>
		</Row>

		<Row class="is-horizontal-align is-fixed">
			<div id="staff"></div>	
		</Row>
	
		<Row class="is-horizontal-align">
		<div id="boutongroup">

			<Button icon-only disabled=
				{$selectedProps.chordObject != '' ? false : true} 
				secondary icon={mdiArrowUpDown} on:click={invertChord}/>

			<Button icon-only disabled=
				{$selectedProps.chordObject != '' ? false : true} 
				secondary icon={mdiClose} on:click={clear}/>

			<Button icon-only disabled=
				{isChord ? false : true} 
				secondary icon={currentChordIcon}  
				on:click={toggleChordQuality}/>

			<Button icon-only success icon = { mdiArrowUpBox } 
				disabled={$transpose >= (12) ? true : false} 
				on:click={shiftOctave} />

			<Button icon-only success icon = {mdiArrowDownBox} 
				disabled={$transpose <= (-12) ? true : false} 
				on:click={unshiftOctave} />

			<Button icon-only error icon={mdiPlayCircleOutline} 
				on:click={play}/>
				<div class="activate-audio"></div>
		</div>
		</Row>
<style>

	#staff {
		margin-top:5px!important;
	}

	.spaceupdown {
		margin-top:20px;
		margin-bottom:10px;
		text-align: center;
	}

	#boutongroup {
		position:absolute;
		bottom:18px;
	}

</style>