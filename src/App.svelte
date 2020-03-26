<svelte:head>
	<link rel="stylesheet" href="./typeface-fira-sans/index.css"> <!-- CSS TYPO-->
	<link rel="stylesheet" href="./hiraku.css">	<!-- CSS DU MENU DRAWER -->
</svelte:head>

<script>

// svelte lifecycle lib

	import { onMount } from "svelte";
	import { Swipe, SwipeItem } from "svelte-swipe"; // gzipped 3.37 KB

	let chordColors;

	let autoplay = false;
	let delay = 2000; //ms
	let showIndicators = true;
	let transitionDuration = 1000; //ms
	let defaultIndex = 0; //start from 0

// external libs dependencies

	import pianissimo from 'pianissimo';
	import Hiraku from 'hiraku';
	import abcjs from "abcjs";

	import "chota";
	import { 
		mdiMusicBoxOutline, 
		mdiBuddhism, 
		mdiCogs, 
		mdiMusicNotePlus, 
		mdiMusicNoteOutline,
		mdiNumeric5Box,
		mdiNumeric4Box,
		mdiNumeric3Box,
		mdiPlayCircleOutline,
		mdiChevronDown,
		mdiAnimationPlay
	} from '@mdi/js';

// Global vars ('svelte stores')

	import { 	
		currentTonic, 
		currentScale, 
		currentMode, 
		currentInnerBehavior, 
		selectedProps,
		bottomUpdateMode,
		wheelUpdateMode,
		bottomVue,
		playNotes,
		transpose
	} from './mobilevar';

// Components

	import {Row, Col, Container, Button, Card, Modal} from 'svelte-chota';
	import Selector from './Selector.svelte';
	import Options from './Options.svelte';
	import Chart from './Chart.svelte';
	import Piano from './Piano.svelte';
	import Staff from './Staff.svelte';
	import Guitar from './Guitar.svelte';

	let hiraku;

	let wheelUpdateRequested = {update : false, animation:0};
	let bottomUpdateRequested = false;
	let bottomInit = false;
	let butChordQuality = 4;
	let audioContext; let synth; let seq;

	let midiInstr = 4;

	onMount(async () => 
	{
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new window.AudioContext();
        synth = new abcjs.synth.CreateSynth();
        seq = new abcjs.synth.SynthSequence();
		
		hiraku = new Hiraku(".offcanvas-left", 
		{
			btn: "#offcanvas-btn-left",
			fixedHeader: "#header",
			direction: "left"
		});
	});

	let openOptions = false;

	let options =  () => {
		hiraku.close();
		openOptions=true;
	}

/* 	▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ 
▶ ■ ▶ ■ ▶ ■ ▶ ■  PLAY STOP		▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■
▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ ■ ▶ */

	function play() {
		synth.stop();
		seq.tracks=[];
		seq.addTrack();
		seq.setInstrument(0,midiInstr);
		$playNotes.forEach((note) => seq.appendNote(0, note + $transpose, 0.35, 128));
		synth.init({
			audioContext:audioContext,
			sequence : seq})
				.then( () => synth.prime(() => {console.log('prime OK')}) )
				.then( () => synth.start() )
	}


	function playChord() {
		synth.stop();
		seq.tracks=[];
		for (let i = 0; i < $playNotes.length ; i++) {

			seq.addTrack();
			seq.appendNote(i, $playNotes[i] + $transpose, 1.5, 128);
			seq.setInstrument(i,midiInstr);

		}

		synth.init({
			audioContext:audioContext,
			sequence : seq})
				.then( () => synth.prime(() => {console.log('prime OK')}) )
				.then( () => synth.start() )
	}

	function playScale () {
		let buffer = pianissimo.scale($currentTonic, $currentScale, ($selectedProps.currentWheel ? $currentMode : 1) );
		$playNotes = [];
		buffer.getNotes().forEach( (note) => $playNotes.push( note.getMidiNumber() + $transpose ) );
		$playNotes.push(buffer.getNotes()[0].getMidiNumber() + $transpose + 12);
		buffer = [];
		play();
	}

