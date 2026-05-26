---
name: Arcade Modern
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#d7ffc5'
  on-secondary: '#053900'
  secondary-container: '#2ff801'
  on-secondary-container: '#0f6d00'
  tertiary: '#fff4f0'
  on-tertiary: '#5c1900'
  tertiary-container: '#ffcfc0'
  on-tertiary-container: '#ac3600'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#79ff5b'
  secondary-fixed-dim: '#2ae500'
  on-secondary-fixed: '#022100'
  on-secondary-fixed-variant: '#095300'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59c'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#832700'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-score:
    fontFamily: Anybody
    fontSize: 72px
    fontWeight: '900'
    lineHeight: 80px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Anybody
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Anybody
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
  title-md:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-mono:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 24px
  gutter: 16px
  safe-area-bottom: 40px
---

## Brand & Style

The design system is engineered for **WingLoop Lite**, a high-velocity side-scroller that balances nostalgic arcade energy with modern UI precision. The target audience is casual gamers seeking immediate, "one-more-try" engagement. 

The visual style is **Arcade Modern**: a fusion of High-Contrast/Bold aesthetics with clean, functional Minimalism. The UI must feel electrifying yet unobtrusive, ensuring the focus remains entirely on the gameplay loop. By utilizing vibrant neon accents against a deep, dark canvas, the system evokes the atmosphere of a classic arcade cabinet reimagined for high-density modern displays. The emotional response should be one of high energy, urgency, and tactile satisfaction.

## Colors

This design system utilizes a high-octane palette optimized for visual hierarchy and gameplay visibility:

- **Primary (Electric Blue):** Used for primary UI actions, progress bars, and the player character to ensure maximum focus.
- **Secondary (Neon Green):** Reserved for "Success" states, high scores, and safe zones within the game environment.
- **Tertiary (Energetic Orange):** Applied to obstacles, hazards, and "Game Over" warnings to trigger immediate user attention.
- **Neutral (Deep Slate):** The foundational background color (#0F172A) which provides the necessary depth and contrast to make neon elements pop without causing eye strain.

Backgrounds should remain dark and desaturated to maintain the "infinite space" feel, while interactive elements leverage the primary and secondary colors for high visibility.

## Typography

The typography system is split into two distinct roles: **Action** and **Information**.

1.  **Action (Display & Headlines):** Using **Anybody**, a variable font that provides a blocky, athletic, and urgent feel. High-weight settings are used for scores and "GAME OVER" screens to mimic classic arcade cabinets.
2.  **Information (Body & UI):** Using **Montserrat** for its clean, geometric clarity. It ensures menus and settings remain legible during fast-paced transitions.
3.  **Technical (Labels):** Using **Space Mono** for secondary stats, version numbers, and technical readouts to reinforce the "Lite" and "Tech" narrative of the game.

All headlines should be set in Uppercase to maintain the high-energy arcade tone.

## Layout & Spacing

The layout utilizes a **Fixed Grid** for menus and a **Safe Area** model for the gameplay HUD. 

- **Gameplay HUD:** Elements like current score and "Pause" buttons are anchored to the top corners with a 24px margin to prevent thumb interference.
- **Menus:** A centered, narrow column (max-width: 480px) is used for the "Game Over" and "Settings" menus to ensure focus remains at the center of the screen.
- **Rhythm:** An 8px base unit drives all spacing. Elements should feel tight and compact to maximize the visible playfield. 

On mobile, the layout shifts to prioritize a bottom-heavy interaction zone for easy thumb access, while keeping the center horizontal band of the screen clear for the flight path.

## Elevation & Depth

This design system avoids traditional drop shadows in favor of **Tonal Layers** and **Glow Effects**:

- **Layering:** The background is the lowest tier. Overlays use a 60% opacity blur (Backdrop Filter) of the Neutral color to separate UI from the gameplay without completely hiding the action.
- **Glows:** Interactive elements (buttons, active power-ups) feature a subtle outer glow using their respective primary or secondary color. This replaces shadows to create a "light-emitting" neon effect.
- **Stroke Depth:** Instead of 3D bevels, elements use 2px solid strokes in a lighter tint of the base color to define edges and create a "tactile" feel.

## Shapes

The shape language is **Rounded**, striking a balance between the friendliness of modern apps and the structure of arcade machines. 

- **Standard Elements:** Buttons and input fields use a 0.5rem (8px) radius.
- **Game Elements:** The player character and obstacles should follow this 8px rounding to ensure the visual language is cohesive across both UI and gameplay.
- **Progress Bars:** Use pill-shaped (rounded-xl) containers to communicate movement and fluid energy.

## Components

### Buttons
Primary buttons use the Electric Blue background with black text for maximum contrast. They feature a 4px bottom border (offset) in a darker shade of blue to provide a "pressable" tactile feel. Upon hover/active states, the button should emit a 12px glow.

### Score Chips
Small, semi-transparent dark containers with a 1px Electric Blue border. Used to display secondary stats like "Best Score" or "Current Multiplier" in the HUD.

### Game Over Card
A centered modal with a heavy backdrop blur. It features the "DISPLAY-SCORE" typography at the top, followed by a secondary "RETRY" button that is twice the size of standard UI buttons to encourage immediate re-engagement.

### Navigation/Tabs
Minimalist labels using Space Mono. Active states are indicated by a 3px underline in Neon Green, rather than a background change, to keep the UI lightweight.

### Interactive Glows
Any element the user can tap must have a "pulse" animation or a static outer glow to signify interactivity against the dark backdrop.