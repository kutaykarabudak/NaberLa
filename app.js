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
    ];

    // Migration for app side
    if (config.images) {
        config.images = config.images.map(img => typeof img === 'string' ? { imgUrl: img, link: '' } : img);
    }
    
    if(!config.images || config.images.length < 5 || (config.images[0] && config.images[0].imgUrl.includes('pinimg.com/736x/82/6b/b3'))) {
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
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="insta-icon"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    <h3>View Link</h3>
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
