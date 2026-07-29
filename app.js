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
    let isHovering = false; // To pause auto-scroll
    let isScrollManuallyPaused = false;

    // Config
    let config = JSON.parse(localStorage.getItem('naberlaConfig')) || { speed: 3, music: [], images: [] };
    
    // Reliable high-res default images (Upgraded to /originals/ for maximum 4K HD quality)
    const defaultImages = [
        { "imgUrl": "https://i.pinimg.com/originals/b6/db/fb/b6dbfb14f13f92dd67201a4b6d53158d.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108236/" },
        { "imgUrl": "https://i.pinimg.com/originals/09/3a/53/093a534cc33a630c46c7e31c7fb24730.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108300/" },
        { "imgUrl": "https://i.pinimg.com/originals/18/09/27/180927c1c23bf6005f9e156d5b3fcddf.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108467/" },
        { "imgUrl": "https://i.pinimg.com/originals/14/aa/a1/14aaa1af7d9558d87ca7ee5c03c01420.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108484/" },
        { "imgUrl": "https://i.pinimg.com/originals/ba/09/c1/ba09c18936b35405ebaf6408a47996a1.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108414/" },
        { "imgUrl": "https://i.pinimg.com/originals/53/1d/89/531d89fcb64b7306ef1c527957b71463.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108346/" },
        { "imgUrl": "https://i.pinimg.com/originals/86/65/c4/8665c4cef8f0dd495f81c37ee39cf188.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108353/" },
        { "imgUrl": "https://i.pinimg.com/originals/67/9a/b8/679ab8e219838428b35d217cd789cae3.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108504/" },
        { "imgUrl": "https://i.pinimg.com/originals/15/e5/ab/15e5ab4f2f0d8f56c1d2cd5b79f9a5cb.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108523/" },
        { "imgUrl": "https://i.pinimg.com/originals/b1/54/fc/b154fc6ad0abb97bd7ee40585377f583.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108344/" },
        { "imgUrl": "https://i.pinimg.com/originals/2f/d0/44/2fd04426158b3c9773d06dd849e8a9d1.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108491/" },
        { "imgUrl": "https://i.pinimg.com/originals/71/8b/80/718b801cb33ecf9071f275cf3318371a.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108349/" },
        { "imgUrl": "https://i.pinimg.com/originals/a3/06/9c/a3069ce243c28813231834e87856e7ec.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108415/" },
        { "imgUrl": "https://i.pinimg.com/originals/55/c6/90/55c690881e279ce7a379bf4d16115ff4.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108470/" },
        { "imgUrl": "https://i.pinimg.com/originals/68/6c/09/686c095f25ad6b13b4259380449a4c38.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108519/" },
        { "imgUrl": "https://i.pinimg.com/originals/44/35/dd/4435dd22a211478e9249b89c5e458f22.jpg", "link": "https://tr.pinterest.com/pin/1104015296186108503/" }
    ];

    const defaultMusic = [
        'https://www.youtube.com/watch?v=5qap5aO4i9A',
        'https://www.youtube.com/watch?v=jfKfPfyJRdk'
    ];

    if (!config.images || config.images.length < 5) {
        config.images = defaultImages;
        localStorage.setItem('naberlaConfig', JSON.stringify(config));
    }
    if (!config.music || config.music.length === 0) {
        config.music = defaultMusic;
        localStorage.setItem('naberlaConfig', JSON.stringify(config));
    }

    // Convert Pinterest image URLs to high quality /originals/
    config.images = config.images.map(img => {
        let url = typeof img === 'string' ? img : img.imgUrl;
        let link = typeof img === 'object' ? img.link : '';
        url = url.replace(/\/(?:236x|474x|736x)\//, '/originals/');
        return { imgUrl: url, link: link };
    });

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
    let currentMode = 'none';

    const SVG_PLAY = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    const SVG_PAUSE = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
    const SVG_UNMUTED = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
    const SVG_MUTED = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';

    // Initialize YouTube API
    window.onYouTubeIframeAPIReady = function() {
        const originUrl = (window.location.origin === 'file://' || window.location.origin === 'null') 
            ? 'https://localhost' 
            : window.location.origin;

        ytPlayer = new YT.Player('yt-player', {
            height: '0', width: '0',
            playerVars: { 
                'autoplay': 1, 
                'controls': 0, 
                'origin': originUrl 
            },
            events: {
                'onReady': () => { isYtReady = true; },
                'onStateChange': onPlayerStateChange,
                'onError': () => playNextTrack()
            }
        });
    };

    function onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) playNextTrack();
        if (event.data === YT.PlayerState.PLAYING) {
            updatePlayBtn(true);
            try {
                if (ytPlayer && ytPlayer.getVideoData) {
                    titleEl.innerText = ytPlayer.getVideoData().title || "NaberLa Music";
                }
            } catch(e){}
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
        try {
            if(!config.music || config.music.length === 0) {
                if (titleEl) titleEl.innerText = "No music in playlist";
                return;
            }
            currentTrackIndex = index % config.music.length;
            const url = config.music[currentTrackIndex];
            
            try { htmlAudio.pause(); } catch(e){}
            try {
                if(isYtReady && ytPlayer && typeof ytPlayer.stopVideo === 'function') {
                    ytPlayer.stopVideo();
                }
            } catch(e){}

            const ytId = getYouTubeId(url);
            if(ytId) {
                currentMode = 'youtube';
                if (ytLinkEl) { ytLinkEl.href = url; ytLinkEl.classList.remove('hidden'); }
                if (titleEl) titleEl.innerText = "Playing Music...";
                
                if(isYtReady && ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
                    ytPlayer.loadVideoById(ytId);
                    if (typeof ytPlayer.setVolume === 'function') ytPlayer.setVolume(isMuted ? 0 : 50);
                    if (typeof ytPlayer.playVideo === 'function') ytPlayer.playVideo();
                } else {
                    setTimeout(() => playTrack(index), 500);
                }
            } else {
                currentMode = 'html';
                if (ytLinkEl) ytLinkEl.classList.add('hidden');
                if (titleEl) titleEl.innerText = url.split('/').pop();
                htmlAudio.src = url;
                htmlAudio.volume = isMuted ? 0 : 0.5;
                htmlAudio.play().catch(e=>console.log("Audio play error", e));
            }
            isPlaying = true;
        } catch(err) {
            console.error("Error playing track:", err);
        }
    }

    function togglePlayPause() {
        if(currentMode === 'youtube' && isYtReady && ytPlayer) {
            const state = ytPlayer.getPlayerState ? ytPlayer.getPlayerState() : -1;
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
        if(currentMode === 'youtube' && isYtReady && ytPlayer && ytPlayer.setVolume) {
            ytPlayer.setVolume(isMuted ? 0 : 50);
        }
        htmlAudio.volume = isMuted ? 0 : 0.5;
        btnMute.innerHTML = isMuted ? SVG_MUTED : SVG_UNMUTED;
    }

    function updatePlayBtn(playing) {
        isPlaying = playing;
        btnPlayPause.innerHTML = playing ? SVG_PAUSE : SVG_PLAY;
    }

    // Progress Bar
    function formatTime(s) {
        if(isNaN(s)) return "0:00";
        const m = Math.floor(s / 60);
        const secs = Math.floor(s % 60).toString().padStart(2, '0');
        return `${m}:${secs}`;
    }

    setInterval(() => {
        if(!isPlaying) return;
        let cTime = 0, dur = 0;
        if(currentMode === 'youtube' && isYtReady && ytPlayer && ytPlayer.getCurrentTime) {
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
        if(currentMode === 'youtube' && isYtReady && ytPlayer && ytPlayer.seekTo) {
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

    // RENDER POSTS
    let totalRendered = 0;
    const renderPosts = (count = 12) => {
        if(!config.images || config.images.length === 0) return; 
        
        for (let i = 0; i < count; i++) {
            totalRendered++;
            
            // Insert AdSense block every 10 images
            if (totalRendered % 10 === 0) {
                const adBlock = document.createElement('article');
                adBlock.className = 'post medium col-span-2 adsense-container';
                adBlock.style.background = '#111';
                adBlock.style.display = 'flex';
                adBlock.style.alignItems = 'center';
                adBlock.style.justifyContent = 'center';
                adBlock.style.border = '1px dashed #333';
                adBlock.innerHTML = `
                    <div style="text-align:center; padding:20px;">
                        <span style="font-size:0.7rem; color:#888; letter-spacing:2px; text-transform:uppercase;">Advertisement</span>
                        <div style="margin-top:15px; width:300px; height:250px; background:#0a0a0a; display:flex; align-items:center; justify-content:center; color:#555;">
                            Google AdSense
                        </div>
                    </div>
                `;
                feedContainer.appendChild(adBlock);
            }

            const randomItem = config.images[Math.floor(Math.random() * config.images.length)];
            const article = document.createElement('article');
            const sizeClasses = ['small', 'medium', 'large'];
            let sizeClass = sizeClasses[Math.floor(Math.random() * sizeClasses.length)];
            
            const randCol = Math.random();
            let colClass = 'col-span-1';
            if (randCol > 0.90) {
                colClass = 'col-span-3';
                sizeClass = 'large';
            } else if (randCol > 0.70) {
                colClass = 'col-span-2';
            }
            
            article.className = `post ${sizeClass} ${colClass}`;
            
            // Ensure highest HD original resolution
            const hdImgUrl = randomItem.imgUrl.replace(/\/(?:236x|474x|736x)\//, '/originals/');
            const isVideo = hdImgUrl.match(/\.(mp4|webm|ogg)$/i);
            const mediaTag = isVideo 
                ? `<video src="${hdImgUrl}" autoplay loop muted playsinline class="post-media"></video>`
                : `<img src="${hdImgUrl}" alt="Feed Media" loading="lazy" class="post-media">`;

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
            
            article.addEventListener('mouseenter', () => isHovering = true);
            article.addEventListener('mouseleave', () => isHovering = false);

            feedContainer.appendChild(article);
        }
    };

    // Initial load
    renderPosts(16);

    let isEntered = false;
    let currentSpeed = 0;
    let scrollAccumulator = 0; // Floating point scroll accumulator to guarantee integer pixel scrolling!

    // GUARANTEED SMOOTH AUTO-SCROLL LOOP
    function scrollLoop() {
        const userSpeed = parseFloat(speedControl.value) || 3;
        let targetSpeed = 0;
        
        if (!isEntered) {
            targetSpeed = 1.5; // Smooth ambient flow under curtain
        } else if (!isHovering && !isScrollManuallyPaused) {
            targetSpeed = userSpeed * 0.75;
        }
        
        currentSpeed += (targetSpeed - currentSpeed) * 0.1;
        scrollAccumulator += currentSpeed;
        
        if (scrollAccumulator >= 1) {
            const pixelsToScroll = Math.floor(scrollAccumulator);
            window.scrollBy(0, pixelsToScroll);
            scrollAccumulator -= pixelsToScroll;
        }
        
        // Infinite scroll check
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 900) {
            if (!isLoading) {
                isLoading = true;
                setTimeout(() => {
                    renderPosts(8);
                    isLoading = false;
                }, 100);
            }
        }
        requestAnimationFrame(scrollLoop);
    }
    
    // Start auto-scroll loop immediately
    requestAnimationFrame(scrollLoop);

    // Initialization & Curtain Lift
    if (enterBtn) {
        enterBtn.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            isEntered = true;
            
            if (startOverlay) {
                startOverlay.classList.add('curtain-lift');
                setTimeout(() => {
                    startOverlay.style.display = 'none';
                }, 900);
            }

            try {
                playTrack(0);
            } catch(musicErr) {
                console.error("Music start failed:", musicErr);
            }
        });
    }

    // Scroll Control Button
    scrollPlayPauseBtn.addEventListener('click', () => {
        isScrollManuallyPaused = !isScrollManuallyPaused;
        scrollPlayPauseBtn.innerHTML = isScrollManuallyPaused 
            ? '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>' 
            : '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
    });

    // Contact Modal
    if(contactBtn) contactBtn.addEventListener('click', () => contactModal.classList.remove('hidden'));
    if(closeContactBtn) closeContactBtn.addEventListener('click', () => contactModal.classList.add('hidden'));

    let scrollTimeout;
    window.addEventListener('wheel', () => {
        isHovering = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isHovering = document.querySelector('.post:hover') !== null;
        }, 1500); 
    });
});
