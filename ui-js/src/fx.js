/**
 * Detects if the sum of 4 consecutive samples is above a certain limit.
 * Optimized for speed in Chrome browser.
 */
const createSilenceDetector = () => {
	const state = {
		a: 0,
		b: 0,
		c: 0,
		y: 0
	};
	return x => {
		state.y = x + state.a + state.b + state.c < 1e-6;
		state.c = state.b;
		state.b = state.a;
		state.a = Math.abs(x);
		return state.y;
	};
};

const createRatioBasedSilenceDetector = () => {
	let y = 0;
	return x => {
		y = y * 0.9999 + Math.abs(x) * 0.0001;
		return y < 1e-6;
	};
}

export const fx = (() => {
	const sampleRate = new AudioContext().sampleRate;

	return {
		delay: (delaymillis, feed, wet) => {
			const buffer = Array(Math.floor(delaymillis / 1000 * sampleRate)).fill(0);
			let idx = 0;
			return x => {
				if (idx === buffer.length)
					idx = 0;
				const b = buffer[idx];
				buffer[idx] = buffer[idx] * feed + x;
				idx++;
				return x * (1 - wet) + b * wet;
			};
		},

		distortion: (gain, clip) => (x => Math.min(Math.max(gain * x, -clip), clip)),

		overdrive: gain => x => Math.min(Math.max(gain * x * x * x, -1), 1),

		flanger: (frequencyHz, delay0to1, depth0to1, wet) => {
			const frequency = frequencyHz / sampleRate * Math.PI * 2;
			const delay = 200 * delay0to1;
			const depth = 200 * depth0to1;
			let phase = 0;
			let index = 0;
			const buffer = Array(600).fill(0);
			return input => {
				const dly = delay + depth * (Math.sin(phase += frequency) + 1);

				let temp1 = dly - 0.5;
				const f = Math.floor(temp1);
				const frac = dly - f;

				if (++index === buffer.length)
					index = 0;

				buffer[index] = input;

				temp1 = index - f;
				if (temp1 < 0)
					temp1 = temp1 + buffer.length;
				temp1 = buffer[Math.floor(temp1)];

				let temp2 = index - f - 1;
				if (temp2 < 0)
					temp2 = temp2 + buffer.length;
				temp2 = buffer[Math.floor(temp2)];

				return (-1 * ((1 - frac) * temp1 + frac * temp2)) * wet + input * (1 - wet);
			};
		},

		compressor: (threshold, ratio, attackmillis, releasemillis) => {
			const attack = attackmillis / sampleRate;
			const release = releasemillis / sampleRate;
			let e = 0;
			return i => {
				const ai = Math.abs(i);
				e = e + ((e < 1) ? ((ai > threshold) ? attack : 0) : 0);
				e = e - ((e > 0) ? ((ai < threshold) ? release : 0) : 0);
				const g = 1 - e * ratio;
				return i * g;
			};
		},
		amplify: gain => (x => x * gain),

		tremolo: (frequencyHz, depth) => {
			const frequency = frequencyHz / sampleRate * 2;
			let phase = 0;
			return x => {
				if ((phase += frequency) >= 1)
					phase -= 2;
				return x * (1 - depth * Math.abs(phase));
			};
		},

		tone: (lowCutFreq0to1, highCutFreq0to1) => {
			const cutConst = 0.3183099;
			const lpCutCalc = lowCutFreq0to1 / (cutConst + lowCutFreq0to1);
			const hpCutCalc = cutConst / (cutConst + highCutFreq0to1);
			let lpOut2 = 0;
			let hpOut2 = 0;
			let hpIn2 = 0;
			const lpProcess = x => {
				lpOut2 = lpOut2 + lpCutCalc * (x - lpOut2);
				return lpOut2
			};
			const hpProcess = x => {
				hpOut2 = hpCutCalc * (x + hpOut2 - hpIn2);
				hpIn2 = x;
				return hpOut2;
			};

			return x => lpProcess(hpProcess(x));
		},
		percussion: decayMs => {
			let phase = 0;
			const decaySamples = decayMs / 1000 * sampleRate;
			return x => {
				phase = x !== 0 ? phase + 1 : 0;

				return phase > decaySamples ? 0 : x * (1 - phase / decaySamples);
			};
		},

		plainFxStack: fxArray => x => fxArray.reduce((a, b) => b(a), x),

		regularFxStack: fxArray => {
			const silenceDetector = createSilenceDetector();
			return x => {
				if (!silenceDetector(x)) {
					return fxArray.reduce((a, b) => b(a), x);
				}
				return 0;
			};
		},

		outputAwareFxStack: fxArray => {
			const inputSilenceDetector = createRatioBasedSilenceDetector();
			const outputSilenceDetector = createRatioBasedSilenceDetector();
			let outputNonSilent = false;
			return x => {
				if (outputNonSilent || !inputSilenceDetector(x)) {
					const output = fxArray.reduce((a, b) => b(a), x);
					outputNonSilent = !outputSilenceDetector(output);
					return output;
				}
				return 0;
			};

		}
	};
})();
