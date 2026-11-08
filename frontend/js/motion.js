/* Original motion treatment inspired by the supplied screen recording. */
(() => {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = !media.matches;
  try { if (sessionStorage.getItem('memory-motion') === 'off') enabled = false; } catch {}
  const toggle = document.createElement('button');
  toggle.className = 'motion-toggle';
  document.querySelector('.tools').append(toggle);
  const canvas = document.createElement('canvas');
  canvas.id = 'living-light'; canvas.setAttribute('aria-hidden','true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d', {alpha:true});
  if (!ctx) { toggle.remove(); canvas.remove(); return; }
  const progress = document.createElement('div');
  progress.className = 'reading-progress'; progress.setAttribute('aria-hidden','true');
  document.body.append(progress);
  let width = 0, height = 0, raf = 0, last = 0, t = 0, pointerAt = 0;
  let pointer = {x:0,y:0};
  const tail = Array.from({length:25},()=>({x:0,y:0}));
  let initialized = false;
  const motes = Array.from({length:34}, (_,i)=>({u:(i*.61803398875)%1,v:(i*.41421356237)%1,r: .8 + (i%4)*.42,phase:i*.73}));
  function resize(){
    width = innerWidth; height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1,1.5);
    canvas.width = Math.round(width*ratio);canvas.height = Math.round(height*ratio);
    canvas.style.width = width+'px';canvas.style.height = height+'px';
    ctx.setTransform(ratio,0,0,ratio,0,0);
    if (!initialized) {tail.forEach(p=>{p.x=width*.28;p.y=height*.35});initialized=true;}
  }
  function syncVideo(){document.querySelectorAll('video.scene-video').forEach(video=>{if(enabled&&!document.hidden&&!document.body.classList.contains('night')&&(!video.closest('.cinema')?.dataset.scene||video.closest('.cinema').dataset.scene==='giza')){video.play().catch(()=>{})}else video.pause()})}
  function state(){
    syncVideo();
    document.body.classList.toggle('motion-on',enabled);
    document.body.classList.toggle('motion-off',!enabled);
    toggle.textContent=enabled?'◌ الحركة':'◌ الحركة متوقفة';
    toggle.setAttribute('aria-label',enabled?'إيقاف الحركة':'تشغيل الحركة');
    toggle.setAttribute('aria-pressed',String(enabled));
    cancelAnimationFrame(raf);raf=0;last=0;
    if(enabled&&!document.hidden)raf=requestAnimationFrame(frame);
    else ctx.clearRect(0,0,width,height);
  }
  function frame(now){
    if(!enabled||document.hidden)return;
    const delta=Math.min((now-(last||now))/1000,.04);last=now;t+=delta;
    ctx.clearRect(0,0,width,height);
    const night=document.body.classList.contains('night');
    const active=now-pointerAt<2600;
    const target=active?pointer:{x:width*(.28+.15*Math.sin(t*.35)),y:height*(.35+.16*Math.cos(t*.27))};
    const follow=1-Math.exp(-delta*8);
    tail[0].x+=(target.x-tail[0].x)*follow;tail[0].y+=(target.y-tail[0].y)*follow;
    for(let i=1;i<tail.length;i++){tail[i].x+=(tail[i-1].x-tail[i].x)*Math.min(delta*14,1);tail[i].y+=(tail[i-1].y-tail[i].y)*Math.min(delta*14,1)}
    // Translucent fabric-like contours, rather than an opaque pointer effect.
    for(let ribbon=0;ribbon<9;ribbon++){
      const phase=ribbon*.58;
      ctx.beginPath();
      tail.forEach((p,i)=>{
        const amplitude=Math.sin(i/(tail.length-1)*Math.PI)*22;
        const x=p.x+Math.sin(t*1.25+i*.31+phase)*amplitude;
        const y=p.y+Math.cos(t*.9+i*.23+phase)*amplitude;
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      });
      ctx.lineWidth=1.2+ribbon*.45;
      ctx.lineCap='round';ctx.lineJoin='round';
      ctx.strokeStyle=ribbon%3===0?`rgba(${night?'96,210,202':'24,136,140'},${night?.12:.085})`:`rgba(${night?'235,191,105':'184,135,52'},${night?.15:.105})`;
      ctx.stroke();
    }
    const head=tail[0];
    const glow=ctx.createRadialGradient(head.x,head.y,0,head.x,head.y,62);
    glow.addColorStop(0,night?'rgba(239,202,135,.13)':'rgba(210,166,85,.12)');glow.addColorStop(.5,night?'rgba(73,197,192,.05)':'rgba(47,153,150,.04)');glow.addColorStop(1,'rgba(210,166,85,0)');
    ctx.fillStyle=glow;ctx.fillRect(head.x-62,head.y-62,124,124);
    // Sparse, softly drifting gold dust remains visible without pointer input.
    for(const m of motes){
      const x=(m.u*width+Math.sin(t*.16+m.phase)*35+width)%width;
      const y=(m.v*height-t*(3+m.r)+height*10)%height;
      ctx.beginPath();ctx.arc(x,y,m.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${night?'236,197,126':'174,132,66'},${(.08+.12*(.5+.5*Math.sin(t*.6+m.phase))).toFixed(3)})`;ctx.fill();
    }
    raf=requestAnimationFrame(frame);
  }
  toggle.addEventListener('click',()=>{enabled=!enabled;try{sessionStorage.setItem('memory-motion',enabled?'on':'off')}catch{}state()});
  media.addEventListener('change',e=>{enabled=!e.matches;state()});
  document.addEventListener('visibilitychange',state);
  addEventListener('resize',resize,{passive:true});
  addEventListener('pointermove',e=>{
    if(e.pointerType==='touch'||!enabled)return;
    pointer={x:e.clientX,y:e.clientY};pointerAt=performance.now();
    const hero=document.querySelector('.hero-art');
    if(hero){
      const box=hero.getBoundingClientRect();
      const x=Math.max(-1,Math.min(1,(e.clientX-(box.left+box.width/2))/(innerWidth/2)));
      const y=Math.max(-1,Math.min(1,(e.clientY-(box.top+box.height/2))/(innerHeight/2)));
      hero.style.setProperty('--look-x',x.toFixed(3));hero.style.setProperty('--look-y',y.toFixed(3));
    }
    const card=e.target.closest('.route,.cat,.item-card');
    if(card){const b=card.getBoundingClientRect();card.style.setProperty('--spot-x',(e.clientX-b.left)+'px');card.style.setProperty('--spot-y',(e.clientY-b.top)+'px');}
  },{passive:true});
  function onScroll(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?scrollY/max:0})`;}
  addEventListener('scroll',onScroll,{passive:true});
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.1});
  function attach(){
    syncVideo();
    const elements=document.querySelectorAll('.route,.cat,.section-head,.intro-strip,.item-card,.article section,.facts');
    elements.forEach((el,i)=>{if(el.dataset.motionReady)return;el.dataset.motionReady='1';el.style.setProperty('--delay',`${Math.min(i%4,3)*90}ms`);el.classList.add('motion-reveal');observer.observe(el)});
    onScroll();
  }
  new MutationObserver(records=>{if(records.some(r=>r.addedNodes.length))attach()}).observe(document.getElementById('app'),{childList:true,subtree:true});
  // Preserve the application's route behavior while giving navigation a camera-like crossfade.
  if(typeof route==='function'&&document.startViewTransition){
    removeEventListener('hashchange',route);
    addEventListener('hashchange',()=>{
      if(enabled&&!media.matches){document.startViewTransition(()=>route()).finished.catch(()=>{})}
      else route();
    });
  }
  resize();state();attach();
})();
