/*  NaberLa v9 — Complete Rewrite  */
(function(){
    "use strict";

    /* ─── DOM ─── */
    const $ = id => document.getElementById(id);
    const overlay   = $('overlay');
    const playBtn   = $('play-btn');
    const feed      = $('feed');
    const cursor    = $('custom-cursor');
    const audio     = $('html-audio');
    const songTitle = $('song-title');
    const ytLink    = $('yt-link');
    const btnPP     = $('btn-pp');
    const btnNext   = $('btn-next');
    const btnPrev   = $('btn-prev');
    const btnMute   = $('btn-mute');
    const btnScrollPP = $('btn-scroll-pp');
    const speedSlider = $('speed-slider');
    const contactOpen  = $('contact-open');
    const contactClose = $('contact-close');
    const contactModal = $('contact-modal');

    /* ─── STATE ─── */
    let hovering = false, scrollPaused = false, entered = false;
    let loading = false, speed = 0, scrollAcc = 0;
    let trackIdx = 0, playing = false, muted = false;
    let ytPlayer = null, ytReady = false, mode = 'none';

    /* ─── CONFIG (localStorage) ─── */
    const DEFAULTS = {
        speed: 3,
        music: [
            'https://www.youtube.com/watch?v=5qap5aO4i9A',
            'https://www.youtube.com/watch?v=jfKfPfyJRdk'
        ],
        images: [
            {u:"https://i.pinimg.com/originals/b6/db/fb/b6dbfb14f13f92dd67201a4b6d53158d.jpg",l:""},
            {u:"https://i.pinimg.com/originals/09/3a/53/093a534cc33a630c46c7e31c7fb24730.jpg",l:""},
            {u:"https://i.pinimg.com/originals/18/09/27/180927c1c23bf6005f9e156d5b3fcddf.jpg",l:""},
            {u:"https://i.pinimg.com/originals/14/aa/a1/14aaa1af7d9558d87ca7ee5c03c01420.jpg",l:""},
            {u:"https://i.pinimg.com/originals/ba/09/c1/ba09c18936b35405ebaf6408a47996a1.jpg",l:""},
            {u:"https://i.pinimg.com/originals/53/1d/89/531d89fcb64b7306ef1c527957b71463.jpg",l:""},
            {u:"https://i.pinimg.com/originals/86/65/c4/8665c4cef8f0dd495f81c37ee39cf188.jpg",l:""},
            {u:"https://i.pinimg.com/originals/67/9a/b8/679ab8e219838428b35d217cd789cae3.jpg",l:""},
            {u:"https://i.pinimg.com/originals/15/e5/ab/15e5ab4f2f0d8f56c1d2cd5b79f9a5cb.jpg",l:""},
            {u:"https://i.pinimg.com/originals/b1/54/fc/b154fc6ad0abb97bd7ee40585377f583.jpg",l:""},
            {u:"https://i.pinimg.com/originals/2f/d0/44/2fd04426158b3c9773d06dd849e8a9d1.jpg",l:""},
            {u:"https://i.pinimg.com/originals/71/8b/80/718b801cb33ecf9071f275cf3318371a.jpg",l:""},
            {u:"https://i.pinimg.com/originals/a3/06/9c/a3069ce243c28813231834e87856e7ec.jpg",l:""},
            {u:"https://i.pinimg.com/originals/55/c6/90/55c690881e279ce7a379bf4d16115ff4.jpg",l:""},
            {u:"https://i.pinimg.com/originals/68/6c/09/686c095f25ad6b13b4259380449a4c38.jpg",l:""},
            {u:"https://i.pinimg.com/originals/44/35/dd/4435dd22a211478e9249b89c5e458f22.jpg",l:""}
        ]
    };

    function loadConfig(){
        try{
            const raw = localStorage.getItem('naberlaConfig');
            if(!raw) return JSON.parse(JSON.stringify(DEFAULTS));
            const c = JSON.parse(raw);
            // Normalize images from admin format
            if(c.images && c.images.length){
                c.images = c.images.map(img => {
                    if(typeof img === 'string') return {u:img, l:''};
                    return {u: img.imgUrl || img.u || '', l: img.link || img.l || ''};
                }).filter(i => i.u);
            }
            if(!c.images || !c.images.length) c.images = JSON.parse(JSON.stringify(DEFAULTS.images));
            if(!c.music || !c.music.length) c.music = [...DEFAULTS.music];
            c.speed = c.speed || 3;
            return c;
        }catch(e){
            return JSON.parse(JSON.stringify(DEFAULTS));
        }
    }

    const cfg = loadConfig();
    if(speedSlider) speedSlider.value = cfg.speed;

    /* ─── CUSTOM CURSOR ─── */
    /* Logo tip originally points DOWN.  After CSS rotate(135deg), tip points UPPER-LEFT.
       The tip ends up near the top-left corner of the bounding box.
       So position: div top-left = mouse position  →  tip is right at the pointer. */
    if(cursor){
        document.addEventListener('mousemove', e => {
            cursor.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
        });
    }

    /* ─── YOUTUBE PLAYER ─── */
    function initYT(){
        if(ytPlayer) return;
        const origin = (location.origin === 'file://' || location.origin === 'null')
            ? 'https://localhost' : location.origin;
        ytPlayer = new YT.Player('yt-player',{
            width:'1', height:'1',
            playerVars:{autoplay:0, controls:0, origin: origin},
            events:{
                onReady(){ ytReady = true; console.log('[NaberLa] YT Ready'); },
                onStateChange(e){
                    if(e.data === YT.PlayerState.ENDED) nextTrack();
                    if(e.data === YT.PlayerState.PLAYING){
                        playing = true; btnPP.textContent = '⏸';
                        try{ songTitle.textContent = ytPlayer.getVideoData().title || 'YouTube'; }catch(x){}
                    }
                },
                onError(e){ console.warn('[NaberLa] YT Error',e.data); nextTrack(); }
            }
        });
    }
    // Race-safe: init now if API already loaded, otherwise set callback
    if(typeof YT !== 'undefined' && YT.Player) initYT();
    window.onYouTubeIframeAPIReady = initYT;

    /* ─── MUSIC ─── */
    function ytId(url){
        const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([^#&?]{11})/);
        return m ? m[1] : null;
    }

    function playTrack(idx){
        if(!cfg.music.length){ songTitle.textContent='No music'; return; }
        trackIdx = ((idx % cfg.music.length) + cfg.music.length) % cfg.music.length;
        const url = cfg.music[trackIdx];
        try{ audio.pause(); }catch(e){}
        try{ if(ytReady && ytPlayer.stopVideo) ytPlayer.stopVideo(); }catch(e){}

        const vid = ytId(url);
        if(vid){
            mode = 'youtube';
            ytLink.href = url; ytLink.style.display = 'inline-flex';
            songTitle.textContent = 'Loading…';
            if(ytReady && ytPlayer.loadVideoById){
                ytPlayer.loadVideoById(vid);
                ytPlayer.setVolume(muted ? 0 : 50);
            } else {
                setTimeout(()=>playTrack(idx), 800);
            }
        } else {
            mode = 'html';
            ytLink.style.display = 'none';
            songTitle.textContent = url.split('/').pop().split('?')[0];
            audio.src = url;
            audio.volume = muted ? 0 : 0.5;
            audio.play().catch(()=>{});
        }
        playing = true; btnPP.textContent = '⏸';
    }

    function togglePP(){
        if(mode==='youtube' && ytReady && ytPlayer){
            const s = ytPlayer.getPlayerState();
            if(s===YT.PlayerState.PLAYING){ ytPlayer.pauseVideo(); playing=false; btnPP.textContent='▶'; }
            else { ytPlayer.playVideo(); playing=true; btnPP.textContent='⏸'; }
        } else if(mode==='html'){
            if(audio.paused){ audio.play(); playing=true; btnPP.textContent='⏸'; }
            else { audio.pause(); playing=false; btnPP.textContent='▶'; }
        }
    }
    function nextTrack(){ playTrack(trackIdx+1); }
    function prevTrack(){ playTrack(trackIdx-1); }
    function toggleMute(){
        muted = !muted;
        if(mode==='youtube' && ytReady && ytPlayer.setVolume) ytPlayer.setVolume(muted?0:50);
        audio.volume = muted ? 0 : 0.5;
        btnMute.textContent = muted ? '🔇' : '🔊';
    }

    audio.addEventListener('ended', nextTrack);
    btnPP.addEventListener('click', togglePP);
    btnNext.addEventListener('click', nextTrack);
    btnPrev.addEventListener('click', prevTrack);
    btnMute.addEventListener('click', toggleMute);

    /* ─── NO-REPEAT SHUFFLE ─── */
    let pool = [];
    function nextImage(){
        if(!pool.length){
            pool = [...cfg.images];
            for(let i=pool.length-1;i>0;i--){
                const j=Math.floor(Math.random()*(i+1));
                [pool[i],pool[j]]=[pool[j],pool[i]];
            }
        }
        return pool.pop();
    }

    /* ─── RENDER CARDS (Staggered Dynamic Row Spans) ─── */
    let rendered = 0;
    function addCards(n){
        if(!cfg.images.length) return;
        for(let i=0;i<n;i++){
            rendered++;
            const img = nextImage();
            if(!img) continue;
            const el = document.createElement('article');

            // 2 & 3 Column Wide Cards
            const r = Math.random();
            let colSpan = 1;
            if(r > 0.85)      { el.className = 'card span3'; colSpan = 3; }
            else if(r > 0.52) { el.className = 'card span2'; colSpan = 2; }
            else               { el.className = 'card'; colSpan = 1; }

            // Staggered dynamic row span calculation from image aspect ratio
            const w = img.w || img.width || 736;
            const h = img.h || img.height || 1000;
            const ratio = h / w;
            const colWidth = ((window.innerWidth || 1400) - 60) / 5 * colSpan;
            const estHeight = colWidth * ratio;
            const rowSpan = Math.max(16, Math.min(85, Math.ceil((estHeight + 10) / (8 + 10))));
            el.style.gridRowEnd = `span ${rowSpan}`;

            const src = img.u.replace(/\/(?:236x|474x|736x)\//,'/originals/');
            el.innerHTML = `<img src="${src}" alt="" loading="lazy">` +
                (img.l ? `<div class="card-overlay">🔗 View</div>` : '');

            // Fine-tune row span when image loads
            const imgEl = el.querySelector('img');
            if(imgEl){
                imgEl.onload = () => {
                    if(imgEl.naturalWidth > 0){
                        const exactRatio = imgEl.naturalHeight / imgEl.naturalWidth;
                        const exactHeight = colWidth * exactRatio;
                        const exactSpan = Math.max(16, Math.min(95, Math.ceil((exactHeight + 10) / (8 + 10))));
                        el.style.gridRowEnd = `span ${exactSpan}`;
                    }
                };
            }

            if(img.l) el.addEventListener('click',()=>window.open(img.l,'_blank'));
            el.addEventListener('mouseenter',()=>hovering=true);
            el.addEventListener('mouseleave',()=>hovering=false);
            feed.appendChild(el);
        }
    }
    addCards(18);

    /* ─── AUTO-SCROLL (Ultra Smooth 60fps Easing) ─── */
    let lastTime = 0;
    function tick(now){
        if(!lastTime) lastTime = now;
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        const target = !entered ? 1.0 :
                        (hovering || scrollPaused) ? 0 :
                        (parseFloat(speedSlider.value)||3) * 0.75;
        
        // Ultra-smooth lerp easing to prevent abrupt speed jumps
        speed += (target - speed) * 0.03;
        scrollAcc += speed * 60 * dt;

        if(scrollAcc >= 1){
            const px = Math.floor(scrollAcc);
            window.scrollBy(0, px);
            scrollAcc -= px;
        }

        // Infinite scroll
        if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 900 && !loading){
            loading = true;
            setTimeout(()=>{ addCards(6); loading=false; }, 60);
        }
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    /* ─── PLAY BUTTON / CURTAIN ─── */
    playBtn.addEventListener('click', e => {
        e.preventDefault();
        entered = true;
        overlay.classList.add('lifted');
        setTimeout(()=>{ overlay.style.display='none'; },950);
        playTrack(0);
    });

    /* ─── SCROLL CONTROL ─── */
    btnScrollPP.addEventListener('click',()=>{
        scrollPaused = !scrollPaused;
        btnScrollPP.textContent = scrollPaused ? '▶' : '⏸';
    });
    speedSlider.addEventListener('input',()=>{
        cfg.speed = speedSlider.value;
        try{ localStorage.setItem('naberlaConfig', JSON.stringify(cfg)); }catch(e){}
    });

    /* ─── CONTACT MODAL ─── */
    if(contactOpen) contactOpen.addEventListener('click',()=>contactModal.style.display='flex');
    if(contactClose) contactClose.addEventListener('click',()=>contactModal.style.display='none');

    /* ─── WHEEL PAUSE ─── */
    let wheelTimer;
    window.addEventListener('wheel',()=>{
        hovering=true;
        clearTimeout(wheelTimer);
        wheelTimer=setTimeout(()=>{hovering=!!document.querySelector('.card:hover');},1200);
    });

})();
