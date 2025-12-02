// Global Variables
let scene, camera, renderer;
let centralSphere, rings = [], particles;
let projects = [];
let currentSection = 'landing';
let mouse = { x: 0, y: 0 };
let time = 0;

// Initialize Three.js Scene
function initScene() {
    const container = document.getElementById('canvas-container');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.Fog(0x050505, 15, 40);
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 12);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x6366f1, 2, 50);
    pointLight1.position.set(8, 5, 5);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xec4899, 2, 50);
    pointLight2.position.set(-8, 5, -5);
    scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0x8b5cf6, 1.5, 50);
    pointLight3.position.set(0, 8, 0);
    scene.add(pointLight3);
    
    // Grid Floor
    const gridHelper = new THREE.GridHelper(40, 40, 0x6366f1, 0x1a1a2e);
    gridHelper.position.y = -3;
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    // Central Glowing Sphere
    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x6366f1,
        emissiveIntensity: 0.5,
    });
    centralSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    centralSphere.position.y = 1;
    scene.add(centralSphere);
    
    // Floating Rings
    const ringColors = [0x6366f1, 0xec4899, 0x8b5cf6];
    for (let i = 0; i < 3; i++) {
        const ringGeometry = new THREE.TorusGeometry(2.5 + i * 0.5, 0.03, 16, 100);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: ringColors[i],
            metalness: 0.9,
            roughness: 0.1,
            emissive: ringColors[i],
            emissiveIntensity: 0.3,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.y = 1;
        ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
        ring.rotation.y = (Math.random() - 0.5) * 0.3;
        scene.add(ring);
        rings.push(ring);
    }
    
    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 300;
    const posArray = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 40;
        posArray[i + 1] = Math.random() * 20 - 5;
        posArray[i + 2] = (Math.random() - 0.5) * 40;
        
        const colorChoice = Math.random();
        if (colorChoice < 0.33) {
            colors[i] = 0.39; colors[i + 1] = 0.4; colors[i + 2] = 0.95;
        } else if (colorChoice < 0.66) {
            colors[i] = 0.93; colors[i + 1] = 0.28; colors[i + 2] = 0.6;
        } else {
            colors[i] = 0.55; colors[i + 1] = 0.36; colors[i + 2] = 0.96;
        }
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
    });
    
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // Project Gallery Cards
    const projectPositions = [
        { x: -4, z: 2 }, { x: 0, z: 2 }, { x: 4, z: 2 },
        { x: -4, z: -2 }, { x: 0, z: -2 }, { x: 4, z: -2 }
    ];
    
    projectPositions.forEach((pos, i) => {
        const geometry = new THREE.BoxGeometry(1.8, 2.4, 0.1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.5,
            roughness: 0.5,
            emissive: 0x6366f1,
            emissiveIntensity: 0.1,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(pos.x, 1, pos.z);
        mesh.visible = false;
        scene.add(mesh);
        projects.push(mesh);
    });
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    
    // Camera follows mouse
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
    camera.position.y += (-mouse.y * 2 + 2 - camera.position.y) * 0.02;
    camera.lookAt(0, 1, 0);
    
    // Central Sphere
    if (centralSphere) {
        centralSphere.rotation.y += 0.005;
        centralSphere.position.y = 1 + Math.sin(time * 0.5) * 0.2;
    }
    
    // Rings
    rings.forEach((ring, i) => {
        ring.rotation.x += 0.002 * (i + 1);
        ring.rotation.z += 0.001 * (i + 1);
    });
    
    // Particles
    if (particles) {
        particles.rotation.y += 0.0003;
        const positions = particles.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] += Math.sin(time + i) * 0.002;
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Projects (Work Section)
    if (currentSection === 'work') {
        projects.forEach((project, i) => {
            project.position.y = 1 + Math.sin(time + i * 0.5) * 0.1;
            project.rotation.y = Math.sin(time * 0.5) * 0.05;
        });
    }
    
    renderer.render(scene, camera);
}

// Update 3D Scene based on Section
function updateScene(section) {
    currentSection = section;
    
    if (section === 'work') {
        centralSphere.visible = false;
        rings.forEach(r => r.visible = false);
        projects.forEach(p => p.visible = true);
    } else {
        centralSphere.visible = true;
        rings.forEach(r => r.visible = true);
        projects.forEach(p => p.visible = false);
    }
}

// Section Navigation
function navigateToSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionId) {
            btn.classList.add('active');
        }
    });
    
    // Update 3D scene
    updateScene(sectionId);
}

// Event Listeners
function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            navigateToSection(btn.dataset.section);
        });
    });
    
    // CTA Button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            navigateToSection(ctaButton.dataset.goto);
        });
    }
    
    // Mouse movement for parallax
    document.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Contact form submission
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleFormSubmit);
    }
    
    // Window resize
    window.addEventListener('resize', onWindowResize);
}

// Handle Form Submission
function handleFormSubmit() {
    const name = document.getElementById('name-input').value;
    const email = document.getElementById('email-input').value;
    const message = document.getElementById('message-input').value;
    
    if (name && email && message) {
        alert(`Message sent!\nName: ${name}\nEmail: ${email}`);
        
        // Clear form
        document.getElementById('name-input').value = '';
        document.getElementById('email-input').value = '';
        document.getElementById('message-input').value = '';
    } else {
        alert('Please fill in all fields');
    }
}

// Handle Window Resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize Everything
function init() {
    initScene();
    setupEventListeners();
    animate();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}