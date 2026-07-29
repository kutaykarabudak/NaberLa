document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const adminDashboard = document.getElementById('admin-dashboard');
    
    document.getElementById('login-btn').addEventListener('click', () => {
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;
        if(u === 'admin' && p === '123') {
            sessionStorage.setItem('isAdmin', 'true');
            showDashboard();
        } else {
            document.getElementById('login-error').innerText = "Invalid credentials";
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        sessionStorage.removeItem('isAdmin');
        loginContainer.classList.remove('hidden');
        adminDashboard.classList.add('hidden');
    });

    if(sessionStorage.getItem('isAdmin') === 'true') {
        showDashboard();
    }

    function showDashboard() {
        loginContainer.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        loadData();
    }

    // ========== DEFAULT CONFIG ==========
    const defaultConfig = {
        speed: 3,
        music: [
            'https://www.youtube.com/watch?v=5qap5aO4i9A',
            'https://www.youtube.com/watch?v=jfKfPfyJRdk'
        ],
        images: [
            { "imgUrl": "https://i.pinimg.com/originals/b6/db/fb/b6dbfb14f13f92dd67201a4b6d53158d.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108236/", "width": 736, "height": 946 },
            { "imgUrl": "https://i.pinimg.com/originals/09/3a/53/093a534cc33a630c46c7e31c7fb24730.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108300/", "width": 736, "height": 946 },
            { "imgUrl": "https://i.pinimg.com/originals/18/09/27/180927c1c23bf6005f9e156d5b3fcddf.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108467/", "width": 736, "height": 946 },
            { "imgUrl": "https://i.pinimg.com/originals/14/aa/a1/14aaa1af7d9558d87ca7ee5c03c01420.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108484/", "width": 736, "height": 946 },
            { "imgUrl": "https://i.pinimg.com/originals/ba/09/c1/ba09c18936b35405ebaf6408a47996a1.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108414/", "width": 736, "height": 946 }
        ]
    };

    let config = null;
    try {
        config = JSON.parse(localStorage.getItem('naberlaConfig'));
    } catch(e) {
        console.error("Error parsing config", e);
    }

    if (!config || typeof config !== 'object') {
        config = JSON.parse(JSON.stringify(defaultConfig));
    }
    if (!config.music || !Array.isArray(config.music)) config.music = [...defaultConfig.music];
    if (!config.images || !Array.isArray(config.images) || config.images.length === 0) {
        config.images = JSON.parse(JSON.stringify(defaultConfig.images));
    }
    // Normalize image objects
    config.images = config.images.map(img => {
        if (typeof img === 'string') return { imgUrl: img, link: '', width: 0, height: 0 };
        return { imgUrl: img.imgUrl || '', link: img.link || '', width: img.width || 0, height: img.height || 0 };
    });
    if (typeof config.speed === 'undefined') config.speed = 3;
    
    saveData();

    function saveData() {
        localStorage.setItem('naberlaConfig', JSON.stringify(config));
    }

    function loadData() {
        renderMusic();
        analyzeDimensions();
    }

    // ========== DIMENSION ANALYZER ==========
    async function analyzeDimensions() {
        let updated = false;
        const promises = config.images.map(item => {
            return new Promise((resolve) => {
                if (item.width > 0 && item.height > 0) { resolve(); return; }
                const img = new Image();
                img.onload = () => {
                    item.width = img.naturalWidth;
                    item.height = img.naturalHeight;
                    updated = true;
                    resolve();
                };
                img.onerror = () => {
                    // Keep defaults
                    resolve();
                };
                img.src = item.imgUrl;
            });
        });

        await Promise.all(promises);
        if (updated) saveData();
        renderImages();
    }

    // ========== SORT IMAGES ==========
    const sortSelect = document.getElementById('sort-images-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const mode = sortSelect.value;
            if (mode === 'res-desc') {
                config.images.sort((a, b) => ((b.width || 0) * (b.height || 0)) - ((a.width || 0) * (a.height || 0)));
            } else if (mode === 'width-desc') {
                config.images.sort((a, b) => (b.width || 0) - (a.width || 0));
            } else if (mode === 'height-desc') {
                config.images.sort((a, b) => (b.height || 0) - (a.height || 0));
            }
            saveData();
            renderImages();
        });
    }

    // ========== ADD IMAGE ==========
    document.getElementById('add-image-btn').addEventListener('click', () => {
        const inputImg = document.getElementById('new-image-url');
        const inputTarget = document.getElementById('new-target-url');
        
        if(inputImg.value.trim() !== '') {
            const url = inputImg.value.trim().replace(/\/(?:236x|474x|736x)\//, '/originals/');
            config.images.unshift({
                imgUrl: url,
                link: inputTarget.value.trim(),
                width: 0,
                height: 0
            });
            inputImg.value = '';
            inputTarget.value = '';
            saveData();
            analyzeDimensions();
        }
    });

    // ========== RENDER IMAGE TABLE ==========
    function renderImages() {
        const tableBody = document.getElementById('image-table-body');
        const header = document.getElementById('image-count-header');
        if (header) header.innerText = `Image Feed (${config.images.length} images)`;

        if (!tableBody) return;
        tableBody.innerHTML = '';

        config.images.forEach((item, index) => {
            const tr = document.createElement('tr');
            
            const w = item.width || 0;
            const h = item.height || 0;
            const pixels = w * h;
            
            let badgeClass = 'sd';
            let badgeText = 'SD';
            if (pixels >= 1500000 || w >= 1000) {
                badgeClass = 'hd4k';
                badgeText = '4K HD';
            } else if (pixels >= 600000 || w >= 700) {
                badgeClass = 'fhd';
                badgeText = 'Full HD';
            }

            // Determine col-span suggestion
            let spanSuggestion = '1 col';
            if (w > 1200 && w > h * 1.3) spanSuggestion = '3 col';
            else if (w > 800 || (w > h * 1.1 && w > 600)) spanSuggestion = '2 col';

            tr.innerHTML = `
                <td style="padding:8px;">
                    <img src="${item.imgUrl}" alt="thumb" style="width:50px; height:50px; object-fit:cover; border-radius:6px;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22><rect fill=%22%23333%22 width=%2250%22 height=%2250%22/></svg>'">
                </td>
                <td style="padding:8px; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                    <a href="${item.imgUrl}" target="_blank" style="color:#818cf8; font-size:0.8rem;">${item.imgUrl.split('/').pop()}</a>
                </td>
                <td style="padding:8px; font-weight:600; color:#e0af96; font-size:0.9rem;">
                    ${w > 0 ? `${w} × ${h}` : 'Analyzing...'}
                </td>
                <td style="padding:8px;">
                    <span class="quality-badge ${badgeClass}">${badgeText}</span>
                </td>
                <td style="padding:8px; color:#94a3b8; font-size:0.8rem;">
                    ${spanSuggestion}
                </td>
                <td style="padding:8px; text-align:right;">
                    <button class="delete-btn" data-type="img" data-index="${index}">✕</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // ========== MUSIC HANDLERS ==========
    document.getElementById('add-music-btn').addEventListener('click', () => {
        const input = document.getElementById('new-music-url');
        if(input.value.trim() !== '') {
            config.music.push(input.value.trim());
            input.value = '';
            saveData();
            renderMusic();
        }
    });

    function renderMusic() {
        const list = document.getElementById('music-list');
        const header = document.getElementById('music-count-header');
        if (header) header.innerText = `Playlist (${config.music.length} songs)`;

        if (!list) return;
        list.innerHTML = '';
        config.music.forEach((url, index) => {
            const li = document.createElement('li');
            
            // Detect YouTube
            const ytMatch = url.match(/(?:youtu\.be\/|watch\?v=|&v=)([^#&?]{11})/);
            const isYt = !!ytMatch;
            
            li.innerHTML = `
                <div class="item-content">
                    <span style="color:${isYt ? '#ef4444' : '#4ade80'};">${isYt ? '▶ YouTube' : '♫ MP3'}</span>
                    <span style="overflow:hidden; text-overflow:ellipsis; color:#fff; max-width:300px;">${url}</span>
                </div>
                <button class="btn delete-btn" data-type="music" data-index="${index}">✕</button>
            `;
            list.appendChild(li);
        });
    }

    // ========== DELETE DELEGATION ==========
    document.querySelector('.admin-content').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const type = e.target.getAttribute('data-type');
            const index = parseInt(e.target.getAttribute('data-index'));
            if(type === 'img') {
                config.images.splice(index, 1);
                renderImages();
            } else if(type === 'music') {
                config.music.splice(index, 1);
                renderMusic();
            }
            saveData();
        }
    });

    // ========== MULTI-PROXY FETCHER ==========
    async function fetchWithProxy(targetUrl) {
        const proxies = [
            url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
            url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
        ];

        for (let i = 0; i < proxies.length; i++) {
            try {
                const proxyUrl = proxies[i](targetUrl);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);
                
                const res = await fetch(proxyUrl, { signal: controller.signal });
                clearTimeout(timeoutId);
                
                if (res.ok) {
                    const text = await res.text();
                    if (text && text.length > 100) return text;
                }
            } catch(err) {
                console.warn(`Proxy ${i+1} failed:`, err.message);
            }
        }
        throw new Error("All CORS proxies failed. Try a direct Pinterest board RSS link.");
    }

    // ========== RESOLVE SHORT LINKS (pin.it) ==========
    async function resolveShortLink(url) {
        if (!url.includes('pin.it/')) return url;
        
        try {
            // Try to resolve via allorigins which follows redirects
            const html = await fetchWithProxy(url);
            // Extract canonical URL from the resolved page
            const canonMatch = html.match(/property="og:url"\s+content="([^"]+)"/);
            if (canonMatch) return canonMatch[1];
            
            // Try to find board URL
            const boardMatch = html.match(/pinterest\.com\/([^"'\s]+\/[^"'\s]+)\/?/);
            if (boardMatch) return 'https://www.pinterest.com/' + boardMatch[1];
        } catch(e) {
            console.warn("Short link resolve failed:", e);
        }
        return url;
    }

    // ========== PINTEREST SCRAPER ==========
    document.getElementById('scan-btn').addEventListener('click', async () => {
        let inputUrl = document.getElementById('pinterest-url').value.trim();
        if(!inputUrl) { alert("Please enter a Pinterest URL"); return; }
        
        const statusLabel = document.getElementById('scan-status');
        const progressContainer = document.getElementById('scan-progress-container');
        const progressBar = document.getElementById('scan-progress-bar');
        const clearExisting = document.getElementById('clear-existing').checked;
        const btn = document.getElementById('scan-btn');
        
        btn.disabled = true;
        btn.innerHTML = '⏳ Scanning...';
        statusLabel.style.display = 'block';
        progressContainer.style.display = 'block';
        progressBar.style.width = '10%';
        statusLabel.textContent = "Resolving URL...";

        let rawImages = [];

        try {
            // Step 1: Resolve short links
            const resolvedUrl = await resolveShortLink(inputUrl);
            statusLabel.textContent = "Resolved: " + resolvedUrl.substring(0, 60) + "...";
            progressBar.style.width = '20%';

            // Step 2: Try RSS feed first (most reliable for boards)
            const boardMatch = resolvedUrl.match(/pinterest\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)\/?/);
            
            if (boardMatch && !boardMatch[1].startsWith('pin/')) {
                const boardPath = boardMatch[1].replace(/\/$/, '');
                statusLabel.textContent = `Board detected: ${boardPath}. Fetching RSS feed...`;
                progressBar.style.width = '35%';
                
                try {
                    const rssUrl = `https://www.pinterest.com/${boardPath}.rss`;
                    const rssText = await fetchWithProxy(rssUrl);
                    
                    if (rssText.includes('<rss') || rssText.includes('<item')) {
                        const parser = new DOMParser();
                        const xml = parser.parseFromString(rssText, "text/xml");
                        const items = xml.querySelectorAll("item");
                        
                        statusLabel.textContent = `Found ${items.length} items in RSS feed...`;
                        progressBar.style.width = '55%';
                        
                        items.forEach(item => {
                            const desc = item.querySelector("description") ? item.querySelector("description").textContent : "";
                            const link = item.querySelector("link") ? item.querySelector("link").textContent : "";
                            const srcMatch = desc.match(/src="([^"]+)"/);
                            if (srcMatch && srcMatch[1]) {
                                const origUrl = srcMatch[1].replace(/\/(?:236x|474x|736x)\//, '/originals/');
                                rawImages.push({ imgUrl: origUrl, link: link, width: 0, height: 0 });
                            }
                        });
                    }
                } catch(rssErr) {
                    console.warn("RSS failed:", rssErr);
                }
            }

            // Step 3: If RSS didn't work, try HTML scraping
            if (rawImages.length === 0) {
                statusLabel.textContent = "RSS unavailable, scraping HTML page...";
                progressBar.style.width = '40%';
                
                const htmlText = await fetchWithProxy(resolvedUrl);
                progressBar.style.width = '60%';
                
                // Extract pinimg URLs from HTML
                const matches = htmlText.match(/https:\/\/i\.pinimg\.com\/(?:originals|736x|474x|236x)\/[a-zA-Z0-9_\-\/]+\.(?:jpg|png|webp|gif)/g) || [];
                const uniqueUrls = new Set();
                
                matches.forEach(url => {
                    if (!url.includes('user/') && !url.includes('default_') && !url.includes('75x75')) {
                        uniqueUrls.add(url.replace(/\/(?:236x|474x|736x)\//, '/originals/'));
                    }
                });

                statusLabel.textContent = `Found ${uniqueUrls.size} unique images from HTML...`;
                
                uniqueUrls.forEach(imgUrl => {
                    rawImages.push({ imgUrl: imgUrl, link: resolvedUrl, width: 0, height: 0 });
                });
            }

            progressBar.style.width = '75%';
            statusLabel.textContent = `Analyzing dimensions for ${rawImages.length} images...`;

            // Step 4: Analyze dimensions and filter valid images
            let newImages = [];
            let analyzed = 0;
            
            await Promise.all(rawImages.map(imgData => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        imgData.width = img.naturalWidth;
                        imgData.height = img.naturalHeight;
                        analyzed++;
                        // Only keep images that are actual content (not tiny icons)
                        if (img.naturalWidth >= 200 && img.naturalHeight >= 200) {
                            newImages.push(imgData);
                        }
                        statusLabel.textContent = `Analyzed ${analyzed}/${rawImages.length} images (${newImages.length} valid)...`;
                        resolve();
                    };
                    img.onerror = () => {
                        analyzed++;
                        resolve();
                    };
                    img.src = imgData.imgUrl;
                });
            }));

            progressBar.style.width = '100%';

            if(newImages.length === 0) {
                statusLabel.textContent = "⚠️ No valid images found. Try a different Pinterest board URL.";
                statusLabel.style.color = '#facc15';
            } else {
                if(clearExisting) {
                    config.images = newImages;
                } else {
                    // Deduplicate
                    const existingUrls = new Set(config.images.map(i => i.imgUrl));
                    const uniqueNew = newImages.filter(i => !existingUrls.has(i.imgUrl));
                    config.images = uniqueNew.concat(config.images);
                }
                saveData();
                renderImages();
                statusLabel.textContent = `✅ Success! ${newImages.length} HD images imported!`;
                statusLabel.style.color = '#4ade80';
                document.getElementById('pinterest-url').value = '';
            }
        } catch (err) {
            statusLabel.textContent = "❌ Error: " + err.message;
            statusLabel.style.color = '#ef4444';
        }
        
        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 4000);
        
        btn.innerHTML = 'Scan & Import';
        btn.disabled = false;
    });
});