/* 	⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ 
⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤   STATE MANAGEMENT	 ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  
⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ ⇪  ▤ */

	let handleWheelRequest = (e) => {
		$bottomUpdateMode = e.text;  // <<= 'init' or 'hydrate' or 'update' dispatched by Chart.svelte
		switch (e.text) {
			case 'init' : 
				bottomInit = true;
				break;
			case 'hydrate' :
				bottomUpdateRequested = true;
				break;
			case 'update' :
				bottomUpdateRequested = true;
				break;
		}
		wheelUpdateRequested.update = false;
	}

	let handleStaffRequest = (e) => {
		
		midiInstr = 4;
		if (e.text == 'refresh') {
			wheelUpdateRequested.update = true;		
			$wheelUpdateMode = e.text;
		}
		
		else if (e.text == 'colors') {
			chordColors = e.chordColors;
			wheelUpdateRequested.update = true;		
			$wheelUpdateMode = e.text;
		}
		else switch (e.text) {
			case 'note'  : play();break;
			case 'chord' : playChord(); break;
			case 'scale' : playScale(); break;
		}
	}

	let handleKeyboardRequest = (e) => {
		midiInstr = 1;
		switch (e.text) {
			case 'note'  : play();break;
			case 'chord' : playChord(); break;
			case 'scale' : playScale(); break;
		}
	}

	let handleSelectorRequest = (e) => {
		wheelUpdateRequested.animation = 1000;
		$wheelUpdateMode = 'refresh';
		wheelUpdateRequested.update = true;

		e.text == 'scale' ? $currentMode = 1 : $currentMode;
	}

	let updateOptions = (e) => {
		if (e.confirm == true && e.text == true) {
			wheelUpdateRequested.update = false;
			wheelUpdateRequested.animation = 1000;
			bottomUpdateRequested = false;
			update = false;
		}
		openOptions = false;
	}

	let handleGuitar = (conf) => {
		if (conf == 'quality') {
			butChordQuality == 3 ? butChordQuality = 4 : butChordQuality == 4 ? butChordQuality = 5 : butChordQuality = 3;
			bottomUpdateRequested = true;
			bottomUpdateMode.set('chord');
		}
		else if (conf == 'play') {
			midiInstr = 24;
			play();
		}
		else if (conf == 'playChord') {
			midiInstr = 24;
			playChord();
		}
		wheelUpdateRequested.update = false;
	}

	let handleBottomVue = (view) => {
		$bottomVue = view;
		bottomUpdateRequested = true;
		bottomUpdateMode.set('init');
		hiraku.close();
	}

</script>


<body>
<Row is-center>
<!-- == == == == == == == == OPTIONS MODAL == == == == == == == ==  -->

	<Modal bind:open={openOptions}>
		<Options on:message={e => updateOptions(e.detail)}></Options>
	</Modal>

<!-- == == == == == == == == MENU == == == == == == == ==  -->

	<button on:click={hiraku.open()} class="hiraku-open-btn" id="offcanvas-btn-left" data-toggle-offcanvas="#js-hiraku-offcanvas-1">
		<span class="hiraku-open-btn-line"></span>
	</button>
	<div class="offcanvas-left">
		<ul class="menulist">
			<Button primary class="pull-left is-full-width max-button" disabled icon={mdiBuddhism} on:click={hiraku.close()}>Outer Wheel</Button><br><br>
			<Button primary class="pull-left is-full-width max-button" disabled icon={mdiMusicBoxOutline} on:click={hiraku.close()}>Inner Wheel</Button><br><br>
			<li><hr style="border: solid #bbb 1px;"></li>
		
			<div class="butdrop">
				<Button dropdown="Instrument" autoclose primary class="is-full-width" iconRight={mdiChevronDown}>
					<p on:click={() => handleBottomVue ('staff')}>Staff</p> 
					<p on:click={() => handleBottomVue ('keyboard')}>Keyboard</p> 
					<p on:click={() => handleBottomVue ('guitar')}>Guitar</p> 
				</Button>
			</div>
		</ul>
	</div>

<!-- == == == == == == == == CHART == == == == == == == ==  -->

		<Col sizeLG="8" is-center>
			<div id = "chartglobal">
				<Chart bind:chordColors={chordColors} bind:animDuration={wheelUpdateRequested.animation} bind:update={wheelUpdateRequested.update} on:message={e => handleWheelRequest(e.detail)} />			
			</div>
		</Col>

<!-- == == == == == == == SCALE SELECTOR == == == == == == ==  -->

		<Col sizeLG="4">
		<div class="rightcol">
			<div id = "dualselect">
				<Selector on:message={e => handleSelectorRequest(e.detail)} />
 			</div>

