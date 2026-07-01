<b>Singularity ASCII Black Hole</b>

<img width="2553" height="1282" alt="image" src="https://github.com/user-attachments/assets/1177e168-f72f-4669-b11a-8a2b693cab4c" />

An interactive, full-screen simulator of a Schwarzschild black hole accretion disk with relativistic gravitational lensing, rendered in real-time ASCII/Halftone art.

This project visualizes how the intense gravitational pull of a singularity bends light rays, wrapping the back of the disk around the event horizon to form a symmetrical glowing ring.

<b>Project Structure</b>

* index.html - Minimal HTML setup and canvas container.
* style.css - Full-screen layout and page styling.
* singularity.js - Main simulation logic and relativistic p5.js code.
* Dockerfile - Lightweight Nginx container configuration.
* docker-compose.yml - Single-command run configuration.

<b>Features</b>

* Dual-Image Lensing: Simulates both primary and secondary lensed images (photon ring) for a highly realistic event horizon visualization.
* Interactive 3D Orbit: Drag-to-rotate controls allow you to view and flip the black hole under any angle.
* Dynamic Scaling (Pulse): Hold down the mouse button to expand the accretion disk, smoothly returning to normal size on release.
* Smooth Style Transitions: Silky cross-fades between halftone circles, classic density ASCII-code, and a green terminal matrix style.
* Responsive Layout: The simulation automatically scales to fit any screen resolution or window size.

<b>How to Run with Docker</b>

You can easily build and run the simulation inside a lightweight Docker container.

<b>Using Docker Compose</b>

1. Run the following command in the project directory:
docker compose up --build -d

2. Open your browser and navigate to:
http://localhost:8080

3. To stop the container, run:
docker compose down

<b>Using Pure Docker</b>

1. Build the image:
docker build -t singularity-ascii .

2. Run the container:
docker run -d -p 8080:80 singularity-ascii

3. Open your browser and navigate to:
http://localhost:8080
