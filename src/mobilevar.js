import { writable } from 'svelte/store';

export let currentTonic = writable('C');
export let currentScale = writable('major');
export let currentMode = writable(1);
export let currentRelative = writable ('C0');
export let currentFlavor = writable(0)
export let currentInnerBehavior = writable ('Parallel');
export let bottomUpdateMode = writable ('wesh');
export let wheelUpdateMode = writable ('wesh');
export let bottomVue = writable ('staff');
export let playNotes = writable ([48, 52]);
export let transpose = writable(0);

export let selectedProps = writable ({
    chord: undefined,
    note: undefined,
    interval: undefined,
    scale: [[],[]],
    chordObject : undefined,
    currentNotes : [[],[]],
    currentIndex : undefined,
    currentWheel : undefined,
    currentScaleName : ['Major', 'Ionian']
});
