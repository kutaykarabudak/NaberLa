document.addEventListener('DOMContentLoaded', () => {
    const startOverlay = document.getElementById('start-overlay');
    const enterBtn = document.getElementById('enter-btn');
    const bgMusic = document.getElementById('bg-music');
    const muteBtn = document.getElementById('mute-btn');
    const feedContainer = document.getElementById('feed-container');
    
    let isMuted = false;
    let page = 1;
    let isLoading = false;

    // Mock Data Generator
    const generateMockPosts = (count = 3) => {
        const posts = [];
        const usernames = ['model.life', 'fashion_icon', 'runway_star', 'style.muse', 'vogue.dreamer'];
        for (let i = 0; i < count; i++) {
            const id = Math.floor(Math.random() * 1000);
            const userIndex = Math.floor(Math.random() * usernames.length);
            posts.push({
                imageUrl: `https://picsum.photos/seed/${id}/600/800`, // Placeholder for model image
                avatarUrl: `https://i.pravatar.cc/150?u=${id}`,
                username: usernames[userIndex],
                bio: 'Fashion | Travel | Lifestyle',
                postLink: 'https://www.instagram.com/' // Redirect link
            });
        }
        return posts;
    };

    // Render Posts
    const renderPosts = (posts) => {
        posts.forEach(post => {
            const article = document.createElement('article');
            article.className = 'post';
            article.onclick = () => window.open(post.postLink, '_blank');
            
            article.innerHTML = `
                <img src="${post.imageUrl}" alt="Instagram Post" loading="lazy">
                <div class="post-info">
                    <img src="${post.avatarUrl}" alt="${post.username}" class="avatar">
                    <div class="user-details">
                        <h3>@${post.username}</h3>
                        <p>${post.bio}</p>
                    </div>
                </div>
            `;
            feedContainer.appendChild(article);
        });
    };

    // Load initial posts
    renderPosts(generateMockPosts(4));

    // Initialization / Autoplay policy handling
    enterBtn.addEventListener('click', () => {
        startOverlay.classList.add('hidden');
        bgMusic.volume = 0.5;
        bgMusic.play().catch(e => console.log("Audio play failed:", e));
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

    // Infinite Scroll
    window.addEventListener('scroll', () => {
        if(isLoading) return;
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
            isLoading = true;
            // Simulate network request
            setTimeout(() => {
                renderPosts(generateMockPosts(3));
                isLoading = false;
            }, 800);
        }
    });
});
