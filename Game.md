# Distortus Rex — One-Day Browser 3D Game

A small browser-based 3D arcade horror game. The player controls a mutated dinosaur that escapes a lab and devours humans to stay alive. Built to be extremely lightweight, easy to maintain, and playable directly in the browser.

---

## 🧱 Recommended Tech Stack (Popular + Easy + Maintainable)

### 🥇 Engine: **PlayCanvas**
- Open-source runtime + free cloud editor
- Used by NVIDIA, Snapchat, and Miniclip
- Very small builds (1–5 MB total)
- Runs natively in browser (WebGL/WebGPU ready)
- No heavy exports, no Unity/Unreal installs

| Component | Solution |
|-----------|----------|
| Engine | **PlayCanvas** |
| Language | **JavaScript** |
| Model Format | **glTF (.glb)** |
| Physics | Built-in **Ammo.js** |
| UI | **HTML/CSS** overlay or PlayCanvas UI |
| Audio | WebAudio (via engine) |
| Hosting | GitHub Pages, Itch.io, Netlify |

### 🎨 Asset Workflow (Common Across All Tools)
| Task | Tool |
|------|------|
| 3D Modeling | **Blender** |
| Textures | **Krita** or **Photopea (web)** |
| Sounds | **Audacity** + freesound.org |
| Version Control | **GitHub** |

### 🌐 Hosting Recommendations
| Platform | Notes |
|----------|-------|
| **Itch.io** | best for game releases |
| **GitHub Pages** | great for dev and free |
| **Netlify/Vercel** | CI deployment, custom domain |

---

## 🎮 Genre & Core Gameplay
- **Genre:** Web mini-horror arcade / third-person runner
- **Session Length:** 2–5 min
- **Goal:** Devour humans to prevent time from running out
- **Lose Condition:** Time hits zero or security kills you

### Core Actions
| Action | Input |
|--------|-------|
| Move | WASD / Arrow Keys |
| Dash/Attack | SPACE or Left Mouse Button |
| Pause/Restart | ESC |

### Key Gameplay Mechanics
- Running consumes time slowly
- Devouring humans **adds time**
- Security guards **shoot the player**
- NPCs flee when player approaches

---

## 🧪 Game Level (Browser-Optimized)
A small outdoor fenced laboratory yard, sized about **50×50 meters**.

### Environment Objects (Optimized)
| Object | Optimization Strategy |
|--------|-----------------------|
| Building | one modular mesh |
| Fence | instanced repeating mesh |
| Lights | baked glow + fake shadow circle |
| Debris/Props | max 8 low-poly items |
| Ground | single texture, no tiling shaders |

> 🔎 No dynamic shadows — use unlit lights + emissive effects.

---

## 🦖 Player: Distortus Rex
Low-poly mutant dinosaur.

### Visual Characteristics
- Distorted stretched jaw (scaled vertices)
- Glowing eyes (unlit emissive)
- Noise/distortion shader on skin
- Disproportionate limbs

### Animation Requirements (Minimal)
| State | Notes |
|-------|-------|
| Idle | subtle breathing |
| Run | single loop |
| Eat | instant snap + freeze pose |

---

## 👥 NPC Humans
Three NPC types with lightweight behaviors:

| Type | Behavior | Extra |
|------|----------|-------|
| Scientist | fast fleeing | no combat |
| Worker | erratic panic movement | easiest to catch |
| Security Guard | shoots via raycast | reduces player time/health |

### Eating Interaction (Browser Safe)
- NPC disappears instantly
- 2D blood sprite burst + crunch sound
- Floating text **+1 Time**

> ⚠ No physics ragdolls to keep performance high.

---

## 📉 HUD & UI (HTML Overlay Recommended)
Use lightweight **HTML/CSS** overlay or PlayCanvas UI elements.

### UI Elements
| Element | Description |
|---------|-------------|
| Time Bar | decreases over time, increases when eating |
| Counter | number of humans eaten |
| Floating Text | **+1 Time** at NPC position |
| End Screen | restart button (HTML or UI panel) |

---

## 🔊 Audio Guidelines
- Short music loop (≤ 15 sec, `.ogg`)
- Reuse one scream for all humans
- One roar + one chomp sound
- Format: **Ogg for music, MP3/Ogg for SFX**

---

## 🏆 Win/Lose Conditions
| Condition | Result |
|-----------|--------|
| Ate 30 Humans | **“Distortus Rex Devours the World!”** |
| Time/Health Reaches 0 | **“Security Neutralized the Creature.”** |

### Restart
- Tap/Click/Press ESC to restart
- Full reset of level state and counters

---

## ☑️ One-Day Browser Development Plan

| Step | Time | Work |
|------|------|------|
| Level + props setup | 1 hr | import/build low-poly scene |
| Player movement + dash | 1 hr | collision capsule + velocity burst |
| NPC fleeing + guard shooting | 2 hrs | nav avoidance + raycast hit |
| Eating system | 1 hr | collision → disappear → +time |
| UI (HTML + CSS) + audio | 1.5 hrs | counters, overlay, sounds |
| Optimization & deploy | 0.5 hr | reduce draw calls, upload to Itch/GitHub |

---

## 📦 Optional Free Assets List (upon request)
I can provide:
- Dinosaur model (mutated tweakable)
- Human low-poly NPC pack
- Lab props
- HTML UI template
- JavaScript AI scripts

---

### 👉 Want the next step?
Choose what you want:

- 🧩 **Starter PlayCanvas project (link + folders)**
- 📂 **Asset pack recommendations**
- 🤖 **Base AI and eating scripts**

Which one should I generate?