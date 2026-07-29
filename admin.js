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
            { imgUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800', link: 'https://www.instagram.com/candiceswanepoel/' },
            { imgUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c028b?auto=format&fit=crop&q=80&w=800', link: 'https://www.instagram.com/romeestrijd/' },
            { imgUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800', link: 'https://www.instagram.com/taylor_hill/' },
            { imgUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800', link: 'https://www.instagram.com/gigihadid/' }
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
        if (!config.images || !Array.isArray(config.images)) config.images = JSON.parse(JSON.stringify(defaultConfig.images));
        
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
});
