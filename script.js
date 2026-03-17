/**
 * Cool Projekt — Enhanced Interactive JS
 * With 21st.dev inspired elements
 */
document.addEventListener('DOMContentLoaded', () => {

    /* ═══ 1. Hero stagger animation ═══ */
    const heroElements = document.querySelectorAll('.anim-fade');
    requestAnimationFrame(() => {
        setTimeout(() => {
            heroElements.forEach(el => el.classList.add('is-visible'));
        }, 100);
    });

    /* ═══ 2. Scroll Reveal (Intersection Observer) ═══ */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    /* ═══ 3. Animated Counters ═══ */
    function animateCounter(el, target) {
        const duration = 2000;
        const start = performance.now();
        const initial = 0;

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(initial + (target - initial) * eased);
            el.textContent = current;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'), 10);
                if (!isNaN(target)) {
                    animateCounter(entry.target, target);
                }
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('[data-count]').forEach(el => {
        counterObserver.observe(el);
    });

    /* ═══ 4. Scroll Spy for Nav Links ═══ */
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav__link');
    let ticking = false;

    function updateScrollSpy() {
        const scrollY = window.scrollY;
        let current = '';

        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (scrollY >= top) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-target') === current);
        });
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateScrollSpy();
                ticking = false;
            });
            ticking = true;
        }
    });

    /* ═══ 5. Smooth Scrolling ═══ */
    const navLinksEl = document.getElementById('navLinks');
    const burger = document.getElementById('navBurger');

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();

                // Close mobile menu
                navLinksEl.classList.remove('is-open');
                burger.classList.remove('is-open');

                window.scrollTo({
                    top: target.offsetTop - 64,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* ═══ 6. Mobile Menu ═══ */
    burger.addEventListener('click', () => {
        burger.classList.toggle('is-open');
        navLinksEl.classList.toggle('is-open');
    });

    /* ═══ 7. Shader Animation ═══ */
    function initShaderAnimation() {
        const container = document.getElementById('shader-container');
        if (!container || !window.THREE) return;

        const THREE = window.THREE;

        const camera = new THREE.Camera();
        camera.position.z = 1;

        const scene = new THREE.Scene();
        const geometry = new THREE.PlaneBufferGeometry(2, 2);

        const uniforms = {
            time: { type: "f", value: 1.0 },
            resolution: { type: "v2", value: new THREE.Vector2() },
        };

        const vertexShader = `
            void main() {
                gl_Position = vec4( position, 1.0 );
            }
        `;

        const fragmentShader = `
            #define TWO_PI 6.2831853072
            #define PI 3.14159265359

            precision highp float;
            uniform vec2 resolution;
            uniform float time;

            float random (in float x) {
                return fract(sin(x)*1e4);
            }
            float random (vec2 st) {
                return fract(sin(dot(st.xy,
                                     vec2(12.9898,78.233)))*
                    43758.5453123);
            }

            varying vec2 vUv;

            void main(void) {
                vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

                vec2 fMosaicScal = vec2(4.0, 2.0);
                vec2 vScreenSize = vec2(256,256);
                uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
                uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);

                float t = time*0.06+random(uv.x)*0.4;
                float lineWidth = 0.0008;

                vec3 color = vec3(0.0);
                for(int j = 0; j < 3; j++){
                    for(int i=0; i < 5; i++){
                        color[j] += lineWidth*float(i*i) / abs(fract(t - 0.01*float(j)+float(i)*0.01)*1.0 - length(uv));
                    }
                }

                gl_FragColor = vec4(color[2],color[1],color[0],1.0);
            }
        `;

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const onWindowResize = () => {
            const rect = container.getBoundingClientRect();
            renderer.setSize(rect.width, rect.height);
            uniforms.resolution.value.x = renderer.domElement.width;
            uniforms.resolution.value.y = renderer.domElement.height;
        };

        onWindowResize();
        window.addEventListener("resize", onWindowResize, false);

        const animate = () => {
            requestAnimationFrame(animate);
            uniforms.time.value += 0.05;
            renderer.render(scene, camera);
        };

        animate();
    }

    initShaderAnimation();

    /* ═══ 8. Glowing Effect (21st.dev Vanilla) ═══ */
    const glowingWrappers = document.querySelectorAll('.glowing-wrapper');
    let currentAngle = 0;

    function animateGlow() {
        if (glowingWrappers.length > 0) {
            currentAngle = (currentAngle + 1) % 360;
            glowingWrappers.forEach(wrapper => {
                const effect = wrapper.querySelector('.glowing-effect');
                if (effect) {
                    effect.style.setProperty('--start', String(currentAngle));
                }
            });
            requestAnimationFrame(animateGlow);
        }
    }
    animateGlow();

});
