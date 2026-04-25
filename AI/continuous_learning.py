"""
continuous_learning.py — Travaya Chatbot Continuous Learning Module
--------------------------------------------------------------------
What it does:
  1. Logs every user feedback (thumbs up / thumbs down) with the
     original message and bot response.
  2. When enough negative feedback accumulates for a tag, it flags
     that intent for review.
  3. Provides a retrain_if_needed() function that automatically
     retrains both chatbot models when the feedback threshold is met.

Author : Sarthak Vijay (22ESKCS197) | SKIT/CSE/2022-2026/44
"""

import json, os, pickle, random
import numpy as np
from datetime import datetime

# ── Paths ───────────────────────────────────────────────────
BASE_DIR        = os.path.dirname(os.path.abspath(__file__))
FEEDBACK_LOG    = os.path.join(BASE_DIR, "feedback_log.json")
RETRAIN_LOG     = os.path.join(BASE_DIR, "retrain_log.json")
INTENTS_PATH    = os.path.join(BASE_DIR, "intents.json")
INTENTS1_PATH   = os.path.join(BASE_DIR, "intents1.json")
DATA_PICKLE     = os.path.join(BASE_DIR, "data.pickle")
DATA1_PICKLE    = os.path.join(BASE_DIR, "data1.pickle")
WEIGHTS_PATH    = os.path.join(BASE_DIR, "model.weights.h5")
WEIGHTS1_PATH   = os.path.join(BASE_DIR, "model1.weights.h5")

# ── Thresholds ──────────────────────────────────────────────
NEGATIVE_THRESHOLD  = 5    # retrain after this many negatives for a tag
RETRAIN_TOTAL_MIN   = 10   # minimum total feedback entries before retraining


# ══════════════════════════════════════════════════════════════
# 1.  FEEDBACK LOGGING
# ══════════════════════════════════════════════════════════════

def _load(path: str) -> list:
    if os.path.exists(path):
        try:
            with open(path, encoding="utf-8") as f: return json.load(f)
        except: return []
    return []

def _save(path: str, data):
    with open(path, "w", encoding="utf-8") as f: json.dump(data, f, indent=2)


def log_feedback(user_message: str, bot_response: str,
                 tag: str, is_helpful: bool) -> dict:
    """
    Log a single feedback entry.

    Parameters
    ----------
    user_message : what the user typed
    bot_response : what the bot replied
    tag          : intent tag predicted by Model 1
    is_helpful   : True = thumbs up, False = thumbs down

    Returns the saved entry.
    """
    log   = _load(FEEDBACK_LOG)
    entry = {
        "id"           : len(log) + 1,
        "timestamp"    : datetime.now().isoformat(),
        "user_message" : user_message,
        "bot_response" : bot_response,
        "tag"          : tag,
        "is_helpful"   : is_helpful,
        "sentiment"    : "positive" if is_helpful else "negative"
    }
    log.append(entry)
    _save(FEEDBACK_LOG, log)
    return entry


# ══════════════════════════════════════════════════════════════
# 2.  FEEDBACK ANALYSIS
# ══════════════════════════════════════════════════════════════

def get_feedback_stats() -> dict:
    """
    Returns a summary of all feedback collected so far.
    Useful for the admin dashboard / API endpoint.
    """
    log = _load(FEEDBACK_LOG)
    if not log:
        return {"total": 0, "positive": 0, "negative": 0,
                "accuracy_pct": 0, "weak_tags": [], "flag_retrain": False}

    total    = len(log)
    positive = sum(1 for e in log if e["is_helpful"])
    negative = total - positive

    # Count negatives per tag
    neg_by_tag = {}
    for e in log:
        if not e["is_helpful"]:
            neg_by_tag[e["tag"]] = neg_by_tag.get(e["tag"], 0) + 1

    weak_tags     = [t for t, c in neg_by_tag.items() if c >= NEGATIVE_THRESHOLD]
    flag_retrain  = (len(weak_tags) > 0 and total >= RETRAIN_TOTAL_MIN)

    return {
        "total"        : total,
        "positive"     : positive,
        "negative"     : negative,
        "accuracy_pct" : round((positive / total) * 100, 1),
        "neg_by_tag"   : neg_by_tag,
        "weak_tags"    : weak_tags,
        "flag_retrain" : flag_retrain
    }


# ══════════════════════════════════════════════════════════════
# 3.  AUTO-RETRAINING
# ══════════════════════════════════════════════════════════════

