// ============================================
// DISTORTUS REX - Browser 3D Horror Game
// ============================================

// Game State
const gameState = {
    isPlaying: false,
    time: 100,
    maxTime: 100,
    humansEaten: 0,
    targetHumans: 30,
    timeDecayRate: 0.1, // time lost per second
    timeGainPerHuman: 15,
    isGameOver: false
};

// Scene Setup
let scene, camera, renderer;
let player, playerVelocity, playerSpeed, dashSpeed, isDashing;
let npcs = [];
let level = {};
let keys = {};
let clock, deltaTime;

// Constants
const PLAYER_SPEED = 8;
const DASH_SPEED = 20;
const DASH_DURATION = 0.3;
const DASH_COOLDOWN = 1.0;
const LEVEL_SIZE = 50;
const NPC_COUNT = 15;
const GUARD_COUNT = 5;

// Audio Context
let audioContext;
let sounds = {
    roar: null,
    chomp: null,
    scream: null,
    shoot: null,
    music: null
};

// ============================================
// INITIALIZATION
// ============================================

function init() {
    // Setup Three.js scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 30, 60);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('gameCanvas'),
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    renderer.shadowMap.enabled = false; // Disabled for performance

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xff4444, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const redLight = new THREE.PointLight(0xff0000, 1, 30);
    redLight.position.set(0, 5, 0);
    scene.add(redLight);

    // Create Level
    createLevel();

    // Create Player
    createPlayer();

    // Create NPCs
    createNPCs();

    // Initialize Audio
    initAudio();

    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.getElementById('restartBtn').addEventListener('click', restartGame);

    // Clock
    clock = new THREE.Clock();

    // Hide loading screen
    document.getElementById('loadingScreen').classList.add('hidden');

    // Start game
    startGame();

    // Start animation loop
    animate();
}

// ============================================
// LEVEL CREATION
// ============================================

function createLevel() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(LEVEL_SIZE, LEVEL_SIZE);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);
    level.ground = ground;

    // Fence around perimeter
    const fenceHeight = 3;
    const fenceThickness = 0.2;
    const fenceMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        metalness: 0.5
    });

    // Create fence segments
    const fencePositions = [
        { x: 0, z: LEVEL_SIZE/2, w: LEVEL_SIZE, h: fenceHeight, d: fenceThickness },
        { x: 0, z: -LEVEL_SIZE/2, w: LEVEL_SIZE, h: fenceHeight, d: fenceThickness },
        { x: LEVEL_SIZE/2, z: 0, w: fenceThickness, h: fenceHeight, d: LEVEL_SIZE },
        { x: -LEVEL_SIZE/2, z: 0, w: fenceThickness, h: fenceHeight, d: LEVEL_SIZE }
    ];

    fencePositions.forEach(pos => {
        const fenceGeometry = new THREE.BoxGeometry(pos.w, pos.h, pos.d);
        const fence = new THREE.Mesh(fenceGeometry, fenceMaterial);
        fence.position.set(pos.x, pos.h/2, pos.z);
        scene.add(fence);
    });

    // Lab Building
    const buildingGeometry = new THREE.BoxGeometry(15, 8, 12);
    const buildingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a,
        roughness: 0.7
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.set(-15, 4, -15);
    scene.add(building);

    // Building windows (glowing)
    const windowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 1
    });
    for (let i = 0; i < 4; i++) {
        const windowGeometry = new THREE.BoxGeometry(2, 2, 0.2);
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(-15 + (i - 1.5) * 3, 5, -9.1);
        scene.add(window);
    }

    // Debris/Props
    const propMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    for (let i = 0; i < 8; i++) {
        const size = Math.random() * 1.5 + 0.5;
        const propGeometry = new THREE.BoxGeometry(size, size, size);
        const prop = new THREE.Mesh(propGeometry, propMaterial);
        prop.position.set(
            (Math.random() - 0.5) * (LEVEL_SIZE - 10),
            size / 2,
            (Math.random() - 0.5) * (LEVEL_SIZE - 10)
        );
        prop.rotation.y = Math.random() * Math.PI;
        scene.add(prop);
    }

    // Lights (decorative)
    for (let i = 0; i < 4; i++) {
        const lightPole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 6),
            new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        const angle = (i / 4) * Math.PI * 2;
        const radius = LEVEL_SIZE / 3;
        lightPole.position.set(
            Math.cos(angle) * radius,
            3,
            Math.sin(angle) * radius
        );
        scene.add(lightPole);

        const lightBulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.5),
            new THREE.MeshBasicMaterial({ 
                color: 0xff6600,
                emissive: 0xff6600
            })
        );
        lightBulb.position.copy(lightPole.position);
        lightBulb.position.y = 6;
        scene.add(lightBulb);
    }
}

