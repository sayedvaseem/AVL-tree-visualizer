document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') {
        console.error('Three.js or canvas not found!');
        return;
    }

    // Setup Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0c29); // Match dark bg
    scene.fog = new THREE.FogExp2(0x0f0c29, 0.0008);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create Particles
    const geometry = new THREE.BufferGeometry();
    const particlesCount = 4000;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    const color1 = new THREE.Color(0x06b6d4); // Cyan
    const color2 = new THREE.Color(0xd946ef); // Magenta
    const color3 = new THREE.Color(0xf43f5e); // Rose

    for (let i = 0; i < particlesCount * 3; i += 3) {
        // Spread particles across a wide volume
        posArray[i] = (Math.random() - 0.5) * 4000;
        posArray[i + 1] = (Math.random() - 0.5) * 4000;
        posArray[i + 2] = (Math.random() - 0.5) * 4000;

        // Assign colors randomly
        const randColor = Math.random();
        let mixedColor;
        if (randColor < 0.45) mixedColor = color1;
        else if (randColor < 0.9) mixedColor = color2;
        else mixedColor = color3;

        colorArray[i] = mixedColor.r;
        colorArray[i + 1] = mixedColor.g;
        colorArray[i + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    // Circular particle texture using canvas
    const circleCanvas = document.createElement('canvas');
    circleCanvas.width = 32;
    circleCanvas.height = 32;
    const ctx = circleCanvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    const texture = new THREE.CanvasTexture(circleCanvas);

    const material = new THREE.PointsMaterial({
        size: 8,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        map: texture,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);

    // Decorative geometric objects floating
    const geometries = [
        new THREE.TorusGeometry(100, 2, 16, 100),
        new THREE.OctahedronGeometry(80),
        new THREE.IcosahedronGeometry(60)
    ];

    const shapes = [];
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xd946ef,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });

    for(let i=0; i<8; i++) {
        const shapeGeometry = geometries[Math.floor(Math.random() * geometries.length)];
        const shape = new THREE.Mesh(shapeGeometry, wireframeMaterial);
        
        shape.position.x = (Math.random() - 0.5) * 2000;
        shape.position.y = (Math.random() - 0.5) * 2000;
        shape.position.z = (Math.random() - 0.5) * 1500;
        
        shape.rotation.x = Math.random() * Math.PI;
        shape.rotation.y = Math.random() * Math.PI;
        
        scene.add(shape);
        shapes.push({
            mesh: shape,
            speedX: (Math.random() - 0.5) * 0.01,
            speedY: (Math.random() - 0.5) * 0.01
        });
    }

    // Grid Floor
    const gridHelper = new THREE.GridHelper(4000, 80, 0x06b6d4, 0x24243e);
    gridHelper.position.y = -600;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Mouse Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        // Normalize mouse coordinates for subtle parallax
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Resize Handling
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
        const elapsedTime = clock.getElapsedTime();

        // Rotate particles slowly
        particlesMesh.rotation.y = elapsedTime * 0.02;
        particlesMesh.rotation.x = elapsedTime * 0.01;

        // Move grid floor
        gridHelper.position.z = (elapsedTime * 20) % 50;

        // Animate floating shapes
        shapes.forEach(obj => {
            obj.mesh.rotation.x += obj.speedX;
            obj.mesh.rotation.y += obj.speedY;
        });

        // Smooth camera movement based on mouse
        targetX = mouseX * 0.5;
        targetY = mouseY * 0.5;
        
        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (-targetY - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    animate();
});
