<h1>Singularity ASCII Black Hole</h1>

<p align="center">
<img width="2559" height="1317" alt="image" src="https://github.com/user-attachments/assets/f67e1dc0-757c-4f3f-aa98-6cbbf3a28c7a" />
</p>

<p>An interactive, full-screen simulator of a Schwarzschild black hole accretion disk with relativistic gravitational lensing, rendered in real-time ASCII/Halftone art.</p>

<p>This project visualizes how the intense gravitational pull of a singularity bends light rays, wrapping the back of the disk around the event horizon to form a symmetrical glowing ring, while incorporating advanced relativistic physics effects.</p>

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

<ol>
  <li>Run the following command in the project directory:
    <pre><code>docker compose up --build -d</code></pre>
  </li>
  <li>Open your browser and navigate to:
    <pre><code>http://localhost:8080</code></pre>
  </li>
  <li>To stop the container, run:
    <pre><code>docker compose down</code></pre>
  </li>
</ol>

<h3>Using Pure Docker</h3>

<ol>
  <li>Build the image:
    <pre><code>docker build -t singularity-ascii .</code></pre>
  </li>
  <li>Run the container:
    <pre><code>docker run -d -p 8080:80 singularity-ascii</code></pre>
  </li>
  <li>Open your browser and navigate to:
    <pre><code>http://localhost:8080</code></pre>
  </li>
</ol>

<h2>Built With</h2>

<ul>
  <li>HTML5 / CSS3</li>
  <li>JavaScript (ES6)</li>
  <li>p5.js Library</li>
</ul>