// ============================================
// PLAYER CREATION
// ============================================

function createPlayer() {
    // Player group
    player = new THREE.Group();

    // Body (distorted dinosaur shape)
    const bodyGeometry = new THREE.BoxGeometry(1.5, 2, 3);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a5a2a,
        roughness: 0.8,
        emissive: 0x1a3a1a,
        emissiveIntensity: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    player.add(body);

    // Head (stretched jaw)
    const headGeometry = new THREE.BoxGeometry(1, 1.5, 2);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 2, 1.5);
    head.scale.z = 1.5; // Stretched jaw
    player.add(head);

    // Eyes (glowing)
    const eyeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        emissive: 0xff0000
    });
    const eyeGeometry = new THREE.SphereGeometry(0.2);
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 2.3, 2.5);
    player.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 2.3, 2.5);
    player.add(rightEye);

    // Tail
    const tailGeometry = new THREE.ConeGeometry(0.3, 2, 4);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.rotation.x = Math.PI / 2;
    tail.position.set(0, 1, -2);
    player.add(tail);

    // Legs (simple)
    const legGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5);
    const legMaterial = bodyMaterial;
    
    const legs = [
        { x: -0.5, z: 0.5 },
        { x: 0.5, z: 0.5 },
        { x: -0.5, z: -0.5 },
        { x: 0.5, z: -0.5 }
    ];

    legs.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos.x, 0.75, pos.z);
        player.add(leg);
    });

    player.position.set(0, 0, 0);
    scene.add(player);

    // Player physics
    playerVelocity = new THREE.Vector3();
    playerSpeed = PLAYER_SPEED;
    isDashing = false;
    player.dashTimer = 0;
    player.dashCooldown = 0;
}

// ============================================
// NPC CREATION
// ============================================

function createNPCs() {
    // Create Scientists and Workers
    for (let i = 0; i < NPC_COUNT; i++) {
        const npc = createNPC('civilian');
        npcs.push(npc);
    }

    // Create Security Guards
    for (let i = 0; i < GUARD_COUNT; i++) {
        const npc = createNPC('guard');
        npcs.push(npc);
    }
}

function createNPC(type) {
    const npc = new THREE.Group();
    npc.userData.type = type;
    npc.userData.alive = true;
    npc.userData.speed = type === 'guard' ? 3 : 5;
    npc.userData.fleeDistance = 10;
    npc.userData.shootCooldown = 0;
    npc.userData.shootInterval = 2;

    // Body
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.6, 0.6);
    let bodyColor = type === 'guard' ? 0x1a1a4a : 0x4a4a4a;
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: bodyColor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.8;
    npc.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.3);
    const head = new THREE.Mesh(headGeometry, new THREE.MeshStandardMaterial({ color: 0xffdbac }));
    head.position.y = 1.8;
    npc.add(head);

    // Weapon for guards
    if (type === 'guard') {
        const weaponGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.8);
        const weapon = new THREE.Mesh(weaponGeometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
        weapon.position.set(0.5, 1, 0.5);
        weapon.rotation.y = Math.PI / 4;
        npc.add(weapon);
    }

    // Random position
    npc.position.set(
        (Math.random() - 0.5) * (LEVEL_SIZE - 10),
        0,
        (Math.random() - 0.5) * (LEVEL_SIZE - 10)
    );

    scene.add(npc);
    return npc;
}

// ============================================
// AUDIO INITIALIZATION
// ============================================

