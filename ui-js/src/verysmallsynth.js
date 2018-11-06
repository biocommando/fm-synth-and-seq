/*
* Copyrights 2017-2018 by Joonas Salonpää
*/

/**
* This is a super simple 2 operator FM synth with a built-in sequencer.
* It has been optimized for size (mostly for the challenge; the minimized
* version takes a little more than 1kB (without performance optimizations
* would take less)).  
* The sequencer parameter contains the synth parameters and sequencer data
* in the following format:
* ```
* [
* // a single sequencer / synth combination:
* // contains 1 pattern, 1 synth, pattern sequence
* [
*  // pattern sequence, as in definitions for step ranges
*  // during which the pattern is played
*  [[startAtStep, stopAtStep], [startAtStep2, stopAtStep2],...],
*  // synth parameters
*  [  
*    ratio, // osc 2 frequency / osc 1 frequency
*    mod // osc 2 to osc 1 frequency modulation amount
*    osc1 // osc 1 volume (to output)
*    osc2 // osc 2 volume (to output),
*    fx // optional, a function that converts one synth output
*       // sample to effected sample
*       // example for doubling the output volume: x => 2 * x
*  ],  
*  // polyphonic sequencer. One element per step, after
*  // reaching the end, loops to the start.
*  [
*   // note instructions for steps. Within one step, each array
*   // index corresponds to a different
*   // voice. So voice allocation is done by the caller, not
*   // internally. If all notes are held an empty array can be
*   // provided for such a step.
*   // The values from 2 upwards correspond to notes in the
*   // chromatic scale, 2 being C#0 (A4=440Hz).
*   // The values 0 and 1 have a special meaning:
*   // 0 = do nothing,
*   // 1 = note off
*   [10, 20], [0, 1], ...
*  ]
* ],
* ...
* ]
* ```
* The sequence can be given attribute 'reset' that will make the sequencer to reset when the step
* provided by the attribute has been reached.
* 
* This function returns a function that can be used to start and stop the synth.
* The function for starting/stopping returns a function that can be used for updating
* sequence and parameters (even on the fly).
*/
export const verySmallSynth = (sequence, tempo, onStepAdvance) => {
	const audioContext = new AudioContext();
	const sampleRate = audioContext.sampleRate;
	const osc = freq => {
		let phase = 0;
		return fm => {
			phase += freq;
			return Math.sin(phase + fm);
		}
	};
	const RATIO = 0;
	const FM_AMOUNT = 1;
	const OSC1_OUTPUT_LEVEL = 2;
	const OSC2_OUTPUT_LEVEL = 3;
	const FX = 4;
	const VOICE_KILLED = 99;
	const voice = (freq, params) => {
		const osc1 = osc(freq);
		const osc2 = osc(freq * params[RATIO]);
		const fmAmount = params[FM_AMOUNT];
		const osc1OutputLevel = params[OSC1_OUTPUT_LEVEL];
		const osc2OutputLevel = params[OSC2_OUTPUT_LEVEL];
		let killEnvelope = 1;
		return kill => {
			if (kill) {
				killEnvelope = 1 - 1e-15;
			} else {
				const osc2Value = osc2(0);
				const osc1Value = osc1(osc2Value * fmAmount);
				killEnvelope *= killEnvelope;
				if (killEnvelope < 1e-6) { // happens after ~54 samples
					return VOICE_KILLED;
				}
				return (osc1Value * osc1OutputLevel + osc2Value * osc2OutputLevel) * killEnvelope;
			}
		};
	}
	const CHANNEL_VOICES = 0;
	const CHANNEL_FX = 1;
	let channels;
	let seq_step;
	let seq_sample;
	let samplesPerBeat;
	const START_STOP_STEP_RANGES = 0;
	const INSTRUMENT = 1;
	const NOTES_OFFSET = 2;
	const BASE_FREQ_MULTIPLIER_FOR_SINE = 102.740119;
	const progressSequence = () => {
		if (seq_sample > samplesPerBeat) {
			sequence.forEach((fmSynthParams, voiceNum) => {
				const stepRange = fmSynthParams[START_STOP_STEP_RANGES].find(range => seq_step >= range[0] && seq_step < range[1]);
				if (stepRange) {
					let notes = fmSynthParams[(seq_step - stepRange[0]) % (fmSynthParams.length - NOTES_OFFSET) + NOTES_OFFSET];
					notes = notes.pop ? notes : [notes];
					notes.forEach((note, noteNumber) => {
						if (note) {
							if (note > 1) {
								const freq = BASE_FREQ_MULTIPLIER_FOR_SINE * Math.pow(2, note / 12) / sampleRate;
								const instrument = fmSynthParams[INSTRUMENT];
								channels[voiceNum] = channels[voiceNum] ? channels[voiceNum] : [[]];
								channels[voiceNum][CHANNEL_VOICES][noteNumber] = voice(freq, instrument);
								channels[voiceNum][CHANNEL_FX] = instrument[FX] ? instrument[FX] : x => x;
							} else {
								channels[voiceNum] && channels[voiceNum][CHANNEL_VOICES][noteNumber] && channels[voiceNum][CHANNEL_VOICES][noteNumber](1);
							}
						}
					});
				}
			});
			channels.forEach(channel => {
				// Not using filter because the exact indexes matter
				const newVoices = new Array(channel[CHANNEL_VOICES].length);
				channel[CHANNEL_VOICES].forEach((voice, i) => {
					if (!voice.k) {
						newVoices[i] = voice;
					}
				});
				channel[CHANNEL_VOICES] = newVoices;
			});
			seq_step++;
			onStepAdvance && onStepAdvance();
			if (seq_step >= sequence.reset) {
				seq_step = 0;
			}
			seq_sample = 0;
		}
		seq_sample++;
	};

	const proc = audioContext.createScriptProcessor(0, 1, 1);
	proc.onaudioprocess = event => {
		const buf = event.outputBuffer.getChannelData(0);
		for (let i = 0; i < buf.length; i++) {
			progressSequence();
			buf[i] = 0;
			if (play) channels.forEach(channel => {
				let tempBuf = 0;
				channel[CHANNEL_VOICES].forEach(voice => {
					if (voice && !voice.k) {
						const output = voice();
						// Mark the voice killed so it's not being processed anymore
						if (output === VOICE_KILLED) {
							voice.k = 1;
						}
						else {
							tempBuf += output;
						}
					}
				});
				buf[i] += channel[CHANNEL_FX](tempBuf) / 8;
			});
		}
	}
	let play = false;
	return {
		toggle: (startPlayAt) => {
			if (!play) {
				channels = [];
				seq_step = startPlayAt;
				seq_sample = 0;
				samplesPerBeat = 15 / tempo * sampleRate;
				proc.connect(audioContext.destination);
			}
			play = !play;
		},
		update: (newSequence, newTempo) => {
			sequence = newSequence ? newSequence : sequence;
			tempo = newTempo ? newTempo : tempo;
		},
		playing: () => play,
		step: () => seq_step
	};
}
