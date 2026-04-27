"""
main.py — Combined Travaya AI Backend (Chatbot + Recommender)
============================================================
Consolidated for deployment on Render.
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# Import Chatbot Logic
from chatbot_api import (
    chat as chatbot_chat_route,
    feedback as chatbot_feedback_route,
    feedback_stats as chatbot_stats_route,
    retrain as chatbot_retrain_route,
    performance as chatbot_performance_route,
    health as chatbot_health_route,
    destinations as chatbot_destinations_route
)

# Import Recommender Logic
from app_flask import (
    recommend as recommender_recommend_route,
    get_packages as recommender_packages_route,
    user_logs as recommender_user_logs_route,
    rec_logs as recommender_rec_logs_route,
    stats as recommender_stats_route
)

app = Flask(__name__)

# Configure CORS
CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "*")
# If it's a comma-separated list, split it
origins = [o.strip() for o in CORS_ORIGIN.split(",")] if "," in CORS_ORIGIN else CORS_ORIGIN

CORS(app, resources={r"/api/*": {"origins": origins}}, supports_credentials=True)

@app.before_request
def log_request_info():
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Body: %s', request.get_data())
    # Log origin to help debug CORS
    origin = request.headers.get('Origin')
    if origin:
        app.logger.info(f"Request from origin: {origin}")

# ── Health & Root ──────────────────────────────────────────
@app.route("/")
def home():
    return jsonify({
        "status": "online",
        "message": "Travaya AI API is active.",
        "endpoints": ["/api/chat", "/api/recommend", "/api/health"]
    })

@app.route("/api/health")
def combined_health():
    return jsonify({
        "status": "running",
        "service": "Travaya Combined AI API",
        "version": "1.0.0"
    })

# ── Chatbot Routes ─────────────────────────────────────────
app.add_url_rule("/api/chat",            "chatbot_chat",        chatbot_chat_route,        methods=["POST"])
app.add_url_rule("/api/feedback",        "chatbot_feedback",    chatbot_feedback_route,    methods=["POST"])
app.add_url_rule("/api/feedback/stats",  "chatbot_stats",       chatbot_stats_route,       methods=["GET"])
app.add_url_rule("/api/retrain",         "chatbot_retrain",     chatbot_retrain_route,     methods=["POST"])
app.add_url_rule("/api/performance",     "chatbot_performance", chatbot_performance_route, methods=["GET"])
app.add_url_rule("/api/ai-destinations", "chatbot_dests",       chatbot_destinations_route, methods=["GET"])

# ── Recommender Routes ─────────────────────────────────────
app.add_url_rule("/api/recommend",       "recommender_recommend", recommender_recommend_route, methods=["POST"])
app.add_url_rule("/api/packages",        "recommender_packages",  recommender_packages_route,  methods=["GET"])
app.add_url_rule("/api/logs/users",      "recommender_user_logs", recommender_user_logs_route,  methods=["GET"])
app.add_url_rule("/api/logs/recs",       "recommender_rec_logs",  recommender_rec_logs_route,   methods=["GET"])
app.add_url_rule("/api/stats",           "recommender_stats",     recommender_stats_route,      methods=["GET"])

if __name__ == "__main__":
    PORT = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=PORT)