function initAudio() {
    // Create simple audio context
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // We'll use simple oscillator-based sounds for this demo
        // In production, you'd load actual audio files
        
        sounds.initialized = true;
    } catch (e) {
        console.warn('Audio not supported');
        sounds.initialized = false;
    }
}

function playSound(type) {
    if (!sounds.initialized || !audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch(type) {
        case 'chomp':
            oscillator.frequency.value = 100;
            oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
        case 'scream':
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'shoot':
            oscillator.frequency.value = 200;
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'dash':
            oscillator.frequency.value = 150;
            oscillator.type = 'triangle';
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
    }
}

// ============================================
// INPUT HANDLING
// ============================================

function onKeyDown(event) {
    keys[event.key.toLowerCase()] = true;
    keys[event.code] = true;

    // Dash on Space
    if ((event.code === 'Space' || event.key === ' ') && !isDashing && player.dashCooldown <= 0) {
        isDashing = true;
        player.dashTimer = DASH_DURATION;
        player.dashCooldown = DASH_COOLDOWN;
        playSound('dash');
    }

    // Restart on ESC
    if (event.code === 'Escape') {
        if (gameState.isGameOver) {
            restartGame();
        }
    }
}

function onKeyUp(event) {
    keys[event.key.toLowerCase()] = false;
    keys[event.code] = false;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// ============================================
// GAME LOGIC
// ============================================

function startGame() {
    gameState.isPlaying = true;
    gameState.isGameOver = false;
    gameState.time = gameState.maxTime;
    gameState.humansEaten = 0;
    updateUI();
}

function restartGame() {
    // Reset game state
    gameState.isPlaying = true;
    gameState.isGameOver = false;
    gameState.time = gameState.maxTime;
    gameState.humansEaten = 0;

    // Reset player
    player.position.set(0, 0, 0);
    playerVelocity.set(0, 0, 0);
    player.dashCooldown = 0;

    // Remove old NPCs
    npcs.forEach(npc => scene.remove(npc));
    npcs = [];

    // Create new NPCs
    createNPCs();

    // Update UI
    updateUI();
    document.getElementById('endScreen').classList.remove('show');
}

function updateGame() {
    if (!gameState.isPlaying || gameState.isGameOver) return;

    deltaTime = clock.getDelta();

    // Update time
    gameState.time -= gameState.timeDecayRate * deltaTime;
    if (gameState.time <= 0) {
        gameState.time = 0;
        endGame(false);
    }

    // Update player
    updatePlayer();

    // Update NPCs
    updateNPCs();

    // Update camera to follow player
    updateCamera();

    // Update UI
    updateUI();
}

function updatePlayer() {
    // Movement input
    const moveDirection = new THREE.Vector3();
    
    if (keys['w'] || keys['ArrowUp']) moveDirection.z -= 1;
    if (keys['s'] || keys['ArrowDown']) moveDirection.z += 1;
    if (keys['a'] || keys['ArrowLeft']) moveDirection.x -= 1;
    if (keys['d'] || keys['ArrowRight']) moveDirection.x += 1;

    if (moveDirection.length() > 0) {
        moveDirection.normalize();
        
        // Determine speed
        let currentSpeed = PLAYER_SPEED;
        if (isDashing && player.dashTimer > 0) {
            currentSpeed = DASH_SPEED;
            player.dashTimer -= deltaTime;
            if (player.dashTimer <= 0) {
                isDashing = false;
            }
        }

        playerVelocity.x = moveDirection.x * currentSpeed;
        playerVelocity.z = moveDirection.z * currentSpeed;

        // Rotate player to face movement direction
        const angle = Math.atan2(moveDirection.x, moveDirection.z);
        player.rotation.y = angle;
    } else {
        playerVelocity.x *= 0.9;
        playerVelocity.z *= 0.9;
    }

    // Update dash cooldown
    if (player.dashCooldown > 0) {
        player.dashCooldown -= deltaTime;
    }

    // Apply velocity
    player.position.x += playerVelocity.x * deltaTime;
    player.position.z += playerVelocity.z * deltaTime;

    // Keep player in bounds
    const boundary = LEVEL_SIZE / 2 - 2;
    player.position.x = Math.max(-boundary, Math.min(boundary, player.position.x));
    player.position.z = Math.max(-boundary, Math.min(boundary, player.position.z));

    // Simple animation (bobbing)
    player.position.y = Math.abs(Math.sin(Date.now() * 0.01)) * 0.2;

    // Check for eating NPCs
    checkEating();
}

function updateNPCs() {
    npcs.forEach(npc => {
        if (!npc.userData.alive) return;

        const distanceToPlayer = npc.position.distanceTo(player.position);

        if (npc.userData.type === 'guard') {
            // Guards shoot at player
            npc.userData.shootCooldown -= deltaTime;

            if (distanceToPlayer < 20 && npc.userData.shootCooldown <= 0) {
                shootAtPlayer(npc);
                npc.userData.shootCooldown = npc.userData.shootInterval;
            }

            // Guards move toward player slowly
            if (distanceToPlayer > 10) {
                const direction = new THREE.Vector3()
                    .subVectors(player.position, npc.position)
                    .normalize();
                npc.position.x += direction.x * npc.userData.speed * deltaTime * 0.5;
                npc.position.z += direction.z * npc.userData.speed * deltaTime * 0.5;

                // Face player
                const angle = Math.atan2(direction.x, direction.z);
                npc.rotation.y = angle;
            }
        } else {
            // Civilians flee from player
            if (distanceToPlayer < npc.userData.fleeDistance) {
                const fleeDirection = new THREE.Vector3()
                    .subVectors(npc.position, player.position)
                    .normalize();
                
                npc.position.x += fleeDirection.x * npc.userData.speed * deltaTime;
                npc.position.z += fleeDirection.z * npc.userData.speed * deltaTime;

                // Face away from player
                const angle = Math.atan2(fleeDirection.x, fleeDirection.z);
                npc.rotation.y = angle;
            } else {
                // Random wandering
                if (!npc.userData.wanderTimer || npc.userData.wanderTimer <= 0) {
                    npc.userData.wanderDirection = new THREE.Vector3(
                        (Math.random() - 0.5) * 2,
                        0,
                        (Math.random() - 0.5) * 2
                    ).normalize();
                    npc.userData.wanderTimer = Math.random() * 2 + 1;
                }

                npc.userData.wanderTimer -= deltaTime;
                npc.position.x += npc.userData.wanderDirection.x * npc.userData.speed * deltaTime * 0.3;
                npc.position.z += npc.userData.wanderDirection.z * npc.userData.speed * deltaTime * 0.3;
            }
        }

        // Keep NPCs in bounds
        const boundary = LEVEL_SIZE / 2 - 2;
        npc.position.x = Math.max(-boundary, Math.min(boundary, npc.position.x));
        npc.position.z = Math.max(-boundary, Math.min(boundary, npc.position.z));
    });
}

function shootAtPlayer(guard) {
    playSound('shoot');

    // Create bullet tracer (visual only)
    const bulletGeometry = new THREE.SphereGeometry(0.2);
    const bulletMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        emissive: 0xffff00
    });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bullet.position.copy(guard.position);
    bullet.position.y = 1.5;
    scene.add(bullet);

    // Animate bullet toward player
    const direction = new THREE.Vector3()
        .subVectors(player.position, guard.position)
        .normalize();

    let bulletDistance = 0;
    const bulletSpeed = 30;
    const maxDistance = guard.position.distanceTo(player.position);

    const bulletInterval = setInterval(() => {
        bulletDistance += bulletSpeed * 0.016;
        bullet.position.x += direction.x * bulletSpeed * 0.016;
        bullet.position.z += direction.z * bulletSpeed * 0.016;

        if (bulletDistance >= maxDistance) {
            clearInterval(bulletInterval);
            scene.remove(bullet);

            // Check if hit player
            const hitDistance = bullet.position.distanceTo(player.position);
            if (hitDistance < 2) {
                // Hit! Reduce time
                gameState.time -= 10;
                if (gameState.time < 0) gameState.time = 0;
                createFloatingText('-10 TIME', player.position, '#ff0000');
            }
        }
    }, 16);
}

