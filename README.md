Singularity ASCII & Relativistic Black Hole
===========================================
<img width="2540" height="1312" alt="image" src="https://github.com/user-attachments/assets/8570f1bf-4d1c-46dd-955c-04fee42cc7f3" />

An interactive, full-screen simulator of a Schwarzschild black hole accretion disk with relativistic gravitational lensing. This project features a hybrid rendering system that allows seamless transitions between high-contrast retro-terminal digital modes and a smooth, volumetric astrophysical plasma simulation.

It models how the intense gravitational pull of a singularity bends light rays, wrapping the back of the disk around the event horizon to form a symmetrical glowing ring, while incorporating advanced relativistic physics effects.


Project Structure
-----------------

*   globals.js - Global state variables, automatic pulse values, and active theme indices.
*   utils.js - Relativistic color-mapping (thermodynamic plasma spectra) and 3D rotation math.
*   particle.js - Keplerian orbits, accretion disk particle physics, and gravitational time dilation.
*   render.js - Spacetime grid mesh rendering, smooth volumetric particle shaders, and ASCII grid cell projections.
*   singularity.js - Main loop initialization, automated pulse timers, and manual keyboard/mouse event listeners.
*   index.html - Clean HTML layout and canvas mounting wrapper.
*   style.css - Full-screen viewport styles with a deep space radial vignette.
*   Dockerfile - Production-ready Nginx container config.
*   docker-compose.yml - Single-command local runner.


Interactive Controls
--------------------

*   [SPACEBAR] - Toggle automatic mode and theme cycling ON / OFF (visual state indicator is shown faintly in the top-left corner).
*   [LEFT / RIGHT ARROWS] - Manually step backward or forward through rendering styles (Photorealistic, ASCII terminal, Matrix green, Circles).
*   [MOUSE CLICK] - Inject energy locally to trigger realistic gravitational wave ripples through the accretion disk.
*   [MOUSE DRAG] - Click and drag anywhere to rotate the pitch and yaw of the accretion disk dynamically.


Advanced Physics & Visual Features
----------------------------------

*   Astrophysical (Photorealistic) Mode: Seamlessly merges into an additive volumetric gas glow simulation with smooth, light-lensed coordinates.
*   Scientifically Hot Plasma Themes: Replaced cold neon palettes with realistic thermodynamic spectra (Gargantua Amber, Solar Flare, Accretion Fire, Relativistic Red Dust).
*   Relativistic Time Dilation: Orbits dynamically slow down as matter clusters closer to the photon ring near the event horizon.
*   Relativistic Doppler Beaming: Simulates asymmetric accretion brightness; gas moving toward the observer shines white-hot, while gas moving away dims into dark crimson.
*   Gravitational Redshift: Shorthand calculations shift close-orbiting gas into highly redshifted infrared/black boundaries near the horizon shadow.
*   Einstein Ring & Lensing: Projects lensed background stars and wraps background accretion gas into a primary and secondary Einstein ring.
*   Cinematic Vignetting: Fully integrated CSS vignette overlay darkens outer edges, elevating the contrast and depth of the singularity.


How to Run with Docker
----------------------

You can easily build and run the simulation inside a lightweight Docker container.

Using Docker Compose (Recommended)

1. Run the following command in the project directory:
   docker compose up --build -d

2. Open your browser and navigate to:
   http://localhost:8080

3. To stop the container, run:
   docker compose down