def retrain_if_needed() -> dict:
    """
    Check feedback stats. If retraining is flagged:
      - Delete old pickle caches (force re-preprocessing)
      - Retrain both TensorFlow models
      - Save new weights
      - Log the retraining event

    Returns a status dict.
    """
    stats = get_feedback_stats()

    if not stats["flag_retrain"]:
        return {
            "retrained" : False,
            "reason"    : "No retraining needed yet.",
            "stats"     : stats
        }

    print("\n🔄 Retraining triggered!")
    print(f"   Weak tags : {stats['weak_tags']}")
    print(f"   Total feedback : {stats['total']}")

    # ── Delete old pickles to force re-preprocessing ─────────
    for p in [DATA_PICKLE, DATA1_PICKLE]:
        if os.path.exists(p):
            os.remove(p)
            print(f"   Deleted cache: {p}")

    # ── Retrain models ────────────────────────────────────────
    try:
        import tensorflow as tf
        import nltk
        from nltk.stem.lancaster import LancasterStemmer
        nltk.download('punkt', quiet=True)
        nltk.download('punkt_tab', quiet=True)
        stemmer = LancasterStemmer()

        def preprocess(intents_path, pickle_path):
            with open(intents_path, encoding="utf-8") as f:
                data = json.load(f)
            words, labels, docs_x, docs_y = [], [], [], []
            for intent in data["intents"]:
                for pattern in intent["patterns"]:
                    wrds = nltk.word_tokenize(pattern)
                    words.extend(wrds)
                    docs_x.append(wrds)
                    docs_y.append(intent["tag"])
                if intent["tag"] not in labels:
                    labels.append(intent["tag"])
            words  = sorted(list(set([stemmer.stem(w.lower()) for w in words if w != "?"])))
            labels = sorted(labels)
            out_e  = [0] * len(labels)
            training, output = [], []
            for x, doc in enumerate(docs_x):
                bag = [1 if w in [stemmer.stem(w.lower()) for w in doc] else 0 for w in words]
                row = out_e[:]
                row[labels.index(docs_y[x])] = 1
                training.append(bag)
                output.append(row)
            training = np.array(training)
            output   = np.array(output)
            with open(pickle_path, "wb") as f:
                pickle.dump((words, labels, training, output), f)
            return words, labels, training, output

        # Model 1
        words, labels, training, output = preprocess(INTENTS_PATH, DATA_PICKLE)
        m1 = tf.keras.Sequential([
            tf.keras.layers.Input(shape=(len(training[0]),)),
            tf.keras.layers.Dense(13, activation='relu'),
            tf.keras.layers.Dense(13, activation='relu'),
            tf.keras.layers.Dense(len(output[0]), activation='softmax')
        ])
        m1.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        m1.fit(training, output, epochs=200, batch_size=8, verbose=0)
        m1.save_weights(WEIGHTS_PATH)
        print("   ✅ Model 1 retrained")

        # Model 2
        words1, labels1, training1, output1 = preprocess(INTENTS1_PATH, DATA1_PICKLE)
        m2 = tf.keras.Sequential([
            tf.keras.layers.Input(shape=(len(training1[0]),)),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(len(output1[0]), activation='softmax')
        ])
        m2.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        m2.fit(training1, output1, epochs=200, batch_size=8, verbose=0)
        m2.save_weights(WEIGHTS1_PATH)
        print("   ✅ Model 2 retrained")

        retrain_success = True
        retrain_error   = None

    except Exception as e:
        retrain_success = False
        retrain_error   = str(e)
        print(f"   ❌ Retraining failed: {e}")

    # ── Log retraining event ──────────────────────────────────
    retrain_entry = {
        "timestamp"   : datetime.now().isoformat(),
        "success"     : retrain_success,
        "error"       : retrain_error,
        "weak_tags"   : stats["weak_tags"],
        "total_feedback_at_retrain": stats["total"]
    }
    rlog = _load(RETRAIN_LOG)
    rlog.append(retrain_entry)
    _save(RETRAIN_LOG, rlog)

    return {
        "retrained" : retrain_success,
        "reason"    : "Retraining triggered by negative feedback threshold.",
        "weak_tags" : stats["weak_tags"],
        "error"     : retrain_error,
        "stats"     : stats
    }


# ── Quick test ───────────────────────────────────────────────
if __name__ == "__main__":
    # Simulate some feedback
    log_feedback("Tell me about Goa", "Goa Beach Escape...", "destinations", True)
    log_feedback("hi", "Namaste!", "greeting", True)
    log_feedback("book a trip", "...", "booking_info", False)

    stats = get_feedback_stats()
    print(json.dumps(stats, indent=2))
