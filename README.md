<h1>Singularity ASCII & Relativistic Black Hole</h1>

<p>An interactive, full-screen simulator of a Schwarzschild black hole accretion disk with relativistic gravitational lensing. This project features a hybrid rendering system that allows seamless transitions between high-contrast retro-terminal digital modes and a smooth, volumetric astrophysical plasma simulation.</p>
<img width="2559" height="1315" alt="image" src="https://github.com/user-attachments/assets/9210fc1e-fcd7-4c86-82fc-45738586961f" />
<img width="2553" height="1313" alt="image" src="https://github.com/user-attachments/assets/ba74af2d-3050-4d61-95dc-e3cb223c3ba4" />

<p>It models how the intense gravitational pull of a singularity bends light rays, wrapping the back of the disk around the event horizon to form a symmetrical glowing ring, while incorporating advanced relativistic physics effects.</p>

<h2>Project Structure</h2>

<ul>
  <li><strong>index.html</strong> - Minimal HTML setup and canvas container.</li>
  <li><strong>style.css</strong> - Full-screen layout with absolute positioning to prevent clipping.</li>
  <li><strong>singularity.js</strong> - Main simulation logic, Keplerian physics, and relativistic rendering.</li>
  <li><strong>Dockerfile</strong> - Lightweight Nginx container configuration.</li>
  <li><strong>docker-compose.yml</strong> - Single-command run configuration.</li>
</ul>

<h2>Advanced Physics & Visual Features</h2>

<ul>
  <li><strong>Astrophysical (Photorealistic) Mode:</strong> Generates smooth, volumetric-looking gas particles with additive blending (glow effect), creating a realistic space simulation that transitions seamlessly with the terminal modes.</li>
  <li><strong>Relativistic Time Dilation:</strong> Matter close to the inner edge of the accretion disk (near the event horizon shadow) dynamically slows down in orbit from the observer's perspective, creating realistic density clustering.</li>
  <li><strong>Dual-Image Lensing:</strong> Simulates both primary and secondary lensed images (photon ring) for a highly realistic event horizon visualization.</li>
  <li><strong>Relativistic Doppler Beaming:</strong> Models the asymmetric brightness of the accretion disk. Plasma orbiting towards the camera appears shifted to bright yellow-white, while plasma moving away dims to deep crimson.</li>
  <li><strong>Einstein Ring Lensing of Background Stars:</strong> Distant background stars are projected in 3D and dynamically warp into beautiful curved arcs as they pass behind the black hole.</li>
  <li><strong>Gravitational Wave Ripples:</strong> Clicking inside the canvas triggers a physical sine-wave ripple that propagates outward, distorting the space coordinates of the disk.</li>
  <li><strong>Dynamic Plasma Turbulence:</strong> Uses multi-frequency Perlin noise to simulate organic plasma swirls, density waves, and rotating magnetic hotspots.</li>
  <li><strong>Chromatic Aberration:</strong> Transitioning between modes or triggering spasms splits the red and cyan color channels of the ASCII grid for a high-tech glitch effect.</li>
</ul>

<h2>How to Run with Docker</h2>

<p>You can easily build and run the simulation inside a lightweight Docker container.</p>

<h3>Using Docker Compose (Recommended)</h3>

<p>1. Run the following command in the project directory:</p>

```bash
docker compose up --build -d
```

<p>2. Open your browser and navigate to:</p>
<p>http://localhost:8080</p>

<p>3. To stop the container, run:</p>

```bash
docker compose down
```

<h3>Using Pure Docker</h3>

<p>1. Build the image:</p>

```bash
docker build -t singularity-ascii .
```

<p>2. Run the container:</p>

```bash
docker run -d -p 8080:80 singularity-ascii
```

<p>3. Open your browser and navigate to:</p>
<p>http://localhost:8080</p>

<h2>Built With</h2>

<ul>
  <li>HTML5 / CSS3</li>
  <li>JavaScript (ES6)</li>
  <li>p5.js Library</li>
</ul>
