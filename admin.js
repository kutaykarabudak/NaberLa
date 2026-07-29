document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const adminDashboard = document.getElementById('admin-dashboard');
    
    document.getElementById('login-btn').addEventListener('click', () => {
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;
        if(u === 'admin' && p === '123456') {
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
            'https://www.youtube.com/watch?v=5qap5aO4i9A' // Lofi/chill example
        ],
        images: [
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1529139574466-a303027c028b?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800'
        ]
    };

    let config = JSON.parse(localStorage.getItem('naberlaConfig'));
    // Migration: If config exists but music is string, convert to array
    if(config && typeof config.music === 'string') {
        config.music = [config.music];
        saveData();
    }
    if(!config) config = defaultConfig;

    function saveData() {
        localStorage.setItem('naberlaConfig', JSON.stringify(config));
    }

    function loadData() {
        const speedEl = document.getElementById('scroll-speed');
        
        speedEl.value = config.speed;
        document.getElementById('speed-display').innerText = config.speed;

        speedEl.addEventListener('input', (e) => {
            config.speed = e.target.value;
            document.getElementById('speed-display').innerText = config.speed;
            saveData();
        });

        renderImages();
        renderMusic();
    }

    // Image Handlers
    document.getElementById('add-image-btn').addEventListener('click', () => {
        const input = document.getElementById('new-image-url');
        if(input.value.trim() !== '') {
            config.images.push(input.value.trim());
            input.value = '';
            saveData();
            renderImages();
        }
    });

    function renderImages() {
        const list = document.getElementById('image-list');
        list.innerHTML = '';
        config.images.forEach((url, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-content">
                    <img src="${url}" alt="thumb" onerror="this.src='https://via.placeholder.com/40'">
                    <span style="overflow:hidden; text-overflow:ellipsis;">${url}</span>
                </div>
                <button class="btn delete-btn" data-type="img" data-index="${index}">Delete</button>
            `;
            list.appendChild(li);
        });
        bindDeleteButtons();
    }

    // Music Handlers
    document.getElementById('add-music-btn').addEventListener('click', () => {
        const input = document.getElementById('new-music-url');
        if(input.value.trim() !== '') {
            if(!config.music) config.music = [];
            config.music.push(input.value.trim());
            input.value = '';
            saveData();
            renderMusic();
        }
    });

    function renderMusic() {
        const list = document.getElementById('music-list');
        list.innerHTML = '';
        if(!config.music) config.music = [];
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
        bindDeleteButtons();
    }

    function bindDeleteButtons() {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            // Remove old listeners to prevent duplicates
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                const type = e.target.getAttribute('data-type');
                if(type === 'img') {
                    config.images.splice(index, 1);
                    renderImages();
                } else if(type === 'music') {
                    config.music.splice(index, 1);
                    renderMusic();
                }
                saveData();
            });
        });
    }
});
