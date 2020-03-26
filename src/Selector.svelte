<script>
import { createEventDispatcher } from 'svelte';
import {Input, Button, Row, Col, Container} from 'svelte-chota';
import { currentTonic, currentScale, currentMode, selectedProps } from './mobilevar';

const dispatch = createEventDispatcher();
let selectedMode = [];
let selectedScale = [];

let relevantModes = true;
let conditions;

function updateMode() 
{
    currentMode.set(+selectedMode.text);
    dispatch('message', {text: 'mode'});
    $selectedProps.currentScaleName[1] = selectedMode.value;
}

function updateScale() 
{
    if (selectedScale.text == "major"
        || selectedScale.text == "melodicminor"
        || selectedScale.text == "harmonicminor"
        || selectedScale.text =="harmonicmajor"
        || selectedScale.text == "doubleharmonic"
        || selectedScale.text == "enigmatic")
            
            {relevantModes = true }
            else {relevantModes = false;
    }

    $selectedProps.currentScaleName[0] = selectedScale.value;
    currentScale.set(selectedScale.text);
    dispatch('message', {text: 'scale'});
}

const items = [
    {value: "Major", text: "major"},
    {value: "Melodic minor", text: "melodicminor"}, 
    {value: "Harmonic minor", text: "harmonicminor"},
    {value: "Harmonic Major", text: "harmonicmajor"},
    {value: "Double Harmonic", text: "doubleharmonic"},
    {value: "Major Pentatonic", text: "majorpentatonic"},
    {value: "Pentatonic", text: "pentatonic" },
    {value: "Minor Pentatonic", text: "minorpentatonic"},
    {value: "blues", text: "blues"},
    {value: "Wholetone", text: "wholetone"},
    {value: "Augmented", text: "augmented"},
    {value: "Promotheus", text: "promotheus"},
    {value: "Enigmatic", text: "enigmatic"},
    {value: "Half dimished", text: "halfdimished"},
    {value: "Octatonic", text: "octatonic"},
    {value: "Diminished", text: "diminished"}
];
const majorModes = [
    {value: "Ionian", text: "1"},
    {value: "Dorian", text: "2"},
    {value: "Phrygian", text: "3"},
    {value: "Lydian", text: "4"},
    {value: "Mixolydian", text: "5"},
    {value: "Aeolian", text: "6"},
    {value: "Locrian", text: "7"}
];

const meloMinorModes = [
    {value: "Jazz Minor Scale", text: "1"},
    {value: "Dorian b2", text: "2"},
    {value: "Lydian augmented", text: "3"},
    {value: "Lydian dominant", text: "4"},
    {value: "Mixolydian b6", text: "5"},
    {value: "Aoelian b5", text: "6"},
    {value: "Altered dominant", text: "7"},
];

const harmoModes = [
    {value: "Harmonic Minor", text: "1"},
    {value: "Locrian Natural 6", text: "2"},
    {value: "Ionian Augmented", text: "3"},
    {value: "Dorian #11", text: "4"},
    {value: "Phrygian Dominant", text: "5"},
    {value: "Lydian #9", text: "6"},
    {value: "Ultralocrian", text: "7"}
];

const doubleHarmoModes = [
    {value: "Double harmonic", text: "1"},
    {value: "Lydian #2 #6", text: "2"},
    {value: "Ultraphrygian", text: "3"},
    {value: "Hungarian/Gypsy minor", text: "4"},
    {value: "Oriental", text: "5"},
    {value: "Ionian #2#5", text: "6"},
    {value: "Locrian bb3 bb7", text: "7"},
];

const harmoMajorModes = [
    {value: "Ionian b6", text: "1"},
    {value: "Dorian b5", text: "2"},
    {value: "Phrygian b4", text: "3"},
    {value: "Lydian b3", text: "4"},
    {value: "Mixolydian b2", text: "5"},
    {value: "Lydian Augmented #2", text: "6"},
    {value: "Locrian bb7", text: "7"},
];

const EnigmaticModes = [
    {value: "Enigmatic mode 1", text: "1"},
    {value: "Enigmatic mode 2", text: "2"},
    {value: "Enigmatic mode 3", text: "3"},
    {value: "Enigmatic mode 4", text: "4"},
    {value: "Enigmatic mode 5", text: "5"},
    {value: "Enigmatic mode 6", text: "6"},
    {value: "Enigmatic mode 7", text: "7"},
];

selectedScale.text = 'major';
</script>

<!--
<Row class="is-horizontal-align is-full-width">
    <h5>Tap circle center to change root</h5>
</Row>
-->

<Row class="is-horizontal-align">

        <select bind:value={selectedScale} on:change={updateScale} class="select-max">
            {#each items as scale}
                <option value={scale} style="color:black;">
                    {scale.value}
                </option>
            {/each}
        </select>
   
       {#if relevantModes}
            <select bind:value={selectedMode} on:change={updateMode} class="select-max">
                
                {#if selectedScale.text == 'major'}
                    {#each majorModes as mode}
                        <option value={mode} style="color:black;">
                            {mode.value}
                        </option>
                    {/each}
                {:else if selectedScale.text == 'harmonicminor'}
                    {#each harmoModes as mode}
                        <option value={mode} style="color:black;">
                            {mode.value}
                        </option>
                    {/each}
            
                {:else if selectedScale.text == 'doubleharmonic'}
                    {#each doubleHarmoModes as mode}
                        <option value={mode} style="color:black;">
                            {mode.value}
                        </option>
                    {/each}

                {:else if selectedScale.text == 'harmonicmajor'}
                    {#each harmoMajorModes as mode}
                        <option value={mode} style="color:black;">
                            {mode.value}
                        </option>
                    {/each}

                {:else if selectedScale.text == 'melodicminor'}
                    {#each meloMinorModes as mode}
                        <option value={mode} style="color:black;">
                            {mode.value}
                        </option>
                    {/each}
                {:else if selectedScale.text == 'enigmatic'}
                    {#each EnigmaticModes as mode}
                        <option value={mode} style="color:black;">
                            {mode.value}
                        </option>
                    {/each}
                {/if}
            </select>
        {/if}
</Row>
<style>
.select-max {
    
    color : white;
    border-radius: 0!important;
    box-sizing: border-box;
    margin: 5px;
    border: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    appearance: none;
    background-color: #fff;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E'),
      linear-gradient(to bottom, var(--color-darkGrey) 0%,var(--color-darkGrey) 100%);
    background-repeat: no-repeat, repeat;
    background-position: right .7em top 50%, 0 0;
    background-size: .65em auto, 100%;
    width:46%;
}

 .select-max::before,
    .select-max::after {
        content: "";
        position: absolute;
        pointer-events: none;
    }

    .select-max::after { /*  Custom dropdown arrow */
        content: "\25BC"!important;
        height: 1em;
        font-size: .625em;
        line-height: 1;
        right: 1.2em;
        top: 50%; margin-top: -.5em;
        color:white;
    }

    .select-max::before { /*  Custom dropdown arrow cover */
        width: 2em;
        right: 0; top: 0; bottom: 0;
    }


</style>