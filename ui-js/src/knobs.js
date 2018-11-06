/*
 * Copyrights 2017-2018 by Joonas Salonpää
 */

var knobState = {mouseDownKnob: undefined, states: {}, knobCount: 0};
function bindKnob(id) {
	var el = document.getElementById(id);
	var mouseDown = (event) => { 
		//console.log(event);
		knobState.originalPos = event.screenY ? event.screenY : event.targetTouches[0].screenY;
		knobState.originalValue = knobState.states[event.target.id].value;
		knobState.mouseDownKnob = event.target.id;
	};
	el.addEventListener('mousedown', mouseDown);
	el.addEventListener('touchstart', mouseDown);
	el.addEventListener('dragstart', () => false);
	updateKnobElement(id);
}
function updateKnobElement(id) {
	var value = knobState.states[id].value;
	document.getElementById(id + '-label').innerText = knobState.states[id].valueFormatter(value);
	document.getElementById(id).style.transform = 'rotate(?deg)'.replace('?', Math.round(value * 240 - 120));
}

var mouseUp = (event) => { 	
	knobState.mouseDownKnob = undefined;
};
document.addEventListener('mouseup', mouseUp);
document.addEventListener('touchend', mouseUp);

var mouseMove = (event) => { 		
	if(knobState.mouseDownKnob) {
		var relativeChange = (knobState.originalPos - (event.screenY ? event.screenY : event.targetTouches[0].screenY)) / 64;
		var value = knobState.originalValue + relativeChange;
		value = Math.min(Math.max(0, value), 1);
		knobState.states[knobState.mouseDownKnob].value = value;
		knobState.states[knobState.mouseDownKnob].onChange(value);
		updateKnobElement(knobState.mouseDownKnob);
	}
};

document.addEventListener('mousemove', mouseMove);
document.addEventListener('touchmove', mouseMove);
document.addEventListener('dragstart', () => false);

export function createKnob(element, description, onChange, initialValueSetter, valueFormatter) {
	knobState.knobCount++;
	var id = 'ui-knob-' + knobState.knobCount;
	var html = '<div class="knob-container"><div class="knob" id="KNOB_ID"></div><span class="knob-title">DESCR</span><span id="KNOB_ID-label"></span></div>';
	var state = {};
	state.valueSetter = initialValueSetter ? initialValueSetter : () => 0;
	state.value = state.valueSetter();
	state.valueFormatter = valueFormatter ? valueFormatter : knob0to1Formatter;
	state.onChange = onChange;
	knobState.states[id] = state;
	element.innerHTML += html.replace(/DESCR/g, description).replace(/KNOB_ID/g, id);
	setTimeout(()=>bindKnob(id), 1);
	return id;
}

export function fetchKnobs() {
	for(var id in knobState.states) {
		var state = knobState.states[id];
		state.value = state.valueSetter();
		updateKnobElement(id);
	}
}
export var selectOptionWith0to1Value = (value, options) => options[Math.floor(value === 1 ? options.length - 1 : value * options.length)];

export var labelFormatter = (label, multiplier, precision) => (value => ((multiplier ? multiplier : 100) * value).toFixed(precision ? precision : 0) + ' ' + label);
export var knob0to1Formatter = value => value.toFixed(2);
export var rangeFormatter = (min, max, formatter) => (value => formatter(value * (max - min) + min));
export var optionsFormatter = options => (value => selectOptionWith0to1Value(value, options));
