(()=>{'use strict';
const $=id=>document.getElementById(id), G=window.SWITCH_GAMES||[];
const COLORS=['#F18A9C','#F3B369','#F4D65F','#79D9A0','#62CDDA','#7EA9F5','#B28AF2','#E888C9'];
const KEY='switch-party-tournament-v1';
const makePlayers=n=>Array.from({length:n},(_,i)=>({id:'p'+i,name:'',color:i%COLORS.length}));
const defaults=()=>({screen:'home',count:2,playerStep:0,players:makePlayers(2),selected:[],order:'random',scoring:'fixed',sequence:[],rounds:[],picks:[],match:null,history:[]});
let s=defaults();
try{const raw=JSON.parse(localStorage.getItem(KEY));if(raw&&typeof raw==='object'&&Array.isArray(raw.players)&&Array.isArray(raw.history))s={...defaults(),...raw};}catch{}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){console.warn('Cannot save local data',e)}};
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const hexFor=id=>COLORS[s.players.find(p=>p.id===id)?.color??0];
const player=id=>s.players.find(p=>p.id===id);
const game=id=>G.find(g=>g.id===id);
const factor=index=>(s.scoring==='ascending'?(index+1):1);
const posPoints=(rank,index)=>(s.count-1-rank)*factor(index);
const gameMode=g=>g?.mode==='team'&&s.count===4?'team':(g?.mode==='team'||g?.mode==='duels')&&s.count===3?'roundrobin':g?.mode==='duels'&&s.count===4?'pairduels':'ranking';
const fullPoints=index=>(s.count-1)*factor(index);
const blankPoints=()=>Object.fromEntries(s.players.map(p=>[p.id,0]));
function seededMatch(){
 const g=game(s.sequence[s.rounds.length]),mode=gameMode(g);
 if(mode==='ranking')return {mode};
 const ids=shuffle(s.players.map(p=>p.id));
 if(mode==='team')return {mode,teams:[ids.slice(0,2),ids.slice(2,4)],winner:null};
 if(mode==='roundrobin')return {mode,pairs:[[ids[0],ids[1]],[ids[0],ids[2]],[ids[1],ids[2]]],winners:[]};
 return {mode,pairs:[[ids[0],ids[1]],[ids[2],ids[3]]],winners:[]};
}
function ensureMatch(){if(!s.match||s.match.gameId!==s.sequence[s.rounds.length]||s.match.mode!==gameMode(game(s.sequence[s.rounds.length]))){s.match={...seededMatch(),gameId:s.sequence[s.rounds.length]};save()}return s.match}

