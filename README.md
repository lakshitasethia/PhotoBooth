<div align="center">

# 📸 strike a pose.

*3 shots. 1 strip. infinite memories.*

[![Deployed on Vercel](https://img.shields.io/badge/deployed%20on-vercel-black?style=for-the-badge&logo=vercel)](https://photo-booth-onpfjbkuw-lexis-projects-2967fc9f.vercel.app/)
[![React](https://img.shields.io/badge/react-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**[✦ open the booth →](https://photo-booth-onpfjbkuw-lexis-projects-2967fc9f.vercel.app/)**

</div>

---

## ✦ what is this?

A fully browser-based photobooth — no app, no login, no nonsense.  
Pick a filter, hit the button, strike your best pose across 3 auto-captured shots, and walk away with a downloadable photo strip that actually looks like it came out of a real booth.

> *Built entirely on a Sunday evening. Powered by caffeine and React.*

---

## ✦ features

- 🎬 &nbsp;**3-shot auto sequence** — 3-2-1 countdown with a camera flash between shots  
- 🎞️ &nbsp;**film strip output** — vertical strip with date stamp, ready to print or share  
- 🎨 &nbsp;**6 film-inspired filters** — applied live to your webcam feed  
- ✨ &nbsp;**animated landing page** — custom cursor, sparkle trail, floating stars, scrolling film bar  
- 💾 &nbsp;**one-click download** — exports as a clean PNG

---

## ✦ filters

| filter | vibe |
|:---|:---|
| **None** | raw & unfiltered |
| **Disposable** | blown-out flash, that digicam y2k look |
| **Noir** | crushed blacks, high contrast drama |
| **Lomo** | oversaturated, red-shifted, film camera energy |
| **Soft Glow** | dreamy, pastel, slightly blurred warmth |
| **Velvia** | rich punchy colours, Fujifilm-inspired |
| **Golden Hour** | warm amber tones, sunset skin |

---

## ✦ tech stack

| | |
|:---|:---|
| **Framework** | React 18 + Vite |
| **Styling** | Plain CSS, Google Fonts |
| **Camera** | `navigator.mediaDevices.getUserMedia` |
| **Capture + Strip** | Canvas API with `ctx.filter` |
| **Fonts** | Playfair Display · DM Sans · Dancing Script |
| **Deployment** | Vercel |

---

## ✦ run it locally

```bash
git clone https://github.com/your-username/photobooth
cd photobooth/vite-project
npm install
npm run dev
```

open `localhost:5173` and you're in the booth 🎉

---

## ✦ project structure

```
vite-project/src/
├── App.jsx               # view routing + global state
├── LandingPage.jsx       # animated landing with custom cursor
├── PhotoBooth.jsx        # webcam + filters + countdown + capture
└── PhotoStrip.jsx        # canvas strip generation + download
```

---

<div align="center">

made with 🩷 on a sunday evening &nbsp;·&nbsp; [live demo](https://photo-booth-onpfjbkuw-lexis-projects-2967fc9f.vercel.app/)

</div>
