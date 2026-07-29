document.addEventListener('DOMContentLoaded', () => {
    const startOverlay = document.getElementById('start-overlay');
    const enterBtn = document.getElementById('enter-btn');
    const bgMusic = document.getElementById('bg-music');
    const musicSrc = document.getElementById('music-src');
    const muteBtn = document.getElementById('mute-btn');
    const feedContainer = document.getElementById('feed-container');
    
    let isMuted = false;
    let isLoading = false;
    let scrollInterval;

    // Load Configuration from localStorage
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
    
    // Apply music config
    musicSrc.src = config.music;
    bgMusic.load();

    // Render Posts
    const renderPosts = (count = 10) => {
        if(config.images.length === 0) return; // No images available
        
        for(let i=0; i<count; i++) {
            // Pick a random image from the config
            const randomImage = config.images[Math.floor(Math.random() * config.images.length)];
            const article = document.createElement('article');
            article.className = 'post';
            
            // Mock username
            const id = Math.floor(Math.random() * 1000);
            const usernames = ['model.life', 'vogue.dreamer', 'style.muse', 'runway_star'];
            const username = usernames[Math.floor(Math.random() * usernames.length)];

            article.onclick = () => window.open('https://www.instagram.com/', '_blank');
            article.innerHTML = `
                <img src="${randomImage}" alt="Instagram Post" loading="lazy">
                <div class="post-info">
                    <img src="https://i.pravatar.cc/150?u=${id}" alt="${username}" class="avatar">
                    <div class="user-details">
                        <h3>@${username}</h3>
                        <p>Fashion | Lifestyle</p>
                    </div>
                </div>
            `;
            feedContainer.appendChild(article);
        }
    };

    // Initial load
    renderPosts(12);

    // Initialization / Autoplay policy handling
    enterBtn.addEventListener('click', () => {
        startOverlay.classList.add('hidden');
        bgMusic.volume = 0.5;
        bgMusic.play().catch(e => console.log("Audio play failed:", e));
        startAutoScroll();
    });

    // Mute/Unmute
    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        bgMusic.muted = isMuted;
        if(isMuted) {
            muteBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
        } else {
            muteBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
        }
    });

    // Auto-Scroll Logic
    function startAutoScroll() {
        const speedMultiplier = parseInt(config.speed) || 3;
        // speed mapped to pixel increments per frame (approx 60fps)
        const pixelsPerFrame = speedMultiplier * 0.5; 
        
        function scrollLoop() {
            window.scrollBy(0, pixelsPerFrame);
            
            // Check for bottom to load more
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 800) {
                if(!isLoading) {
                    isLoading = true;
                    setTimeout(() => {
                        renderPosts(8);
                        isLoading = false;
                    }, 100);
                }
            }
            scrollInterval = requestAnimationFrame(scrollLoop);
        }
        scrollInterval = requestAnimationFrame(scrollLoop);
    }

    // Pause auto-scroll on manual interaction
    let scrollTimeout;
    window.addEventListener('wheel', () => {
        cancelAnimationFrame(scrollInterval);
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            startAutoScroll();
        }, 1500); // Resume auto-scroll after 1.5s of no manual scrolling
    });
});
