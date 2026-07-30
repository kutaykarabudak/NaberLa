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

    /* ─── PINTEREST DEEP BOARD SCRAPER (Full 250+ Pins with Real Links) ─── */
    async function scrapePinterestBoard(url, onProgress) {
        const pinMap = new Map(); // imgUrl -> { imgUrl, link, width: 0, height: 0 }
        let boardPath = '';
        
        const bm = url.match(/pinterest\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)\/?/);
        if (bm && !bm[1].startsWith('pin/')) {
            boardPath = bm[1].replace(/\/$/, '');
        }

        onProgress("Connecting to Pinterest API...");

        // 1. Fetch BoardFeedResource API with board_url & page_size 250 (Full 250+ pins per board!)
        if (boardPath) {
            let bookmark = null;
            let page = 1;
            
            do {
                onProgress(`Fetching API Page ${page} (${pinMap.size} total pins found)...`);
                try {
                    const apiOptions = {
                        board_url: `/${boardPath}/`,
                        page_size: 250
                    };
                    if (bookmark) apiOptions.bookmark = bookmark;

                    const apiUrl = `https://www.pinterest.com/resource/BoardFeedResource/get/?data=${encodeURIComponent(JSON.stringify({ options: apiOptions, context: {} }))}`;
                    const apiResText = await proxyFetch(apiUrl);
                    const apiJson = JSON.parse(apiResText);
                    
                    const resourceData = apiJson.resource_response?.data || [];
                    let newCount = 0;
                    
                    resourceData.forEach(pin => {
                        const origUrl = pin.images?.orig?.url || pin.images?.['736x']?.url || pin.images?.['474x']?.url;
                        if (origUrl) {
                            const hdUrl = origUrl.replace(/\/(?:236x|474x|736x)\//, '/originals/');
                            // Real Pin Link (Target website OR Pinterest Pin page)
                            const pinLink = pin.link || (pin.id ? `https://www.pinterest.com/pin/${pin.id}/` : `https://www.pinterest.com/${boardPath}/`);
                            if (!pinMap.has(hdUrl)) {
                                pinMap.set(hdUrl, { imgUrl: hdUrl, link: pinLink, width: 0, height: 0 });
                                newCount++;
                            }
                        }
                    });

                    bookmark = apiJson.resource_response?.bookmark || null;
                    console.log(`API Page ${page}: ${newCount} new pins. Bookmark:`, bookmark);
                    
                    if (newCount === 0 || !bookmark || bookmark === '-end-') break;
                    page++;
                } catch(err) {
                    console.warn(`API page ${page} error:`, err);
                    break;
                }
            } while (bookmark && page <= 10);
        }

        // 2. Fallback: Parse main HTML & embedded JSON state if API returned 0
        if (pinMap.size === 0) {
            onProgress("Parsing board HTML & embedded JSON state...");
            try {
                const fetchUrl = url.includes('pinterest.com') ? url : `https://www.pinterest.com/${boardPath}/`;
                const html = await proxyFetch(fetchUrl);
                
                const jsonMatches = html.match(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
                jsonMatches.forEach(scriptStr => {
                    try {
                        const jsonText = scriptStr.replace(/<[^>]+>/g, '');
                        if (jsonText.includes('images') || jsonText.includes('pinimg')) {
                            const pinIdMatches = jsonText.match(/"id":"(\d{15,20})"/g) || [];
                            const imageMatches = jsonText.match(/https:\/\/i\.pinimg\.com\/(?:originals|736x|474x|236x)\/[a-zA-Z0-9_\-\/]+\.(?:jpg|png|webp|gif)/g) || [];
                            
                            imageMatches.forEach((imgUrl, idx) => {
                                if (!imgUrl.includes('user/') && !imgUrl.includes('default_') && !imgUrl.includes('75x75')) {
                                    const hdUrl = imgUrl.replace(/\/(?:236x|474x|736x)\//, '/originals/');
                                    const rawId = pinIdMatches[idx] ? pinIdMatches[idx].replace(/"id":"|"/g, '') : null;
                                    const pinLink = rawId ? `https://www.pinterest.com/pin/${rawId}/` : (boardPath ? `https://www.pinterest.com/${boardPath}/` : url);
                                    if (!pinMap.has(hdUrl)) {
                                        pinMap.set(hdUrl, { imgUrl: hdUrl, link: pinLink, width: 0, height: 0 });
                                    }
                                }
                            });
                        }
                    } catch(e) {}
                });

                if (pinMap.size === 0) {
                    const matches = html.match(/https:\/\/i\.pinimg\.com\/(?:originals|736x|474x|236x)\/[a-zA-Z0-9_\-\/]+\.(?:jpg|png|webp|gif)/g) || [];
                    matches.forEach(u => {
                        if (!u.includes('user/') && !u.includes('default_') && !u.includes('75x75')) {
                            const hdUrl = u.replace(/\/(?:236x|474x|736x)\//, '/originals/');
                            const pinLink = boardPath ? `https://www.pinterest.com/${boardPath}/` : url;
                            if (!pinMap.has(hdUrl)) {
                                pinMap.set(hdUrl, { imgUrl: hdUrl, link: pinLink, width: 0, height: 0 });
                            }
                        }
                    });
                }
            } catch(e) {
                console.warn("HTML scrape fallback failed:", e);
            }
        }

        // 3. Fallback: RSS Feed if HTML found 0
        if (pinMap.size === 0 && boardPath) {
            onProgress("Fetching RSS feed fallback...");
            try {
                const rss = await proxyFetch(`https://www.pinterest.com/${boardPath}.rss`);
                if (rss.includes('<item')) {
                    const doc = new DOMParser().parseFromString(rss, 'text/xml');
                    doc.querySelectorAll('item').forEach(item => {
                        const desc = item.querySelector('description')?.textContent || '';
                        const link = item.querySelector('link')?.textContent || `https://www.pinterest.com/${boardPath}/`;
                        const sm = desc.match(/src="([^"]+)"/);
                        if (sm) {
                            const hdUrl = sm[1].replace(/\/(?:236x|474x|736x)\//, '/originals/');
                            if (!pinMap.has(hdUrl)) {
                                pinMap.set(hdUrl, { imgUrl: hdUrl, link: link, width: 0, height: 0 });
                            }
                        }
                    });
                }
            } catch(e) {}
        }

        return Array.from(pinMap.values());
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

        try{
            const resolved = await resolveUrl(raw);
            msg.textContent = 'Scanning board: ' + resolved.substring(0, 50) + '...';
            bar.style.width = '25%';

            const found = await scrapePinterestBoard(resolved, (statusText) => {
                msg.textContent = statusText;
            });

            bar.style.width = '70%';
            msg.textContent = `Analyzing dimensions for ${found.length} images…`;

            // Measure dimensions, filter tiny icons
            let valid = [];
            let done = 0;
            await Promise.all(found.map(item => new Promise(res => {
                const img = new Image();
                img.onload = () => {
                    item.width = img.naturalWidth; item.height = img.naturalHeight;
                    if(img.naturalWidth >= 200 && img.naturalHeight >= 200) valid.push(item);
                    done++;
                    msg.textContent = `Analyzed ${done}/${found.length} (${valid.length} HD valid)…`;
                    res();
                };
                img.onerror = () => { done++; res(); };
                img.src = item.imgUrl;
            })));

            bar.style.width = '100%';

            if(!valid.length){
                msg.textContent = '⚠️ No valid images found. Check the Pinterest board URL.';
                msg.style.color = '#facc15';
            } else {
                if(clear) cfg.images = valid;
                else {
                    const existing = new Set(cfg.images.map(i => i.imgUrl));
                    cfg.images = valid.filter(i => !existing.has(i.imgUrl)).concat(cfg.images);
                }
                save(); renderImages();
                msg.textContent = `✅ Success! ${valid.length} 4K HD images imported into database!`;
                msg.style.color = '#4ade80';
                $('inp-pin').value = '';
            }
        }catch(e){
            msg.textContent = '❌ ' + e.message;
            msg.style.color = '#ef4444';
        }
        setTimeout(() => { wrap.style.display = 'none'; }, 4000);
        btn.textContent = 'Scan & Import'; btn.disabled = false;
    });

})();
