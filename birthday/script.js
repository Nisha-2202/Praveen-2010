// Tiny confetti burst + tap-to-flip on mobile
const c = document.getElementById('confetti'), x = c.getContext('2d');
let bits = [];
function size(){ c.width = innerWidth; c.height = innerHeight; }
size(); addEventListener('resize', size);
const colors = ['#B3124F','#F4A9C2','#FCE9F0','#3A0A22'];

function burst(){
  for(let i=0;i<160;i++){
    bits.push({x:innerWidth/2,y:innerHeight/2,vx:(Math.random()-.5)*16,vy:Math.random()*-14-3,
      s:Math.random()*8+4,col:colors[i%4],r:Math.random()*6});
  }
  if(bits.length === 160) loop();
}
function loop(){
  x.clearRect(0,0,c.width,c.height);
  bits.forEach(b=>{b.x+=b.vx;b.y+=b.vy;b.vy+=.35;b.r+=.2;
    x.save();x.translate(b.x,b.y);x.rotate(b.r);x.fillStyle=b.col;x.fillRect(0,0,b.s,b.s*.6);x.restore();});
  bits = bits.filter(b=>b.y<c.height+20);
  if(bits.length) requestAnimationFrame(loop);
}
document.getElementById('party').onclick = burst;
document.getElementById('party2').onclick = burst;
document.querySelectorAll('.flip').forEach(f=>f.addEventListener('click',()=>f.classList.toggle('on')));

// Intro page: tap to open the main page
const intro = document.getElementById('intro');
function openSite(){
  document.body.classList.remove('locked');
  intro.classList.add('open');
  burst();
  setTimeout(()=>{intro.remove();window.scrollTo(0,0);},900);
}
intro.addEventListener('click',openSite);
intro.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openSite();}});

// Hide broken-image icon until real photos are added
document.querySelectorAll('img').forEach(i=>{if(i.closest('.song'))return;i.addEventListener('error',()=>{i.style.display='none'});if(i.complete&&i.naturalWidth===0)i.style.display='none';});

// Birthday date & time (change this line! format: YYYY-MM-DDTHH:MM:SS, 24-hour time)
const BIRTHDAY = new Date('2026-10-20T00:00:00');
const dateEl=document.getElementById('bdayText'),box=document.getElementById('count');
dateEl.textContent = BIRTHDAY.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) +
  ' \u00b7 ' + BIRTHDAY.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});
function tick(){
  const diff=BIRTHDAY-new Date();
  if(diff<=0){box.classList.add('done');dateEl.textContent='Today is your big day!';return;}
  const s=Math.floor(diff/1000);
  document.getElementById('cd').textContent=Math.floor(s/86400);
  document.getElementById('ch').textContent=Math.floor(s%86400/3600);
  document.getElementById('cm').textContent=Math.floor(s%3600/60);
  document.getElementById('cs').textContent=s%60;
}
tick();setInterval(tick,1000);


// Music cards: tap a song and it plays inside the page.
// 1) put the YouTube video id in data-yt="..." (plays here, thumbnail used if no cover image), or
// 2) add music/songN.mp3 (plays with the pink bar). Otherwise the "Listen on YouTube" link shows.
const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
const songs=[...document.querySelectorAll('.song')];
function closeSong(c){
  c.classList.remove('open','playing');
  const box=c.querySelector('.yt'); if(box) box.innerHTML='';
  c.querySelector('audio').pause();
  c.querySelector('.play').innerHTML='&#9654;';
}
songs.forEach(card=>{
  const id=(card.dataset.yt||'').trim();
  const a=card.querySelector('audio'),btn=card.querySelector('.play'),bar=card.querySelector('.bar'),
        fill=bar.firstElementChild,t=card.querySelector('.time'),box=card.querySelector('.yt'),img=card.querySelector('.cover img'),
        name=card.querySelector('.meta b').textContent;
  const tap=()=>{
    if(id){
      if(card.classList.contains('open')){closeSong(card);return;}
      songs.forEach(c=>c!==card&&closeSong(c));
      box.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&playsinline=1&rel=0" title="'+name+'" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      card.classList.add('open','playing');btn.innerHTML='&#9632;';
    }else if(card.classList.contains('ready')){
      if(a.paused){songs.forEach(c=>c!==card&&closeSong(c));a.play().catch(()=>{});}else a.pause();
    }
  };
  btn.addEventListener('click',tap);
  card.querySelector('.cover').addEventListener('click',tap);
  card.querySelector('.meta b').addEventListener('click',tap);
  if(id){
    card.classList.add('ready','yt-mode');
    const fb='https://img.youtube.com/vi/'+id+'/mqdefault.jpg';
    const useThumb=()=>{if(!img.dataset.fb){img.dataset.fb='1';img.src=fb;}};
    img.addEventListener('error',useThumb);
    if(img.complete&&img.naturalWidth===0)useThumb();
  }else{
    img.addEventListener('error',()=>{img.style.display='none'});
    if(img.complete&&img.naturalWidth===0)img.style.display='none';
    a.addEventListener('loadedmetadata',()=>card.classList.add('ready'));
    a.addEventListener('play',()=>{card.classList.add('playing');btn.innerHTML='&#10074;&#10074;';});
    const stop=()=>{card.classList.remove('playing');btn.innerHTML='&#9654;';};
    a.addEventListener('pause',stop);a.addEventListener('ended',stop);
    a.addEventListener('timeupdate',()=>{if(a.duration){fill.style.width=(a.currentTime/a.duration*100)+'%';t.textContent=fmt(a.currentTime);}});
    bar.addEventListener('click',e=>{if(a.duration){const r=bar.getBoundingClientRect();a.currentTime=(e.clientX-r.left)/r.width*a.duration;}});
  }
});
