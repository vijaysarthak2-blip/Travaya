"""
recommender.py — Travaya India Travel Recommender System
---------------------------------------------------------
Approach : Hybrid (Content-Based Filtering + Rule-Based Scoring)
Coverage : India-only destinations (15 packages across Indian states)
Author   : Sarthak Vijay (22ESKCS197) | SKIT/CSE/2022-2026/44
"""

import json, os
from datetime import datetime

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
PKG_PATH   = os.path.join(BASE_DIR, "packages_data.json")
USER_LOG   = os.path.join(BASE_DIR, "user_log.json")
REC_LOG    = os.path.join(BASE_DIR, "recommendation_log.json")

with open(PKG_PATH, encoding="utf-8") as f:
    ALL_PACKAGES = json.load(f)


# ── Logging ────────────────────────────────────────────────

def _load(path):
    if os.path.exists(path):
        try:
            with open(path, encoding="utf-8") as f: return json.load(f)
        except: return []
    return []

def _save(path, data):
    with open(path, "w", encoding="utf-8") as f: json.dump(data, f, indent=2)

def log_user_input(prefs: dict):
    try:
        log = _load(USER_LOG)
        log.append({"timestamp": datetime.now().isoformat(), "user_input": prefs})
        _save(USER_LOG, log)
    except Exception as e:
        print(f"⚠️ Could not log user input: {e}")

def log_recommendations(prefs: dict, results: list):
    try:
        log = _load(REC_LOG)
        log.append({
            "timestamp": datetime.now().isoformat(),
            "user_input": prefs,
            "recommended_packages": [p["name"] for p in results]
        })
        _save(REC_LOG, log)
    except Exception as e:
        print(f"⚠️ Could not log recommendations: {e}")


# ── Scoring Logic ───────────────────────────────────────────

def score_package(pkg: dict, prefs: dict) -> float:
    """
    Score a package out of 100 based on user preferences.

    Breakdown:
      Travel style match   → up to 40 pts
      Destination match    → up to 30 pts
      Budget fit (INR)     → up to 20 pts
      Duration fit         → up to 10 pts
    """
    score = 0.0

    # 1. Travel style match (40 pts)
    user_styles = [s.lower() for s in prefs.get("travel_style", [])]
    pkg_styles  = [s.lower() for s in pkg.get("style", [])]
    matches     = len(set(user_styles) & set(pkg_styles))
    if user_styles:
        score += (matches / len(user_styles)) * 40

    # 2. Destination / state match (30 pts)
    preferred = [d.lower() for d in prefs.get("destinations", [])]
    pkg_dest  = pkg.get("destination", "").lower()
    pkg_state = pkg.get("state", "").lower()
    if any(p in pkg_dest or p in pkg_state for p in preferred):
        score += 30

    # 3. Budget fit in INR (20 pts)
    user_budget = prefs.get("budget_inr", 0)
    pkg_cost    = pkg.get("budget_inr", 0)
    if pkg_cost <= user_budget:
        ratio = pkg_cost / user_budget if user_budget else 0
        score += 20 if ratio >= 0.5 else 10
    elif pkg_cost <= user_budget * 1.15:   # within 15 % over budget
        score += 5

    # 4. Duration fit (10 pts)
    diff = abs(prefs.get("duration_days", 0) - pkg.get("duration_days", 0))
    if   diff == 0: score += 10
    elif diff <= 2: score += 7
    elif diff <= 4: score += 4

    return round(score, 2)


def build_reason(pkg: dict, prefs: dict) -> str:
    """Human-readable match explanation."""
    reasons = []

    user_styles = [s.lower() for s in prefs.get("travel_style", [])]
    matched     = list(set(user_styles) & set(s.lower() for s in pkg.get("style", [])))
    if matched:
        reasons.append(f"Matches your {' & '.join(matched)} travel style")

    preferred = [d.lower() for d in prefs.get("destinations", [])]
    if any(p in pkg.get("destination","").lower() or
           p in pkg.get("state","").lower() for p in preferred):
        reasons.append("Destination matches your preference")

    if pkg.get("budget_inr", 0) <= prefs.get("budget_inr", 0):
        reasons.append(f"Within your \u20b9{prefs['budget_inr']:,} budget")

    return " \u00b7 ".join(reasons) if reasons else "Highly rated India package"


# ── Main API ────────────────────────────────────────────────

def get_recommendations(prefs: dict, top_n: int = 3) -> list:
    """
    Return top_n recommended Indian travel packages.

    prefs example:
    {
        "destinations"  : ["Rajasthan", "Goa"],
        "budget_inr"    : 20000,
        "duration_days" : 7,
        "travel_style"  : ["cultural", "beach"]
    }
    """
    log_user_input(prefs)

    scored = []
    for pkg in ALL_PACKAGES:
        p = pkg.copy()
        p["score"]        = score_package(pkg, prefs)
        p["match_reason"] = build_reason(pkg, prefs)
        scored.append(p)

    scored.sort(key=lambda x: x["score"], reverse=True)
    results = scored[:top_n]

    log_recommendations(prefs, results)
    return results


# ── Quick test ──────────────────────────────────────────────
if __name__ == "__main__":
    test = {
        "destinations" : ["Kerala", "Goa"],
        "budget_inr"   : 25000,
        "duration_days": 7,
        "travel_style" : ["beach", "nature"]
    }
    for r in get_recommendations(test, 3):
        print(f"\n{r['name']}  (Score: {r['score']})")
        print(f"  Cost  : INR {r['budget_inr']:,}  |  {r['duration_days']} days")
        print(f"  Reason: {r['match_reason']}")
