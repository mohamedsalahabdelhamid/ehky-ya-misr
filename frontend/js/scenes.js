/* Scenic opening for all 27 governorates. */
(() => {
  const scenes = [
    {id:'giza',name:'أهرامات الجيزة',province:'الجيزة'},
    {id:'alex',name:'قلعة قايتباي',province:'الإسكندرية'},
    {id:'aswan',name:'معبد أبو سمبل الكبير',province:'أسوان'},
    {id:'luxor',name:'معابد الكرنك',province:'الأقصر'},
    {id:'matrouh',name:'بحيرات واحة سيوة',province:'مطروح'},
    {id:'newvalley',name:'الصحراء البيضاء — الفرافرة',province:'الوادي الجديد'},
    {id:'redsea',name:'ساحل مرسى علم',province:'البحر الأحمر'},
    {id:'qalyubia',name:'القناطر الخيرية',province:'القليوبية'},
    {id:'cairo',name:'قلعة صلاح الدين ومسجد محمد علي',province:'القاهرة'},
    {id:'beheira',name:'بيوت رشيد الأثرية',province:'البحيرة'},
    {id:'kafr',name:'بحيرة البرلس',province:'كفر الشيخ'},
    {id:'dakahlia',name:'كورنيش النيل بالمنصورة',province:'الدقهلية'},
    {id:'damietta',name:'اللسان برأس البر',province:'دمياط'},
    {id:'gharbia',name:'مسجد السيد البدوي بطنطا',province:'الغربية'},
    {id:'monufia',name:'ريف دنشواي وأبراج الحمام',province:'المنوفية'},
    {id:'sharqia',name:'تل بسطة',province:'الشرقية'},
    {id:'portsaid',name:'مبنى هيئة قناة السويس التاريخي',province:'بورسعيد'},
    {id:'ismailia',name:'بحيرة التمساح',province:'الإسماعيلية'},
    {id:'suez',name:'ساحل العين السخنة',province:'السويس'},
    {id:'northsinai',name:'شاطئ النخيل بالعريش',province:'شمال سيناء'},
    {id:'southsinai',name:'دير سانت كاترين',province:'جنوب سيناء'},
    {id:'fayoum',name:'شلالات وادي الريان',province:'الفيوم'},
    {id:'beni',name:'هرم ميدوم',province:'بني سويف'},
    {id:'minya',name:'مقابر بني حسن ووادي النيل',province:'المنيا'},
    {id:'asyut',name:'الدير المحرق بالقوصية',province:'أسيوط'},
    {id:'sohag',name:'معبد سيتي الأول بأبيدوس',province:'سوهاج'},
    {id:'qena',name:'معبد دندرة',province:'قنا'}
  ];
  const sceneDurationMs=5000;
  let index=0,hero=null,timer=null,remaining=sceneDurationMs,lastTick=0,revision=0;
  let imageLayer=null,caption=null,count=null;
  const isNight=()=>document.body.classList.contains('night');
  function canMove(){return !document.hidden&&!document.body.classList.contains('motion-off');}
  function asset(s,night){return night?`assets/scene-${s.id}-night.webp`:s.id==='giza'?null:`assets/scene-${s.id}.webp`;}
  function tick(){const now=Date.now();if(canMove()){remaining-=now-lastTick;if(remaining<=0){remaining=sceneDurationMs;show(index+1);}}lastTick=now;}
  function preloadNext(){const next=scenes[(index+1)%scenes.length];const src=asset(next,isNight());if(src){const img=new Image();img.src=src;}}
  async function show(next,themeOnly=false){
    if(!hero?.isConnected)return;
    const generation=++revision,target=hero,layer=imageLayer;
    const wanted=(next+scenes.length)%scenes.length,s=scenes[wanted],night=isNight();
    try{
      let incoming=null;const src=asset(s,night);
      if(src){
        incoming=new Image();incoming.className='scene-still';incoming.alt='';incoming.setAttribute('aria-hidden','true');incoming.src=src;
        await incoming.decode();
        if(generation!==revision||target!==hero||!target.isConnected)return;
        // Match the original Giza video's framing during the day/night switch.
        if(s.id==='giza')incoming.classList.add('scene-giza');
        layer.append(incoming);incoming.getBoundingClientRect();incoming.classList.add('is-active');
      }
      if(generation!==revision||target!==hero)return;
      const old=[...layer.querySelectorAll('.scene-still')].filter(el=>el!==incoming);
      old.forEach(el=>el.classList.remove('is-active'));
      setTimeout(()=>old.forEach(el=>el.remove()),1500);
      index=wanted;if(!themeOnly)remaining=sceneDurationMs;
      target.dataset.scene=s.id;target.dataset.sceneMode=night?'night':'day';
      const video=target.querySelector('video');
      video.style.opacity=src?'0':'1';
      caption.textContent=`${s.name} — محافظة ${s.province}`;
      count.textContent=`${index+1} / ${scenes.length}`;
      if(!src&&canMove())video.play().catch(()=>{});else video.pause();
      preloadNext();
    }catch{if(generation===revision)caption.textContent=`${s.name} — تعذّر تحميل المشهد، جرّب مرة أخرى`;}
  }
  function attach(){
    const found=document.querySelector('.hero.cinema');
    if(found===hero)return;
    clearInterval(timer);timer=null;hero=found;revision++;
    if(!hero)return;
    imageLayer=document.createElement('div');imageLayer.className='scene-images';imageLayer.setAttribute('aria-hidden','true');hero.prepend(imageLayer);
    const existing=hero.querySelector('.scene-caption');
    existing.classList.add('scene-place');existing.removeAttribute('aria-hidden');
    existing.innerHTML='<span class="scene-place-name"></span><small>تصوّر فني متحرك · ٢٧ محافظة</small>';
    caption=existing.querySelector('.scene-place-name');caption.textContent='أهرامات الجيزة — محافظة الجيزة';
    const controls=document.createElement('div');controls.className='scene-controls';controls.setAttribute('aria-label','تغيير مشهد المحافظة');
    controls.innerHTML='<button type="button" aria-label="المشهد السابق">→</button><span class="scene-count" dir="ltr">1 / 27</span><button type="button" aria-label="المشهد التالي">←</button><small>مشهد جديد كل ٥ ثوانٍ</small>';
    hero.append(controls);count=controls.querySelector('.scene-count');
    const buttons=controls.querySelectorAll('button');buttons[0].onclick=()=>show(index-1);buttons[1].onclick=()=>show(index+1);
    remaining=sceneDurationMs;lastTick=Date.now();timer=setInterval(tick,250);
    show(index,true);
  }
  new MutationObserver(attach).observe(document.getElementById('app'),{childList:true});
  document.addEventListener('visibilitychange',()=>{lastTick=Date.now()});
  let previousNight=isNight();
  new MutationObserver(()=>{const night=isNight();if(night!==previousNight){previousNight=night;show(index,true);}}).observe(document.body,{attributes:true,attributeFilter:['class']});
  attach();
})();