<!-- == == == == == == == == BOTTOM VIEW == == == == == == == ==  -->

			{#if bottomInit || bottomUpdateRequested}
				<div id = "bottom">
					{#if $bottomVue == 'staff'}
						<Staff bind:update={bottomUpdateRequested} on:message={e => handleStaffRequest(e.detail)} />
					{:else if $bottomVue == 'keyboard'}
						<Piano bind:update={bottomUpdateRequested} on:message={e => handleKeyboardRequest(e.detail)} />
					{:else if $bottomVue == 'guitar'}
					<div class = "swipe-holder">

						<Swipe {showIndicators} {autoplay} {delay} {transitionDuration} {defaultIndex}
							on:message={(e) => console.log(e)}
						>

							<SwipeItem>
								<Guitar bind:update={bottomUpdateRequested} pos={0} />
							</SwipeItem>
							<SwipeItem>
								<Guitar bind:update={bottomUpdateRequested} pos={1} />
							</SwipeItem>	
							<SwipeItem>
								<Guitar bind:update={bottomUpdateRequested} pos={2} />
							</SwipeItem>
							<SwipeItem>
								<Guitar bind:update={bottomUpdateRequested} pos={3} />
							</SwipeItem>

						</Swipe>

						<div class = "swipe-buttons">
							<Button icon-only
							secondary icon={butChordQuality == 3 ? mdiNumeric3Box : butChordQuality == 4 ? mdiNumeric4Box : mdiNumeric5Box}  
							on:click={ ()=> handleGuitar('quality') }/>
							<Button icon-only error icon={mdiPlayCircleOutline} 
								on:click={()=> handleGuitar('play')} />
							<Button icon-only error icon={mdiAnimationPlay} 
								on:click={()=> handleGuitar('playChord')} />
						</div>
					</div>
					{/if}				
				</div>
			{/if}				
			</div>
		</Col>
	</Row>
</body>

<!-- == == == == == == == == == == == STYLING == == == == == == ==  -->

<style>

	
	:global(button)
	{
		border-radius:0px!important;
	}

	:global(.button) {
		border-radius:0px!important;
	}

	:global(:root) {
	--color-primary: #35383f!important;
	--color-lightGrey: #d2d6dd;
	--color-grey: #474b52;
	--color-darkGrey: #35383f;
	--color-error: #d43939;
	--color-success: #006989!important;
	--grid-maxWidth: 120rem;
	--grid-gutter: 2rem;
	--font-size: 1.6rem;
	--font-family: "Fira Sans", "Helvetica Neue", sans-serif;

	--sv-swipe-panel-height: 240px;
    --sv-swipe-panel-width: 380px;
    --sv-swipe-panel-wrapper-index: 0;
    --sv-swipe-indicator-active-color: #35383f;

    }

	.butdrop {
		display : grid;
	}

	.hiraku-open-btn {
		position: fixed;
		z-index: 1;
		left : 20px;
		top : 20px;
		width:32px;
		height : 32px;
	}

	.hiraku-open-btn-line, .hiraku-open-btn-line::before, .hiraku-open-btn-line::after {
		background-color:var(--color-darkGrey);
		height:3px;
	}

	.menulist {
		list-style-type: none;
		z-index :1;	
		cursor:pointer;
		padding-top:3em;
		margin-right:3em;
		margin-left:2em;
	}

	#chartglobal {
		margin-left:45px;
		margin-right:20px;
		margin-top:20px;
		margin-bottom:25px;
	}

	@media (max-width: 640px) {

		#dualselect {
			margin-left:30px;
			margin-right:10px;
		}
		#bottom {
			margin-left:10px;
		}
	}	

	@media (min-width: 640px) {

		#dualselect {
			margin-left:3px;
			margin-right:3px;
			
		}	
		.rightcol {
			margin-top:20%;
			margin-bottom: 20%;
		}	
	}	

	:global(svg .mark) {
        fill: #C43835;
        stroke: #C43835;
    }

	@media (max-width: 640px) {

		:global(.body) {
			max-width: 380px
		}	
	}
	.swipe-holder {
		height: auto;
		width: 100%;
  	}
	:global(.swipe-indicator) {
		bottom:-1rem!important;
 	}

	.swipe-buttons {
		position : relative;
		bottom : 80px;
		float : right;
		margin-right:2em;
	}

</style>