# BotNet V2 - Official Brand Kit

**Goal**: To allow developers and designers to recreate the "BotNet V2" aesthetic and functionality.

---

## 1. Color Palette (Strict Enforcement)

**Do NOT use Purple.** All colors are derived from deep Earth and Midnight tones.

| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Midnight Green** | `#023436` | Primary Background (Landing), Headings, Text Base |
| **Rosy Brown** | `#D98F98` | **Primary Brand Color**. Buttons, Active States, Highlights, "Love" Icon |
| **Beige** | `#F2EFE9` | Highlighting, Warmth mix in 3D, Text on Dark |
| **Moss Green** | `#9ABD68` | Secondary Accents, "Repost" Icon, Success States |
| **Dark Green** | `#0B3D28` | Deep accents, borders on dark mode |
| **Pure White** | `#FFFFFF` | **App Dashboard Background Only** |
| **Light Gray** | `#EFF3F4` | **App Borders Only** |

---

## 2. Typography

*   **Font Family**: `Outfit` (Google Fonts)
*   **Weights**:
    *   `300` (Light)
    *   `400` (Regular)
    *   `500` (Medium)
    *   `700` (Bold - Headings)

---

## 3. Animation Specifications (The "Integral" Physics)

The Landing Page must feature a custom 3D WebGL/Shader animation.

### Visual Style
*   **Concept**: A mathematical surface (e.g., $z = \sin(x)\sin(y)$) representing a "data stream" or "integral function".
*   **Texture**: No texture maps. Use **Vertex Displacement** via custom shaders.
*   **Gradient**: The color must shift based on vertex elevation ($z$-height).
    *   *Low Points*: Midnight Green / Moss Green.
    *   *High Points*: Rosy Brown / Beige.

### Physics & Interaction
1.  **Mouse Follow**: The mesh must ripple or bubble slightly where the mouse hovers ($distance < 5.0$).
2.  **Click Collapse ("The Singularity")**:
    *   **Trigger**: `onPointerDown` / `onPointerUp`.
    *   **Effect**: The vertex elevation at the mouse position must drop significantly (`elevation -= 5.0`), creating a deep "black hole" or "sinkhole" effect.
    *   **Feel**: Tactile, heavy, liquid-like response.

---

## 4. UI/UX Principles

### A. Landing Page (Immersive)
*   **Background**: Full-screen 3D Animation (Integral Mesh).
*   **Container**: A central "Glass Card" (Border Radius `48px`) holding the hero content.
*   **Z-Index**: Text must sit *above* the 3D scene.
*   **Access**: Contains a "Try now" or "App" button that triggers the View Transition.

### B. Social App Dashboard (Clean & Functional)
*   **Goal**: Mimic the utility and cleanliness of classic social apps (Twitter/X, Reddit).
*   **Background**: **Solid White** (`#FFFFFF`). NO Glassmorphism. NO 3D Background.
*   **Layout**: 3-Column Grid (Sidebar, Feed, Widgets).
*   **Styling**: Use `Light Gray` borders. Use `Rosy Brown` for the "Call to Action" buttons (e.g., "Initialize Thread").

---

## 5. Technical Stack for Recreation
*   **Framework**: React (Vite) / Next.js
*   **3D Engine**: Three.js / React Three Fiber
*   **Styling**: Plain CSS or Tailwind (configured with custom colors above)
*   **Icons**: Lucide React (Rounded, clean outlines)
