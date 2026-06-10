// ========================================
// SEUN — Main JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', () => {

    // --- Search functionality ---
    const searchInput = document.getElementById('search-input');
    const productCards = document.querySelectorAll('.product-card');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            productCards.forEach(card => {
                const name = card.querySelector('.product-name').textContent.toLowerCase();
                if (query === '' || name.includes(query)) {
                    card.style.display = '';
                    card.style.opacity = '1';
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 200);
                }
            });
        });
    }

    // --- Add to cart feedback ---
    const cartButtons = document.querySelectorAll('.add-to-cart-btn');

    cartButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const originalText = btn.textContent;
            btn.textContent = 'ADDED ✓';
            btn.style.background = '#1A1A1A';
            btn.style.color = '#FFFFFF';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.style.color = '';
            }, 1500);
        });
    });

    // --- Scroll reveal animation ---
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    productCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(24px)';
        // Reset index for staggered animation in batches
        const delay = (index % 3) * 0.1;
        card.style.transition = `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`;
        observer.observe(card);
    });

    // --- Scroll to Top functionality ---
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Video Intersection Observer ---
    const videoElement = document.getElementById('hero-video');
    if (videoElement) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const playPromise = videoElement.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.log("Video autoplay prevented by browser:", error);
                        });
                    }
                } else {
                    videoElement.pause();
                }
            });
        }, { threshold: 0.3 }); // Play when 30% visible
        videoObserver.observe(videoElement);
    }

    // --- Category active state (Tab switching) ---
    const categoryLinks = document.querySelectorAll('.category-link');
    const tabPanels = document.querySelectorAll('.category-tab-panel');

    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Stop the page from jumping
            
            // 1. Toggle link active states
            categoryLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // 2. Hide all tab panels
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
            });

            // 3. Show the targeted tab panel
            const targetId = link.getAttribute('data-target');
            if (targetId) {
                const targetPanel = document.getElementById(targetId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            }
        });
    });

});
