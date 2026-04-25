# Travaya — AI Chatbot + Recommender System
## Module: AI & Recommendation System
### Student : Sarthak Vijay (22ESKCS197)
### Project  : SKIT/CSE/2022-2026/44 | Mentor: Mr. Shirish Nagar

---

## 📁 Complete File List

```
travaya_ai_module/
│
├── ── CHATBOT ──────────────────────────────────────────
│   ├── chatbot_api.py          ← Flask API server (FINAL OPTIMIZED)
│   ├── intents.json            ← Model 1: 20 general travel intents
│   ├── intents1.json           ← Model 2: 16 Indian destination packages
│   ├── continuous_learning.py  ← Feedback logging + auto-retraining
│   └── TrivaChatbot.jsx        ← React component for MERN frontend
│
├── ── RECOMMENDER ──────────────────────────────────────
│   ├── recommender.py          ← Hybrid AI scoring engine (India-only)
│   ├── app_flask.py            ← Flask API for recommender (port 5000)
│   ├── recommender.html        ← Standalone recommender frontend UI
│   └── packages_data.json      ← 15 India travel packages (INR)
│
├── ── DOCUMENTATION ────────────────────────────────────
│   ├── README.md               ← This file
│   ├── chatbot_summary.pdf     ← Full module documentation (PDF)
│   └── chatbot_summary.tex     ← LaTeX source for the PDF
│
└── ── AUTO-GENERATED on first run ──────────────────────
    ├── data.pickle, data1.pickle
    ├── model_weights.h5, model1_weights.h5
    ├── user_log.json, recommendation_log.json
    ├── feedback_log.json, retrain_log.json
    └── performance_log.json
```

---

## ⚙️ How to Run

### Step 1 — Install dependencies
pip install flask flask-cors tensorflow nltk

### Step 2 — Run Chatbot API (port 5001)
python chatbot_api.py

### Step 3 — Run Recommender API (port 5000)
python app_flask.py

### Step 4 — Add chatbot to React (MERN)
import TrivaChatbot from './components/TrivaChatbot';
<TrivaChatbot />

---

## 🔧 Technology Stack
- NLP: TensorFlow 2.x + Keras + NLTK + Lancaster Stemmer
- Algorithm: Bag-of-Words + Dense Neural Network
- APIs: Flask + Flask-CORS
- Frontend: React.js JSX + HTML5/CSS3
- Optimizations: Caching, Rate Limiting, Spell Correction, Warmup

---

*Travaya — SKIT/CSE/2022-2026/44 | Session 2025-2026*
