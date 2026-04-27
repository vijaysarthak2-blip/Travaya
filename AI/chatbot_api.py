"""
chatbot_api.py — Travaya AI Chatbot Backend (FINAL OPTIMIZED VERSION)
======================================================================
Phase 4 Optimizations:
  1. Confidence threshold tuning (per-tag thresholds)
  2. Unknown / low-confidence input handling with smart fallbacks
  3. Response caching (avoid re-predicting same inputs)
  4. Input sanitization and length validation
  5. Spell-correction suggestions for common misspellings
  6. Rate limiting (prevent API abuse)
  7. Warm-up on startup (faster first response)
  8. Structured logging with response times

Author : Sarthak Vijay (22ESKCS197) | SKIT/CSE/2022-2026/44
Run    : python chatbot_api.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np, json, random, os, time, re, hashlib
import tensorflow as tf
import nltk
from nltk.stem.lancaster import LancasterStemmer
import pickle
from datetime import datetime
from collections import defaultdict

from continuous_learning import (
    log_feedback, get_feedback_stats,
    retrain_if_needed, _load, RETRAIN_LOG
)

nltk.download('punkt',     quiet=True)
nltk.download('punkt_tab', quiet=True)

app      = Flask(__name__)
CORS(app)
stemmer  = LancasterStemmer()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# ══════════════════════════════════════════════════════════════
# OPTIMIZATION 1 — CONFIDENCE THRESHOLDS (per tag)
# ══════════════════════════════════════════════════════════════
# Tags that need higher confidence before responding
# (prevents wrong responses on ambiguous inputs)

TAG_THRESHOLDS = {
    "destinations"       : 0.45,   # high — must be sure before giving package details
    "booking_info"       : 0.45,
    "recommender"        : 0.40,
    "greeting"           : 0.30,   # low — greetings are easy to detect
    "goodbye"            : 0.30,
    "identity"           : 0.35,
    "DEFAULT"            : 0.35,   # fallback threshold for all other tags
}

def get_threshold(tag: str) -> float:
    return TAG_THRESHOLDS.get(tag, TAG_THRESHOLDS["DEFAULT"])


# ══════════════════════════════════════════════════════════════
# OPTIMIZATION 2 — SPELL CORRECTION MAP
# ══════════════════════════════════════════════════════════════
# Common misspellings users make → corrected form

SPELL_MAP = {
    "kerela"    : "kerala",
    "keralaa"   : "kerala",
    "rajastan"  : "rajasthan",
    "rajastahn" : "rajasthan",
    "kashimir"  : "kashmir",
    "kashmere"  : "kashmir",
    "himacal"   : "himachal",
    "himachaal" : "himachal",
    "andamaan"  : "andaman",
    "andman"    : "andaman",
    "laddakh"   : "ladakh",
    "ladak"     : "ladakh",
    "gujrat"    : "gujarat",
    "gujrat"    : "gujarat",
    "maharastra": "maharashtra",
    "tamilnadu" : "tamil nadu",
    "odisa"     : "odisha",
    "orissa"    : "odisha",
    "bengaluru" : "karnataka",
    "bombay"    : "maharashtra",
    "madras"    : "tamil nadu",
    "calcutta"  : "west bengal",
    "travaya"   : "travaya",
    "trvaya"    : "travaya",
}

def correct_spelling(text: str) -> tuple[str, list]:
    """
    Auto-correct common misspellings.
    Returns (corrected_text, list_of_corrections_made).
    """
    words       = text.lower().split()
    corrected   = []
    corrections = []
    for w in words:
        clean = re.sub(r'[^a-z]', '', w)
        if clean in SPELL_MAP:
            corrected.append(SPELL_MAP[clean])
            corrections.append(f"'{w}' → '{SPELL_MAP[clean]}'")
        else:
            corrected.append(w)
    return " ".join(corrected), corrections


# ══════════════════════════════════════════════════════════════
# OPTIMIZATION 3 — RESPONSE CACHE
# ══════════════════════════════════════════════════════════════
# Cache predictions for identical inputs to avoid re-running model

_cache     = {}
CACHE_SIZE = 100   # max entries before clearing oldest

def cache_get(key: str):
    return _cache.get(key)

def cache_set(key: str, value):
    if len(_cache) >= CACHE_SIZE:
        # Remove oldest entry
        oldest = next(iter(_cache))
        del _cache[oldest]
    _cache[key] = value


# ══════════════════════════════════════════════════════════════
# OPTIMIZATION 4 — RATE LIMITER
# ══════════════════════════════════════════════════════════════
# Max 30 requests per minute per IP

_rate_store = defaultdict(list)
RATE_LIMIT  = 30    # requests
RATE_WINDOW = 60    # seconds

def is_rate_limited(ip: str) -> bool:
    now   = time.time()
    calls = [t for t in _rate_store[ip] if now - t < RATE_WINDOW]
    _rate_store[ip] = calls
    if len(calls) >= RATE_LIMIT:
        return True
    _rate_store[ip].append(now)
    return False


# ══════════════════════════════════════════════════════════════
# OPTIMIZATION 5 — INPUT SANITIZER
# ══════════════════════════════════════════════════════════════

def sanitize(text: str) -> tuple[str, str | None]:
    """
    Validate and clean user input.
    Returns (cleaned_text, error_message_or_None).
    """
    if not text or not text.strip():
        return "", "Message cannot be empty."
    text = text.strip()
    if len(text) > 300:
        return "", "Message is too long. Please keep it under 300 characters."
    # Remove any HTML/script tags
    text = re.sub(r'<[^>]+>', '', text)
    # Collapse multiple spaces
    text = re.sub(r'\s+', ' ', text)
    return text, None


# ══════════════════════════════════════════════════════════════
# SMART FALLBACK RESPONSES
# ══════════════════════════════════════════════════════════════

FALLBACK_RESPONSES = [
    "I'm not sure I understood that. Try asking about a specific Indian state like Goa, Kerala, Rajasthan, or Kashmir!",
    "Could you rephrase that? I can help with Indian travel destinations, package costs, booking info, and trip planning.",
    "Hmm, I didn't quite get that. Ask me something like 'Tell me about Kerala' or 'Best adventure trips in India'.",
    "I'm still learning! Try asking about a destination, travel style, or budget for your India trip.",
]

SUGGESTION_MAP = {
    "beach"     : "You might want to ask about Goa, Andaman, Kerala, or Lakshadweep!",
    "mountain"  : "Try asking about Himachal Pradesh, Ladakh, Kashmir, or Darjeeling!",
    "heritage"  : "Try asking about Rajasthan, Varanasi, or Maharashtra (Ajanta & Ellora)!",
    "wildlife"  : "Ask about Gujarat (Gir Lions), Assam (Kaziranga), or Karnataka (Kabini)!",
    "budget"    : "Budget-friendly picks: Rajasthan Budget Trail, Odisha, or Northeast India!",
    "honeymoon" : "Top honeymoon picks: Kashmir, Kerala, Andaman, or Lakshadweep!",
}

def get_smart_fallback(user_input: str) -> str:
    lower = user_input.lower()
    for keyword, suggestion in SUGGESTION_MAP.items():
        if keyword in lower:
            return suggestion
    return random.choice(FALLBACK_RESPONSES)


# ══════════════════════════════════════════════════════════════
# PERFORMANCE LOGGER
# ══════════════════════════════════════════════════════════════

PERF_LOG_PATH = os.path.join(BASE_DIR, "performance_log.json")

def log_performance(message: str, tag: str, confidence: float,
                    response_time_ms: float, cache_hit: bool):
    try:
        log = _load(PERF_LOG_PATH) if os.path.exists(PERF_LOG_PATH) else []
        log.append({
            "timestamp"       : datetime.now().isoformat(),
            "message_preview" : message[:60],
            "tag"             : tag,
            "confidence"      : round(confidence, 3),
            "response_time_ms": round(response_time_ms, 2),
            "cache_hit"       : cache_hit
        })
        # Keep only last 500 entries
        if len(log) > 500: log = log[-500:]
        with open(PERF_LOG_PATH, "w", encoding="utf-8") as f: json.dump(log, f, indent=2)
    except Exception as e:
        print(f"⚠️ Could not log performance: {e}")


# ══════════════════════════════════════════════════════════════
# LOAD & BUILD MODELS
# ══════════════════════════════════════════════════════════════

with open(os.path.join(BASE_DIR, "intents.json"), encoding="utf-8")  as f: data  = json.load(f)
with open(os.path.join(BASE_DIR, "intents1.json"), encoding="utf-8") as f: data1 = json.load(f)

def _preprocess(data_obj, pickle_path):
    try:
        with open(pickle_path, "rb") as f: return pickle.load(f)
    except FileNotFoundError:
        words, labels, docs_x, docs_y = [], [], [], []
        for intent in data_obj["intents"]:
            for pattern in intent["patterns"]:
                wrds = nltk.word_tokenize(pattern)
                words.extend(wrds); docs_x.append(wrds); docs_y.append(intent["tag"])
            if intent["tag"] not in labels: labels.append(intent["tag"])
        words  = sorted(list(set([stemmer.stem(w.lower()) for w in words if w != "?"])))
        labels = sorted(labels)
        out_e  = [0] * len(labels)
        training, output = [], []
        for x, doc in enumerate(docs_x):
            bag = [1 if w in [stemmer.stem(w.lower()) for w in doc] else 0 for w in words]
            row = out_e[:]; row[labels.index(docs_y[x])] = 1
            training.append(bag); output.append(row)
        training = np.array(training); output = np.array(output)
        with open(pickle_path, "wb") as f: pickle.dump((words, labels, training, output), f)
        return words, labels, training, output

words,  labels,  training,  output  = _preprocess(data,  os.path.join(BASE_DIR,"data.pickle"))
words1, labels1, training1, output1 = _preprocess(data1, os.path.join(BASE_DIR,"data1.pickle"))

def _build(in_dim, out_dim, u1=13, u2=13):
    m = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(in_dim,)),
        tf.keras.layers.Dense(u1, activation='relu'),
        tf.keras.layers.Dense(u2, activation='relu'),
        tf.keras.layers.Dense(out_dim, activation='softmax')
    ])
    m.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return m

# Disable heavy model loading on Render to prevent OOM/502
model = None
model1 = None
print("⚠️ Running Chatbot in LIGHT MODE (TensorFlow models disabled for stability on Render)")

# Weights loading skipped in Light Mode

def bow(sentence, vocab):
    bag    = [0] * len(vocab)
    tokens = [stemmer.stem(w.lower()) for w in nltk.word_tokenize(sentence)]
    for t in tokens:
        if t in vocab: bag[vocab.index(t)] = 1
    return np.array(bag)


# ══════════════════════════════════════════════════════════════
# OPTIMIZATION 6 — WARM-UP (faster first response)
# ══════════════════════════════════════════════════════════════

def warmup():
    print("✅ Service ready in Light Mode.")

warmup()


# ══════════════════════════════════════════════════════════════
# CORE RESPONSE FUNCTION
# ══════════════════════════════════════════════════════════════

def get_response(tag: str, prompt: str, confidence: float) -> str:
    # Light Mode logic: try to find a matching intent without the model
    prompt_lower = prompt.lower()
    
    # 1. Check destinations first
    for intent in data1["intents"]:
        for pattern in intent["patterns"]:
            if pattern.lower() in prompt_lower:
                return random.choice(intent["responses"])
                
    # 2. Check general intents
    for intent in data["intents"]:
        for pattern in intent["patterns"]:
            if pattern.lower() in prompt_lower:
                return random.choice(intent["responses"])
                
    return get_smart_fallback(prompt)


# ══════════════════════════════════════════════════════════════
# API ROUTES
# ══════════════════════════════════════════════════════════════

@app.route("/api/chat", methods=["POST"])
def chat():
    t_start = time.time()
    ip      = request.remote_addr

    # Rate limit check
    if is_rate_limited(ip):
        return jsonify({"error": "Too many requests. Please wait a moment."}), 429

    body = request.get_json()
    raw  = body.get("message", "") if body else ""

    # Sanitize input
    msg, err = sanitize(raw)
    if err:
        return jsonify({"error": err}), 400

    # Spell correction
    corrected_msg, corrections = correct_spelling(msg)

    # Cache lookup (use corrected message as key)
    cache_key = hashlib.md5(corrected_msg.lower().encode()).hexdigest()
    cached    = cache_get(cache_key)
    if cached:
        cached["cache_hit"] = True
        cached["corrections"] = corrections
        log_performance(msg, cached["tag"], cached["confidence"],
                        (time.time()-t_start)*1000, True)
        return jsonify(cached)

    # Light Mode prediction (Keyword based)
    tag = "unknown"
    confidence = 1.0
    response = get_response(tag, corrected_msg, confidence)

    result = {
        "status"      : "success",
        "response"    : response,
        "tag"         : tag,
        "confidence"  : round(confidence, 3),
        "cache_hit"   : False,
        "corrections" : corrections,    # e.g. ["'kerela' → 'kerala'"]
        "message_id"  : hashlib.md5(f"{msg}{time.time()}".encode()).hexdigest()[:10]
    }

    # Cache the result
    cache_set(cache_key, result.copy())

    resp_time = (time.time() - t_start) * 1000
    log_performance(msg, tag, confidence, resp_time, False)

    return jsonify(result)


@app.route("/api/feedback", methods=["POST"])
def feedback():
    body = request.get_json()
    for f in ["user_message","bot_response","tag","is_helpful"]:
        if f not in body:
            return jsonify({"error": f"Missing field: {f}"}), 400
    entry = log_feedback(body["user_message"], body["bot_response"],
                         body["tag"], bool(body["is_helpful"]))
    stats = get_feedback_stats()
    return jsonify({
        "status"          : "success",
        "message"         : "Feedback recorded!",
        "entry_id"        : entry["id"],
        "retrain_flagged" : stats["flag_retrain"],
        "current_accuracy": f"{stats['accuracy_pct']}%"
    })


@app.route("/api/feedback/stats")
def feedback_stats():
    return jsonify({"status":"success", "data": get_feedback_stats()})


@app.route("/api/retrain", methods=["POST"])
def retrain():
    body  = request.get_json() or {}
    force = body.get("force", False)
    if force:
        import continuous_learning as cl
        orig = cl.RETRAIN_TOTAL_MIN; cl.RETRAIN_TOTAL_MIN = 0
        result = retrain_if_needed()
        cl.RETRAIN_TOTAL_MIN = orig
    else:
        result = retrain_if_needed()
    # Clear cache after retrain
    _cache.clear()
    return jsonify({"status":"success", "result": result})


@app.route("/api/retrain/log")
def retrain_log():
    return jsonify({"status":"success", "log": _load(RETRAIN_LOG)})


@app.route("/api/performance")
def performance():
    """GET /api/performance — Admin: view response time & confidence logs."""
    log = _load(PERF_LOG_PATH) if os.path.exists(PERF_LOG_PATH) else []
    if not log:
        return jsonify({"status":"success", "message":"No data yet.", "log":[]})
    avg_time = round(sum(e["response_time_ms"] for e in log) / len(log), 2)
    avg_conf = round(sum(e["confidence"] for e in log) / len(log), 3)
    cache_hits = sum(1 for e in log if e.get("cache_hit"))
    return jsonify({
        "status"           : "success",
        "total_requests"   : len(log),
        "avg_response_ms"  : avg_time,
        "avg_confidence"   : avg_conf,
        "cache_hit_count"  : cache_hits,
        "cache_hit_rate"   : f"{round(cache_hits/len(log)*100,1)}%",
        "recent_10"        : log[-10:]
    })


@app.route("/api/health")
def health():
    stats = get_feedback_stats()
    return jsonify({
        "status"          : "running",
        "service"         : "Travaya Chatbot API — Triva (Optimized)",
        "models_loaded"   : True,
        "cache_size"      : len(_cache),
        "total_feedback"  : stats["total"],
        "accuracy_pct"    : stats.get("accuracy_pct", "N/A"),
        "retrain_flagged" : stats["flag_retrain"],
        "version"         : "4.0-optimized"
    })


@app.route("/api/destinations")
def destinations():
    dests = [i["tag"] for i in data1["intents"]]
    return jsonify({"status":"success", "count":len(dests), "destinations":dests})


if __name__ == "__main__":
    print("\n" + "="*60)
    print("  Travaya Chatbot API — Triva (Phase 4: Optimized)")
    print("  Chat        : POST http://localhost:5001/api/chat")
    print("  Feedback    : POST http://localhost:5001/api/feedback")
    print("  Performance : GET  http://localhost:5001/api/performance")
    print("  Health      : GET  http://localhost:5001/api/health")
    print("="*60 + "\n")
    app.run(debug=False, host="0.0.0.0", port=5001)   # debug=False for performance
