/* NaberLa Admin v9 — Complete Rewrite */
(function(){
    "use strict";
    const $ = id => document.getElementById(id);

    /* ─── INITIALIZATION ─── */
    document.addEventListener('DOMContentLoaded', refresh);
    // Also run immediately if DOM is ready
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        refresh();
    }

    /* ─── CONFIG ─── */
    const DEFAULTS = {
        speed:3,
        music:['https://www.youtube.com/watch?v=5qap5aO4i9A','https://www.youtube.com/watch?v=jfKfPfyJRdk'],
        images:[
            {imgUrl:"https://i.pinimg.com/originals/b6/db/fb/b6dbfb14f13f92dd67201a4b6d53158d.jpg",link:"",width:736,height:946},
            {imgUrl:"https://i.pinimg.com/originals/09/3a/53/093a534cc33a630c46c7e31c7fb24730.jpg",link:"",width:736,height:946},
            {imgUrl:"https://i.pinimg.com/originals/18/09/27/180927c1c23bf6005f9e156d5b3fcddf.jpg",link:"",width:736,height:946},
            {imgUrl:"https://i.pinimg.com/originals/14/aa/a1/14aaa1af7d9558d87ca7ee5c03c01420.jpg",link:"",width:736,height:946},
            {imgUrl:"https://i.pinimg.com/originals/ba/09/c1/ba09c18936b35405ebaf6408a47996a1.jpg",link:"",width:736,height:946}
        ]
    };

    let cfg;
    try{
        cfg = JSON.parse(localStorage.getItem('naberlaConfig'));
        if(!cfg || typeof cfg !== 'object') throw 0;
    }catch(e){ cfg = null; }
    if(!cfg) cfg = JSON.parse(JSON.stringify(DEFAULTS));
    if(!Array.isArray(cfg.music)) cfg.music = [...DEFAULTS.music];
    if(!Array.isArray(cfg.images) || !cfg.images.length) cfg.images = JSON.parse(JSON.stringify(DEFAULTS.images));
    // normalize
    cfg.images = cfg.images.map(i => {
        if(typeof i === 'string') return {imgUrl:i, link:'', width:0, height:0};
        return {imgUrl: i.imgUrl||i.u||'', link: i.link||i.l||'', width: i.width||0, height: i.height||0};
    }).filter(i => i.imgUrl);
    save();

    function save(){ localStorage.setItem('naberlaConfig', JSON.stringify(cfg)); }

    /* ─── REFRESH ALL ─── */
    function refresh(){
        renderMusic();
        measureAndRender();
    }

    /* ─── MUSIC ─── */
    $('btn-add-music').addEventListener('click',()=>{
        const v = $('inp-music').value.trim();
        if(!v) return;
        cfg.music.push(v);
        $('inp-music').value='';
        save(); renderMusic();
    });

    function renderMusic(){
        const ul = $('music-list');
        $('music-h').textContent = `Playlist (${cfg.music.length})`;
        ul.innerHTML='';
        cfg.music.forEach((url,i)=>{
            const isYt = /youtu/.test(url);
            const li = document.createElement('li');
            li.innerHTML=`<span style="color:${isYt?'#ef4444':'#4ade80'}">${isYt?'▶ YT':'♫ MP3'}</span><span>${url}</span>`;
            const btn = document.createElement('button');
            btn.className='del-btn'; btn.textContent='✕';
            btn.onclick=()=>{ cfg.music.splice(i,1); save(); renderMusic(); };
            li.appendChild(btn);
            ul.appendChild(li);
        });
    }

    /* ─── IMAGES ─── */
    $('btn-add-img').addEventListener('click',()=>{
        const u = $('inp-img').value.trim();
        if(!u) return;
        cfg.images.unshift({imgUrl: u.replace(/\/(?:236x|474x|736x)\//,'/originals/'), link: $('inp-link').value.trim(), width:0, height:0});
        $('inp-img').value=''; $('inp-link').value='';
        save(); measureAndRender();
    });

    $('sort-sel').addEventListener('change',()=>{
        const v = $('sort-sel').value;
        if(v==='res') cfg.images.sort((a,b)=>(b.width*b.height)-(a.width*a.height));
        else if(v==='w') cfg.images.sort((a,b)=>b.width-a.width);
        else if(v==='h') cfg.images.sort((a,b)=>b.height-a.height);
        save(); renderImages();
    });

    async function measureAndRender(){
        let changed = false;
        await Promise.all(cfg.images.map(item=>new Promise(res=>{
            if(item.width>0 && item.height>0) return res();
            const img = new Image();
            img.onload=()=>{ item.width=img.naturalWidth; item.height=img.naturalHeight; changed=true; res(); };
            img.onerror=()=>res();
            img.src=item.imgUrl;
        })));
        if(changed) save();
        renderImages();
    }

    function renderImages(){
        const tbody = $('img-tbody');
        $('img-h').textContent = `Images (${cfg.images.length})`;
        tbody.innerHTML='';
        cfg.images.forEach((item,i)=>{
            const w=item.width||0, h=item.height||0, px=w*h;
            let bc='sd',bt='SD';
            if(px>=1500000||w>=1000){bc='hd';bt='4K HD';}
            else if(px>=600000||w>=700){bc='fhd';bt='Full HD';}
            const tr=document.createElement('tr');
            tr.innerHTML=`
                <td><img src="${item.imgUrl}" alt="" onerror="this.style.background='#333'"></td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                    <a href="${item.imgUrl}" target="_blank" style="color:#818cf8;">${item.imgUrl.split('/').pop()}</a>
                </td>
                <td style="color:var(--skin);font-weight:600;">${w?`${w}×${h}`:'…'}</td>
                <td><span class="badge ${bc}">${bt}</span></td>
                <td style="text-align:right;"></td>`;
            const btn=document.createElement('button');
            btn.className='del-btn'; btn.textContent='✕';
            btn.onclick=()=>{ cfg.images.splice(i,1); save(); renderImages(); };
            tr.lastElementChild.appendChild(btn);
            tbody.appendChild(tr);
        });
    }

    /* ─── PROXY FETCH ─── */
    async function proxyFetch(url){
        const proxies=[
            async u => {
                const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(u)}`);
                if(r.ok){ const d = await r.json(); return d.contents || ''; }
                throw new Error('allorigins failed');
            },
            async u => {
                const r = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(u)}`);
                if(r.ok) return await r.text();
                throw new Error('corsproxy failed');
            },
            async u => {
                const r = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`);
                if(r.ok) return await r.text();
                throw new Error('codetabs failed');
            }
        ];
        for(const p of proxies){
            try{
                const txt = await p(url);
                if(txt && txt.length > 50) return txt;
            }catch(e){ console.warn('proxy fail', e.message); }
        }
        throw new Error('All proxies failed. Try entering the full Pinterest board link (e.g. pinterest.com/username/boardname).');
    }

    /* ─── RESOLVE pin.it SHORT LINKS ─── */
    async function resolveUrl(url){
        if(!url.includes('pin.it/')) return url;
        try{
            // allorigins JSON API follows HTTP redirects and returns the final target URL in status.url
            const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            if(res.ok){
                const data = await res.json();
                if(data.status && data.status.url && data.status.url.includes('pinterest.com')){
                    console.log('Resolved pin.it via status.url:', data.status.url);
                    return data.status.url;
                }
                if(data.contents){
                    const m = data.contents.match(/property="og:url"\s+content="([^"]+)"/);
                    if(m) return m[1];
                    const m2 = data.contents.match(/pinterest\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/);
                    if(m2) return 'https://www.pinterest.com/' + m2[1];
                }
            }
        }catch(e){
            console.warn('Shortlink resolve failed:', e);
        }
        return url;
    }

    /* ─── PINTEREST SCANNER ─── */
    $('btn-scan').addEventListener('click', async()=>{
        const raw = $('inp-pin').value.trim();
        if(!raw){ alert('Enter a Pinterest URL'); return; }
        const msg=$('scan-msg'), bar=$('scan-bar'), wrap=$('scan-bar-wrap'), btn=$('btn-scan');
        const clear=$('chk-clear').checked;

        btn.disabled=true; btn.textContent='⏳ Scanning…';
        msg.style.display='block'; msg.style.color='#d8b4fe';
        wrap.style.display='block'; bar.style.width='10%';
        msg.textContent='Resolving URL…';

        let found=[];
        try{
            const resolved=await resolveUrl(raw);
            msg.textContent='Resolved: '+resolved.substring(0,50)+'…';
            bar.style.width='20%';

            // Try RSS first (boards)
            const boardMatch=resolved.match(/pinterest\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)\/?/);
            if(boardMatch && !boardMatch[1].startsWith('pin/')){
                const bp=boardMatch[1].replace(/\/$/,'');
                msg.textContent=`Board: ${bp} — Fetching RSS…`;
                bar.style.width='35%';
                try{
                    const rss=await proxyFetch('https://www.pinterest.com/'+bp+'.rss');
                    if(rss.includes('<item')){
                        const doc=new DOMParser().parseFromString(rss,'text/xml');
                        doc.querySelectorAll('item').forEach(item=>{
                            const desc=item.querySelector('description')?.textContent||'';
                            const link=item.querySelector('link')?.textContent||'';
                            const sm=desc.match(/src="([^"]+)"/);
                            if(sm) found.push({imgUrl:sm[1].replace(/\/(?:236x|474x|736x)\//,'/originals/'),link,width:0,height:0});
                        });
                    }
                }catch(e){ console.warn('RSS fail',e); }
            }

            // Fallback: scrape HTML
            if(!found.length){
                msg.textContent='Scraping HTML…';
                bar.style.width='45%';
                const html=await proxyFetch(resolved);
                const matches=html.match(/https:\/\/i\.pinimg\.com\/(?:originals|736x|474x|236x)\/[a-zA-Z0-9_\-\/]+\.(?:jpg|png|webp|gif)/g)||[];
                const uniq=new Set();
                matches.forEach(u=>{
                    if(!u.includes('user/')&&!u.includes('default_')&&!u.includes('75x75'))
                        uniq.add(u.replace(/\/(?:236x|474x|736x)\//,'/originals/'));
                });
                uniq.forEach(u=>found.push({imgUrl:u,link:resolved,width:0,height:0}));
            }

            bar.style.width='70%';
            msg.textContent=`Analyzing ${found.length} images…`;

            // Measure dimensions, filter tiny icons
            let valid=[];
            let done=0;
            await Promise.all(found.map(item=>new Promise(res=>{
                const img=new Image();
                img.onload=()=>{
                    item.width=img.naturalWidth; item.height=img.naturalHeight;
                    if(img.naturalWidth>=200&&img.naturalHeight>=200) valid.push(item);
                    done++;
                    msg.textContent=`Analyzed ${done}/${found.length} (${valid.length} valid)`;
                    res();
                };
                img.onerror=()=>{ done++; res(); };
                img.src=item.imgUrl;
            })));

            bar.style.width='100%';

            if(!valid.length){
                msg.textContent='⚠️ No valid images found.';
                msg.style.color='#facc15';
            } else {
                if(clear) cfg.images=valid;
                else {
                    const existing=new Set(cfg.images.map(i=>i.imgUrl));
                    cfg.images=valid.filter(i=>!existing.has(i.imgUrl)).concat(cfg.images);
                }
                save(); renderImages();
                msg.textContent=`✅ ${valid.length} HD images imported!`;
                msg.style.color='#4ade80';
                $('inp-pin').value='';
            }
        }catch(e){
            msg.textContent='❌ '+e.message;
            msg.style.color='#ef4444';
        }
        setTimeout(()=>{wrap.style.display='none';},3000);
        btn.textContent='Scan & Import'; btn.disabled=false;
    });

})();
