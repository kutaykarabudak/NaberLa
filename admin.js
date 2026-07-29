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
        music: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2d812bd15e.mp3?filename=house-music-111166.mp3',
        images: [
            'https://picsum.photos/seed/1/400/600',
            'https://picsum.photos/seed/2/600/400',
            'https://picsum.photos/seed/3/500/500',
            'https://picsum.photos/seed/4/400/800',
            'https://picsum.photos/seed/5/800/600',
            'https://picsum.photos/seed/6/500/700',
            'https://picsum.photos/seed/7/600/600',
            'https://picsum.photos/seed/8/400/500',
            'https://picsum.photos/seed/9/700/500'
        ]
    };

    let config = JSON.parse(localStorage.getItem('naberlaConfig')) || defaultConfig;

    function saveData() {
        localStorage.setItem('naberlaConfig', JSON.stringify(config));
    }

    function loadData() {
        const speedEl = document.getElementById('scroll-speed');
        const musicEl = document.getElementById('music-url');
        
        speedEl.value = config.speed;
        document.getElementById('speed-display').innerText = config.speed;
        musicEl.value = config.music;

        speedEl.addEventListener('input', (e) => {
            config.speed = e.target.value;
            document.getElementById('speed-display').innerText = config.speed;
            saveData();
        });

        musicEl.addEventListener('change', (e) => {
            config.music = e.target.value;
            saveData();
        });

        renderImages();
    }

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
                <button class="btn delete-btn" data-index="${index}">Delete</button>
            `;
            list.appendChild(li);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                config.images.splice(index, 1);
                saveData();
                renderImages();
            });
        });
    }
});
