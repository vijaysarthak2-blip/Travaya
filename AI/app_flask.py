"""
app_flask.py — Travaya Recommender Flask Backend (India-Only)
--------------------------------------------------------------
Run  : python app_flask.py
Open : http://localhost:5000
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os, json
from recommender import get_recommendations, _load, USER_LOG, REC_LOG

app      = Flask(__name__)
CORS(app)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# ── Serve Frontend ──────────────────────────────────────────

@app.route("/")
def index():
    with open(os.path.join(BASE_DIR, "recommender.html"), encoding="utf-8") as f:
        return f.read()


# ── POST /api/recommend ─────────────────────────────────────

@app.route("/api/recommend", methods=["POST"])
def recommend():
    """
    Body (JSON):
    {
        "destinations"  : ["Kerala", "Goa"],
        "budget_inr"    : 20000,
        "duration_days" : 7,
        "travel_style"  : ["beach", "nature"]
    }
    """
    try:
        data = request.get_json()
        for field in ["destinations", "budget_inr", "duration_days", "travel_style"]:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        results = get_recommendations(data, top_n=3)
        return jsonify({"status": "success", "count": len(results),
                        "recommendations": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── GET /api/packages ───────────────────────────────────────

@app.route("/api/packages")
def get_packages():
    with open(os.path.join(BASE_DIR, "packages_data.json"), encoding="utf-8") as f:
        pkgs = json.load(f)
    return jsonify({"status": "success", "count": len(pkgs), "packages": pkgs})


# ── Transparency Logs ───────────────────────────────────────

@app.route("/api/logs/users")
def user_logs():
    logs = _load(USER_LOG)
    return jsonify({"status": "success", "count": len(logs), "logs": logs})

@app.route("/api/logs/recommendations")
def rec_logs():
    logs = _load(REC_LOG)
    return jsonify({"status": "success", "count": len(logs), "logs": logs})


# ── Stats ───────────────────────────────────────────────────

@app.route("/api/stats")
def stats():
    rec_logs_data  = _load(REC_LOG)
    user_logs_data = _load(USER_LOG)

    pkg_counter, style_counter, dest_counter = {}, {}, {}

    for e in rec_logs_data:
        for name in e.get("recommended_packages", []):
            pkg_counter[name] = pkg_counter.get(name, 0) + 1

    for e in user_logs_data:
        inp = e.get("user_input", {})
        for s in inp.get("travel_style", []):
            style_counter[s] = style_counter.get(s, 0) + 1
        for d in inp.get("destinations", []):
            dest_counter[d] = dest_counter.get(d, 0) + 1

    top_pkgs = sorted(pkg_counter.items(), key=lambda x: x[1], reverse=True)[:5]

    return jsonify({
        "status": "success",
        "total_queries": len(user_logs_data),
        "top_recommended": [{"name": k, "count": v} for k, v in top_pkgs],
        "popular_styles": style_counter,
        "popular_destinations": dest_counter
    })


if __name__ == "__main__":
    print("="*50)
    print("  Travaya Recommender — India Only")
    print("  Open : http://localhost:5000")
    print("="*50)
    app.run(debug=True, host="0.0.0.0", port=5000)
