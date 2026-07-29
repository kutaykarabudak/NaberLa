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
    } else {
        loadData();
    }

    function showDashboard() {
        loginContainer.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        loadData();
    }

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

    if (!config) {
        config = JSON.parse(JSON.stringify(defaultConfig));
    } else {
        if (typeof config.speed === 'undefined') config.speed = defaultConfig.speed;
        if (!config.images || config.images.length === 0) {
            config.images = JSON.parse(JSON.stringify(defaultConfig.images));
        }
        config.images = config.images.map(img => typeof img === 'string' ? { imgUrl: img, link: '', width: 0, height: 0 } : img);

        if (!config.music || config.music.length === 0) config.music = [...defaultConfig.music];
    }
    
    saveData();

    function saveData() {
        localStorage.setItem('naberlaConfig', JSON.stringify(config));
    }

    function loadData() {
        analyzeDimensions();
        renderMusic();
    }

    // Measure dimensions for all images
    async function analyzeDimensions() {
        let updated = false;
        await Promise.all(config.images.map(item => {
            return new Promise((resolve) => {
                if (item.width && item.height) { resolve(); return; }
                const img = new Image();
                img.onload = () => {
                    item.width = img.naturalWidth;
                    item.height = img.naturalHeight;
                    updated = true;
                    resolve();
                };
                img.onerror = () => {
                    item.width = item.width || 736;
                    item.height = item.height || 1000;
                    resolve();
                };
                img.src = item.imgUrl;
            });
        }));

        if (updated) saveData();
        renderImages();
    }

    // Sort Images Handler
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

    // Add Image Handler
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

    function renderImages() {
        const tableBody = document.getElementById('image-table-body');
        const header = document.getElementById('image-count-header');
        if (header) header.innerText = `Image Feed Links (${config.images.length} HD images)`;

        if (!tableBody) return;
        tableBody.innerHTML = '';

        config.images.forEach((item, index) => {
            const tr = document.createElement('tr');
            
            const w = item.width || 736;
            const h = item.height || 1000;
            const pixels = w * h;
            
            let badgeClass = 'sd';
            let badgeText = 'SD';
            if (pixels >= 1500000 || w >= 1000) {
                badgeClass = 'hd4k';
                badgeText = '4K Ultra HD';
            } else if (pixels >= 600000 || w >= 700) {
                badgeClass = 'fhd';
                badgeText = 'Full HD';
            }

            tr.innerHTML = `
                <td style="padding:8px;">
                    <img src="${item.imgUrl}" alt="thumb" style="width:45px; height:45px; object-fit:cover; border-radius:6px;" onerror="this.src='https://via.placeholder.com/45'">
                </td>
                <td style="padding:8px; max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#fff;">
                    <a href="${item.imgUrl}" target="_blank" style="color:#818cf8;">${item.imgUrl}</a>
                </td>
                <td style="padding:8px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#aaa;">
                    ${item.link ? `<a href="${item.link}" target="_blank" style="color:#aaa;">🔗 ${item.link}</a>` : '—'}
                </td>
                <td style="padding:8px; font-weight:600; color:#e0af96;">
                    ${w} × ${h} px
                </td>
                <td style="padding:8px;">
                    <span class="quality-badge ${badgeClass}">${badgeText}</span>
                </td>
                <td style="padding:8px; text-align:right;">
                    <button class="delete-btn" data-type="img" data-index="${index}">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Music Handlers
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
            li.innerHTML = `
                <div class="item-content">
                    <span style="overflow:hidden; text-overflow:ellipsis; color:#fff;">🎵 ${url}</span>
                </div>
                <button class="btn delete-btn" data-type="music" data-index="${index}">Delete</button>
            `;
            list.appendChild(li);
        });
    }

    // Delete delegation
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

    // Multi-Proxy Fetcher
    async function fetchWithProxy(targetUrl) {
        const proxies = [
            url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
            url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
        ];

        for (let i = 0; i < proxies.length; i++) {
            try {
                const proxyUrl = proxies[i](targetUrl);
                const res = await fetch(proxyUrl);
                if (res.ok) {
                    const text = await res.text();
                    if (text && text.length > 50) return text;
                }
            } catch(err) {
                console.warn(`Proxy ${i+1} failed:`, err);
            }
        }
        throw new Error("Could not reach Pinterest link via proxy.");
    }

    // Pinterest Scraper with Original HD resolution extraction
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
        progressBar.style.width = '25%';
        statusLabel.textContent = "Connecting to Pinterest proxy...";

        let rawImages = [];

        try {
            const htmlText = await fetchWithProxy(inputUrl);
            progressBar.style.width = '55%';
            statusLabel.textContent = "Extracting high-res images...";

            if (htmlText.includes('<rss') || htmlText.includes('<feed')) {
                const parser = new DOMParser();
                const xml = parser.parseFromString(htmlText, "text/xml");
                const items = xml.querySelectorAll("item");
                items.forEach(item => {
                    const desc = item.querySelector("description") ? item.querySelector("description").textContent : "";
                    const link = item.querySelector("link") ? item.querySelector("link").textContent : "";
                    const srcMatch = desc.match(/src="([^"]+)"/);
                    if (srcMatch && srcMatch[1]) {
                        const origUrl = srcMatch[1].replace(/\/(?:236x|474x|736x)\//, '/originals/');
                        rawImages.push({ imgUrl: origUrl, link: link, width: 0, height: 0 });
                    }
                });
            } else {
                const matches = htmlText.match(/https:\/\/i\.pinimg\.com\/(?:736x|originals|474x|236x)\/[a-zA-Z0-9_\-\/]+\.(?:jpg|png|webp)/g) || [];
                const uniqueUrls = new Set();
                matches.forEach(url => {
                    if (!url.includes('user/') && !url.includes('default_')) {
                        uniqueUrls.add(url.replace(/\/(?:236x|474x|736x)\//, '/originals/'));
                    }
                });

                const boardMatch = htmlText.match(/https:\/\/(?:[a-z]+\.)?pinterest\.com\/([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)\/?/);
                if (boardMatch && boardMatch[1] && !boardMatch[1].startsWith('pin/')) {
                    statusLabel.textContent = `Found Board (${boardMatch[1]}). Fetching RSS...`;
                    try {
                        const rssText = await fetchWithProxy('https://www.pinterest.com/' + boardMatch[1] + '.rss');
                        const parser = new DOMParser();
                        const xml = parser.parseFromString(rssText, "text/xml");
                        const items = xml.querySelectorAll("item");
                        items.forEach(item => {
                            const desc = item.querySelector("description") ? item.querySelector("description").textContent : "";
                            const link = item.querySelector("link") ? item.querySelector("link").textContent : "";
                            const srcMatch = desc.match(/src="([^"]+)"/);
                            if (srcMatch && srcMatch[1]) {
                                const origUrl = srcMatch[1].replace(/\/(?:236x|474x|736x)\//, '/originals/');
                                rawImages.push({ imgUrl: origUrl, link: link, width: 0, height: 0 });
                            }
                        });
                    } catch(e) {}
                }

                if (rawImages.length === 0 && uniqueUrls.size > 0) {
                    uniqueUrls.forEach(imgUrl => {
                        rawImages.push({ imgUrl: imgUrl, link: inputUrl, width: 0, height: 0 });
                    });
                }
            }

            progressBar.style.width = '85%';
            statusLabel.textContent = `Analyzing dimensions for ${rawImages.length} images...`;

            let newImages = [];
            await Promise.all(rawImages.map(imgData => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        imgData.width = img.naturalWidth;
                        imgData.height = img.naturalHeight;
                        if (img.naturalWidth >= 300 || img.naturalHeight >= 300) {
                            newImages.push(imgData);
                        }
                        resolve();
                    };
                    img.onerror = () => resolve();
                    img.src = imgData.imgUrl;
                });
            }));

            progressBar.style.width = '100%';

            if(newImages.length === 0) {
                statusLabel.textContent = "⚠️ No high-res images found.";
            } else {
                if(clearExisting) {
                    config.images = newImages;
                } else {
                    config.images = newImages.concat(config.images);
                }
                saveData();
                renderImages();
                statusLabel.textContent = `✅ Success! ${newImages.length} 4K HD images imported into database!`;
                document.getElementById('pinterest-url').value = '';
            }
        } catch (err) {
            statusLabel.textContent = "❌ Error: " + err.message;
        }
        
        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 3000);
        
        btn.innerHTML = 'Scan & Import';
        btn.disabled = false;
    });
});
