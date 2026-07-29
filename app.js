document.addEventListener('DOMContentLoaded', () => {
    const startOverlay = document.getElementById('start-overlay');
    const enterBtn = document.getElementById('enter-btn');
    const feedContainer = document.getElementById('feed-container');
    
    // Player DOM
    const htmlAudio = document.getElementById('html-audio');
    const btnPlayPause = document.getElementById('ctrl-playpause');
    const btnNext = document.getElementById('ctrl-next');
    const btnMute = document.getElementById('ctrl-mute');
    const titleEl = document.getElementById('current-song-title');
    const ytLinkEl = document.getElementById('yt-link');

    let isLoading = false;
    let scrollInterval;
    let isHovering = false; // To pause auto-scroll

    // Config
    let config = JSON.parse(localStorage.getItem('naberlaConfig')) || { speed: 3, music: [], images: [] };
    if(!config.images || config.images.length === 0) {
        config.images = ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800']; // fallback
    }
    
    // MUSIC PLAYER LOGIC
    let currentTrackIndex = 0;
    let isPlaying = false;
    let isMuted = false;
    let ytPlayer = null;
    let isYtReady = false;
    let currentMode = 'none'; // 'youtube' or 'html'

    const SVG_PLAY = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    const SVG_PAUSE = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
    const SVG_UNMUTED = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
    const SVG_MUTED = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';

    // Initialize YouTube API
    window.onYouTubeIframeAPIReady = function() {
        // Use a dummy origin if running on local file system to bypass some YT restrictions
        const originUrl = (window.location.origin === 'file://' || window.location.origin === 'null') 
            ? 'https://localhost' 
            : window.location.origin;

        ytPlayer = new YT.Player('yt-player', {
            height: '0', width: '0',
            playerVars: { 
                'autoplay': 0, 
                'controls': 0, 
                'origin': originUrl 
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
    };

    function onPlayerError(event) {
        console.log("YouTube Player Error:", event.data);
        titleEl.innerText = "Error playing YouTube video";
        playNextTrack(); // Skip to next track on error
    }

    function onPlayerReady(event) {
        isYtReady = true;
    }

    function onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) {
            playNextTrack();
        }
        if (event.data === YT.PlayerState.PLAYING) {
            updatePlayBtn(true);
            titleEl.innerText = ytPlayer.getVideoData().title || "YouTube Audio";
        }
    }

    htmlAudio.addEventListener('ended', playNextTrack);
    htmlAudio.addEventListener('play', () => updatePlayBtn(true));
    htmlAudio.addEventListener('pause', () => updatePlayBtn(false));

    function getYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function playTrack(index) {
        if(!config.music || config.music.length === 0) {
            titleEl.innerText = "No music in playlist";
            return;
        }
        currentTrackIndex = index % config.music.length;
        const url = config.music[currentTrackIndex];
        
        // Stop current
        htmlAudio.pause();
        if(isYtReady && ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo();

        const ytId = getYouTubeId(url);
        if(ytId) {
            currentMode = 'youtube';
            ytLinkEl.href = url;
            ytLinkEl.classList.remove('hidden');
            titleEl.innerText = "Loading YouTube...";
            if(isYtReady) {
                ytPlayer.loadVideoById(ytId);
                ytPlayer.setVolume(isMuted ? 0 : 50);
                ytPlayer.playVideo();
            } else {
                // Try again shortly if API not loaded
                setTimeout(() => playTrack(index), 500);
            }
        } else {
            currentMode = 'html';
            ytLinkEl.classList.add('hidden');
            titleEl.innerText = url.split('/').pop();
            htmlAudio.src = url;
            htmlAudio.volume = isMuted ? 0 : 0.5;
            htmlAudio.play().catch(e=>console.log("Audio play error", e));
        }
        isPlaying = true;
    }

    function togglePlayPause() {
        if(currentMode === 'youtube' && isYtReady) {
            const state = ytPlayer.getPlayerState();
            if(state === YT.PlayerState.PLAYING) {
                ytPlayer.pauseVideo();
                updatePlayBtn(false);
            } else {
                ytPlayer.playVideo();
                updatePlayBtn(true);
            }
        } else if(currentMode === 'html') {
            if(htmlAudio.paused) {
                htmlAudio.play();
                updatePlayBtn(true);
            } else {
                htmlAudio.pause();
                updatePlayBtn(false);
            }
        }
    }

    function playNextTrack() {
        playTrack(currentTrackIndex + 1);
    }

    function toggleMute() {
        isMuted = !isMuted;
        if(currentMode === 'youtube' && isYtReady) {
            ytPlayer.setVolume(isMuted ? 0 : 50);
        }
        htmlAudio.volume = isMuted ? 0 : 0.5;
        btnMute.innerHTML = isMuted ? SVG_MUTED : SVG_UNMUTED;
    }

    function updatePlayBtn(playing) {
        isPlaying = playing;
        btnPlayPause.innerHTML = playing ? SVG_PAUSE : SVG_PLAY;
    }

    btnPlayPause.addEventListener('click', togglePlayPause);
    btnNext.addEventListener('click', playNextTrack);
    btnMute.addEventListener('click', toggleMute);

    // RENDER POSTS
    const renderPosts = (count = 10) => {
        if(config.images.length === 0) return; 
        
        for(let i=0; i<count; i++) {
            const randomImage = config.images[Math.floor(Math.random() * config.images.length)];
            const article = document.createElement('article');
            article.className = 'post';
            
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
            
            // Hover-to-pause logic
            article.addEventListener('mouseenter', () => isHovering = true);
            article.addEventListener('mouseleave', () => isHovering = false);

            feedContainer.appendChild(article);
        }
    };

    // Initial load
    renderPosts(12);

    // Initialization 
    enterBtn.addEventListener('click', () => {
        startOverlay.classList.add('hidden');
        playTrack(0);
        startAutoScroll();
    });

    // Auto-Scroll Logic
    function startAutoScroll() {
        const speedMultiplier = parseInt(config.speed) || 3;
        const pixelsPerFrame = speedMultiplier * 0.5; 
        
        function scrollLoop() {
            if(!isHovering) {
                window.scrollBy(0, pixelsPerFrame);
            }
            
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
        }, 1500); 
    });
});