function checkEating() {
    npcs.forEach((npc, index) => {
        if (!npc.userData.alive) return;

        const distance = npc.position.distanceTo(player.position);
        
        // Eating range
        if (distance < 2 && isDashing) {
            eatNPC(npc, index);
        }
    });
}

function eatNPC(npc, index) {
    npc.userData.alive = false;
    
    // Play sounds
    playSound('chomp');
    playSound('scream');

    // Visual effect - blood sprite (simple red circle)
    const bloodGeometry = new THREE.CircleGeometry(1, 8);
    const bloodMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        transparent: true,
        opacity: 0.8
    });
    const blood = new THREE.Mesh(bloodGeometry, bloodMaterial);
    blood.position.copy(npc.position);
    blood.position.y = 0.1;
    blood.rotation.x = -Math.PI / 2;
    scene.add(blood);

    // Fade out blood
    setTimeout(() => {
        let opacity = 0.8;
        const fadeInterval = setInterval(() => {
            opacity -= 0.05;
            bloodMaterial.opacity = opacity;
            if (opacity <= 0) {
                clearInterval(fadeInterval);
                scene.remove(blood);
            }
        }, 50);
    }, 500);

    // Remove NPC
    scene.remove(npc);
    npcs.splice(index, 1);

    // Update game state
    gameState.humansEaten++;
    gameState.time = Math.min(gameState.time + gameState.timeGainPerHuman, gameState.maxTime);

    // Floating text
    createFloatingText('+' + gameState.timeGainPerHuman + ' TIME', npc.position, '#00ff00');

    // Check win condition
    if (gameState.humansEaten >= gameState.targetHumans) {
        endGame(true);
    }
}

