<script>

	export let update = false;
	export let chordColors;
	export let animDuration = 1000;
	import { onMount, createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

	import pianissimo from 'pianissimo';
	import Chart from "chart.js";
	import ChartDataLabels from 'chartjs-plugin-datalabels';

	import "chota";
	import {Row, Col, Container, Button } from 'svelte-chota';

	import { 	
		currentTonic, 
		currentScale, 
		currentMode, 
		currentInnerBehavior, 
		selectedProps,
		wheelUpdateMode,
		currentFlavor
	} from './mobilevar';

	import wheel from './wheel.js';
	import Selector from './Selector.svelte';
	import Options from './Options.svelte';

	let chart;
	let tmpTonic = $currentTonic;
	let degrees = [,];
	let justArefresh = false;

	$: if (update) {

		if ($wheelUpdateMode == 'colors') {	updateColors(chart) ; update=false;} 
		else if ($wheelUpdateMode == 'refresh') { updateCircle(chart, animDuration); justArefresh = false; update=false; $wheelUpdateMode == 'nothing'}
	}
	
/****************						********************************** /
/* ************** DOUGHNUT OPTIOMS      ********************************** /
***************** 						********************************* */


	Chart.defaults.global.legend.display = false;
	Chart.defaults.global.tooltips.bodyFontFamily = "Fira Sans";
	Chart.defaults.global.tooltips.bodyFontSize = 18;
	Chart.defaults.global.tooltips.backgroundColor = '#141e30';
	Chart.defaults.global.tooltips.bodySpacing = 16;
	Chart.defaults.global.tooltips.displayColors = false;
	Chart.defaults.global.tooltips.cornerRadius = 0;
	Chart.defaults.global.tooltips.footerMarginTop = 20;


/****************						 ********************************* /
/* ************** CENTER DOUGHNUT PLUGIN ********************************** /
***************** 						 ******************************** */

	Chart.pluginService.register(
	{
		id: 'centerWheel',
		beforeDraw: function(chart) {
			let text1, text2;
			text1 = document.getElementById('text1');
			text2 = document.getElementById('text2');
			let width = chart.chart.width,
				height = chart.chart.height;

			let fontSize = (height / 114).toFixed(2);
			text1.style.font = fontSize + "em Fira Sans";
			text1.style.backgroundColor = "#35383f";
			text1.style.padding = "1% 5%";
			text1.style.borderRadius = "3em";
			text1.style.color = "white";
			text1.innerText = tmpTonic;
			let r = text1.getBoundingClientRect();
			text1.style.left = ((width-r.width)/2)+"px";
			text1.style.top = ((height-r.height)/2.4)+"px";
			
			text2.style.font = (fontSize / 3).toFixed(2) + "em Fira Sans";
			text2.style.color = "black";
			text2.innerText = 'Push to\n set scale';
			let r2 = text2.getBoundingClientRect();
			text2.style.left = ((width-r2.width)/2)+"px";
			text2.style.top = ((height-r2.height)/1.65)+"px";
		}
	});

/****************						********************************** /
/* ************** CHART AND GLOBAL INIT ********************************** /
***************** 						********************************* */

onMount(async () => 
{
	currentScale.set('major');
	currentTonic.set('C');
	wheel.setWheel ('C0',0, $currentFlavor);
	wheel.setWheel ('C0',1, $currentFlavor);
	$selectedProps.scale[0]=wheel.setScale($currentTonic, $currentScale, 1, 0);	
	let props = [[],[]];
	props[0] = wheel.matchWheel(0);
	$selectedProps.scale[1]=wheel.setScale($currentTonic, $currentScale, $currentMode, 1);
	props[1] = wheel.matchWheel(1);
	$selectedProps.currentWheel = 0;
	degrees[0] = wheel.matchDegrees($selectedProps.scale[0],0);
	degrees[1] = wheel.matchDegrees($selectedProps.scale[1],1);
	updateBottom('init');

	///////////////////////////////////////	
	//INITIAL CHART DATA /////////////////
	/////////////////////////////////////

	chart = new Chart('chart',
	{
		type: 'doughnut',
		data: 
		{
			datasets: 
			[
				{
					data: [8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33], 
					backgroundColor:props[0].colors,
					borderWidth: 0,
					hoverBackgroundColor:'#084',
					labels: props[0].names,
					chords: props[0].chords
				},
				{
					data: [8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33],
					borderWidth: 0,
					hoverBackgroundColor:'#084',
					backgroundColor:props[1].colors,
					labels: props[1].names,
					chords: props[1].chords
				}
			]
		},
		//INITIAL CHART OPTIONS ///////////////////////////////////////////////////////////////////////////////
		options: 
		{
			aspectRatio: 1,
			cutoutPercentage: 40,
			tooltips: {
				callbacks: 
				{
					title: function(tooltipItem, data) {
						return `Example Chords`;
					},
					label: function(tooltipItem, data) 
					{
						$selectedProps.chord = data.datasets[tooltipItem.datasetIndex].chords[tooltipItem.index]; 

						$selectedProps.currentIndex = props[tooltipItem.datasetIndex].delta[tooltipItem.index]

						if ($selectedProps.currentIndex != undefined) {
							$selectedProps.currentWheel == tooltipItem.datasetIndex ? updateBottom('hydrate') : updateBottom('update');
							$selectedProps.currentWheel = tooltipItem.datasetIndex;
						}

						tmpTonic = (data.datasets[tooltipItem.datasetIndex].labels[tooltipItem.index]);
						return $selectedProps.chord;
					}
				}
			},
			plugins: 
			{
				centerWheel : true,
				datalabels: 
				{
					font : {size:16, family:"Fira Sans", weight:400},
					color: 'white',
					textAlign: 'center',
					formatter: function(value, ctx) 
					{
						let index = ctx.dataIndex;
						return ctx.dataset.labels[ctx.dataIndex] + '\n' + 
						(degrees[ctx.datasetIndex][props[ctx.datasetIndex].delta[index]] || pianissimo.interval($currentTonic, ctx.dataset.labels[ctx.dataIndex]).invert().interval);
						//props.intervals[index].interval;
					}
				}
			}
		}
	});
});

/****************				******************************************* /
/* **************  UPDATE FUNC  ******************************************* /
***************** 				****************************************** */

function updateCircle (chart, duration) 
{
	$currentTonic = tmpTonic;

	if ($currentTonic.length > 2 && ($currentTonic.substring(2) == '#' || $currentTonic.substring(2) == 'b'))
		$currentTonic = wheel.alterRootDic[$currentTonic];
		else if ($currentTonic == 'Cb' || $currentTonic == 'Fb' || $currentTonic == 'B#' || $currentTonic == 'E#')
			$currentTonic = wheel.alterRootDic[$currentTonic];

	wheel.setWheel (wheel.fundamental, 0, $currentFlavor);	
	wheel.setWheel (wheel.relative, 1, $currentFlavor);
	$selectedProps.scale[0] = wheel.setScale($currentTonic, $currentScale, 1, 0);
	let props = [,]; // props flushing
	props[0] = wheel.matchWheel(0);
	$selectedProps.scale[1] = wheel.setScale($currentTonic, $currentScale, $currentMode, 1);
	props[1] = wheel.matchWheel(1);
	degrees[0] = wheel.matchDegrees($selectedProps.scale[0],0);
	degrees[1] = wheel.matchDegrees($selectedProps.scale[1],1);
	if (!justArefresh) updateBottom('update');

	chart.data = {
		labels: props[0].names,
		datasets: 
		[	
			{
				data: [8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33], 
				borderWidth: 0,
				hoverBackgroundColor:'#084',	
				backgroundColor:props[0].colors,

				labels: props[0].names,
				chords: props[0].chords
			},
			{
				data: [8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33],
				borderWidth: 0,
				hoverBackgroundColor:'#084',
				backgroundColor:props[1].colors,
				labels: props[1].names,
				chords: props[1].chords
			}
		]
	}
	// UPDATED CHART OPTIONS
	chart.options = {	
		animation : {duration : duration || animDuration},
		aspectRatio: 1,
		cutoutPercentage: 40,
		tooltips: 
		{
			callbacks: 
			{
				label: function(tooltipItem, data) 
				{
					$selectedProps.chord = data.datasets[tooltipItem.datasetIndex].chords[tooltipItem.index]; 

					$selectedProps.currentIndex = props[tooltipItem.datasetIndex].delta[tooltipItem.index]

					if ($selectedProps.currentIndex != undefined) {
						$selectedProps.currentWheel == tooltipItem.datasetIndex ? updateBottom('hydrate') : updateBottom('update');
						$selectedProps.currentWheel = tooltipItem.datasetIndex;
					}

					tmpTonic = (data.datasets[tooltipItem.datasetIndex].labels[tooltipItem.index]);
					
					return $selectedProps.chord;
				}
			}
		},
		plugins: 
		{	
			centerWheel : true,
			datalabels: 
			{
				font : {size:16, family:"Fira Sans", weight:400},
				color: 'white',
				textAlign: 'center',
						
				formatter: function(value, ctx) 
				{
					let index = ctx.dataIndex;
					return ctx.dataset.labels[ctx.dataIndex] + '\n' + //props.intervals[index].interval;
					(degrees[ctx.datasetIndex][props[ctx.datasetIndex].delta[index]] || pianissimo.interval($currentTonic, ctx.dataset.labels[ctx.dataIndex]).invert().interval);
					//pianissimo.interval($currentTonic, ctx.dataset.labels[ctx.dataIndex]).invert().interval;
				}
			}
		}
	};
	chart.update();
	update = false;
};

/****************				******************************************* /
/* **************  UPDATE COLORS ******************************************* /
***************** 				****************************************** */

	function updateColors (chart) {
		let deltas = [,];
		deltas[0] = [...wheel._scaleDelta[0]];
		deltas[1] = [...wheel._scaleDelta[1]];
		
		chart.data = {
			labels: wheel._names,
			datasets: 
			[	
				{
					data: [8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33], 
					borderWidth: 0,
					hoverBackgroundColor:'#084',	
					backgroundColor: chordColors[0],
					labels: wheel._names[0],
					chords: wheel._chordsStrings[0]
				},
				{
					data: [8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33, 8.33],
					borderWidth: 0,
					hoverBackgroundColor:'#084',
					backgroundColor: chordColors[1],
					labels: wheel._names[1],
					chords: wheel._chordsStrings[1]
				}
			]
		}

		chart.options = { 
			aspectRatio: 1,
			cutoutPercentage: 40,
			tooltips: 
			{
				callbacks: 
				{
					label: function(tooltipItem, data) 	{
						tmpTonic = $currentTonic;
						justArefresh = true;
						updateCircle(chart,1);
					}
				}
			},
			plugins: 
			{	
				centerWheel : true,
				datalabels: 
				{
					font : {size:16, family:"Fira Sans", weight:400},
					color: 'white',
					textAlign: 'center',

					formatter: function(value, ctx) 
					{
						let index = ctx.dataIndex;
						return ctx.dataset.labels[ctx.dataIndex] + '\n' + //props.intervals[index].interval;
						(degrees[ctx.datasetIndex][wheel._scaleDelta[ctx.datasetIndex][index]] 
						|| pianissimo.interval($currentTonic, ctx.dataset.labels[ctx.dataIndex]).invert().interval);
					}
				}
			},
			animation : {duration : 0} 
		};

		chart.update();
		update = false;	
	}

/****************				    ******************************************* /
/* ************** BOTTOM FORWARDING	******************************************* /
***************** 			     	****************************************** */

	function updateBottom (message) {	
		
		dispatch('message', {
			text: message
		});
	}
function toggleIcon () {

console.log('chat');
}

function toggleFlavor () {
	$currentFlavor ? $currentFlavor = 0 : $currentFlavor =1;
	updateCircle(chart, 1000);
}


</script>


<!-- == == == == == == == == CHART == == == == == == == ==  -->
	<div class="chart-wrapper">
	<div class='pingouin'><button on:click={toggleFlavor} class="boutonsharp">{$currentFlavor ? '#' : '♭'}</button></div>
		<canvas id="chart" />
		<div class="chart-text" id="text1" on:click={() => {justArefresh=false; updateCircle(chart)}}>{$currentTonic}</div>
		<div class="chart-text" id="text2"></div>
	</div>				

<!-- == == == == == == == == == == == STYLING == == == == == == ==  -->

<style>

	.chart-wrapper { position: relative;}
	.chart-text { position: absolute; }
	.chart-wrapper > .chart-text {z-index:100!important;}
	.pingouin {position: fixed; right:32px;}	
	.boutonsharp {
		border:1px solid #747681;
		display:inline-block;
		cursor:pointer;
		color:#747681;
		font-size:18px;
		border-radius : 3px!important;
		font-weight:900;
		padding:6px 24px;
		text-decoration:none;
		background: none;
		padding: 8px 12px;
	}

	.boutonsharp:active {
		position:relative;
		top:1px;
	}

        

</style>