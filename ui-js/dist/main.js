!function(e){var t={};function n(a){if(t[a])return t[a].exports;var o=t[a]={i:a,l:!1,exports:{}};return e[a].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,a){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(n.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(a,o,function(t){return e[t]}.bind(null,o));return a},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=1)}([function(e,t){const n=(e,t)=>{const n=`dataStoreServerApi_${e}_${Date.now().toString(31)}`;return t[e]=(()=>document.getElementById(n)),n};let a,o,r,s={};document.body.innerHTML+=`<div id=${n("container",s)}></div>`,s=s.container;const i=(e,t,n,a,o)=>{var r=new XMLHttpRequest;r.onreadystatechange=function(){4==this.readyState&&(200==this.status?a&&a(JSON.parse(r.responseText)):o&&o(this.status,JSON.parse(r.responseText)))},r.timeout=1e3,"GET"===e?(r.open("GET",t+(n?"?"+Object.keys(n).map(e=>e+"="+n[e]).join("&"):""),!0),r.send()):(r.open("POST",t,!0),r.setRequestHeader("Content-Type","application/json;charset=UTF-8"),r.send(JSON.stringify(n)))},c=(e,t)=>alert(t.message),d=e=>{0===s().childElementCount&&i("GET","/session",{token:r},t=>{if(r=t.token,t.authenticated)return e();if(void 0===a){const t={};s().innerHTML+=`\n                <div id="${n("modal",t)}" style="${["min-height: 140px;","min-width: 400px;","background-color: white;","border: 3px dotted black;","padding: 20px;","font-size: 18px;","position: fixed;","margin-top: -70px;","margin-left: -200px;","top: 50%;","left: 50%;"].join("")}">\n                    <div id="${n("error",t)}" style="color:red;white-space:wrap;"></div>\n                    <div style="font-weight:bold">Login to service</div>\n                    <div style="margin:10px">\n                        User name <input id="${n("userName",t)}"/>\n                    </div>\n                    <div style="margin:10px">\n                        Password <input type="password" id="${n("password",t)}"/>\n                    </div>\n                    <div style="margin:10px">\n                        <button id="${n("login",t)}">Login</button> | <button id="${n("signup",t)}">Signup</button>\n\t\t\t\t\t\t| <button id="${n("cancel",t)}">Cancel</button>\n                    </div>\n                </div>\n                `;const c=n=>()=>{const s=t.userName().value,c=t.password().value;i("POST",n,{user:s,pass:c,token:r},()=>{a=s,o=c,e(),t.modal().remove()},(e,n)=>t.error().innerText="Error: "+n.message)};t.userName().focus(),t.password().onkeypress=(e=>("Enter"===e.key&&c("/login")(),!0)),t.login().onclick=c("/login"),t.signup().onclick=c("/register"),t.cancel().onclick=(()=>t.modal().remove())}else i("POST","/login",{user:a,pass:o,token:r},e,t=>{c(),a=void 0,d(e)})})};e.exports={getDirectory:e=>{d(()=>{i("GET","/directory",{token:r},e,c)})},setData:(e,t,n)=>{d(()=>{i("POST","/data",{token:r,id:e,...t},n,c)})},getData:(e,t)=>{d(()=>{i("GET","/data",{token:r,id:e},t,c)})},deleteData:(e,t)=>{d(()=>{i("POST","/delete",{token:r,id:e},t,c)})},createShareToken:(e,t)=>{d(()=>{i("POST","/share",{token:r,id:e},t,c)})},getSharedData:(e,t)=>{i("GET","/share",{shareToken:e},t,c)}}},function(e,t,n){"use strict";n.r(t);var a={mouseDownKnob:void 0,states:{},knobCount:0};function o(e){var t=a.states[e].value;document.getElementById(e+"-label").innerText=a.states[e].valueFormatter(t),document.getElementById(e).style.transform="rotate(?deg)".replace("?",Math.round(240*t-120))}var r=e=>{a.mouseDownKnob=void 0};document.addEventListener("mouseup",r),document.addEventListener("touchend",r);var s=e=>{if(a.mouseDownKnob){var t=(a.originalPos-(e.screenY?e.screenY:e.targetTouches[0].screenY))/256,n=a.originalValue+t;n=Math.min(Math.max(0,n),1),a.states[a.mouseDownKnob].value=n,a.states[a.mouseDownKnob].onChange(n),o(a.mouseDownKnob)}};function i(e,t,n,r,s){a.knobCount++;var i="ui-knob-"+a.knobCount,c={};return c.valueSetter=r||(()=>0),c.value=c.valueSetter(),c.valueFormatter=s||l,c.onChange=n,a.states[i]=c,e.innerHTML+='<div class="knob-container"><div class="knob" id="KNOB_ID"></div><span class="knob-title">DESCR</span><span id="KNOB_ID-label"></span></div>'.replace(/DESCR/g,t).replace(/KNOB_ID/g,i),setTimeout(()=>(function(e){var t=document.getElementById(e),n=e=>{a.originalPos=e.screenY?e.screenY:e.targetTouches[0].screenY,a.originalValue=a.states[e.target.id].value,a.mouseDownKnob=e.target.id};t.addEventListener("mousedown",n),t.addEventListener("touchstart",n),t.addEventListener("dragstart",()=>!1),o(e)})(i),1),i}function c(){for(var e in a.states){var t=a.states[e];t.value=t.valueSetter(),o(e)}}document.addEventListener("mousemove",s),document.addEventListener("touchmove",s),document.addEventListener("dragstart",()=>!1);var d=(e,t,n)=>a=>((t||100)*a).toFixed(n||0)+" "+e,l=e=>e.toFixed(2),m=e=>t=>((e,t)=>t[Math.floor(1===e?t.length-1:e*t.length)])(t,e);let u=120;const p=[];let f,g,h=0,v=0;const y=[],x=(()=>{const e=(new AudioContext).sampleRate;return{delay:(t,n,a)=>{const o=Array(Math.floor(t/1e3*e)).fill(0);let r=0;return e=>{r===o.length&&(r=0);const t=o[r];return o[r]=o[r]*n+e,r++,e*(1-a)+t*a}},distortion:(e,t)=>n=>Math.min(Math.max(e*n,-t),t),overdrive:e=>t=>Math.min(Math.max(e*t*t*t,-1),1),flanger:(t,n,a,o)=>{const r=t/e*Math.PI*2,s=200*n,i=200*a;let c=0,d=0;const l=Array(600).fill(0);return e=>{const t=s+i*(Math.sin(c+=r)+1);let n=t-.5;const a=Math.floor(n),m=t-a;++d===l.length&&(d=0),l[d]=e,(n=d-a)<0&&(n+=l.length),n=l[Math.floor(n)];let u=d-a-1;return u<0&&(u+=l.length),-1*((1-m)*n+m*(u=l[Math.floor(u)]))*o+e*(1-o)}},compressor:(t,n,a,o)=>{const r=a/e,s=o/e;let i=0;return e=>{const a=Math.abs(e);return i+=i<1&&a>t?r:0,e*(1-(i-=i>0&&a<t?s:0)*n)}},amplify:e=>t=>t*e,tremolo:(t,n)=>{const a=t/e*2;let o=0;return e=>((o+=a)>=1&&(o-=2),e*(1-n*Math.abs(o)))},tone:(e,t)=>{const n=e/(.3183099+e),a=.3183099/(.3183099+t);let o=0,r=0,s=0;return e=>(e=>o+=n*(e-o))((e=>(r=a*(e+r-s),s=e,r))(e))},percussion:t=>{let n=0;const a=t/1e3*e;return e=>(n=0!==e?n+1:0)>a?0:e*(1-n/a)},stack:e=>t=>e.reduce((e,t)=>t(e),t)}})(),E=(e,t,n)=>{const a=new AudioContext,o=a.sampleRate,r=e=>{let t=0;return n=>(t+=e,Math.sin(t+n))};let s,i,c,d;const l=()=>{c>d&&(e.forEach((e,t)=>{const n=e[0].find(e=>i>=e[0]&&i<e[1]);if(n){let a=e[(i-n[0])%(e.length-2)+2];(a=a.pop?a:[a]).forEach((n,a)=>{if(n)if(n>1){const i=102.740119*Math.pow(2,n/12)/o,c=e[1];s[t]=s[t]?s[t]:[[]],s[t][0][a]=((e,t)=>{const n=r(e),a=r(e*t[0]),o=t[1],s=t[2],i=t[3];let c=1;return e=>{if(!e){const e=a(0),t=n(e*o);return(c*=c)<1e-6?99:(t*s+e*i)*c}c=1-1e-15}})(i,c),s[t][1]=c[4]?c[4]:e=>e}else s[t]&&s[t][0][a]&&s[t][0][a](1)})}}),s.forEach(e=>{const t=new Array(e[0].length);e[0].forEach((e,n)=>{e.k||(t[n]=e)}),e[0]=t}),i++,n&&n(),i>=e.reset&&(i=0),c=0),c++},m=a.createScriptProcessor(0,1,1);m.onaudioprocess=(e=>{const t=e.outputBuffer.getChannelData(0);for(let e=0;e<t.length;e++)l(),t[e]=0,u&&s.forEach(n=>{let a=0;n[0].forEach(e=>{if(e&&!e.k){const t=e();99===t?e.k=1:a+=t}}),t[e]+=n[1](a)/8})});let u=!1;return{toggle:e=>{u||(s=[],i=e,c=0,d=15/t*o,m.connect(a.destination)),u=!u},update:(n,a)=>{e=n||e,t=a||t},playing:()=>u,step:()=>i}},S=()=>{const e=p.map(e=>[e.composition.map((e,t)=>e?[32*t,32*(t+1)]:void 0).filter(e=>void 0!==e).reduce((e,t)=>e.length>0&&t[0]===e[e.length-1][1]?(e[e.length-1][1]=t[1],e):[...e,t],[]),[...e.fmParams,(e=>{if(0!==e.length)return x.stack(e.map(e=>x[e.name](...e.params)))})(e.fx)],...((e,t,n)=>{const a=new Array(2*e.length).fill().map(()=>new Array(8).fill(0)),o=new Array(8).fill(!1);e.forEach((e,r)=>{e.forEach((e,s)=>{e&&((o[s]||n&&o.includes(!0)&&0!==r)&&(n&&o.forEach((e,t)=>{e&&(a[2*r-1][t]=1)}),a[2*r-1][s]=1),a[2*r][s]=(e=>{switch(e){case 7:return 2;case 6:return 4;case 5:return 5;case 4:return 7;case 3:return 9;case 2:return 10;case 1:return 12;case 0:return 14}})(s)+12*t,o[s]=!0)})});const r=new Array(8).fill(!1);a.forEach(e=>{e.forEach((e,t)=>r[t]=r[t]||e)});let s=0;for(let e=0;e<a.length;e++){a[e]=a[e].filter((e,t)=>r[t]);const t=a[e].reduce((e,t,n)=>0!==t?n+1:e,0);a[e].splice(t),s=s<a[e].length?a[e].length:s}return a[31]=new Array(s).fill(1),a})(e.notes,e.octave,e.chokeChords)]),t=p.map(e=>e.composition.lastIndexOf(!0)+1).sort((e,t)=>t-e)[0];return e.reset=32*t,e},b=()=>{if(f&&f.playing())return;const e=S();f?f.update(e,2*u):f=E(e,2*u,re),f.toggle(32*p[h].compositionEditStartStep),re()},k=()=>{f.playing()&&(f.toggle(),re())},$=()=>{f&&f.update(S(),2*u)},I=[{name:"delay",params:[{name:"delay",default:250,min:1,max:1e3,suffix:"ms"},{name:"feed",default:.25,min:0,max:1},{name:"wet",default:.25,min:0,max:1}]},{name:"distortion",params:[{name:"gain",default:5,min:.1,max:20},{name:"clip",default:1,min:.1,max:2}]},{name:"overdrive",params:[{name:"gain",default:5,min:0,max:20}]},{name:"flanger",params:[{name:"frequency",default:1,min:0,max:20,suffix:"Hz"},{name:"delay",default:.3,min:0,max:1},{name:"depth",default:.3,min:0,max:1},{name:"wet",default:.5,min:0,max:1}]},{name:"amplify",params:[{name:"gain",default:1,min:0,max:5}]},{name:"tremolo",params:[{name:"frequency",default:1,min:0,max:20,suffix:"Hz"},{name:"depth",default:.5,min:0,max:1}]},{name:"tone",params:[{name:"lowCutFreq",default:1,min:0,max:1},{name:"highCutFreq",default:0,min:0,max:1}]},{name:"compressor",params:[{name:"threshold",default:.1,min:0,max:1},{name:"ratio",default:4,min:0,max:10},{name:"attack",default:200,min:0,max:1e3,suffix:"ms"},{name:"release",default:200,min:0,max:1e3,suffix:"ms"}]},{name:"percussion",params:[{name:"decay",default:200,min:0,max:1e3,suffix:"ms"}]}],T=[];let w=0;const B=(e,t)=>(++w,T.push({counter:w,event:e,fn:t}),`data-dynamic-binding-id="${w}"`),M=()=>{T.splice(0).forEach(e=>{document.querySelector(`[data-dynamic-binding-id="${e.counter}"]`)[e.event]=e.fn})};var L=n(0),D=n.n(L);const P={Init:{synth:[0,0,1,0],fx:[],octave:4},Bass:{synth:[.5,.5,.42,.4],fx:[{name:"overdrive",params:[10]}],octave:3},Pad:{synth:[2.01,.22,.21,.33],fx:[{name:"flanger",params:[1,.3,.3,.5]},{name:"delay",params:[250,.25,.25]}],octave:4},Mallet:{synth:[8,.61,.5,0],fx:[{name:"percussion",params:[300]},{name:"delay",params:[250,.15,.3]}],octave:4},"Lead 1":{synth:[1.5,1.8,.25,.1],fx:[{name:"distortion",params:[9,.7]},{name:"flanger",params:[2.9,.21,.16,.44]},{name:"tone",params:[.6,.06]},{name:"amplify",params:[1.9]},{name:"delay",params:[125,.38,.34]}],octave:4},"Lead 2":{synth:[2.5,3.4,.3,.3],fx:[{name:"tremolo",params:[10,1]},{name:"distortion",params:[10,.5]},{name:"delay",params:[250,.25,.25]}],octave:4},"Kick drum":{synth:[.2,3.1,1,0],fx:[{name:"percussion",params:[90]},{name:"compressor",params:[.1,4,200,200]},{name:"tone",params:[1,.015]},{name:"amplify",params:[2]},{name:"amplify",params:[5]}],octave:2},"Hi-hat":{synth:[26,630,.5,0],fx:[{name:"percussion",params:[75]},{name:"tone",params:[1,.08]},{name:"amplify",params:[2]}],octave:4},"Snare drum":{synth:[33,1011,1,0],fx:[{name:"percussion",params:[250]}],octave:3}},O=()=>new Array(16).fill().map(()=>new Array(8).fill(!1)),C=()=>({notes:O(),start:0,stop:1,composition:[],compositionEditStartStep:0,fmParams:[0,0,1,0],octave:4,name:"new page",fx:[],chokeChords:!0}),N=(e,t)=>{p[h].notes[e][t]?(p[h].notes[e][t]=!1,document.querySelector(`[data-step="${e},${t}"]`).classList.remove("grid-cell--active","grid-cell--playing--active")):(p[h].notes[e][t]=!0,document.querySelector(`[data-step="${e},${t}"]`).classList.add("grid-cell--active")),$()},q=e=>{p[h].composition[e+p[h].compositionEditStartStep]?(p[h].composition[e+p[h].compositionEditStartStep]=!1,document.querySelector(`[data-step="${e},8"]`).classList.remove("grid-cell--active","grid-cell--playing--active")):(p[h].composition[e+p[h].compositionEditStartStep]=!0,document.querySelector(`[data-step="${e},8"]`).classList.add("grid-cell--active")),$()};n.d(t,"clearPage",function(){return j}),n.d(t,"copy",function(){return A}),n.d(t,"paste",function(){return F}),n.d(t,"page",function(){return K}),n.d(t,"selectPage",function(){return _}),n.d(t,"setFmParam",function(){return J}),n.d(t,"selectPreset",function(){return R}),n.d(t,"setPageName",function(){return G}),n.d(t,"setTempo",function(){return Y}),n.d(t,"setOctave",function(){return z}),n.d(t,"fxEdit",function(){return U}),n.d(t,"insertFx",function(){return V}),n.d(t,"changeCurrentFx",function(){return X}),n.d(t,"clearTrack",function(){return Q}),n.d(t,"removeCurrentFx",function(){return W}),n.d(t,"saveData",function(){return Z}),n.d(t,"convertLoadedData",function(){return ee}),n.d(t,"loadData",function(){return te}),n.d(t,"deleteData",function(){return ne}),n.d(t,"shareData",function(){return ae}),n.d(t,"fromToJson",function(){return oe}),n.d(t,"updatePlayStatusToGrid",function(){return re});const j=()=>{p[h].notes=O(),p[h].composition=[],K(0),$()},A=()=>{g=p[h]},F=()=>{g&&(p[h]=JSON.parse(JSON.stringify(g)),K(0),$())},H=()=>{const e=[...p];e.length<32&&e.push({name:"+ Add new page"}),document.getElementById("page-selector").innerHTML=e.map((e,t)=>`<option value="${t-h}"${t===h?" selected":""}>${((e,t)=>{const n=String(e);return"0".repeat(t-n.length)+n})(t+1,2)}: ${e.name.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</option>`)},K=e=>{(h+=e)<0?h=0:h>=32&&(h=31),p[h]||(p[h]=C()),Array.from(document.querySelectorAll(".grid-cell")).forEach(e=>e.classList.remove("grid-cell--active","grid-cell--playing--active")),p[h].notes.forEach((e,t)=>{e.forEach((e,n)=>{e&&document.querySelector(`[data-step="${t},${n}"]`).classList.add("grid-cell--active")})}),p[h].composition.forEach((e,t)=>{e&&t>=p[h].compositionEditStartStep&&t<16*(p[h].compositionEditStartStep+1)&&document.querySelector(`[data-step="${t-p[h].compositionEditStartStep},8"]`).classList.add("grid-cell--active")}),v=0,J(),U(),document.getElementById("page-name").value=p[h].name,H()},_=()=>{const e=Number(document.getElementById("page-selector").value);isNaN(e)||K(e)},J=(e,t)=>{if(e>=0&&e<=3){const n=void 0===t?Number(prompt("Type the new value",p[h].fmParams[e])):t;!isNaN(n)&&n>=0&&(p[h].fmParams[e]=n)}$(),c()},R=()=>{const e=document.getElementById("preset-select").value;if("none"===e)return;const t=(e=>P[e])(e);t.synth.forEach((e,t)=>J(t,e)),p[h].fx=[...t.fx],p[h].octave=t.octave,document.getElementById("preset-select").value="none",$(),K(0)},G=()=>{p[h].name=name=document.getElementById("page-name").value,H()},Y=e=>{u=e,$(),c()},z=e=>{p[h].octave=e,$()},U=(e,t)=>{if(p[h].fx[v]){if(document.getElementById("fx-param-knobs").classList.remove("hidden"),e>=0&&e<=3){const n=void 0===t?Number(prompt("Type the new value",p[h].fx[v].params[e])):t;!isNaN(n)&&n>=0&&(p[h].fx[v].params[e]=n,$())}const n=I.find(e=>e.name===p[h].fx[v].name);p[h].fx[v].params.forEach((e,t)=>{document.getElementById(y[t]).parentElement.classList.remove("hidden"),document.querySelector(`#${y[t]} + span`).innerText=n.params[t].name});for(let e=p[h].fx[v].params.length;e<4;e++)document.getElementById(y[e]).parentElement.classList.add("hidden")}else document.getElementById("fx-param-knobs").classList.add("hidden"),[0,1,2,3].forEach(e=>{y[e]&&document.getElementById(y[e]).parentElement.classList.add("hidden")});let n='<option value="none">choose...</option>';p[h].fx.forEach((e,t)=>{n+=`<option ${v===t?"selected":""}>${e.name}</option>`}),document.getElementById("current-fx").innerHTML=n,c()},V=()=>{const e=document.getElementById("fx-list").value;if("none"!==e){const t=I.find(t=>t.name===e).params.map(e=>e.default);p[h].fx.push({name:e,params:[...t]}),$()}document.getElementById("fx-list").value="none",U()},X=()=>{"none"!==document.getElementById("current-fx").value&&(v=document.getElementById("current-fx").selectedIndex-1,U(),$())},Q=()=>{confirm("Clear all the data on the current track?")&&(p.splice(0),p.push(C()),K(-100))},W=()=>{p[h].fx[v]&&(p[h].fx.splice(v,1),v=0,U(),$())},Z=(e,t)=>{if(e&&!confirm("Overwrite the existing track?"))return;const n={object:{tempo:u,pages:p},name:t};D.a.setData(e,n,e=>{e.success&&(oe(),alert("Data saved"))})};window.setTrackDataJSON=(e=>ee({success:!0,data:JSON.parse(e)}));const ee=e=>{e.success&&(u=e.data.tempo,p.splice(0),p.push(...e.data.pages),$(),K(-100))},te=e=>{document.getElementById("to-json").classList.add("hidden"),D.a.getData(e,e=>{ee(e),alert("Data loaded")})},ne=e=>{confirm("Delete the selected track?")&&D.a.deleteData(e,e=>{e.success&&(alert("Data deleted"),oe())})},ae=e=>{D.a.createShareToken(e,e=>{e.success&&(prompt("Copy the share link:",location.origin+location.pathname+"?shareToken="+e.shareToken),oe())})},oe=()=>{D.a.getDirectory(e=>{if("DIRECTORY_OK"===e.code){document.getElementById("to-json").classList.remove("hidden");const t=e.data.map(e=>`<tr>\n                <td>${e.name}</td>\n                <td>${new Date(e.modified).toDateString()}</td>\n                <td><button ${B("onclick",()=>Z(e.id,e.name))}>Overwrite</button></td>\n                <td><button ${B("onclick",()=>ne(e.id))}>Delete</button></td>\n                <td><button ${B("onclick",()=>te(e.id))}>Load</button></td>\n                <td><button ${B("onclick",()=>ae(e.id))}>Share</button></td>\n                </tr>`).join("");document.getElementById("directory").innerHTML=t+`<tr>\n            <td><input id="save-file" value="New file"/></td>\n            <td></td>\n            <td><button ${B("onclick",()=>Z(void 0,document.getElementById("save-file").value))}>Save</button></td>\n            <td colspan="3"></td>\n            </tr>`,M()}})},re=()=>{if(f)if(f.playing()){document.querySelectorAll("[data-step]").forEach(e=>e.classList.remove("grid-cell--playing"));const e=16*Math.floor(f.step()/32/16),t=Math.floor(f.step()/32)%16;if(p[h].composition[e+t]){const e=Math.floor(f.step()/2)%16;for(let t=0;t<8;t++)document.querySelector(`[data-step="${e},${t}"]`).classList.add("grid-cell--playing")}p[h].compositionEditStartStep===e&&document.querySelector(`[data-step="${t},8"]`).classList.add("grid-cell--playing")}else document.querySelectorAll("[data-step]").forEach(e=>e.classList.remove("grid-cell--playing"))};setTimeout(()=>{const e=document.getElementById("grid");let t="";for(let e=0;e<16;e++){t+='<div class="col">';for(let n=0;n<8;n++)t+=`<div data-step="${e},${n}" data-col="${e}" data-row="${n}"`+` class="grid-cell${e%4==0?" grid-cell--beat-start":""}" ${B("onclick",()=>N(e,n))}></div>`;t+=`<div data-step="${e},8" class="grid-cell grid-cell--composition" ${B("onclick",()=>q(e))}></div>`,t+="</div>"}e.innerHTML=t,M(),K(0),document.getElementById("fx-list").innerHTML+=I.map(e=>e.name).map(e=>`<option value="${e}">${e}</option>`).join("");let n=document.getElementById("fm-param-knobs");i(n,"ratio",e=>{let t=0;t=e<.75?Math.round(8*e/.75*4)/4:Math.round(96*(e-.75)+9),J(0,t)},()=>{const e=p[h].fmParams[0];return e<9?Math.round(4*e)/4/8*3/4:e<33?(Math.round(e)-9)/96+.75:1},()=>p[h].fmParams[0].toFixed(2)),i(n,"mod",e=>{let t=0;J(1,t=e<.25?4*e:e<.75?20*(e-.25)+1:4e3*(e-.75)+11)},()=>{const e=p[h].fmParams[1];return e<1?e/4:e<11?(e-1)/20+.25:e<1011?(e-11)/4e3+.75:1},()=>p[h].fmParams[1].toFixed(1)),i(n,"vol1",e=>J(2,e),()=>p[h].fmParams[2],d("%")),i(n,"vol2",e=>J(3,e),()=>p[h].fmParams[3],d("%")),i(n=document.getElementById("other-param-knobs"),"octave",e=>z(Math.round(8*e)),()=>p[h].octave/8,()=>{const e=p[h].octave-4;return(e>0?"+":"")+e}),i(n,"polyphony",e=>{p[h].chokeChords=e<.5,$()},()=>p[h].chokeChords?0:1,m(["choke","hold"])),i(n,"seqPage",e=>{const t=p[h].compositionEditStartStep;p[h].compositionEditStartStep=16*Math.round(8*e),t!==p[h].compositionEditStartStep&&(K(0),$())},()=>p[h].compositionEditStartStep/8/16,e=>1+Math.round(8*e)),i(n,"tempo",e=>Y(Math.round(140*e)+60),()=>(u-60)/140,()=>u),n=document.getElementById("fx-param-knobs");const a=e=>t=>{if(!p[h].fx[v])return 0;const n=p[h].fx[v].name,a=I.find(e=>e.name===n).params[e];if(!a)return 0;const o=a.min,r=a.max;U(e,t*(r-o)+o)},o=e=>()=>{if(!p[h].fx[v])return 0;const t=p[h].fx[v].name,n=I.find(e=>e.name===t).params[e];if(!n)return 0;const a=p[h].fx[v].params[e],o=n.min;return(a-o)/(n.max-o)},r=e=>()=>{if(!p[h].fx[v])return 0;const t=p[h].fx[v].name,n=I.find(e=>e.name===t).params[e];if(!n)return 0;const a=p[h].fx[v].params[e],o=Math.max(0,2+Math.round(Math.log10(1/n.max))),r=n.suffix?" "+n.suffix:"";return a.toFixed(o)+r};y.push(i(n,"param 1",a(0),o(0),r(0)),i(n,"param 2",a(1),o(1),r(1)),i(n,"param 3",a(2),o(2),r(2)),i(n,"param 4",a(3),o(3),r(3))),U(),setTimeout(()=>{const e=location.search.substr(1).split("=");"shareToken"===e[0]&&L.getSharedData(e[1],e=>{ee(e),alert(`Loaded a track named '${e.name}' by ${e.owner}.`)})},100),document.getElementById("preset-select").innerHTML+=Object.keys(P).map(e=>`<option value="${e}">${e}</option>`).join(""),document.getElementById("play-button").onclick=b,document.getElementById("stop-button").onclick=k,document.getElementById("page-name").onchange=G,document.getElementById("clear-button").onclick=j,document.getElementById("copy-button").onclick=A,document.getElementById("paste-button").onclick=F,document.getElementById("current-fx").onchange=X,document.getElementById("fx-list").onchange=V,document.getElementById("remove-fx-button").onclick=W,document.getElementById("save-load-button").onclick=oe,document.getElementById("preset-select").onchange=R,document.getElementById("clear-track-button").onclick=Q,document.getElementById("page-selector").onchange=_},0)}]);