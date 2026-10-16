# Platforms Supported & System Requirements

This document outlines the operating systems, browsers, mobile architectures, resolution breakpoints, and hardware requirements supported by **Karachi Hole.io (City Devourer & Civic Patrol)**.

---

## 1. Supported Platform Matrix

| Platform | Runtime / Delivery | Minimum Version | Status | Performance Profile |
| :--- | :--- | :--- | :--- | :--- |
| **Android Mobile & Tablet** | Capacitor Native APK / AAB | Android 8.0 (Oreo, API 26) | **Production Supported** | 60 FPS Target (Hardware Accelerated) |
| **Google Chrome (Desktop)** | WebGL 2.0 / WebGL 1.0 Fallback | Chrome 90+ (macOS, Windows, Linux) | **Production Supported** | 60 FPS |
| **Apple Safari (Desktop)** | WebKit WebGL | Safari 14+ (macOS 11+) | **Production Supported** | 60 FPS |
| **Mozilla Firefox** | Gecko WebGL | Firefox 88+ (macOS, Windows, Linux) | **Production Supported** | 60 FPS |
| **Microsoft Edge** | Chromium WebGL | Edge 90+ (Windows 10/11) | **Production Supported** | 60 FPS |
| **iOS / iPadOS Safari (Mobile)** | WebKit Mobile Touch | iOS 14.5+ (iPhone & iPad) | **Production Supported** | 60 FPS |
| **Android Chrome (Mobile Web)** | Chromium Mobile Touch | Chrome Mobile 90+ | **Production Supported** | 60 FPS |
| **Capacitor Hybrid Container** | Capacitor 7.x / 8.x WebView | Android System WebView 80+ | **Production Supported** | 60 FPS Native Touch Bridge |

---

## 2. Screen Size & Responsive Breakpoint Specifications

Karachi Hole.io is engineered with a fully dynamic CSS & Three.js projection system that scales seamlessly from small smartphones to ultra-wide desktop monitors:

```
+---------------------------------------------------------------------------------------+
|  Breakpoint Range       | Target Form Factor             | HUD & Layout Adaptation    |
+-------------------------+--------------------------------+----------------------------+
|  320px - 480px          | Compact Smartphones (Portrait) | * Single-column layout     |
|                         | (iPhone SE, Galaxy A, Pixel)   | * Stacked mission banners  |
|                         |                                | * Scaled 100px radar       |
|                         |                                | * Touch targets >= 44px    |
|                         |                                | * Compact text tags        |
+-------------------------+--------------------------------+----------------------------+
|  481px - 768px          | Large Phones & Phablets        | * Dual-row top status      |
|                         | (iPhone 14 Pro Max, Galaxy S)  | * 120px radar HUD          |
|                         |                                | * Multi-column quiz cards  |
+-------------------------+--------------------------------+----------------------------+
|  769px - 1024px         | Tablets & Small Laptops        | * Full top status bar      |
|                         | (iPad Mini, iPad Air, Surface) | * Integrated scoreboard    |
|                         |                                | * 130px radar HUD          |
+-------------------------+--------------------------------+----------------------------+
|  1025px - 1440px        | Desktop & Full Laptops         | * Full HUD with live top 5 |
|                         | (MacBook Pro, 1080p Desktop)   | * Expanded minimap         |
|                         |                                | * Full billboard details   |
+-------------------------+--------------------------------+----------------------------+
|  1440px+ (Ultra-Wide)   | 2K, 4K & Ultra-Wide Monitors   | * Max-width container clamp|
|                         |                                | * Scaled shadow maps       |
|                         |                                | * Expanded visual distance |
+---------------------------------------------------------------------------------------+
```

---

## 3. Hardware & GPU Requirements

### Recommended Hardware
* **Desktop / Laptop**:
  * **CPU**: Dual-Core 2.0 GHz or higher (Intel Core i3/i5, Apple Silicon M1/M2/M3, AMD Ryzen).
  * **GPU**: Intel Iris Plus / UHD 620, Apple GPU, NVIDIA GeForce GTX 750+, AMD Radeon R7+.
  * **Memory**: 4 GB RAM minimum (8 GB recommended).
  * **Screen**: 1280x720 or higher.
* **Mobile / Tablet**:
  * **SoC**: Snapdragon 660+, MediaTek Helio G80+, Samsung Exynos 9611+, Apple A11 Bionic+.
  * **Memory**: 3 GB RAM minimum (4 GB+ recommended).
  * **OpenGL ES**: ES 3.0 / Vulkan / WebGL.

---

## 4. Input Devices & Control Schemes

Karachi Hole.io automatically detects and supports multiple input modalities simultaneously:

1. **Virtual Touch Joystick (Mobile & Touchscreens)**:
   * Floating, dynamic base positioned on the left thumb region.
   * Auto-centering knob with fluid velocity clamping.
   * Dedicated touch-activated **TURBO Boost Button** on the right thumb region.
2. **Keyboard Controls (Desktop / Laptop)**:
   * **W / Up Arrow**: Move Forward (North).
   * **S / Down Arrow**: Move Backward (South).
   * **A / Left Arrow**: Steer Left (West).
   * **D / Right Arrow**: Steer Right (East).
   * **Spacebar / Shift**: Engage Turbo Boost.
   * **P / Escape**: Trigger Pause Patrol modal.
3. **Mouse Pointer Dragging**:
   * Click and drag anywhere across the 3D canvas to steer the hole relative to drag vector.
