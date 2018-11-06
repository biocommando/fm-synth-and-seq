fx = {
	delay: (delay, feedback, wet) => {
		const buffer = new Array(4e4+1).fill(0);
		let idx = 0;
		return x => {
			idx += idx < 4e4 ? 1 : -4e4;
			const bufferValue = buffer[idx];
			buffer[idx] = bufferValue * feedback + x;
			return x * (1 - wet) + wet * bufferValue;
		}
	},
	trem: (speed, amount) => {
		let phase = 0;
		return x => {
			phase += phase < .5 ? speed : -1;
			return x * (1 - Math.abs(phase) * amount);
		}
	},
	distort: (gain) => x => x = Math.min(Math.max(gain * x * x * x, -1), 1),
	tone: (lowCutFreq0to1, highCutFreq0to1) => {
		const lpCutCalc = lowCutFreq0to1 / (.3 + lowCutFreq0to1);
		const hpCutCalc = .3 / (.3 + highCutFreq0to1);
		let lpOut=0,hpOut=0,hpIn2=0;
		const lpProcess = x => lpOut = lpOut + lpCutCalc * (x - lpOut);
		const hpProcess = x => {
			hpOut = hpCutCalc * (hpOut - hpIn2 + x);
			hpIn2 = x;
			return hpOut;
		}
		return x => lpProcess(hpProcess(x));
	},
	vol: gain => x => gain * x,
	stack: (...fxs) => x => fxs.reduce((a,b)=>b(a), x)
}