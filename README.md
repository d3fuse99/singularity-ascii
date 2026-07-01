<h1>Singularity ASCII Black Hole</h1>
<img width="2553" height="1282" alt="image" src="https://github.com/user-attachments/assets/66342b1a-b7c8-407e-9170-c7aa4a4e95f6" />

<p>An interactive, full-screen simulator of a Schwarzschild black hole accretion disk with relativistic gravitational lensing, rendered in real-time ASCII/Halftone art.</p>

<p>This project visualizes how the intense gravitational pull of a singularity bends light rays, wrapping the back of the disk around the event horizon to form a symmetrical glowing ring.</p>

<h2>Project Structure</h2>

<ul>
  <li><strong>index.html</strong> - Minimal HTML setup and canvas container.</li>
  <li><strong>style.css</strong> - Full-screen layout and page styling.</li>
  <li><strong>singularity.js</strong> - Main simulation logic and relativistic p5.js code.</li>
  <li><strong>Dockerfile</strong> - Lightweight Nginx container configuration.</li>
  <li><strong>docker-compose.yml</strong> - Single-command run configuration.</li>
</ul>

<h2>Features</h2>

<ul>
  <li><strong>Dual-Image Lensing:</strong> Simulates both primary and secondary lensed images (photon ring) for a highly realistic event horizon visualization.</li>
  <li><strong>Interactive 3D Orbit:</strong> Drag-to-rotate controls allow you to view and flip the black hole under any angle.</li>
  <li><strong>Dynamic Scaling (Pulse):</strong> Hold down the mouse button to expand the accretion disk, smoothly returning to normal size on release.</li>
  <li><strong>Smooth Style Transitions:</strong> Silky cross-fades between halftone circles, classic density ASCII-code, and a green terminal matrix style.</li>
  <li><strong>Responsive Layout:</strong> The simulation automatically scales to fit any screen resolution or window size.</li>
</ul>

<h2>How to Run with Docker</h2>

<p>You can easily build and run the simulation inside a lightweight Docker container.</p>

<h3>Using Docker Compose</h3>

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
