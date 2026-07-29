document.addEventListener('DOMContentLoaded', () => {
    const startOverlay = document.getElementById('start-overlay');
    const enterBtn = document.getElementById('enter-btn');
    const feedContainer = document.getElementById('feed-container');
    
    // Player DOM
    const htmlAudio = document.getElementById('html-audio');
    const btnPlayPause = document.getElementById('ctrl-playpause');
    const btnNext = document.getElementById('ctrl-next');
    const btnPrev = document.getElementById('ctrl-prev');
    const btnMute = document.getElementById('ctrl-mute');
    const titleEl = document.getElementById('current-song-title');
    const ytLinkEl = document.getElementById('yt-link');
    const seekBar = document.getElementById('seek-bar');
    const timeCurrent = document.getElementById('time-current');
    const timeTotal = document.getElementById('time-total');
    const speedControl = document.getElementById('main-scroll-speed');
    const scrollPlayPauseBtn = document.getElementById('ctrl-scroll-playpause');
    const contactBtn = document.getElementById('contact-btn');
    const contactModal = document.getElementById('contact-modal');
    const closeContactBtn = document.getElementById('close-contact-btn');

    let isLoading = false;
    let scrollInterval;
    let isHovering = false; // To pause auto-scroll
    let isScrollManuallyPaused = false;

    // Config
    let config = JSON.parse(localStorage.getItem('naberlaConfig')) || { speed: 3, music: [], images: [] };
    
    const defaultImages = [
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
    ];

    // Migration for app side
    if (config.images) {
        config.images = config.images.map(img => typeof img === 'string' ? { imgUrl: img, link: '' } : img);
    }
    
    if(!config.images || config.images.length < 5 || (config.images[0] && config.images[0].imgUrl.includes('unsplash.com'))) {
        config.images = defaultImages;
        localStorage.setItem('naberlaConfig', JSON.stringify(config));
    }

    // Set initial speed UI
    speedControl.value = config.speed || 3;
    speedControl.addEventListener('change', () => {
        config.speed = speedControl.value;
        localStorage.setItem('naberlaConfig', JSON.stringify(config));
    });
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

    function playPrevTrack() {
        if(!config.music || config.music.length === 0) return;
        currentTrackIndex = (currentTrackIndex - 1 + config.music.length) % config.music.length;
        playTrack(currentTrackIndex);
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

    // Progress Bar Logic
    function formatTime(s) {
        if(isNaN(s)) return "0:00";
        const m = Math.floor(s / 60);
        const secs = Math.floor(s % 60).toString().padStart(2, '0');
        return `${m}:${secs}`;
    }

    setInterval(() => {
        if(!isPlaying) return;
        let cTime = 0, dur = 0;
        if(currentMode === 'youtube' && isYtReady && ytPlayer.getCurrentTime) {
            cTime = ytPlayer.getCurrentTime() || 0;
            dur = ytPlayer.getDuration() || 0;
        } else if(currentMode === 'html') {
            cTime = htmlAudio.currentTime;
            dur = htmlAudio.duration;
        }
        
        if(dur > 0) {
            seekBar.max = dur;
            seekBar.value = cTime;
            timeCurrent.innerText = formatTime(cTime);
            timeTotal.innerText = formatTime(dur);
        }
    }, 500);

    seekBar.addEventListener('input', (e) => {
        const t = parseFloat(e.target.value);
        if(currentMode === 'youtube' && isYtReady && ytPlayer.seekTo) {
            ytPlayer.seekTo(t, true);
        } else if(currentMode === 'html') {
            htmlAudio.currentTime = t;
        }
        timeCurrent.innerText = formatTime(t);
    });

    btnPlayPause.addEventListener('click', togglePlayPause);
    btnNext.addEventListener('click', playNextTrack);
    btnPrev.addEventListener('click', playPrevTrack);
    btnMute.addEventListener('click', toggleMute);

    function extractInstaUsername(url) {
        if (!url) return 'instagram';
        const match = url.match(/(?:instagram\.com\/)([A-Za-z0-9_.]+)/);
        return match ? match[1] : 'instagram';
    }

    // RENDER POSTS
    const renderPosts = (count = 10) => {
        if(config.images.length === 0) return; 
        
        const sizes = ['small', 'medium', 'large'];

        for (let i = 0; i < count; i++) {
            const randomItem = config.images[Math.floor(Math.random() * config.images.length)];
            const article = document.createElement('article');
            const sizeClass = sizes[Math.floor(Math.random() * sizes.length)];
            const isWide = Math.random() < 0.2 ? 'wide' : '';
            article.className = `post ${sizeClass} ${isWide}`;
            
            const instaUser = extractInstaUsername(randomItem.link);

            const isVideo = randomItem.imgUrl.match(/\.(mp4|webm|ogg)$/i);
            const mediaTag = isVideo 
                ? `<video src="${randomItem.imgUrl}" autoplay loop muted playsinline class="post-media"></video>`
                : `<img src="${randomItem.imgUrl}" alt="Feed Media" loading="lazy" class="post-media">`;

            article.onclick = () => {
                if (randomItem.link) {
                    window.open(randomItem.link, '_blank');
                }
            };
            
            article.innerHTML = `
                ${mediaTag}
                ${randomItem.link ? `
                <div class="post-info">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="insta-icon"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    <h3>@${instaUser}</h3>
                </div>
                ` : ''}
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
    let currentSpeed = 0; // Real-time velocity for easing
    
    function startAutoScroll() {
        function scrollLoop() {
            // Target speed based on UI, manual pause, and hover state
            const userSpeed = parseFloat(speedControl.value) || 3;
            let targetSpeed = 0;
            if(!isHovering && !isScrollManuallyPaused) {
                targetSpeed = userSpeed * 0.5;
            }
            
            // Interpolation (easing) formula
            currentSpeed += (targetSpeed - currentSpeed) * 0.05;
            
            if (Math.abs(currentSpeed) > 0.05) {
                window.scrollBy(0, currentSpeed);
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

    // Scroll Control Button
    scrollPlayPauseBtn.addEventListener('click', () => {
        isScrollManuallyPaused = !isScrollManuallyPaused;
        scrollPlayPauseBtn.innerHTML = isScrollManuallyPaused 
            ? '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>' // Play icon
            : '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'; // Pause icon
    });

    // Contact Modal Logic
    if(contactBtn) {
        contactBtn.addEventListener('click', () => contactModal.classList.remove('hidden'));
    }
    if(closeContactBtn) {
        closeContactBtn.addEventListener('click', () => contactModal.classList.add('hidden'));
    }
    document.getElementById('contact-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you! This is a UI demo, no data was actually sent.');
        contactModal.classList.add('hidden');
        e.target.reset();
    });

    // Pause auto-scroll on manual interaction
    let scrollTimeout;
    window.addEventListener('wheel', () => {
        isHovering = true; // Act like hover to trigger braking
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Check actual hover state from mouse position could be complex, 
            // so we just reset isHovering and let the mouse events handle it if still hovering
            isHovering = document.querySelector('.post:hover') !== null;
        }, 1500); 
    });
});