function createFloatingText(text, position, color) {
    const floatingText = document.createElement('div');
    floatingText.className = 'floatingText';
    floatingText.textContent = text;
    floatingText.style.color = color;

    // Convert 3D position to screen position
    const vector = position.clone();
    vector.project(camera);

    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;

    floatingText.style.left = x + 'px';
    floatingText.style.top = y + 'px';

    document.getElementById('floatingTexts').appendChild(floatingText);

    // Remove after animation
    setTimeout(() => {
        floatingText.remove();
    }, 1000);
}

function updateCamera() {
    // Follow player from behind and above
    const cameraOffset = new THREE.Vector3(0, 10, 15);
    const rotatedOffset = cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
    
    const targetPosition = player.position.clone().add(rotatedOffset);
    camera.position.lerp(targetPosition, 0.1);
    camera.lookAt(player.position.x, player.position.y + 2, player.position.z);
}

function updateUI() {
    // Time bar
    const timePercent = (gameState.time / gameState.maxTime) * 100;
    document.getElementById('timeBar').style.width = timePercent + '%';
    document.getElementById('timeText').textContent = 'TIME: ' + Math.ceil(gameState.time);

    // Counter
    document.getElementById('counter').textContent = 
        'HUMANS EATEN: ' + gameState.humansEaten + ' / ' + gameState.targetHumans;
}

function endGame(won) {
    gameState.isGameOver = true;
    gameState.isPlaying = false;

    const endScreen = document.getElementById('endScreen');
    const endTitle = document.getElementById('endTitle');
    const endStats = document.getElementById('endStats');

    if (won) {
        endTitle.textContent = 'DISTORTUS REX DEVOURS THE WORLD!';
        endTitle.style.color = '#00ff00';
    } else {
        endTitle.textContent = 'SECURITY NEUTRALIZED THE CREATURE';
        endTitle.style.color = '#ff0000';
    }

    endStats.textContent = 'Humans Eaten: ' + gameState.humansEaten + ' / ' + gameState.targetHumans;
    endScreen.classList.add('show');
}

// ============================================
// ANIMATION LOOP
// ============================================

function animate() {
    requestAnimationFrame(animate);
    
    updateGame();
    renderer.render(scene, camera);
}

// ============================================
// START
// ============================================

window.addEventListener('load', init);

