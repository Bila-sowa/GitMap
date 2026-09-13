(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{#e=``;#t=`dark-theme`;#n=``;#r={saveLink:!1,saveToken:!1};constructor(e={}){this.setData(e)}get link(){return this.#e}set link(e){this.#e=typeof e==`string`?e.trim():``}get theme(){return this.#t}set theme(e){this.#t=e===`light-theme`||e===`dark-theme`?e:`dark-theme`}get token(){return this.#n}set token(e){this.#n=typeof e==`string`?e.trim():``}get localStorage(){return this.#r}set localStorage(e){e&&typeof e==`object`&&(typeof e.saveLink==`boolean`&&(this.#r.saveLink=e.saveLink),typeof e.saveToken==`boolean`&&(this.#r.saveToken=e.saveToken))}get saveLink(){return this.#r.saveLink}set saveLink(e){this.#r.saveLink=!!e}get saveToken(){return this.#r.saveToken}set saveToken(e){this.#r.saveToken=!!e}getLink(){return this.link}setLink(e){this.link=e}getTheme(){return this.theme}setTheme(e){this.theme=e}getToken(){return this.token}setToken(e){this.token=e}getSaveLink(){return this.saveLink}setSaveLink(e){this.saveLink=e}getSaveToken(){return this.saveToken}setSaveToken(e){this.saveToken=e}getLocalStorage(){return{...this.#r}}setLocalStorage(e){this.localStorage=e}getData(){return{link:this.#e,theme:this.#t,token:this.#n,localStorage:{...this.#r}}}setData(e={}){!e||typeof e!=`object`||(e.link!==void 0&&(this.link=e.link),e.theme!==void 0&&(this.theme=e.theme),e.token!==void 0&&(this.token=e.token),e.localStorage!==void 0&&(this.localStorage=e.localStorage))}reset(){this.#e=``,this.#t=`dark-theme`,this.#n=``,this.#r={saveLink:!1,saveToken:!1}}},t=new e,n=()=>({name:`GitMap`,debug:!1,versionDetails:{version:`not found`,versionType:`not found`,versionIsStable:!1},graph:{renderLimit:30},notifications:{showNotifications:!0,COOLDOWN_MS:5e3}}),r=async(e=`/GitMap/config.json`)=>{try{let t=await fetch(e);if(!t.ok)throw Error(`Failed to load config.json: ${t.status}`);let n=await t.json();if(!Object.entries(n).length)throw Error(`Config is empty`);return n}catch(e){return console.error(`Returning default config, error fetching config:`,e),n()}},i=async e=>{let t=e.dataset.copyValue;if(t)try{await navigator.clipboard.writeText(t),e.classList.add(`copied`),u.notify(`Successfully copied`,`success`),setTimeout(()=>e.classList.remove(`copied`),3500)}catch{u.notify(`Copying error or copying is not allowed by your browser (especially if you launched the server on live server)`,`error`)}};function a(e){return`${e?e+`-`:``}${Math.random().toString(16).slice(2)}`}function o(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function s(e,t,n=16){if(!e||!t)return;let r=t.getBoundingClientRect(),i=e.getBoundingClientRect();e.style.position=`fixed`;let a=window.innerHeight-i.height-n,o=Math.min(Math.max(r.top,n),Math.max(a,n));e.style.top=`${o}px`,e.style.left=`${r.right+n}px`}var c=(e,t=5)=>{if(!e)return;let n=e.trim().split(/\s+/);return n.length>t?n.slice(0,3).join(` `)+`...`:e};function l(e){let t=document.body;!e|!t||t.insertAdjacentHTML(`beforeend`,e)}var u=new class e{#e=[];#t=!1;static icons={info:`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 16 16" fill="none"><path d="M7.493 0.015 C 7.442 0.021,7.268 0.039,7.107 0.055 C 5.234 0.242,3.347 1.208,2.071 2.634 C 0.660 4.211,-0.057 6.168,0.009 8.253 C 0.124 11.854,2.599 14.903,6.110 15.771 C 8.169 16.280,10.433 15.917,12.227 14.791 C 14.017 13.666,15.270 11.933,15.771 9.887 C 15.943 9.186,15.983 8.829,15.983 8.000 C 15.983 7.171,15.943 6.814,15.771 6.113 C 14.979 2.878,12.315 0.498,9.000 0.064 C 8.716 0.027,7.683 -0.006,7.493 0.015 M8.853 1.563 C 9.967 1.707,11.010 2.136,11.944 2.834 C 12.273 3.080,12.920 3.727,13.166 4.056 C 13.727 4.807,14.142 5.690,14.330 6.535 C 14.544 7.500,14.544 8.500,14.330 9.465 C 13.916 11.326,12.605 12.978,10.867 13.828 C 10.239 14.135,9.591 14.336,8.880 14.444 C 8.456 14.509,7.544 14.509,7.120 14.444 C 5.172 14.148,3.528 13.085,2.493 11.451 C 2.279 11.114,1.999 10.526,1.859 10.119 C 1.618 9.422,1.514 8.781,1.514 8.000 C 1.514 6.961,1.715 6.075,2.160 5.160 C 2.500 4.462,2.846 3.980,3.413 3.413 C 3.980 2.846,4.462 2.500,5.160 2.160 C 6.313 1.599,7.567 1.397,8.853 1.563 M7.706 4.290 C 7.482 4.363,7.355 4.491,7.293 4.705 C 7.257 4.827,7.253 5.106,7.259 6.816 C 7.267 8.786,7.267 8.787,7.325 8.896 C 7.398 9.033,7.538 9.157,7.671 9.204 C 7.803 9.250,8.197 9.250,8.329 9.204 C 8.462 9.157,8.602 9.033,8.675 8.896 C 8.733 8.787,8.733 8.786,8.741 6.816 C 8.749 4.664,8.749 4.662,8.596 4.481 C 8.472 4.333,8.339 4.284,8.040 4.276 C 7.893 4.272,7.743 4.278,7.706 4.290 M7.786 10.530 C 7.597 10.592,7.410 10.753,7.319 10.932 C 7.249 11.072,7.237 11.325,7.294 11.495 C 7.388 11.780,7.697 12.000,8.000 12.000 C 8.303 12.000,8.612 11.780,8.706 11.495 C 8.763 11.325,8.751 11.072,8.681 10.932 C 8.616 10.804,8.460 10.646,8.333 10.580 C 8.217 10.520,7.904 10.491,7.786 10.530" fill="currentColor" fill-rule="evenodd"/></svg>`,warning:`<svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15H12.01M12 12V9M4.98207 19H19.0179C20.5615 19 21.5233 17.3256 20.7455 15.9923L13.7276 3.96153C12.9558 2.63852 11.0442 2.63852 10.2724 3.96153L3.25452 15.9923C2.47675 17.3256 3.43849 19 4.98207 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,error:`<svg aria-hidden="true" width="40" height="40" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32.085,56.058c6.165,-0.059 12.268,-2.619 16.657,-6.966c5.213,-5.164 7.897,-12.803 6.961,-20.096c-1.605,-12.499 -11.855,-20.98 -23.772,-20.98c-9.053,0 -17.853,5.677 -21.713,13.909c-2.955,6.302 -2.96,13.911 0,20.225c3.832,8.174 12.488,13.821 21.559,13.908c0.103,0.001 0.205,0.001 0.308,0Zm-0.282,-4.003c-9.208,-0.089 -17.799,-7.227 -19.508,-16.378c-1.204,-6.452 1.07,-13.433 5.805,-18.015c5.53,-5.35 14.22,-7.143 21.445,-4.11c6.466,2.714 11.304,9.014 12.196,15.955c0.764,5.949 -1.366,12.184 -5.551,16.48c-3.672,3.767 -8.82,6.016 -14.131,6.068c-0.085,0 -0.171,0 -0.256,0Zm-12.382,-10.29l9.734,-9.734l-9.744,-9.744l2.804,-2.803l9.744,9.744l10.078,-10.078l2.808,2.807l-10.078,10.079l10.098,10.098l-2.803,2.804l-10.099,-10.099l-9.734,9.734l-2.808,-2.808Z" fill="currentColor"/></svg>`,success:`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/><path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`};async notify(e,t){let{showNotifications:n,COOLDOWN_MS:i}=(await r())?.notifications;!e||!t||!n||(this.#e.push({message:e,type:t,COOLDOWN_MS:i}),this.#n())}async#n(){if(this.#t||this.#e.length===0)return;this.#t=!0;let{message:e,type:t,COOLDOWN_MS:n}=this.#e.shift();await this.#r(e,t,n),this.#t=!1,this.#n()}#r(t,n,r){return new Promise(i=>{let o=a(`notification`),s=`
                <div class="notification-container ${n} rounded-normal" data-notification-id="${o}" role="alert">
                    ${e.icons[n]||e.icons.info}
                    <span class="text-small">${t}</span>
                    <button class="close-button close-alert-button rounded-full" type="button" aria-label="Close notification">&times;</button>
                </div>
            `;document.body.insertAdjacentHTML(`beforeend`,s);let c=document.querySelector(`[data-notification-id="${o}"]`),l=c?.querySelector(`.close-alert-button`),u=()=>{c?.remove(),l?.removeEventListener(`click`,u),i()};l?.addEventListener(`click`,u),setTimeout(()=>{c?.isConnected&&u()},r)})}},d=new class{save(){let e=t.getData(),n={...e,localStorage:{...e.localStorage},link:t.saveLink?t.link:``,token:t.saveToken?t.token:``};try{return globalThis.localStorage.setItem(`GitMap`,JSON.stringify(n)),{success:!0}}catch(e){return u.notify(`Unable to save data in local storage.`,`error`),{error:e.name,success:!1}}}get(){try{let e=globalThis.localStorage.getItem(`GitMap`),t={};return e&&(t=JSON.parse(e)),!t||typeof t!=`object`||Array.isArray(t)?{data:{},success:!1}:{data:t,success:!0}}catch(e){return u.notify(`Invalid local storage parse. Please check your data in the local storage or delete its data.`,`error`),{error:e.name,success:!1}}}load(){let e=this.get();if(!e.success||!e.data||!Object.keys(e.data).length)return{success:!1,data:null};let n=e.data;return n.theme&&(t.theme=n.theme),n.localStorage&&(t.localStorage=n.localStorage),t.saveLink&&n.link&&(t.link=n.link),t.saveToken&&n.token&&(t.token=n.token),{success:!0,data:t.getData()}}};d.load(),document.querySelector(`body`);var f=document.querySelector(`#viewport`),p=document.querySelector(`#canvas`),m=document.querySelector(`#linkInput`),h=document.querySelector(`#refresh`),g=document.querySelector(`#theme`),ee=document.querySelector(`#settings`),te=document.querySelector(`#graph`),ne=document.querySelector(`#scale-increase`),re=document.querySelector(`#scale-display`),_=document.querySelector(`#scale-decrese`),ie=document.querySelector(`#branch-dropdown-trigger`),v=document.querySelector(`#branch-dropdown-list`),y=document.querySelector(`#branch-dropdown-label`),b=new class{#e=null;#t=!1;#n=0;#r=0;#i=0;#a=0;#o=0;#s=0;#c=0;#l=1;#u=0;#d=0;constructor(e,t){this.viewport=e,this.canvas=t,this.scale=1,this.offsetX=0,this.offsetY=0,this.minScale=.1,this.maxScale=5,this.zoomSensitivity=.001,this.onChange=null,this.canvas.style.transformOrigin=`0 0`,this.#f(),this.#T()}#f(){this.#e&&this.#e.abort(),this.#e=new AbortController;let{signal:e}=this.#e;this.viewport.addEventListener(`mousedown`,this.#v,{signal:e}),window.addEventListener(`mousemove`,this.#y,{signal:e}),window.addEventListener(`mouseup`,this.#b,{signal:e}),this.viewport.addEventListener(`wheel`,this.#x,{passive:!1,signal:e}),this.viewport.addEventListener(`touchstart`,this.#S,{passive:!1,signal:e}),this.viewport.addEventListener(`touchmove`,this.#C,{passive:!1,signal:e}),this.viewport.addEventListener(`touchend`,this.#w,{signal:e})}#p(e,t,n){return Math.min(Math.max(e,t),n)}#m(e,t){this.#t=!0,this.#n=e,this.#r=t,this.#i=this.offsetX,this.#a=this.offsetY,this.viewport.classList.add(`is-panning`)}#h(e,t){this.#t&&(this.offsetX=this.#i+(e-this.#n),this.offsetY=this.#a+(t-this.#r),this.#T())}#g(){this.#t&&(this.#t=!1,this.viewport.classList.remove(`is-panning`))}#_(e){let t=e[0].clientX-e[1].clientX,n=e[0].clientY-e[1].clientY;return Math.sqrt(t*t+n*n)}#v=e=>{e.button===0&&(e.target!==this.viewport&&e.target!==this.canvas&&!this.canvas.contains(e.target)||this.#m(e.clientX,e.clientY))};#y=e=>{this.#h(e.clientX,e.clientY)};#b=()=>{this.#g()};#x=e=>{e.preventDefault();let t=this.viewport.getBoundingClientRect(),n=e.clientX-t.left,r=e.clientY-t.top;if(e.ctrlKey){let t=-e.deltaY*this.zoomSensitivity;this.zoomAt(n,r,this.scale*(1+t));return}this.panBy(-e.deltaX,-e.deltaY)};#S=e=>{if(e.touches.length===1){this.#m(e.touches[0].clientX,e.touches[0].clientY);return}e.touches.length===2&&(this.#t=!1,this.#o=this.#_(e.touches),this.#s=(e.touches[0].clientX+e.touches[1].clientX)/2,this.#c=(e.touches[0].clientY+e.touches[1].clientY)/2,this.#l=this.scale,this.#u=this.offsetX,this.#d=this.offsetY)};#C=e=>{if(e.preventDefault(),e.touches.length===1&&this.#t){this.#h(e.touches[0].clientX,e.touches[0].clientY);return}if(e.touches.length===2){let t=this.#_(e.touches)/this.#o,n=this.viewport.getBoundingClientRect(),r=(e.touches[0].clientX+e.touches[1].clientX)/2-n.left,i=(e.touches[0].clientY+e.touches[1].clientY)/2-n.top;this.scale=this.#p(this.#l*t,this.minScale,this.maxScale),this.offsetX=r-(this.#s-n.left-this.#u)*(this.scale/this.#l)-(r-(this.#s-n.left)),this.offsetY=i-(this.#c-n.top-this.#d)*(this.scale/this.#l)-(i-(this.#c-n.top)),this.#T()}};#w=()=>{this.#g()};#T(){this.canvas.style.transform=`translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`,this.onChange?.(this)}panBy(e,t){this.offsetX+=e,this.offsetY+=t,this.#T()}panTo(e,t){this.offsetX=e,this.offsetY=t,this.#T()}setScale(e){this.scale=this.#p(e,this.minScale,this.maxScale),this.#T()}zoomAt(e,t,n){let r=this.#p(n,this.minScale,this.maxScale),i=r/this.scale;this.offsetX=e-i*(e-this.offsetX),this.offsetY=t-i*(t-this.offsetY),this.scale=r,this.#T()}reset(){this.scale=1,this.offsetX=0,this.offsetY=0,this.#T()}centerOn(e,t){let n=this.viewport.getBoundingClientRect();this.offsetX=n.width/2-e*this.scale,this.offsetY=n.height/2-t*this.scale,this.#T()}zoom(e){let t=this.viewport.getBoundingClientRect();this.zoomAt(t.width/2,t.height/2,this.scale*e)}getTransform(){return{scale:this.scale,offsetX:this.offsetX,offsetY:this.offsetY}}destroy(){this.#e&&=(this.#e.abort(),null),this.viewport.classList.remove(`is-panning`)}}(f,p);new class{#e=null;#t=null;constructor(e,t,n){this.increaseButton=e,this.display=t,this.decreaseButton=n,this.step=.1,this.#n(),this.render()}#n(){this.#e&&this.#e.abort(),this.#e=new AbortController;let{signal:e}=this.#e;this.increaseButton.addEventListener(`click`,this.#r,{signal:e}),this.decreaseButton.addEventListener(`click`,this.#i,{signal:e}),this.#t=b.onChange,b.onChange=e=>{this.#t?.(e),this.render()}}#r=()=>{b.zoom(1+this.step)};#i=()=>{b.zoom(1/(1+this.step))};render(){this.display.textContent=`${Math.round(b.scale*100)}%`}destroy(){this.#e&&=(this.#e.abort(),null),b.onChange&&(b.onChange=this.#t,this.#t=null)}}(ne,re,_);var x=class{getHttpErrorMessage(e){switch(e){case 400:return`Bad Request (400): Unable to process request.`;case 401:return`Unauthorized (401): Bad credentials or invalid GitHub token.`;case 403:return`Forbidden (403): Access denied, SAML enforcement, or rate limit exceeded.`;case 404:return`Not Found (404): Repository or resource not found.`;case 409:return`Conflict (409): Git repository is empty or conflict occurred.`;case 422:return`Unprocessable Entity (422): Validation failed or resource is locked.`;case 429:return`Too Many Requests (429): GitHub API rate limit exceeded.`;case 500:return`Internal Server Error (500): GitHub encountered an internal error.`;case 501:return`Not Implemented (501): Feature not supported by GitHub.`;case 502:return`Bad Gateway (502): Invalid response from upstream GitHub servers.`;case 503:return`Service Unavailable (503): GitHub is temporarily offline or undergoing maintenance.`;case 504:return`Gateway Timeout (504): GitHub timed out waiting for upstream server.`;default:return`GitHub API error (HTTP ${e}).`}}async createHttpError(e,t=``){let n=``;try{let t=await e.json();t&&typeof t==`object`&&t.message&&(n=t.message)}catch(e){console.warn(`createHttpError: failed to parse JSON response body for "${t}".`,e)}let r=this.getHttpErrorMessage(e.status),i=[];n&&i.push(`API Message: "${n}"`),t&&i.push(`URL: ${t}`);let a=i.length?`${r} [${i.join(`, `)}]`:r;return{error:r,devError:{status:e.status,message:a,url:t}}}},S=class{#e;#t;constructor(e,t){this.#e=e,this.#t=t}#n(e){let t={Accept:this.#e.Accept},n=``;try{n=new URL(e).hostname}catch(t){console.warn(`getSafeHeaders: invalid URL "${e}", Authorization header omitted.`,t)}return n===`api.github.com`&&this.#e.Authorization&&(t.Authorization=this.#e.Authorization),t}async#r(){try{let e=`https://api.github.com/rate_limit`,t=await fetch(e,{headers:this.#n(e)});return t.ok?{success:!0}:{success:!1,...await this.#t.createHttpError(t,e)}}catch(e){return{success:!1,error:`Failed to validate GitHub token`,devError:{message:`Network or fetch exception in #validateToken: ${e.message}`,stack:e.stack}}}}async setToken(e){if(!e)return delete this.#e.Authorization,delete t.token,{success:!0};t.token=e,this.#e.Authorization=`Bearer ${e}`;let n=await this.#r();return n.success?(u.notify(`The token has been successfully set`,`success`),{success:!0}):(delete this.#e.Authorization,delete t.token,u.notify(n.error,`error`),n)}getHeaders(){return{...this.#e}}getAuthorizationHeader(){return this.#e.Authorization||null}},C=class{#e;#t;constructor(e,t){this.#e=e,this.#t=t}#n(e){let t={Accept:this.#e.Accept},n=``;try{n=new URL(e).hostname}catch(t){console.warn(`getSafeHeaders: invalid URL "${e}", Authorization header omitted.`,t)}return n===`api.github.com`&&this.#e.Authorization&&(t.Authorization=this.#e.Authorization),t}checkIsRateLimitHigh(e,t=70){return e?.success&&typeof e.data?.usedPerPercent==`number`&&e.data.usedPerPercent>=t&&u.notify(`GitHub API rate limit is above ${t}%. Consider reducing request volume or adding a personal access token.`,`warning`),e}async getRateLimitData(){try{let e=`https://api.github.com/rate_limit`,t=await fetch(e,{headers:this.#n(e)});if(!t.ok){let n=await this.#t.createHttpError(t,e);return u.notify(n.error,`error`),{success:!1,...n,data:{limitPerNumber:0,usedPerNumber:0,usedPerPercent:0}}}let n=await t.json();if(!n?.resources?.core){let e=`Invalid rate limit response format`,t={message:`Missing data.resources.core in GitHub rate_limit response`,rawResponse:n};return u.notify(e,`error`),{success:!1,error:e,devError:t,data:{limitPerNumber:0,usedPerNumber:0,usedPerPercent:0}}}let{limit:r,remaining:i,used:a}=n.resources.core,o=a===void 0?r-i:a,s={success:!0,data:{limitPerNumber:r,usedPerNumber:o,usedPerPercent:r>0?Number((o/r*100).toFixed(2)):0}};return this.checkIsRateLimitHigh(s),s}catch(e){let t=`Failed to fetch rate limit data`,n={message:`Network or fetch exception in getRateLimitData: ${e.message}`,stack:e.stack};return u.notify(t,`error`),{success:!1,error:t,devError:n,data:{limitPerNumber:0,usedPerNumber:0,usedPerPercent:0}}}}},w=class{getCleanRepoUrl(e){return e?.replace(/\.git$/,``).replace(/\/$/,``)}getFormattedTitle(e){return e?.split(`
`).slice(0,1).join(`
`)}getFormattedDescription(e){return e?.split(`
`).slice(1).join(`
`)}getDateInLocaleString(e){return new Date(e).toLocaleString()}getShortHash(e){return e?.slice(0,7)}getFormattedExtension(e){return e?.slice(e.lastIndexOf(`.`)+1)}getShortStatus(e){return e?.slice(0,1).toUpperCase()}},T=new w,E=class{parseBranchesData(e){let t=Array.isArray(e)?e:[];if(!t.length)return{success:!1,error:`Unexpected response format from GitHub`,devError:{message:`Missing data in parseBranchData: branches count = ${t.length}`,branches:t}};let n=[];return t.forEach(e=>{typeof e?.name==`string`&&e.name.trim()&&n.push(e.name)}),{success:!0,branchesDetails:n}}parseCommitsData(e){let t=Array.isArray(e)?e:[];if(!t.length)return{success:!1,error:`Unexpected response format from GitHub`,devError:{message:`Missing data in parseCommitsData: commits count = ${t.length}`,commits:t}};let n=[];return t.forEach(e=>{let t=T.getFormattedTitle(e.commit.message),r=T.getFormattedDescription(e.commit.message),i=T.getDateInLocaleString(e.commit.author.date),a=T.getShortHash(e.sha),s={author:{name:o(e.commit.author.name),email:o(e.commit.author.email),avatar:e.author?.avatar_url,url:e.author?.html_url,date:i},title:o(t),description:r?o(r):``,hash:a,url:e.html_url,sha:e.sha};n.push(s)}),{success:!0,commitsDetails:n}}parseRepoData(e){let t=this.parseBranchesData(e.branches);if(!t.success)return t;let n=this.parseCommitsData(e.commits);if(!n.success)return n;let r=[...t.branchesDetails],i=typeof e.defaultBranch==`string`&&e.defaultBranch.trim()?e.defaultBranch.trim():r[0];return i&&!r.includes(i)&&r.unshift(i),{success:!0,defaultBranch:i,commitsDetails:n.commitsDetails,branchesDetails:r}}parseCommitFilesData(e){let t=Array.isArray(e.files)?e.files:[],n=[];return t.forEach(e=>{let t=T.getFormattedExtension(e.filename),r=T.getShortStatus(e.status),i={name:o(e.filename),additions:e.additions,deletions:e.deletions,extension:o(t),fullStatus:e.status,status:r};n.push(i)}),{success:!0,files:n,truncated:t.length===300}}};function D(e){try{let t,n,r=e.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?\/?$/i),i=e.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#]+)\/([^/?#]+?)(?:\.git)?\/?(?:[?#].*)?$/i);if(r)[,t,n]=r;else if(i)[,t,n]=i;else return{success:!1,error:`Invalid GitHub URL`,devError:`Failed to parse GitHub URL: "${e}". Expected HTTPS or SSH format.`};return{success:!0,repositoryLink:`https://api.github.com/repos/${t}/${n}`,branchLink:`https://api.github.com/repos/${t}/${n}/branches`,commitsLink:`https://api.github.com/repos/${t}/${n}/commits`}}catch(e){return{success:!1,error:`Invalid GitHub URL`,devError:`URL parsing exception: ${e.message}`}}}var O=class extends x{#e={Accept:`application/vnd.github+json`};#t;#n;#r;constructor(){super(),this.#t=new S(this.#e,this),this.#n=new C(this.#e,this),this.#r=new E,t.token&&this.setToken(t.token)}#i(e){let t={Accept:this.#e.Accept},n=``;try{n=new URL(e).hostname}catch(t){console.warn(`getSafeHeaders: invalid URL "${e}", Authorization header omitted.`,t)}return n===`api.github.com`&&this.#e.Authorization&&(t.Authorization=this.#e.Authorization),t}async#a(e,t={}){let n=D(e);if(!n.success)return n;try{let[e,r,i]=await Promise.all([fetch(n.repositoryLink,{headers:this.#i(n.repositoryLink),signal:t.signal}),fetch(n.branchLink,{headers:this.#i(n.branchLink),signal:t.signal}),fetch(n.commitsLink,{headers:this.#i(n.commitsLink),signal:t.signal})]);if(!e.ok)return{success:!1,...await this.createHttpError(e,n.repositoryLink)};if(!r.ok)return{success:!1,...await this.createHttpError(r,n.branchLink)};if(!i.ok)return{success:!1,...await this.createHttpError(i,n.commitsLink)};let a=await e.json(),o=await r.json(),s=await i.json();return{success:!0,defaultBranch:a.default_branch,branches:o,commits:s}}catch(e){return e.name===`AbortError`?{success:!1,cancelled:!0}:{success:!1,error:`Failed to fetch repository data`,devError:{message:`Network or fetch exception in #getRawData: ${e.message}`,stack:e.stack}}}}async getData(e,t={}){let n=await this.#a(e,t);if(!n.success)return n.cancelled||u.notify(n.error,`error`),n;await this.getRateLimitData();let r=this.#r.parseRepoData(n);return r.success||u.notify(r.error,`error`),r}async getDataByBranch(e,n=t.link,r={}){let i=typeof e==`string`?e.trim():``;if(!i){let e=`Missing branch name`;return u.notify(e,`error`),{success:!1,error:e,devError:{message:`getDataByBranch requires a valid branch name parameter`}}}let a=D(n);if(!a.success)return u.notify(a.error,`error`),a;try{let e=`${a.commitsLink}?sha=${encodeURIComponent(i)}`,t=await fetch(e,{headers:this.#i(e),signal:r.signal});if(!t.ok){let n=await this.createHttpError(t,e);return u.notify(n.error,`error`),{success:!1,...n}}let n=await t.json(),o=this.#r.parseCommitsData(n);return o.success||u.notify(o.error,`error`),this.getRateLimitData(),o}catch(e){if(e.name===`AbortError`)return{success:!1,cancelled:!0};let t=`Failed to fetch branch commits`,n={message:`Network or fetch exception in getDataByBranch: ${e.message}`,stack:e.stack};return u.notify(t,`error`),{success:!1,error:t,devError:n}}}async getCommitFiles(e,t){let n=D(e);if(!n.success)return u.notify(n.error,`error`),n;if(!t){let e=`Missing commit SHA`;return u.notify(e,`error`),{success:!1,error:e,devError:{message:`getCommitFiles requires a valid commit SHA parameter`}}}await this.getRateLimitData();try{let e=`${n.commitsLink}/${t}`,r=await fetch(e,{headers:this.#i(e)});if(!r.ok){let t=await this.createHttpError(r,e);return u.notify(t.error,`error`),{success:!1,...t}}let i=await r.json();return this.#r.parseCommitFilesData(i)}catch(e){let t=`Failed to fetch commit files`,n={message:`Network or fetch exception in getCommitFiles: ${e.message}`,stack:e.stack};return u.notify(t,`error`),{success:!1,error:t,devError:n}}}async setToken(e){return this.#t.setToken(e)}async getRateLimitData(){return this.#n.getRateLimitData()}checkIsRateLimitHigh(e,t=70){return this.#n.checkIsRateLimitHigh(e,t)}},k=new O,A={modal:`_modal_6fjqm_1`,elongation:`_elongation_6fjqm_1`,"modal-header":`_modal-header_6fjqm_19`,"modal-description":`_modal-description_6fjqm_35`,"modal-item":`_modal-item_6fjqm_39`,"modal-data":`_modal-data_6fjqm_49`,"modal-changes":`_modal-changes_6fjqm_55`,"modal-changes-github-button":`_modal-changes-github-button_6fjqm_69`,"modal-files":`_modal-files_6fjqm_80`,"modal-file":`_modal-file_6fjqm_80`,"modal-file-path":`_modal-file-path_6fjqm_97`,"modal-file-changes":`_modal-file-changes_6fjqm_102`,"modal-file-changes-additions":`_modal-file-changes-additions_6fjqm_108`,"modal-file-changes-deletions":`_modal-file-changes-deletions_6fjqm_111`},ae=`/GitMap/assets/github-logo-C11ywE_q.webp`,j=()=>document.body.classList.contains(`dark-theme`)?`dark`:`light`,M=null,N=null,P=()=>{M?.abort(),N?.setAttribute(`aria-expanded`,`false`),M=null,N=null,[...document.querySelectorAll(`.full-commit-modal`)].forEach(e=>e.remove())},F={light:{added:`#2DA44E`,modified:`#BF8700`,removed:`#CF222E`,renamed:`#0969DA`,copied:`#8250DF`,changed:`#656D76`},dark:{added:`#3FB950`,modified:`#D29922`,removed:`#F85149`,renamed:`#58A6FF`,copied:`#A371F7`,changed:`#8B949E`}},I=(e,t)=>{if(!e||!t)return;let{title:n,description:r=``,author:{url:i,email:a,name:o,avatar:s,date:c},hash:l,url:u}=e,{success:d,files:f,truncated:p}=t;P();let m=typeof globalThis.marked?.parse==`function`?globalThis.marked.parse(r):r,h=j();return`
        <div class="full-commit-modal ${A.modal}" id="full-commit-modal" role="dialog">
        <div class="${A[`modal-header`]}">
            <h2>${n}</h2>
            <button class="close-button rounded-full" id="close-full-commit-button" aria-label="Close">&times;</button>
        </div>
        <p>Description:</p>
        <div class="${A[`modal-description`]}">
            ${m||``} 
        </div>
        <div class="${A[`modal-data`]}">
            <a class="${A[`modal-item`]} rounded-normal" href="${i}" target="_blank" rel="noopener noreferrer" title="Email: ${a}">
                <span>Author: </span>
                <div class="flex-align-center">
                    ${o}
                    <img class="avatar rounded-full" src="${s}" alt="${o}'s Avatar">
                </div>
            </a>
            <button class="${A[`modal-item`]} rounded-normal copyable" data-copy-value="${l}" aria-label="Copy commit hash to clipboard">
                <span>Hash: </span>
                <span>#${l}</span>
            </button>
            <button class="${A[`modal-item`]} rounded-normal copyable" data-copy-value="${c}" aria-label="Copy commit date to clipboard">
                <span>Date: </span>
                <span>${c}</span>
            </button>
        </div>
        <div class="${A[`modal-changes`]}">
            <h3>Changes</h3>
            <div class="${A[`modal-files`]}">
                ${d&&Array.isArray(f)?f.map(e=>`
                        <div class="${A[`modal-file`]} rounded-normal">
                            <img class="modal-file-icon" src="https://raw.githubusercontent.com/Bila-sowa/file-extension-icons/main/icons-${h}/${e.extension}.svg" alt>
                            <code class="${A[`modal-file-path`]} text-small">${e.name}</code>
                            <div class="${A[`modal-file-changes`]}">
                                ${e.status===`R`?`<span class="text-small" style="color: ${F[`${h}`][e.fullStatus]}" title="${e.fullStatus}">${e.status}</span>`:`
                                    <code class="${A[`modal-file-changes-additions`]} text-small">+${e.additions}</code>
                                    <code class="${A[`modal-file-changes-deletions`]} text-small">-${e.deletions}</code>
                                    <code class="text-small" style="color: ${F?.[`${h}`][e.fullStatus]??`#8B949E`}" title="${e.fullStatus}">${e.status}</code>
                                `}
                            </div>
                        </div>
                    `).join(``):`<p class="text-small">No files details available.</p>`}
            ${p?`<p class="text-small">The files were truncated to 300 due to <a class="link text-small" href="https://docs.github.com/en/rest/commits/commits?apiVersion=2022-11-28#get-a-commit" target="_blank">limits.</a></p>`:``}
            </div>
            <a class="${A[`modal-changes-github-button`]}" href="${u}" target="_blank" rel="noopener noreferrer">
                View in GitHub<img width="32" src="${ae}" alt="GitHub logo">
            </a>
        </div>
    </div>
    `};function oe(e){let t=document.querySelector(`#full-commit-modal`);if(!t)return;M?.abort();let n=new AbortController;M=n,N=e;let{signal:r}=n,a=t.querySelector(`#close-full-commit-button`),o=[...t.querySelectorAll(`.modal-file-icon`)],s=[...t.querySelectorAll(`.copyable`)],c=j();o.forEach(e=>{e.addEventListener(`error`,()=>{e.onerror=null,e.src=`https://raw.githubusercontent.com/Bila-sowa/file-extension-icons/main/icons-${c}/file.svg`},{signal:r})}),s.forEach(e=>{e.addEventListener(`click`,()=>i(e),{signal:r})}),a?.focus();let l=()=>{P(),e?.focus()};e?.setAttribute(`aria-expanded`,`true`),a?.addEventListener(`click`,l,{signal:r}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&l()},{signal:r})}var L={modal:`_modal_vmiy7_1`,appearance:`_appearance_vmiy7_1`,"modal-hr":`_modal-hr_vmiy7_26`,"modal-content":`_modal-content_vmiy7_31`,"modal-data":`_modal-data_vmiy7_38`,"modal-item":`_modal-item_vmiy7_44`},R=()=>{[...document.querySelectorAll(`.hover-commit-modal`)].forEach(e=>e.remove())},z=e=>{if(!e)return;let{title:t,author:{email:n,name:r,avatar:i,date:a},hash:o}=e;R();let s=a.split(`,`)[0].trim().split(`.`).map((e,t)=>t===2?e.slice(-2):e).join(`.`),l=c(t,12);return`
        <div class="${L.modal} hover-commit-modal" id="hover-commit-modal" role="dialog">
            <h3>${l}</h3>
            <div class="${L[`modal-hr`]}"></div>
            <div class="${L[`modal-content`]}">
                <div class="${L[`modal-data`]}">
                    <div class="${L[`modal-item`]} rounded-normal" class="flex-align-center" title="Email: ${n}">
                        <span>Author: </span>
                        <div class="flex-align-center">
                            <span>${r}</span>
                            <img class="avatar rounded-full" src="${i}" alt="${r} avatar">
                        </div>
                    </div>
                    <div class="${L[`modal-item`]} rounded-normal">
                        <span>Hash: </span>
                        <span>#${o}</span>
                    </div>
                    <div class="${L[`modal-item`]} rounded-normal">
                        <span>Date: </span>
                        <span>${s}</span>
                    </div>
                </div>
            </div>
        </div>
    `},B={loader:`_loader_1s18d_1`,"loader-bar":`_loader-bar_1s18d_6`,"loader-bounce":`_loader-bounce_1s18d_1`};function V(){[...document.querySelectorAll(`.loader`)].length&&H();let e=`
        <div class="overlay loader">
            <div class="${B.loader}" role="status" aria-label="Loading">
                <div class="${B[`loader-bar`]}"></div>
                <div class="${B[`loader-bar`]}"></div>
                <div class="${B[`loader-bar`]}"></div>
                <div class="${B[`loader-bar`]}"></div>
                <div class="${B[`loader-bar`]}"></div>
            </div>
        </div>
    `;document.body.insertAdjacentHTML(`beforeend`,e)}function H(){[...document.querySelectorAll(`.loader`)].forEach(e=>e.remove())}var U=new class{#e;#t;#n;#r=null;#i=null;#a=0;constructor(e,t,n){this.#e=e,this.#t=t,this.#n=n,this.#o()}#o(){this.#r&&this.#r.abort(),this.#r=new AbortController;let{signal:e}=this.#r;this.#e.addEventListener(`click`,()=>this.#l(),{signal:e}),this.#e.addEventListener(`keydown`,e=>this.#f(e),{signal:e}),this.#t.addEventListener(`click`,e=>this.#d(e),{signal:e}),this.#t.addEventListener(`keydown`,e=>this.#p(e),{signal:e}),document.addEventListener(`click`,e=>this.#m(e),{signal:e})}#s(e=`selected`){if(this.#t.classList.remove(`hidden`),this.#e.setAttribute(`aria-expanded`,`true`),!e)return;let t=[...this.#t.querySelectorAll(`.branch-dropdown-item`)],n=t.find(e=>e.getAttribute(`aria-selected`)===`true`);(e===`last`?t.at(-1):n||t[0])?.focus()}#c(){this.#t.classList.add(`hidden`),this.#e.setAttribute(`aria-expanded`,`false`)}#l(){this.#e.getAttribute(`aria-expanded`)===`true`?this.#c():this.#s()}async#u(e){let t=e.textContent,n=++this.#a;this.#c(),this.#e.setAttribute(`aria-busy`,`true`);try{this.#i?await this.#i(t):this.setSelectedBranch(t)}finally{n===this.#a&&(this.#e.removeAttribute(`aria-busy`),this.#e.focus())}}#d(e){let t=e.target.closest(`.branch-dropdown-item`);t&&this.#u(t)}#f(e){e.key===`ArrowDown`||e.key===`ArrowUp`?(e.preventDefault(),this.#s(e.key===`ArrowUp`?`last`:`selected`)):e.key===`Escape`&&this.#c()}#p(e){let t=e.target.closest(`.branch-dropdown-item`);t&&(e.key===`Enter`||e.key===` `?(e.preventDefault(),this.#u(t)):e.key===`Escape`?(this.#c(),this.#e.focus()):e.key===`ArrowDown`?(e.preventDefault(),(t.nextElementSibling||this.#t.firstElementChild)?.focus()):e.key===`ArrowUp`?(e.preventDefault(),(t.previousElementSibling||this.#t.lastElementChild)?.focus()):e.key===`Home`?(e.preventDefault(),this.#t.firstElementChild?.focus()):e.key===`End`&&(e.preventDefault(),this.#t.lastElementChild?.focus()))}#m(e){this.#e.closest(`#branch-dropdown`)?.contains(e.target)||this.#c()}destroy(){this.#r&&=(this.#r.abort(),null)}setOnSelect(e){this.#i=typeof e==`function`?e:null}setSelectedBranch(e){let t=null;this.#t.querySelectorAll(`.branch-dropdown-item`).forEach(n=>{let r=n.textContent===e;n.setAttribute(`aria-selected`,String(r)),n.tabIndex=r?0:-1,r&&(t=n)}),t&&(this.#n.textContent=e)}render(e,t=``){if(!Array.isArray(e))return;let n=document.createDocumentFragment();e.forEach(e=>{if(typeof e!=`string`||!e.trim())return;let r=document.createElement(`li`);r.className=`branch-dropdown-item`,r.setAttribute(`role`,`option`);let i=e===t;r.setAttribute(`aria-selected`,String(i)),r.tabIndex=i?0:-1,r.textContent=e,n.append(r)}),this.#t.replaceChildren(n),this.#e.disabled=!this.#t.children.length,this.#n.textContent=t||`Set a branch`,this.#c()}}(ie,v,y),W=new class{#e=document.querySelector(`body`);#t=null;#n=null;#r=null;#i=null;#a=null;#o=null;#s=0;#c=null;constructor(e){this.#t=e}async render(){let e=t.link;if(!e)return{success:!1,error:`Missing repository URL`};let n=this.#l();V();try{let[t,i]=await Promise.all([k.getData(e,{signal:n.signal}),r()]);return this.#u(n.id,e)?t.success?(this.#n=e,this.#r=t,this.#i=i,this.#c=t.defaultBranch||t.branchesDetails[0]||null,this.#f(t.commitsDetails,this.#c),U.render(t.branchesDetails,this.#c),this.#p(),{success:!0,currentBranch:this.#c}):t:{success:!1,cancelled:!0}}catch(e){return u.notify(`Failed to render the repository graph`,`error`),{success:!1,error:e.message}}finally{n.id===this.#s&&H()}}async renderByBranch(e){let n=typeof e==`string`?e.trim():``,r=t.link;if(!r||!n||!this.#r?.success||this.#n!==r)return{success:!1,error:`Repository data or branch name is missing`};let i=this.#l();V();try{let e=await k.getDataByBranch(n,r,{signal:i.signal});return this.#u(i.id,r)?e.success?(this.#r={...this.#r,commitsDetails:e.commitsDetails},this.#c=n,this.#f(this.#r.commitsDetails,n),U.setSelectedBranch(n),this.#p(),{success:!0,currentBranch:n}):e:{success:!1,cancelled:!0}}catch(e){return u.notify(`Failed to render the selected branch`,`error`),{success:!1,error:e.message}}finally{i.id===this.#s&&H()}}refresh(){return this.#c&&this.#n===t.link?this.renderByBranch(this.#c):this.render()}#l(){return this.#o?.abort(),this.#o=new AbortController,{id:++this.#s,signal:this.#o.signal}}#u(e,n){return e===this.#s&&n===t.link}#d=async e=>{if(!(!this.#n||!e))return await k.getCommitFiles(this.#n,e)};#f(e,n=`main`){if(!e)return;P(),R(),this.#t.innerHTML=``,this.#t.dataset.repoUrl=t.link;let r=o(n);e.forEach((t,n)=>{let i=c(t.title,5),a=+this.#i.graph.renderLimit;if(n>=a)return;let o=n===0,s=n===Math.min(e.length,a)-1,l=`
                ${o?`<div class='triangular-connector'></div>`:``}
                <button
                    class="
                        commit
                        neon
                        rounded-full
                        ${o?`head-commit`:``}
                    "
                    data-id="${n}"
                    data-sha="${t.sha}"
                    name="${i}"
                    aria-expanded="false"
                    aria-label="Open commit: ${t.title}"
                    aria-branch="${r}"
                ></button>
                ${s?`<span class="limit-description text-smallest">Showing up to ${a} of the most recent commits for this branch.</span>`:`
                <div class="connection neon">
                    <span></span>
                    <span></span>
                </div>
                `}
            `;this.#t.insertAdjacentHTML(`beforeend`,l)}),u.notify(`The graph has been successfully generated`,`success`)}#p(){this.#a&&this.#a.abort(),this.#a=new AbortController;let{signal:e}=this.#a;this.#t.addEventListener(`click`,async e=>{let t=e.target.closest(`[data-id]`);if(!t)return;let{sha:n}=t.dataset,r=this.#r?.commitsDetails.find(e=>e.sha===n);if(!r)return;let i=this.#s;V();try{let e=await this.#d(n);if(i!==this.#s||!t.isConnected)return;let a=I(r,e);if(!a)return;l(a),oe(t)}finally{i===this.#s&&H()}},{signal:e}),this.#t.addEventListener(`mouseover`,e=>{let t=e.target.closest(`[data-id]`);if(!t)return;let{sha:n}=t.dataset,r=this.#r?.commitsDetails.find(e=>e.sha===n),i=z(r);if(!i)return;l(i);let a=this.#e.querySelector(`#hover-commit-modal`);i&&s(a,t)},{signal:e}),this.#t.addEventListener(`mouseout`,()=>R(),{signal:e})}}(te);U.setOnSelect(e=>W.renderByBranch(e)),t.link&&W.render(),new class{#e;#t;constructor(e,n){this.#e=e,this.#t=n,this.#e.value=t.link||``,this.#n()}#n(){this.#e.addEventListener(`blur`,()=>{let e=this.#e.value.trim();e&&(t.link=e,t.saveLink&&d.save(),this.#t.render())})}}(m,W),new class{#e;#t;constructor(e,t){this.#e=e,this.#t=t,this.#n()}#n(){this.#e.addEventListener(`click`,()=>this.#t.refresh())}}(h,W);var G={settings:`_settings_zy4ip_1`,"settings-header":`_settings-header_zy4ip_11`,"settings-content":`_settings-content_zy4ip_20`,"settings-section":`_settings-section_zy4ip_25`,"settings-item":`_settings-item_zy4ip_32`,"settings-token-status":`_settings-token-status_zy4ip_39`,"settings-toggle-button":`_settings-toggle-button_zy4ip_45`,"settings-toggle-input":`_settings-toggle-input_zy4ip_65`,"settings-rest-api-limit-progress":`_settings-rest-api-limit-progress_zy4ip_68`,"settings-rest-api-limit-bar":`_settings-rest-api-limit-bar_zy4ip_75`,"settings-version-text-container":`_settings-version-text-container_zy4ip_81`},K=(e,n)=>{let{usedPerNumber:r,limitPerNumber:i,usedPerPercent:a}=e,o=!1;i>=5e3&&(o=!0);let{version:s,versionIsStable:c}=n;return`
        <div class="overlay">
            <div class="${G.settings}" id="settings-content" role="dialog">
                <div class="${G[`settings-header`]}">
                    <h1>Settings</h1>
                    <button class="close-button rounded-full" id="close-settings-button">&times;</button>
                </div>
                <div class="${G[`settings-content`]}">
                    <div class="${G[`settings-section`]}">
                        <h3>GitHub</h3>
                        <div class="${G[`settings-item`]} rounded-normal border-sm">
                            <label for="token-input">GitHub rest api token</label>
                            <input style="height: 30px" class="rounded-normal border-sm" type="password" id="token-input" value="${t.token||``}" placeholder="gpy_">
                        </div>
                        <div class="${G[`settings-item`]} rounded-normal border-sm">
                            <span>GitHub Rest api token status:</span>
                            <span class="
                                ${o?`active-color`:`non-active-color`}
                                ${G[`settings-token-status`]} rounded-full"
                                title="${o?`The token is active, now your limit is 5000 requests per hour.`:`The token is not active, your limit is 60 requests per hour.`}"
                            >
                                ${o?`Active`:`Non-active`}
                            </span>
                        </div>
                    </div>
                    <div class="${G[`settings-section`]}">
                        <h3>LocalStorage</h3>
                        <div class="${G[`settings-item`]} rounded-normal border-sm">
                            <span for="save-link">Save current repo in page</span>
                            <input class="hidden ${G[`settings-toggle-input`]}" type="checkbox" id="save-link">
                            <label class="${G[`settings-toggle-button`]} rounded-full" for="save-link" aria-label="toggle save link option"></label>
                        </div>
                        <div class="${G[`settings-item`]} rounded-normal border-sm">
                            <span>Save current token in page</span>
                            <input class="hidden ${G[`settings-toggle-input`]}" type="checkbox" id="save-token">
                            <label class="${G[`settings-toggle-button`]} rounded-full" for="save-token" aria-label="toggle save token option"></label>
                        </div>
                        <div class="${G[`settings-item`]} rounded-normal border-sm">
                            <span>Rest API Limit:</span>
                            <div
                                class="${G[`settings-rest-api-limit-progress`]}
                                rounded-full border-normal"
                                title="Used: ${r} / ${i}"
                            >
                                <span
                                    class="${G[`settings-rest-api-limit-bar`]}"
                                    style="width: ${a}%"></span>
                            </div>
                        </div>
                    </div>
                    <div class="${G[`settings-version-text-container`]}">
                        <span class="text-small">Version: </span>
                        <a class="text-small link is-disabled" href="#" target="_blank" title="View in changelog" class="text-small" aria-disabled="true">${s}</a>
                        ${c?``:`<span title="This version provides no guarantees regarding your security and the program's operability." class="text-small cursor-help">${c?``:`(not stable)`}</span>`}
                    </div>
                </div>
            </div>
        </div>
    `};function q(){let e=document.querySelector(`.overlay`),n=document.querySelector(`#settings-content`);if(!e||!n)return;let r=new AbortController,{signal:i}=r,a=e.querySelector(`#close-settings-button`),o=e.querySelector(`#token-input`),s=document.querySelector(`#save-link`),c=document.querySelector(`#save-token`);function l(){k.setToken(o.value.trim()),t.saveToken&&d.save()}function u(){r.abort(),e.remove()}function f(t){t.target===e&&u()}function p(e){e.code===`Escape`&&u()}function m(){t.saveLink=s.checked,d.save()}function h(){t.saveToken=c.checked,d.save()}o.addEventListener(`blur`,l,{signal:i}),a.addEventListener(`click`,u,{signal:i}),document.addEventListener(`click`,f,{signal:i}),document.addEventListener(`keydown`,p,{signal:i}),s.checked=t.saveLink,s.addEventListener(`change`,m,{signal:i}),c.checked=t.saveToken,c.addEventListener(`change`,h,{signal:i})}new class{#e;constructor(e){this.#e=e,this.#t()}#t(){this.#e.addEventListener(`click`,()=>this.#n())}async#n(){t.token&&await k.setToken(t.token),V();let e=(await k.getRateLimitData()).data,n=(await r()).versionDetails;H();let i=K(e,n);i&&(l(i),q())}}(ee),new class{#e;constructor(e){this.#e=e,this.#n(t.theme||`dark-theme`),this.#t()}#t(){this.#e.addEventListener(`click`,()=>this.#r())}#n(e){let n=e===`light-theme`||e===`dark-theme`?e:`dark-theme`;document.body.classList.remove(`dark-theme`,`light-theme`),document.body.classList.add(n),t.theme=n,d.save()}#r(){let e=t.theme===`dark-theme`?`light-theme`:`dark-theme`;this.#n(e)}}(g);var se=(e,t)=>{if(!e||typeof e!=`object`)return;let n=t&&typeof t==`object`&&t.success===!1;if(e.success===!1&&!n)throw Error(e.error?e.error.message||e.error:`Request failed`);for(let[n,r]of Object.entries(e))if(r&&typeof r==`object`){let e=t&&typeof t==`object`?t[n]:void 0,i=e&&typeof e==`object`&&e.success===!1;if(r.success===!1&&!i)throw Error(`${n}: ${r.error?r.error.message||r.error:`Request failed`}`)}},J=Symbol(`ANY_VALID`),ce=e=>e==null||typeof e==`number`&&Number.isNaN(e),Y=(e,t,n=new WeakMap)=>{if(t===J)return!ce(e);if(typeof t!=`object`||!t)return Object.is(e,t);if(typeof e!=`object`||!e)return!1;if(n.get(t)===e)return!0;n.set(t,e);let r=Object.keys(t),i=Object.keys(e);return r.length===i.length&&r.every(r=>Object.prototype.hasOwnProperty.call(e,r)?Y(e[r],t[r],n):!1)},X=class{constructor({file:e,name:t,test:n,type:r,success:i,data:a}){this.file=e,this.name=t,this.test=n,this.type=r,this.success=i,this.data=a}},Z=class{constructor(e,t,n={}){this.details=e,this.expected=t,this.testData=n}async run(e){let t={};try{t=await e(this.testData,this);let n=le(t,this.expected);return new X({...this.details,success:n,data:t})}catch(e){return console.error(e),new X({...this.details,success:!1,data:t})}}},le=(e,t)=>!e||(se(e,t),!t)||Y(e,t);async function ue(){let e=new Z({file:`getGitHubData.js`,test:`test_nd2u3_Data`,name:`getCommitFiles`,type:`method`},{files:J,success:!0,truncated:!1},{TEST_REPO_URL:`https://github.com/Bila-sowa/GitMap`,TEST_COMMIT_SHA:`46f5cd270ddda0267790caf4fe48ec8895149ec6`}),t=new O;return e.run(async({TEST_REPO_URL:e,TEST_COMMIT_SHA:n})=>await t.getCommitFiles(e,n))}async function de(){let e=new Z({file:`getGitHubData.js`,test:`test_hvnws_Data`,name:`getData`,type:`method`},{defaultBranch:J,commitsDetails:J,branchesDetails:J,success:!0},{TEST_REPO_URL:`https://github.com/Bila-sowa/GitMap`}),t=new O;return e.run(async({TEST_REPO_URL:e})=>await t.getData(e))}async function fe(){let e=new x;return new Z({file:`httpController.js`,test:`test_483nq_Data`,name:`httpController`,type:`method`},[`Bad Request (400): Unable to process request.`,`Unprocessable Entity (422): Validation failed or resource is locked.`,`Gateway Timeout (504): GitHub timed out waiting for upstream server.`,`GitHub API error (HTTP 402).`],[400,422,504,402]).run(async t=>{let n=[];return t.map(t=>n.push(e.getHttpErrorMessage(t))),n})}function pe(){let e=new Z({file:`gitHubDataParser`,test:`test_idi3p_Data`,name:`parseRepoData`,type:`method`},{branchesDetails:[`feature/a&b`,`main`],commitsDetails:J,defaultBranch:`feature/a&b`,success:!0},{defaultBranch:`feature/a&b`,branches:[{name:`main`,commit:{sha:`1cbed9ccd45d045ade461da424696b46322a7f56`,url:`https://api.github.com/repos/Bila-sowa/GitMap/commits/1cbed9ccd45d045ade461da424696b46322a7f56`},protected:!1}],commits:[{sha:`51c497d0faee027f4b124401823c59416bda590a`,node_id:`C_kwDOTj3rDdoAKDUxYzQ5N2QwZmFlZTAyN2Y0YjEyNDQwMTgyM2M1OTQxNmJkYTU5MGE`,commit:{author:{name:`Bila_sowa`,email:`zlepkopavlo9@gmail.com`,date:`2026-08-28T12:58:44Z`},committer:{name:`GitHub`,email:`noreply@github.com`,date:`2026-08-28T12:58:44Z`},message:`Merge pull request #12 from Bila-sowa/feature-scaleMenu

added: scale widget functional`,tree:{sha:`e4c4944c9eaab36437ae070643baa06211cb90b2`,url:`https://api.github.com/repos/Bila-sowa/GitMap/git/trees/e4c4944c9eaab36437ae070643baa06211cb90b2`},url:`https://api.github.com/repos/Bila-sowa/GitMap/git/commits/51c497d0faee027f4b124401823c59416bda590a`,comment_count:0,verification:{verified:!0,reason:`valid`,signature:`-----BEGIN PGP SIGNATURE-----

wsFcBAABCAAQBQJqkYYECRC1aQ7uu5UhlAAAMMAQAC6xGVEpFO4dCdbEnXrgtePk
nhh2CNM1r/eqeeuGKeC6HdV5LEyFjfCfUaJK1avTg6amiZ6fa0phnYl+aAkc8Bdf
3uVL9b/uwP0Do1vX3YZGAN51JWCyME7UuTSb74AQ/DF2juEkNL6QVcGoB2p7+Y2b
D6RPtuYT9BvJ2OvydU1hLs6d6FFLMfp6zeIpaGwvlZe58L2yy6xxG8ZZz5QLp+q7
QWJrG6ZR2AyWt/gg/E7DBMt2nlyKmXVt30d3HYODCOpfaaGVZXBpRWolKS2Dv7u+
ztPn7F2Hy9qLVKGtzn3UE0dUQyQZhc1LPBc/A+N6laaPN5yTNCa0GQjURsYfqNIZ
KOBARAdgLDcbb6jxi5olSCx1rbNqRqDfBNAnIetgLGKku9qPGIGEOEC6aeXTo6I/
zVv/0ZNHwuwPpyHUYeKW5qUJvfObpOc4hs6w+6k1EO7WTQQB+Kf1fkv0i58BWKix
XD5EREuuIatWDSrM4bOh8pg2wkJnQopSB+CHG6kyB/AdDgKjtHR6etniOZwwCdYV
kzZcr82Ste7FjRMir5MT9EORTmdyB3UqWnVHOH/WiyqI7CM93Le4iPS9FNDRz4Ro
FPyp1LRq+DZq28hwKWAuvSTB6R2SC7AJp6GOCsfC+Nk4ywv8t67qWaqdhrwuzsIe
WjbikrZVU4eifwaD58Gw
=kjot
-----END PGP SIGNATURE-----
`,payload:`tree e4c4944c9eaab36437ae070643baa06211cb90b2
parent 282fa46d7bdd39f183a8aa924211106fa250f9a3
parent 71a4288ba55eea653e8ac0fa8365e90603204575
author Bila_sowa <zlepkopavlo9@gmail.com> 1787921924 +0300
committer GitHub <noreply@github.com> 1787921924 +0300

Merge pull request #12 from Bila-sowa/feature-scaleMenu

added: scale widget functional`,verified_at:`2026-08-28T12:58:45Z`}},url:`https://api.github.com/repos/Bila-sowa/GitMap/commits/51c497d0faee027f4b124401823c59416bda590a`,html_url:`https://github.com/Bila-sowa/GitMap/commit/51c497d0faee027f4b124401823c59416bda590a`,comments_url:`https://api.github.com/repos/Bila-sowa/GitMap/commits/51c497d0faee027f4b124401823c59416bda590a/comments`,author:{login:`Bila-sowa`,id:274431135,node_id:`U_kgDOEFt8nw`,avatar_url:`https://avatars.githubusercontent.com/u/274431135?v=4`,gravatar_id:``,url:`https://api.github.com/users/Bila-sowa`,html_url:`https://github.com/Bila-sowa`,followers_url:`https://api.github.com/users/Bila-sowa/followers`,following_url:`https://api.github.com/users/Bila-sowa/following{/other_user}`,gists_url:`https://api.github.com/users/Bila-sowa/gists{/gist_id}`,starred_url:`https://api.github.com/users/Bila-sowa/starred{/owner}{/repo}`,subscriptions_url:`https://api.github.com/users/Bila-sowa/subscriptions`,organizations_url:`https://api.github.com/users/Bila-sowa/orgs`,repos_url:`https://api.github.com/users/Bila-sowa/repos`,events_url:`https://api.github.com/users/Bila-sowa/events{/privacy}`,received_events_url:`https://api.github.com/users/Bila-sowa/received_events`,type:`User`,user_view_type:`public`,site_admin:!1},committer:{login:`web-flow`,id:19864447,node_id:`MDQ6VXNlcjE5ODY0NDQ3`,avatar_url:`https://avatars.githubusercontent.com/u/19864447?v=4`,gravatar_id:``,url:`https://api.github.com/users/web-flow`,html_url:`https://github.com/web-flow`,followers_url:`https://api.github.com/users/web-flow/followers`,following_url:`https://api.github.com/users/web-flow/following{/other_user}`,gists_url:`https://api.github.com/users/web-flow/gists{/gist_id}`,starred_url:`https://api.github.com/users/web-flow/starred{/owner}{/repo}`,subscriptions_url:`https://api.github.com/users/web-flow/subscriptions`,organizations_url:`https://api.github.com/users/web-flow/orgs`,repos_url:`https://api.github.com/users/web-flow/repos`,events_url:`https://api.github.com/users/web-flow/events{/privacy}`,received_events_url:`https://api.github.com/users/web-flow/received_events`,type:`User`,user_view_type:`public`,site_admin:!1},parents:[{sha:`282fa46d7bdd39f183a8aa924211106fa250f9a3`,url:`https://api.github.com/repos/Bila-sowa/GitMap/commits/282fa46d7bdd39f183a8aa924211106fa250f9a3`,html_url:`https://github.com/Bila-sowa/GitMap/commit/282fa46d7bdd39f183a8aa924211106fa250f9a3`},{sha:`71a4288ba55eea653e8ac0fa8365e90603204575`,url:`https://api.github.com/repos/Bila-sowa/GitMap/commits/71a4288ba55eea653e8ac0fa8365e90603204575`,html_url:`https://github.com/Bila-sowa/GitMap/commit/71a4288ba55eea653e8ac0fa8365e90603204575`}]}],success:!0}),t=new E;return e.run(e=>t.parseRepoData(e))}function me(){let e=new Z({file:`gitHubDataParser.js`,test:`test_rz8ou_Data`,name:`parseCommitFilesData`,type:`method`},{files:J,success:!0,truncated:J},{files:[{sha:`955aac5edba26fa1d8f1ef0f235bbb4817fe9c63`,filename:`README.md`,status:`modified`,additions:3,deletions:3,changes:6,blob_url:`https://github.com/Bila-sowa/GitMap/blob/46f5cd270ddda0267790caf4fe48ec8895149ec6/README.md`,raw_url:`https://github.com/Bila-sowa/GitMap/raw/46f5cd270ddda0267790caf4fe48ec8895149ec6/README.md`,contents_url:`https://api.github.com/repos/Bila-sowa/GitMap/contents/README.md?ref=46f5cd270ddda0267790caf4fe48ec8895149ec6`,patch:`@@ -58,10 +58,10 @@ You can also add a <a href="https://github.com/settings/personal-access-tokens"
 </h2>
 
 <h3>Options for open</h3>
+<span><b>Only by:</b></span>
 <ul>
-    <li>By <a href="https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer" target="_blank">Live Server</a></li>
-    <li>By <a href="#" target="_blank">GitHub Pages</a></li>
-    <li>By opening <code>index.html</code> directly in your browser</li>
+    <li><a href="https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer" target="_blank">Live Server</a></li>
+    <li><a href="#" target="_blank">GitHub Pages</a></li>
 </ul>
 
 <h3>Using</h3>`},{sha:`4037b3acf0a2f93acda6ff985722a8ea9250bbb6`,filename:`src/css/style.css`,status:`modified`,additions:92,deletions:0,changes:92,blob_url:`https://github.com/Bila-sowa/GitMap/blob/46f5cd270ddda0267790caf4fe48ec8895149ec6/src%2Fcss%2Fstyle.css`,raw_url:`https://github.com/Bila-sowa/GitMap/raw/46f5cd270ddda0267790caf4fe48ec8895149ec6/src%2Fcss%2Fstyle.css`,contents_url:`https://api.github.com/repos/Bila-sowa/GitMap/contents/src%2Fcss%2Fstyle.css?ref=46f5cd270ddda0267790caf4fe48ec8895149ec6`,patch:`@@ -178,12 +178,22 @@ main {
 }
 
 .commit {
+    position: relative;
     width: 64px;
     height: 64px;
     border: 5px solid var(--accent-color-1);
     border-radius: 999px;
 }
 
+.commit::before {
+    font-size: 1.2rem;
+    content: attr(name);
+    position: absolute;
+    right: 120px;
+    top: 12px;
+    width: 250px;
+}
+
 .commit:hover, .commit:active { background: none; }
 
 .connection {
@@ -197,3 +207,85 @@ main {
     margin: -8px 0px;
     border: 2px solid var(--accent-color-1);
 }
+
+.full-commit-modal {
+    position: fixed;
+    z-index: 20;
+    top: 77px;
+    right: 0;
+    height: calc(100dvh - 77px);
+    width: 30dvw;
+    box-sizing: border-box;
+    padding: 20px;
+    background: var(--color-3);
+    display: flex;
+    flex-direction: column;
+    gap: 20px;
+    /* animation: modal-pop; */
+}
+
+.full-commit-modal button {
+    position: absolute;
+    right: 0;
+    top: 0;
+    font-size: 2rem;
+    margin: 2px;
+    width: 50px;
+    height: 50px;
+    border-radius: 999px;
+    transition: background 0.3s ease;
+}
+
+.full-commit-modal h2 {
+    font-size: 1.75rem; 
+}
+
+.full-commit-modal p {
+    font-size: 1rem;
+    font-weight: 600;
+    color: var(--text-color-2);
+}
+
+.full-commit-modal .data-container {
+    margin-top: 40px;
+    display: flex;
+    flex-direction: column;
+    gap: 20px;
+}
+
+.full-commit-modal .changes-container {
+    margin-top: auto;
+    height: 300px;
+    width: 100%;
+    display: flex;
+    flex-direction: column;
+    align-items: center;
+    justify-content: space-between;
+}
+
+.full-commit-modal .changes-container h3 { 
+    width: 100%;
+    padding-bottom: 5px;
+    font-size: 1.35rem;
+    border-bottom: var(--border-color-1) 2px solid;
+}
+
+.full-commit-modal .changes-container div { overflow-y: scroll; }
+
+.full-commit-modal .changes-container a { 
+    background: var(--color-4);
+    width: 260px;
+    height: 50px;
+    font-size: 1rem;
+    display: flex;
+    justify-content: center;
+    align-items: center;
+    gap: 10px;
+    border-radius: 10px;
+    transition: background 0.3s ease;
+}
+
+
+.full-commit-modal .changes-container a:hover { 
+    background: var(--hover-color-1);
+}`},{sha:`8c0765bab07924ce793d19c29dba51fbdd962751`,filename:`src/js/controllers/graph.js`,status:`modified`,additions:30,deletions:10,changes:40,blob_url:`https://github.com/Bila-sowa/GitMap/blob/46f5cd270ddda0267790caf4fe48ec8895149ec6/src%2Fjs%2Fcontrollers%2Fgraph.js`,raw_url:`https://github.com/Bila-sowa/GitMap/raw/46f5cd270ddda0267790caf4fe48ec8895149ec6/src%2Fjs%2Fcontrollers%2Fgraph.js`,contents_url:`https://api.github.com/repos/Bila-sowa/GitMap/contents/src%2Fjs%2Fcontrollers%2Fgraph.js?ref=46f5cd270ddda0267790caf4fe48ec8895149ec6`,patch:`@@ -9,6 +9,7 @@ export default class Graph {
     #isFullOpen = false;
     #isHoverOpen = false;
     #hoverTimeoutId = null;
+    #lastFocusedCommit = null;
 
     constructor(graphElement) {
         this.#body = document.querySelector("body")
@@ -27,7 +28,7 @@ export default class Graph {
             const isLast = index === this.#data.commitsDetails.length - 1;
 
             const commitCard = \`
-                <button class="commit" data-id="\${index}" aria-label="Open commit: \${commit.title}" title="Open commit: \${commit.title}"></button>
+                <button class="commit" data-id="\${index}" name="\${commit.title}" aria-expanded="false" aria-label="Open commit: \${commit.title}" title="Open commit: \${commit.title}"></button>
                 \${isLast ? '' : \`
                 <div class="connection">
                     <span></span>
@@ -43,7 +44,7 @@ export default class Graph {
     #bindEvents() {
         this.#graph.addEventListener('click', this.#openFullCommitModal);
         this.#graph.addEventListener('mouseover', this.#openHoverCommitModal);
-        this.#graph.addEventListener('mouseout', this.#closeCommitModal);
+        this.#graph.addEventListener('mouseout', this.#closeHoverCommitModal);
     }
 
     async #getData(link) {
@@ -55,19 +56,24 @@ export default class Graph {
         const commitButton = e.target.closest('.commit');
         const commit = this.#data?.commitsDetails[+commitButton?.dataset.id];
 
-        if (!commit || this.#isFullOpen || this.#isHoverOpen) return;
+        if (!commit) return;
 
         if (this.#hoverTimeoutId) {
             clearTimeout(this.#hoverTimeoutId);
             this.#hoverTimeoutId = null;
         }
 
-        console.log(commit)
+        document.querySelector("#hover-commit-modal")?.remove();
+        this.#isHoverOpen = false;
+
+        document.querySelector("#full-modal-window")?.remove();
+        this.#lastFocusedCommit?.setAttribute("aria-expanded", "false");
 
         const card = \`
-            <div class="full-commit-modal">
+            <div class="full-commit-modal" id="full-modal-window" role="dialog">
+                <button id="close-button" aria-label="close">&times;</button>
                 <h2>\${commit.title}</h2>
-                <p>\${commit.description ? "Description" + commit.description : ""} </p>
+                <p>\${commit.description ? "Description: " + commit.description : ""} </p>
                 <div class="data-container">
                     <span title="Email: \${commit.author.email}">Author: \${commit.author.name}</span>
                     <span>Hash: \${commit.hash}</span>
@@ -78,13 +84,27 @@ export default class Graph {
                     <div>
 
                     </div>
-                    <a href="\${commit.url}" target="_blank" rel="noopener noreferrer">View in <b>GitHub</b></a>
+                    <a href="\${commit.url}" target="_blank" rel="noopener noreferrer">View in <b>GitHub</b><img width="32" src="./images/github_logo.webp" alt></a>
                 </div>
             </div>
         \`;
 
-        // this.#body.insertAdjacentHTML("beforeend", card);
+        commitButton.setAttribute("aria-expanded", "true");
+        this.#body.insertAdjacentHTML("beforeend", card);
         this.#isFullOpen = true;
+        this.#lastFocusedCommit = commitButton;
+
+        const modal = document.querySelector("#full-modal-window");
+        const closeButton = document.querySelector("#close-button");
+
+        closeButton.focus();
+
+        closeButton.addEventListener("click", () => {
+            modal.remove();
+            this.#isFullOpen = false;
+            commitButton.setAttribute("aria-expanded", "false");
+            commitButton.focus();
+        });
     }
 
     #openHoverCommitModal = (e) => {
@@ -104,16 +124,16 @@ export default class Graph {
             if (this.#isFullOpen) return;
 
             this.#isHoverOpen = true;
-            console.log(commit)
         }, this.#delay);
     }
 
-    #closeCommitModal = () => {
+    #closeHoverCommitModal = () => {
         if (this.#hoverTimeoutId) {
             clearTimeout(this.#hoverTimeoutId);
             this.#hoverTimeoutId = null;
         }
 
+        document.querySelector("#hover-commit-modal")?.remove();
         this.#isHoverOpen = false;
     }
 }`}]}),t=new E;return e.run(e=>t.parseCommitFilesData(e))}async function he(){let e=new Z({file:`gitHubTokenManager.js`,test:`test_05yau_Data`,name:`setToken`,type:`method`},{success:!1,error:J,devError:J},{token:`ghu_example_token`}),t=new S({Accept:`application/vnd.github+json`},new x);return e.run(async({token:e})=>t.setToken(e))}async function Q(){let e=new Z({file:`getGitHubData.js`,test:`test_3j3f8_Data`,name:`getRateLimitData`,type:`method`},{data:{limitPerNumber:J,usedPerNumber:J,usedPerPercent:J},success:!0}),t=new O;return e.run(async()=>await t.getRateLimitData())}async function ge(){let e=new Z({file:`getGitHubData.js`,test:`test_vt6mk_Data`,name:`getDataByBranch`,type:`method`},{commitsDetails:J,success:!0},{TEST_REPO_URL:`https://github.com/Bila-sowa/GitMap`,TEST_BRANCH_NAME:`main`}),t=new O;return e.run(async({TEST_REPO_URL:e,TEST_BRANCH_NAME:n})=>await t.getDataByBranch(n,e))}async function _e(){for(let e of[`info`,`success`,`warning`,`error`])u.notify(`Test notification`,e)}function ve(e=!1){return new Z({file:`utils.js`,name:`escapeHTML`,test:`test_0c2os_Data`,type:`function`},{pattern1:`&lt;input style=&quot;display: none;&quot; type=&quot;text&quot; value=&quot;&quot; onfocus=&quot;alert(&#39;XSS&#39;)&quot; autofocus&gt;`,pattern2:`&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;`,pattern3:`&lt;textarea style=&quot;display: none;&quot;&gt;&lt;img src=x onerror=alert(&#39;XSS&#39;)&gt;&lt;/textarea&gt;`},{pattern1:`<input style="display: none;" type="text" value="" onfocus="alert('XSS')" autofocus>`,pattern2:`<script>alert("XSS")<\/script>`,pattern3:`<textarea style="display: none;"><img src=x onerror=alert('XSS')></textarea>`}).run(({pattern1:t,pattern2:n,pattern3:r})=>{let i={pattern1:o(t),pattern2:o(n),pattern3:o(r)};if(e)for(let e in i)document.body.insertAdjacentHTML(`beforeend`,i[e]);return i})}function ye(){let e=new Z({file:`formatter.js`,test:`test_gj781_Data`,name:`Formatter`,type:`class`},{title:`update tests`,description:`
- getGitHubData.test.js has been split into smaller modules
- update testTools.js`,dateInLocalString:`16.08.2026, 15:55:32`,shortHash:`35c2ab6`,formatedExtension:`js`,shorStatus:`M`},{name:`update tests

- getGitHubData.test.js has been split into smaller modules
- update testTools.js`,date:`2026-08-16T12:55:32Z`,hash:`35c2ab6d6ac3526a22a21d0a83c6309f574daeac`,extension:`example.js`,status:`modifed`}),t=new w;return e.run(({name:e,date:n,hash:r,extension:i,status:a})=>({title:t.getFormattedTitle(e),description:t.getFormattedDescription(e),dateInLocalString:t.getDateInLocaleString(n),shortHash:t.getShortHash(r),formatedExtension:t.getFormattedExtension(i),shorStatus:t.getShortStatus(a)}))}function be(){let t=new e;return new Z({file:`storage.js`,test:`test_8je0j_Data`,name:`Storage`,type:`class`},{link:`https://github.com/Bila-sowa/GitMap`,theme:`dark-theme`,token:``,localStorage:{saveLink:!1,saveToken:!1}},{link:`   https://github.com/Bila-sowa/GitMap    `,theme:`contrast-theme`,token:!1,localStorage:{saveLink:`Yes`,saveToken:3}}).run(({link:e,theme:n,token:r,localStorage:i})=>(t.setLink(e),t.theme=n,t.token=r,t.setData({localStorage:i}),t.getData()))}var xe=[ue,de,Q,fe,pe,me,he,ge,ve,ye,be],Se=[_e];async function Ce(){try{let e=await fetch(new URL(`data:application/json;base64,ewogICAgInVpVGVzdHMiOiBmYWxzZSwKICAgICJkYXRhVGVzdHMiOiB0cnVlCn0K`,``+import.meta.url));if(!e.ok)throw Error(`Failed to load config: ${e.status}`);return await e.json()}catch(e){return console.warn(`Using default test config because config.json could not be loaded.`,e),{uiTests:!1,dataTests:!1}}}function $(e){let t=e.slice();for(let e=t.length-1;e>0;e--){let n=Math.floor(Math.random()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}async function we(e=xe){let t=$(e),n=await Promise.all(t.map(e=>e())),r=n.map((e,n)=>({name:t[n].name,result:e})).filter(({result:e})=>!e.success);return console.log(`Tests done: ${n.length-r.length} passed, ${r.length} failed.`),r.length>0&&console.error(`Failed tests:`,r.map(({name:e})=>e)),console.table(n),n}async function Te(e=Se){await Promise.all($(e).map(e=>e())),console.log(`Ui tests done`)}async function Ee(){let e=await Ce();console.group(`Unit tests`),e.dataTests&&await we(),e.uiTests&&await Te(),console.groupEnd()}Ee();