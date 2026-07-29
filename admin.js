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

    const defaultConfig = {
        speed: 3,
        music: [
            'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2d812bd15e.mp3?filename=house-music-111166.mp3',
            'https://www.youtube.com/watch?v=5qap5aO4i9A'
        ],
        images: [
            { "imgUrl": "https://i.pinimg.com/736x/b6/db/fb/b6dbfb14f13f92dd67201a4b6d53158d.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108236/" },
            { "imgUrl": "https://i.pinimg.com/736x/09/3a/53/093a534cc33a630c46c7e31c7fb24730.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108300/" },
            { "imgUrl": "https://i.pinimg.com/736x/18/09/27/180927c1c23bf6005f9e156d5b3fcddf.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108467/" },
            { "imgUrl": "https://i.pinimg.com/736x/14/aa/a1/14aaa1af7d9558d87ca7ee5c03c01420.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108484/" },
            { "imgUrl": "https://i.pinimg.com/736x/ba/09/c1/ba09c18936b35405ebaf6408a47996a1.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108414/" },
            { "imgUrl": "https://i.pinimg.com/736x/53/1d/89/531d89fcb64b7306ef1c527957b71463.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108346/" },
            { "imgUrl": "https://i.pinimg.com/736x/86/65/c4/8665c4cef8f0dd495f81c37ee39cf188.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108353/" },
            { "imgUrl": "https://i.pinimg.com/736x/67/9a/b8/679ab8e219838428b35d217cd789cae3.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108504/" },
            { "imgUrl": "https://i.pinimg.com/736x/15/e5/ab/15e5ab4f2f0d8f56c1d2cd5b79f9a5cb.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108523/" },
            { "imgUrl": "https://i.pinimg.com/736x/b1/54/fc/b154fc6ad0abb97bd7ee40585377f583.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108344/" },
            { "imgUrl": "https://i.pinimg.com/736x/2f/d0/44/2fd04426158b3c9773d06dd849e8a9d1.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108491/" },
            { "imgUrl": "https://i.pinimg.com/736x/71/8b/80/718b801cb33ecf9071f275cf3318371a.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108349/" },
            { "imgUrl": "https://i.pinimg.com/736x/a3/06/9c/a3069ce243c28813231834e87856e7ec.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108415/" },
            { "imgUrl": "https://i.pinimg.com/736x/55/c6/90/55c690881e279ce7a379bf4d16115ff4.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108470/" },
            { "imgUrl": "https://i.pinimg.com/736x/68/6c/09/686c095f25ad6b13b4259380449a4c38.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108519/" },
            { "imgUrl": "https://i.pinimg.com/736x/44/35/dd/4435dd22a211478e9249b89c5e458f22.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108503/" },
            { "imgUrl": "https://i.pinimg.com/736x/6a/b2/f9/6ab2f9c80e7f9a9008e726008bcec226.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108315/" },
            { "imgUrl": "https://i.pinimg.com/736x/e3/07/81/e307811462d0af5fdd9df164ae34d545.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108499/" },
            { "imgUrl": "https://i.pinimg.com/736x/55/1e/c2/551ec2ce2f28e990e4eae89901bca8e4.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108478/" },
            { "imgUrl": "https://i.pinimg.com/736x/27/4b/86/274b86945744824db8cf8c28958a81af.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108483/" },
            { "imgUrl": "https://i.pinimg.com/736x/d6/c6/07/d6c607c90e48886ba0f2d080217bd427.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108408/" },
            { "imgUrl": "https://i.pinimg.com/736x/49/f8/c3/49f8c3632573533f82ef876cd6a00445.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108302/" },
            { "imgUrl": "https://i.pinimg.com/736x/8f/3c/f9/8f3cf9a5c0e2346070c6d3e42f233068.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108475/" },
            { "imgUrl": "https://i.pinimg.com/736x/c0/46/39/c04639fc347b1a3cb1123528e9c13b21.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108492/" },
            { "imgUrl": "https://i.pinimg.com/736x/35/aa/52/35aa523c1c424a63049669d42256980d.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108507/" }
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
        // Bulletproof fallbacks & Migration
        if (typeof config.speed === 'undefined') config.speed = defaultConfig.speed;
        if (!config.images || config.images.length < 5 || (config.images[0] && config.images[0].imgUrl.includes('pinimg.com/736x/82/6b/b3'))) {
            config.images = JSON.parse(JSON.stringify(defaultConfig.images));
        }
        
        // Migrate legacy string images to objects
        config.images = config.images.map(img => typeof img === 'string' ? { imgUrl: img, link: '' } : img);

        if (!config.music) config.music = [...defaultConfig.music];
        else if (typeof config.music === 'string') config.music = [config.music];
    }
    
    // Always save normalized config back immediately
    saveData();

    function saveData() {
        localStorage.setItem('naberlaConfig', JSON.stringify(config));
    }

    function loadData() {
        renderImages();
        renderMusic();
    }

    // Image Handlers
    document.getElementById('add-image-btn').addEventListener('click', () => {
        const inputImg = document.getElementById('new-image-url');
        const inputTarget = document.getElementById('new-target-url');
        
        if(inputImg.value.trim() !== '') {
            config.images.push({
                imgUrl: inputImg.value.trim(),
                link: inputTarget.value.trim()
            });
            inputImg.value = '';
            inputTarget.value = '';
            saveData();
            renderImages();
        }
    });

    function renderImages() {
        const list = document.getElementById('image-list');
        list.innerHTML = '';
        config.images.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-content" style="flex-direction:column; align-items:flex-start;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${item.imgUrl}" alt="thumb" onerror="this.src='https://via.placeholder.com/40'">
                        <span style="overflow:hidden; text-overflow:ellipsis;">${item.imgUrl}</span>
                    </div>
                    ${item.link ? `<small style="color:#aaa;">🔗 Target: ${item.link}</small>` : ''}
                </div>
                <button class="btn delete-btn" data-type="img" data-index="${index}">Delete</button>
            `;
            list.appendChild(li);
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
        list.innerHTML = '';
        config.music.forEach((url, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-content">
                    <span style="overflow:hidden; text-overflow:ellipsis;">🎵 ${url}</span>
                </div>
                <button class="btn delete-btn" data-type="music" data-index="${index}">Delete</button>
            `;
            list.appendChild(li);
        });
    }

    // Event Delegation for Delete Buttons
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

    // Pinterest Auto-Scraper
    document.getElementById('scan-btn').addEventListener('click', async () => {
        let url = document.getElementById('pinterest-url').value.trim();
        if(!url) { alert("Please enter a Pinterest board URL"); return; }
        
        // Ensure it ends with .rss
        if (!url.endsWith('.rss')) {
            if (!url.endsWith('/')) url += '/';
            url += '.rss';
        }

        const statusLabel = document.getElementById('scan-status');
        const clearExisting = document.getElementById('clear-existing').checked;
        const btn = document.getElementById('scan-btn');
        
        btn.disabled = true;
        statusLabel.style.display = 'block';
        statusLabel.textContent = "Connecting to Pinterest via Proxy...";
        
        try {
            const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error("Network error or board is private.");
            
            const text = await response.text();
            statusLabel.textContent = "Parsing data...";
            
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "text/xml");
            
            const items = xml.querySelectorAll("item");
            let newImages = [];
            
            items.forEach(item => {
                const desc = item.querySelector("description") ? item.querySelector("description").textContent : "";
                const link = item.querySelector("link") ? item.querySelector("link").textContent : "";
                
                const srcMatch = desc.match(/src="([^"]+)"/);
                if (srcMatch && srcMatch[1]) {
                    const highRes = srcMatch[1].replace('236x', '736x').replace('474x', '736x');
                    newImages.push({ imgUrl: highRes, link: link });
                }
            });
            
            if(newImages.length === 0) {
                statusLabel.textContent = "No images found. Ensure board is public.";
            } else {
                if(clearExisting) {
                    config.images = newImages;
                } else {
                    config.images = config.images.concat(newImages);
                }
                saveData();
                renderImages();
                statusLabel.textContent = `Success! ${newImages.length} images imported.`;
                document.getElementById('pinterest-url').value = '';
            }
        } catch (err) {
            statusLabel.textContent = "Error: " + err.message;
        }
        btn.disabled = false;
    });
});