const totals=()=>{const out=blankPoints();s.rounds.forEach((r,i)=>{
 if(r.points){Object.entries(r.points).forEach(([id,v])=>{if(id in out)out[id]+=v})}
 else if(r.ranking){r.ranking.forEach((id,rank)=>{if(id in out)out[id]+=posPoints(rank,i)})}
});return out};
const leaders=()=>{const pts=totals();return [...s.players].sort((a,b)=>pts[b.id]-pts[a.id]||a.id.localeCompare(b.id));};
const img=(g,cl='')=>`<img class="${cl}" src="${encodeURI(g?.icon||'')}" alt="${esc(g?.name||'Game')}" onerror="this.onerror=null;this.src='icons/placeholder.svg'">`;
const circle=(p)=>`<span class="dot" style="background:${COLORS[p.color]}"></span>`;
function header(step=''){return `<header class="top"><div class="brand"><span class="logo">✦</span> SWITCH PARTY</div><span class="chip">${esc(step||'TOURNAMENT')}</span></header>`}
function shell(body,step=''){ $('app').innerHTML=`<main class="shell">${step==='PLAYING'?'':header(step)}${body}<div class="footer">SWITCH PARTY · Tournament tracker · Saved on this device</div></main>`;save()}
function btn(label,fn,cls=''){return `<button class="btn ${cls}" data-action="${fn}">${label}</button>`}
function steps(active){return `<div class="steps">${['Players','Games','Rules'].map((t,i)=>`<span class="step ${i===active?'active':''}">${i+1}. ${t}</span>`).join('')}</div>`}
function toHome(){s.screen='home';render()}
function restart(){if(s.sequence.length&&s.screen==='playing'&&!confirm('Start a new tournament? Current progress will be replaced.'))return;s={...defaults(),history:s.history};s.screen='players';render()}
function home(){shell(`<section class="surface"><div class="hero"><div class="eyebrow">Game night, sorted.</div><h1>One party.<br>One champion.</h1><p>Pick your players, choose your sports, and compete for the top of the table.</p></div><div class="buttonrow">${btn('＋ New tournament','new','full')}${s.sequence.length?btn('▶ Continue tournament','continue','secondary full'):''}${s.history.length?btn('⌛ Tournament history','history','ghost full'):''}</div></section>`,'HOME')}
function playersScreen(){const p=s.players[s.playerStep];const used=new Set(s.players.filter((x,i)=>i!==s.playerStep&&(i<s.playerStep||Boolean(x.name.trim()))).map(x=>x.color));shell(`<section class="surface">${steps(0)}<div class="section-head"><div><div class="eyebrow">Set up your team</div><h2>Players</h2></div><span class="chip">${s.playerStep+1}/${s.count}</span></div><label class="formlabel">Number of players</label><div class="choices">${[2,3,4].map(n=>`<button class="choice ${s.count===n?'active':''}" data-count="${n}">${n} players</button>`).join('')}</div><div class="players-summary">${s.players.map((x,i)=>`<div class="player-pill">${circle(x)} ${esc(x.name||'Player '+(i+1))}</div>`).join('')}</div><hr class="divider"><div class="eyebrow">Player ${s.playerStep+1}</div><h2>Your profile</h2><label class="formlabel" for="player-name">Name</label><input class="input" id="player-name" maxlength="24" placeholder="Enter player name" value="${esc(p.name)}"><div style="height:22px"></div><div class="formlabel">Choose a color</div><div class="colors">${COLORS.map((c,i)=>`<button title="${used.has(i)?'Already chosen by another player':'Color '+(i+1)}" aria-label="Choose color ${i+1}" aria-pressed="${p.color===i}" data-color="${i}" ${used.has(i)?'disabled':''} class="colorbtn ${p.color===i?'active':''} ${used.has(i)?'taken':''}" style="background:${c}">${used.has(i)?'×':p.color===i?'✓':''}</button>`).join('')}</div><div class="buttonrow">${btn('← Back',s.playerStep?'previous-player':'home','secondary')}${btn(s.playerStep===s.count-1?'Choose games →':'Next player →','next-player','flex')}</div></section>`,'SETUP')}
function gamesScreen(){const available=G.filter(g=>g.players.includes(s.count));const validIds=available.map(g=>g.id);const all=validIds.length>0&&validIds.every(id=>s.selected.includes(id));shell(`<section class="surface">${steps(1)}<div class="section-head"><div><div class="eyebrow">Choose your lineup</div><h2>Select games</h2></div><span class="chip">${s.selected.length} selected</span></div><p class="small">Only sports supporting ${s.count} players can be selected. Colored covers are selected; unavailable games have a red ×.</p><div class="game-grid">${G.map(g=>{const valid=g.players.includes(s.count),selected=s.selected.includes(g.id);return `<button class="game-option ${selected?'selected':''} ${valid?'':'unavailable'}" data-game="${esc(g.id)}" ${valid?'':'disabled'} aria-pressed="${selected}"><div class="game-img-wrap">${img(g)}${!valid?'<span class="x-overlay">×</span>':selected?'<span class="check-overlay">✓</span>':''}</div><div class="game-label">${esc(g.name)}</div></button>`}).join('')}</div><div class="buttonrow">${btn(all?'Deselect all':'Select all available','select-all','secondary flex')}${btn('← Players','back-players','ghost')}${btn('Next →','to-rules','flex')}</div>${s.selected.length?'':'<p class="notice">Select at least one game to continue.</p>'}</section>`,'SETUP')}
function option(name,val,heading,sub,current){return `<label class="option-block"><input type="radio" name="${name}" value="${val}" ${current===val?'checked':''}><span class="option-card"><span class="radioicon"></span><span><span class="option-title">${heading}</span><div class="option-sub">${sub}</div></span></span></label>`}
function rulesScreen(){shell(`<section class="surface">${steps(2)}<div class="eyebrow">Almost ready</div><h2>Tournament rules</h2><div class="subhead">Game order</div>${option('order','random','Random','Automatically shuffle all selected games.',s.order)}${option('order','manual','Manual','Use the arrows to choose the exact sequence.',s.order)}${s.order==='manual'?`<div class="order-list">${s.selected.map((id,i)=>`<div class="order-row">${img(game(id))}<div class="name">${i+1}. ${esc(game(id)?.name||id)}</div><button data-move="${i}:-1" ${i===0?'disabled':''} aria-label="Move up">↑</button><button data-move="${i}:1" ${i===s.selected.length-1?'disabled':''} aria-label="Move down">↓</button></div>`).join('')}</div>`:''}<div class="subhead">Scoring system</div>${option('scoring','fixed','Fixed points',`${s.count} players: ${Array.from({length:s.count},(_,i)=>s.count-i-1).join(' / ')} points in every game.`,s.scoring)}${option('scoring','ascending','Ascending points','Game 1 ×1, Game 2 ×2, Game 3 ×3, etc. Points scale by finishing position.',s.scoring)}<div class="buttonrow" style="margin-top:23px">${btn('← Games','back-games','secondary')}${btn('▶ Start tournament','start','flex')}</div></section>`,'SETUP')}
function tracker(){const max=s.sequence.length,visible=Math.min(s.rounds.length+1,max);return `<div class="between"><div class="subhead" style="margin:0">Game history</div><span class="muted small">${s.rounds.length} / ${max} completed</span></div><div class="tracker">${s.sequence.slice(0,visible).map((id,i)=>{const g=game(id),r=s.rounds[i];const color=r?hexFor(r.winners?.[0]||r.ranking?.[0]):'transparent';const border=r&&r.winners?.length>1?`border-top-color:${hexFor(r.winners[0])};border-left-color:${hexFor(r.winners[0])};border-bottom-color:${hexFor(r.winners[1])};border-right-color:${hexFor(r.winners[1])}`:`border-color:${color}`;return `<div title="${esc(g?.name||id)}${r?' — Winner(s): '+esc((r.winners||[r.ranking?.[0]]).map(id=>player(id)?.name).join(' & ')):''}"><div class="tracker-icon ${r?'finished':''}" style="${border}">${img(g)}</div><div class="tracker-label">${i+1}</div></div>`}).join('')}</div>`}
function leaderboard(){const pts=totals();return `<div class="between"><div class="subhead" style="margin:0">Standings</div><span class="muted small">Live points</span></div><div class="leaderboard" style="--players:${s.count}">${leaders().map((p,i)=>`<div class="score-card"><div class="score-color" style="background:${COLORS[p.color]}"></div><div class="score-name">${i+1}. ${esc(p.name)}</div><div class="score-points">${pts[p.id]}</div><div class="score-rank">POINTS</div></div>`).join('')}</div>`}
function startingOrder(){
 const pts=totals();
 // Lowest score starts, highest score goes last. Ties keep player entry order.
 const order=[...s.players].sort((a,b)=>pts[a.id]-pts[b.id]||s.players.indexOf(a)-s.players.indexOf(b));
 return `<div class="starting-order"><div class="subhead">Starting order</div><div class="starting-order-list">${order.map((p,i)=>`<div class="starting-order-player"><span class="starting-number">${i+1}</span>${circle(p)}<span>${esc(p.name)}</span></div>`).join('')}</div></div>`;
}
function rankEntry(rank){const p=s.picks[rank],available=s.players.filter(x=>!s.picks.includes(x.id)),auto=rank===s.count-1&&s.picks.length===s.count-1,chosen=auto?available[0]?.id:p;const value=posPoints(rank,s.rounds.length);return `<div class="rank-row"><div class="rank-label">${rank===0?'🥇':rank===1?'🥈':rank===2?'🥉':'④'} ${rank+1}${rank===0?'st':rank===1?'nd':rank===2?'rd':'th'}</div><div>${chosen?`<button class="rank-filled" data-unpick="${rank}" ${auto?'disabled':''}>${circle(player(chosen))}<span>${esc(player(chosen)?.name)}</span><span>+${value} pt${value===1?'':'s'}</span>${auto?'':' ×'}</button>`:rank===s.picks.length?`<div class="rank-options">${available.map(x=>`<button class="rank-choice" data-pick="${esc(x.id)}">${circle(x)}${esc(x.name)}</button>`).join('')}</div>`:'<div class="rank-unfilled">Choose the previous position first</div>'}</div></div>`}
function singleMatchButtons(pair,chosen,kind,index){
 return `<div class="match-row"><div class="match-label">${esc(kind)}</div><div class="match-buttons">${pair.map(id=>{
 const p=player(id);return `<button class="match-choice ${chosen===id?'chosen':''}" data-match="${index}" data-winner="${esc(id)}" ${chosen&&chosen!==id?'':' '}>${circle(p)} ${esc(p?.name)} ${chosen===id?'✓':''}</button>`;
 }).join('')}</div></div>`;
}
function specialInput(m,idx){
 const mult=factor(idx),max=fullPoints(idx);
 if(m.mode==='team'){
 return `<div class="mode-hint">Random teams · Choose the winning team. Both winners earn <strong>${max} points</strong>; both losing players get 0.</div>
 <div class="team-options">${m.teams.map((team,i)=>`<button class="team-choice ${m.winner===i?'chosen':''}" data-team="${i}"><span>TEAM ${i+1}</span><div>${team.map(id=>`<span class="team-member">${circle(player(id))}${esc(player(id)?.name)}</span>`).join('')}</div>${m.winner===i?'✓ Winners':''}</button>`).join('')}</div>`;
 }
 if(m.mode==='roundrobin'){
 return `<div class="mode-hint">Everyone plays everyone once (three 1v1 matches). Record each winner. Ranking is based on match wins: 2 / 1 / 0 wins earn ${2*mult} / ${mult} / 0 points. If all players win once, everyone gets ${mult} point${mult===1?'':'s'}.</div>
 ${m.pairs.map((pair,i)=>singleMatchButtons(pair,m.winners[i],`Match ${i+1}`,i)).join('')}`;
 }
 if(m.mode==='pairduels'){
 return `<div class="mode-hint">Two separate random 1v1 matches, not teams. Select one winner from each match. Both winners independently receive <strong>${max} points</strong>, both losers 0. No final.</div>
 ${m.pairs.map((pair,i)=>singleMatchButtons(pair,m.winners[i],`Match ${i+1}`,i)).join('')}`;
 }
 return '';
}
function canFinish(m){return m.mode==='ranking'?s.picks.length===s.count-1:m.mode==='team'?m.winner!==null:m.mode==='roundrobin'?m.pairs.every((_,i)=>Boolean(m.winners[i])):m.mode==='pairduels'?m.pairs.every((_,i)=>Boolean(m.winners[i])):false}
function activeScreen(){
 const idx=s.rounds.length;if(idx>=s.sequence.length){finishScreen();return}
 const g=game(s.sequence[idx]),m=ensureMatch(),base=fullPoints(idx);
 const title=m.mode==='ranking'?'Enter finishing positions':m.mode==='team'?'Choose the winning team':m.mode==='roundrobin'?'Enter match winners':'Choose the two match winners';
 shell(`<section class="surface">${tracker()}<hr class="divider">${leaderboard()}<hr class="divider">
 <div class="between"><div class="eyebrow">NOW PLAYING · GAME ${idx+1} OF ${s.sequence.length}</div><span class="chip">ROUND ${idx+1}</span></div>
 <div class="current-game">${img(g)}<div><div class="muted small">CURRENT GAME</div><h2>${esc(g?.name||'Game')}</h2><div class="points-callout">${base} POINT${base===1?'':'S'}</div></div></div>
 ${startingOrder()}<div class="subhead">${title}</div>
 ${m.mode==='ranking'?`<p class="small" style="margin-top:3px">Select players in finishing order. The last player is assigned automatically.</p><div class="rank-list">${Array.from({length:s.count},(_,i)=>rankEntry(i)).join('')}</div>`:specialInput(m,idx)}
 <div class="buttonrow">${btn('✓ Finish game','finish','full')}${m.mode==='ranking'?btn('Reset selections','reset-picks','secondary flex'):''}${s.rounds.length?btn('↶ Undo last result','undo','ghost flex'):''}</div>
 <div class="exit-row">${btn('End tournament','end-tournament','danger smallbtn')}</div></section>`,'PLAYING')
}
function roundWinners(r){return (r.winners||[r.ranking?.[0]]).filter(Boolean).map(id=>player(id)?.name).filter(Boolean)}
function finishScreen(){const pts=totals(),list=leaders(),top=pts[list[0].id],champs=list.filter(p=>pts[p.id]===top);shell(`<section class="surface"><div class="champion"><div class="trophy">🏆</div><div class="eyebrow">Tournament completed</div><h1>${champs.length>1?'It’s a tie!':'Champion!'}</h1><div class="winnername">${champs.map(p=>esc(p.name)).join(' & ')}</div><p>${s.rounds.length} games played</p></div>${tracker()}<hr class="divider">${leaderboard()}<div class="subhead">Results by game</div>${s.rounds.map((r,i)=>`<div class="history-row"><div><strong>${i+1}. ${esc(game(s.sequence[i])?.name||'Game')}</strong><br><small>Winner${roundWinners(r).length>1?'s':''}: ${esc(roundWinners(r).join(' & '))}</small></div><span class="dot" style="background:${hexFor(r.winners?.[0]||r.ranking?.[0])}"></span></div>`).join('')}<div class="buttonrow" style="margin-top:22px">${btn('↶ Undo final game','undo','secondary flex')}${btn('＋ New tournament','new','flex')}${btn('⌂ Home','home','ghost flex')}</div></section>`,'FINISHED')}
function historyScreen(){shell(`<section class="surface"><h2>Past tournaments</h2>${s.history.length?s.history.map(h=>`<div class="history-row"><div><strong>${esc(h.winners.join(' & '))}</strong><br><small>${esc(h.date)} · ${h.games} games · ${h.players} players${h.status==='ended early'?' · ended early':''}</small></div>🏆</div>`).join(''):'<p>No completed tournaments archived yet.</p>'}<div class="buttonrow">${btn('← Home','home','secondary')}${btn('Clear history','clear-history','danger')}</div></section>`,'HISTORY')}
function render(){if(s.screen==='home')home();else if(s.screen==='players')playersScreen();else if(s.screen==='games')gamesScreen();else if(s.screen==='rules')rulesScreen();else if(s.screen==='playing')activeScreen();else if(s.screen==='finished')finishScreen();else if(s.screen==='history')historyScreen();else toHome()}
function validNames(){const a=s.players.map(p=>p.name.trim());return a.every(Boolean)&&new Set(a.map(x=>x.toLocaleLowerCase())).size===a.length}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function archiveTournament(status){
 if(!s.rounds.length)return;
 const pts=totals(),max=Math.max(...Object.values(pts));
 s.history.unshift({date:new Date().toLocaleDateString('en-GB'),winners:s.players.filter(p=>pts[p.id]===max).map(p=>p.name),players:s.count,games:s.rounds.length,status});
 s.history=s.history.slice(0,100);
}
function finishGame(){
 const m=ensureMatch(),idx=s.rounds.length;
 if(!canFinish(m))return alert('Please complete all required results first.');
 const pts=blankPoints();let winners=[];let ranking=[];
 if(m.mode==='ranking'){
  const last=s.players.find(p=>!s.picks.includes(p.id));if(!last)return;
  ranking=[...s.picks,last.id];ranking.forEach((id,i)=>pts[id]=posPoints(i,idx));winners=[ranking[0]];
 } else if(m.mode==='team'){
  winners=[...m.teams[m.winner]];winners.forEach(id=>pts[id]=fullPoints(idx));
 } else if(m.mode==='roundrobin'){
  const winCount=Object.fromEntries(s.players.map(p=>[p.id,0]));
  m.winners.forEach(id=>winCount[id]++);
  // Three games imply either 2/1/0 or 1/1/1 wins.
  // A 1/1/1 tie shares the three placement rewards evenly (1 per player).
  Object.keys(pts).forEach(id=>pts[id]=winCount[id]*factor(idx));
  const high=Math.max(...Object.values(winCount));
  winners=s.players.filter(p=>winCount[p.id]===high).map(p=>p.id);
  ranking=s.players.map(p=>p.id).sort((a,b)=>winCount[b]-winCount[a]);
 } else if(m.mode==='pairduels'){
  winners=[...m.winners];
  winners.forEach(id=>pts[id]=fullPoints(idx));
 }
 s.rounds.push({mode:m.mode,ranking,winners,points:pts,details:JSON.parse(JSON.stringify(m))});
 s.picks=[];s.match=null;
 if(s.rounds.length===s.sequence.length){archiveTournament('completed');s.screen='finished'}
 render();
}
function endTournament(){
 if(!confirm('End this tournament now? The current unfinished game will not be scored. Completed results will be saved to tournament history.'))return;
 archiveTournament('ended early');const hist=s.history;
 s={...defaults(),history:hist};s.screen='home';render();
}
function undo(){
 if(!s.rounds.length)return;
 if(!confirm('Undo the last completed game?'))return;
 if(s.screen==='finished'&&s.history.length)s.history.shift();
 const last=s.rounds.pop();s.picks=last.mode==='ranking'?last.ranking.slice(0,s.count-1):[];
 s.match=last.details||null;s.screen='playing';render();
}
$('app').addEventListener('input',e=>{if(e.target.id==='player-name'){s.players[s.playerStep].name=e.target.value;save()}});
$('app').addEventListener('change',e=>{const t=e.target;if(t.name==='order'||t.name==='scoring'){s[t.name]=t.value;render()}});
$('app').addEventListener('click',e=>{const target=e.target.closest('button');if(!target||target.disabled)return;
if(target.dataset.count){const n=Number(target.dataset.count);s.count=n;s.players=makePlayers(n);s.playerStep=0;s.selected=[];render();return}
if(target.dataset.color!==undefined){const color=Number(target.dataset.color);if(s.players.some((p,i)=>i!==s.playerStep&&(i<s.playerStep||Boolean(p.name.trim()))&&p.color===color))return;s.players[s.playerStep].color=color;render();return}
if(target.dataset.game){const id=target.dataset.game;s.selected=s.selected.includes(id)?s.selected.filter(x=>x!==id):[...s.selected,id];render();return}
if(target.dataset.move){const [i,d]=target.dataset.move.split(':').map(Number),j=i+d;if(j>=0&&j<s.selected.length){[s.selected[i],s.selected[j]]=[s.selected[j],s.selected[i]];render()}return}
if(target.dataset.team!==undefined){const m=ensureMatch();if(m.mode==='team'){m.winner=Number(target.dataset.team);render()}return}
if(target.dataset.match!==undefined){
 const m=ensureMatch(),i=Number(target.dataset.match),id=target.dataset.winner;
 if(m.mode==='roundrobin'&&m.pairs[i]?.includes(id)){m.winners[i]=id;render();return}
 if(m.mode==='pairduels'&&m.pairs[i]?.includes(id)){m.winners[i]=id;render();return}
 return;
}
if(target.dataset.pick){if(s.picks.length<s.count-1&&!s.picks.includes(target.dataset.pick)){s.picks.push(target.dataset.pick);render()}return}
if(target.dataset.unpick!==undefined){s.picks=s.picks.slice(0,Number(target.dataset.unpick));render();return}
switch(target.dataset.action){case 'new':restart();break;case 'continue':s.screen=s.rounds.length===s.sequence.length?'finished':'playing';render();break;case 'history':s.screen='history';render();break;case 'home':toHome();break;case 'previous-player':s.playerStep=Math.max(0,s.playerStep-1);render();break;case 'next-player':{const p=s.players[s.playerStep];p.name=p.name.trim();if(!p.name)return alert('Enter a player name.');if(s.players.some((x,i)=>i!==s.playerStep&&x.name.trim().toLocaleLowerCase()===p.name.toLocaleLowerCase()))return alert('Please use unique player names.');if(s.playerStep<s.count-1){s.playerStep++;const used=new Set(s.players.slice(0,s.playerStep).map(x=>x.color));if(used.has(s.players[s.playerStep].color))s.players[s.playerStep].color=COLORS.findIndex((_,i)=>!used.has(i));}else if(validNames())s.screen='games';else return alert('Enter a name for every player.');render();break}
case 'back-players':s.screen='players';s.playerStep=s.count-1;render();break;
case 'select-all':{const valid=G.filter(g=>g.players.includes(s.count)).map(g=>g.id);s.selected=valid.every(id=>s.selected.includes(id))?[]:valid;render();break}
case 'to-rules':if(!s.selected.length)return alert('Select at least one game.');s.screen='rules';render();break;
case 'back-games':s.screen='games';render();break;
case 'start':if(!s.selected.length)return; s.sequence=s.order==='random'?shuffle([...s.selected]):[...s.selected];s.rounds=[];s.picks=[];s.match=null;s.screen='playing';render();break;
case 'end-tournament':endTournament();break;case 'reset-picks':s.picks=[];render();break;case 'finish':finishGame();break;case 'undo':undo();break;
case 'clear-history':if(confirm('Permanently remove the past tournament history?')){s.history=[];render()}break;default:break}
});
render();
})();
