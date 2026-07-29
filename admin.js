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
            { imgUrl: 'https://i.pinimg.com/736x/82/6b/b3/826bb3c72d371585ced968383b77b8b1.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/49/48/c6/4948c6be445d68f48115e4ca1dd55a0b.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/8c/1e/37/8c1e3751ddad8a8a334af0c642aed5ab.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/77/bb/03/77bb038dd44f4826acdbb9760c5cbd7e.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/dd/ff/93/ddff936573861ec90b9a2f02f00a971f.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/8a/97/61/8a9761a6daefb42ab774102dfa9a41ad.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/00/22/f9/0022f96edecf8f1bb4f3fe0d585890de.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/3c/32/77/3c3277d643902f7caf19713486d48b6f.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/b3/7b/ba/b37bba8d745479dc2aec22a2c29c4d7e.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/d9/ab/ee/d9abeec40f0add52fa1cf3742cc8f93f.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/2f/75/1e/2f751ece5231ba84d0bd9dd5bfe0dad8.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/9d/27/63/9d27636c36a209c8ad3641b42e4a5fc1.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/e0/c1/04/e0c104c98131f28c79f904f12c829130.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/9b/cf/e8/9bcfe8413e312a001cb5eed39983ce41.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/fb/42/d8/fb42d851861cca2d4d1fe930c259085b.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/d6/45/8e/d6458e53687a7bc14ee8637af1582fda.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/c8/32/a8/c832a833aa4cdd3f61cb4134b502c19b.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/21/de/f5/21def5615b425b9f59256d579020305f.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/39/2b/a2/392ba25f3b8fd871923e7a30ee3ebd4b.jpg', link: '' },
            { imgUrl: 'https://i.pinimg.com/736x/81/a4/cd/81a4cd5d2b9b212c8e81941a377cfa7b.jpg', link: '' }
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
        if (!config.images || config.images.length < 5 || (config.images[0] && config.images[0].imgUrl.includes('unsplash.com'))) {
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
});
