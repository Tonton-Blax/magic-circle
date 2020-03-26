<script>
import {Input, Button, Card } from 'svelte-chota';
import "chota";
import { createEventDispatcher } from 'svelte';
import RadInput from './RadInput.svelte';
import wheel from "./wheel";
import {bottomVue} from './mobilevar';

const dispatch = createEventDispatcher();
let wheelDirection = {text : "cw", current : 'cw'};
let instru = 'staff'; 
let requestUpdate = false;
let instruCurrent =  {'staff' : false, 'keyboard' : false, 'guitar': false};

function confirm () 
{
    if (!instruCurrent[instru]) {
        $bottomVue = instru;
        requestUpdate = true;
        instruCurrent = {'staff' : false, 'keyboard' : false, 'guitar': false};
        instruCurrent[instru] = true;  
    }

    if (wheelDirection.current != wheelDirection.text) 
    {
        if ( wheelDirection.text = "ccw") 
        {
            wheel.order = '-';
            wheel.fundamental = 'C4';
            wheel.relative = 'C4';
        }

        else if ( wheelDirection.text = "cw") 
        {
            wheel.order = '+';
            wheel.fundamental = 'C0';
            wheel.relative = 'C0';
        }
        requestUpdate = true;
    }

    dispatch('message', {
        text : requestUpdate,
        confirm : 'confirm'
    });

    wheelDirection.current = wheelDirection.text;
    requestUpdate = false;
}

function cancel () {
   
   requestUpdate = false;

    dispatch('message', {
        text : requestUpdate,
        confirm : 'cancel'
    });

}

</script>

<div>
    <Card> 
        <h3 slot="header">Options</h3>
        <p>Wheel Direction:</p>
        <RadInput value="cw" bind:group={wheelDirection.text} checked=true>Clock</RadInput>
        <RadInput value="ccw" bind:group={wheelDirection.text}>Counter-clock</RadInput>
        <p>Chord visualisation:</p>
        <RadInput value="staff" bind:group={instru} checked={instruCurrent['staff']} >Staff</RadInput>
        <RadInput value="keyboard" bind:group={instru} checked={instruCurrent['keyboard']} >Keyboard</RadInput>
        <RadInput value="guitar" bind:group={instru} checked={instruCurrent['guitar']} }>Guitar</RadInput>
        
        <div slot="footer" class="is-right footer-max">
            <Button on:click={cancel} clear>Cancel</Button>
            <Button on:click={confirm} primary>Confirm</Button>
        </div>
    </Card> 
</div>

<style>
p {
    font-weight: 700;
    margin-top: 1.5em;
    margin-bottom: .3em;
}

.footer-max {
    margin: 2em 0;
}

</style>