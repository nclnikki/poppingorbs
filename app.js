import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Raycaster and Mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Orbs Array
const orbs = [];

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Gradient Background
const gradientTexture = new THREE.TextureLoader().load(
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOLcDALoDrP0WmbwErDP1UdDYC1elEljq0Lw&s' // Artistic gradient image
);
scene.background = gradientTexture;

// Orb Creation Function
function createOrb(position) {
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(`hsl(${Math.random() * 360}, 70%, 50%)`),
    emissive: new THREE.Color(`hsl(${Math.random() * 360}, 50%, 30%)`),
  });
  const orb = new THREE.Mesh(geometry, material);
  orb.position.set(position.x, position.y, position.z);
  scene.add(orb);
  orbs.push(orb);
}

// Populate Orbs
for (let i = 0; i < 30; i++) {
  createOrb({
    x: Math.random() * 20 - 10,
    y: Math.random() * 20 - 10,
    z: Math.random() * 20 - 10,
  });
}

// Event Listeners
document.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

document.addEventListener('click', () => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(orbs);

  intersects.forEach((intersect) => {
    const orb = intersect.object;

    // Make the orb "explode" into particles
    const particles = [];
    for (let i = 0; i < 10; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: orb.material.color,
      });
      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(orb.position);
      particle.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      );
      scene.add(particle);
      particles.push(particle);
    }

    // Animate particles and remove orb
    setTimeout(() => {
      particles.forEach((p) => scene.remove(p));
    }, 1000);
    scene.remove(orb);
  });
});

// Scroll Interaction
document.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  camera.position.z = 20 + scrollTop * 0.01;
  orbs.forEach((orb) => {
    orb.position.y += Math.sin(scrollTop * 0.01) * 0.1;
  });
});

// Resize Handling
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate Orbs with different speeds for variety
  orbs.forEach((orb, index) => {
    orb.rotation.x += 0.01 + Math.random() * 0.02; // Slightly random rotation speed
    orb.rotation.y += 0.01 + Math.random() * 0.02;

    // Add floating effect (oscillation)
    orb.position.y += Math.sin(Date.now() * 0.002 + index) * 0.02;
  });

  // Particle Explosion Animation
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(orbs);

  intersects.forEach((intersect) => {
    intersect.object.material.color.set(0xffcc00); // Highlight on hover
  });

  renderer.render(scene, camera);
}

camera.position.z = 20; // Adjusted to ensure orbs are visible
animate();

