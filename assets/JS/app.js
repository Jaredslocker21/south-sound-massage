document.addEventListener("DOMContentLoaded", function () {
  const circle = document.querySelector(".circle");
  const circleContainer = document.querySelector(".circle-container");

  // If this page doesn't have the floating ball, do nothing (prevents JS errors)
  if (!circle || !circleContainer) return;

  let mouseX = 0.5;
  let mouseY = 0.5;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId = null;
  let mouseListenerAttached = false;

  const maxX = 18; // px
  const maxY = 18; // px
  const ease = 0.08; // smoothing factor

  function onMouseMove(event) {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;

    mouseX = event.clientX / w;
    mouseY = event.clientY / h;

    targetX = (mouseX - 0.5) * maxX;
    targetY = (mouseY - 0.5) * maxY;
  }

  function animate() {
    // Smoothly approach target
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;

    // Extra subtle "float" even when idle
    const t = Date.now() * 0.001;
    const floatX = Math.sin(t * 0.9) * 1.2;
    const floatY = Math.cos(t * 0.8) * 1.2;

    circle.style.transform = `translate(${currentX + floatX}px, ${currentY + floatY}px)`;

    rafId = requestAnimationFrame(animate);
  }

  function start() {
    if (!rafId) rafId = requestAnimationFrame(animate);

    if (!mouseListenerAttached) {
      document.addEventListener("mousemove", onMouseMove, { passive: true });
      mouseListenerAttached = true;
    }
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (mouseListenerAttached) {
      document.removeEventListener("mousemove", onMouseMove);
      mouseListenerAttached = false;
    }
    circle.style.transform = "none";
  }

  function handleResize() {
    if (window.innerWidth <= 400) {
      circleContainer.style.display = "none";
      stop();
    } else {
      circleContainer.style.display = "flex";
      start();
    }
  }

  handleResize();
  window.addEventListener("resize", handleResize);
});
