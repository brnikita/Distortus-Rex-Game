# 🦖 Distortus Rex - Browser 3D Horror Game

A lightweight browser-based 3D arcade horror game where you play as a mutated dinosaur escaping a lab and devouring humans to survive!

## 🎮 How to Play

### Controls
- **WASD / Arrow Keys**: Move the dinosaur
- **SPACE**: Dash/Attack (devour humans when close)
- **ESC**: Restart game

### Objective
- **Goal**: Devour 30 humans to win
- **Survival**: Keep your time from reaching zero
- **Mechanics**:
  - Time slowly decreases as you move
  - Eating humans adds +15 time
  - Security guards shoot at you, reducing time by 10
  - Civilians flee when you approach

## 🚀 Running the Game

### Option 1: Simple Local Server (Recommended)

1. **Using Python** (if installed):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

2. **Using Node.js** (if installed):
   ```bash
   npx http-server -p 8000
   ```

3. **Using PHP** (if installed):
   ```bash
   php -S localhost:8000
   ```

4. Open your browser and navigate to: `http://localhost:8000`

### Option 2: Live Server Extension (VS Code/Cursor)

1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 3: Direct File Opening

Simply open `index.html` directly in your browser (may have limitations with some browsers).

## 🎯 Game Features

### ✅ Implemented
- ✅ 3D environment with lab building, fences, and props
- ✅ Player character (Distortus Rex) with glowing eyes
- ✅ Smooth WASD movement and dash mechanic
- ✅ 15 civilian NPCs that flee from player
- ✅ 5 security guards that shoot at player
- ✅ Eating mechanic with visual blood effects
- ✅ Time system (decreases over time, increases when eating)
- ✅ HUD with time bar and human counter
- ✅ Floating damage/gain text
- ✅ Win/lose conditions
- ✅ Restart functionality
- ✅ Basic procedural audio (chomp, scream, shoot sounds)
- ✅ Third-person camera following player
- ✅ Atmospheric lighting and fog

## 🛠️ Technical Details

### Tech Stack
- **Engine**: Three.js (r128)
- **Language**: Vanilla JavaScript
- **UI**: HTML/CSS overlay
- **Audio**: Web Audio API (procedural sounds)
- **File Size**: ~30KB (excluding Three.js CDN)

### Performance Optimizations
- No dynamic shadows (performance)
- Instanced geometry for repeated objects
- Simple low-poly models
- Efficient collision detection
- Minimal draw calls
- Fog to limit render distance

### Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile: ⚠️ Limited (touch controls not implemented)

## 📁 Project Structure

```
Distortus-Rex-Game/
├── index.html          # Main HTML with UI overlay
├── game.js             # Complete game logic
├── README.md           # This file
└── Game.md            # Original game design document
```

## 🎨 Customization

### Adjusting Difficulty

Edit these constants in `game.js`:

```javascript
// Line 24-30
const PLAYER_SPEED = 8;          // Player movement speed
const DASH_SPEED = 20;           // Dash attack speed
const NPC_COUNT = 15;            // Number of civilians
const GUARD_COUNT = 5;           // Number of guards

// Line 11-16 (gameState)
timeDecayRate: 0.1,              // Time lost per second
timeGainPerHuman: 15,            // Time gained per human eaten
targetHumans: 30,                // Humans needed to win
```

### Changing Colors

Edit materials in `game.js`:

```javascript
// Player color (line ~220)
color: 0x2a5a2a,  // Green dinosaur

// Guard uniform (line ~340)
color: 0x1a1a4a,  // Blue uniform

// Civilian clothes (line ~340)
color: 0x4a4a4a,  // Gray clothes
```

## 🐛 Known Limitations

- Audio is procedural (simple beeps) - replace with actual sound files for better experience
- No mobile touch controls
- NPCs use simple AI (no pathfinding)
- No particle effects (kept simple for performance)
- Models are primitive shapes (replace with actual 3D models for better visuals)

## 🚀 Future Enhancements

Potential improvements:
- [ ] Load actual 3D models (.glb format)
- [ ] Add real audio files
- [ ] Implement touch controls for mobile
- [ ] Add more enemy types
- [ ] Power-ups and special abilities
- [ ] Multiple levels
- [ ] High score system
- [ ] Better particle effects

## 📝 Credits

Built following the design document in `Game.md`
- Three.js for 3D rendering
- Web Audio API for sound

## 📄 License

Free to use and modify. Have fun! 🦖

---

**Enjoy devouring humans as Distortus Rex!** 👾
