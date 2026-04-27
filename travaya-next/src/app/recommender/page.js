"use client";

import React, { useState } from "react";
import "./recommender.css";
import { AI_API_BASE } from "@/config";

export default function RecommenderPage() {
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedDests, setSelectedDests] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const destinations = [
    { id: "Goa", label: "🏖️ Goa" },
    { id: "Kerala", label: "🌴 Kerala" },
    { id: "Rajasthan", label: "🏰 Rajasthan" },
    { id: "Kashmir", label: "🌸 Kashmir" },
    { id: "Himachal Pradesh", label: "🏔️ Himachal Pradesh" },
    { id: "Ladakh", label: "⛰️ Ladakh" },
    { id: "Andaman & Nicobar", label: "🏝️ Andaman" },
    { id: "Uttar Pradesh", label: "🛕 Uttar Pradesh" },
    { id: "Northeast India", label: "🌿 Northeast India" },
    { id: "Darjeeling & Sikkim", label: "🍵 Darjeeling & Sikkim" },
    { id: "Karnataka", label: "🌺 Karnataka" },
    { id: "Gujarat", label: "🦁 Gujarat" },
    { id: "Tamil Nadu", label: "🏛️ Tamil Nadu" },
    { id: "Maharashtra", label: "🌆 Maharashtra" },
    { id: "Lakshadweep", label: "🌊 Lakshadweep" },
    { id: "Odisha", label: "☀️ Odisha" },
  ];

  const travelStyles = [
    { id: "adventure", label: "🧗 Adventure" },
    { id: "beach", label: "🏖️ Beach" },
    { id: "cultural", label: "🏛️ Cultural" },
    { id: "heritage", label: "🏰 Heritage" },
    { id: "nature", label: "🌿 Nature" },
    { id: "luxury", label: "💎 Luxury" },
    { id: "family", label: "👨‍👩‍👧 Family" },
    { id: "spiritual", label: "🙏 Spiritual" },
    { id: "budget", label: "💰 Budget" },
  ];

  const toggleDest = (id) => {
    setSelectedDests(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const toggleStyle = (id) => {
    setSelectedStyles(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const validate = () => {
    if (!budget || budget < 1000) return 'Please enter a valid budget (minimum ₹1,000).';
    if (!duration || duration < 1) return 'Please enter a valid trip duration.';
    if (!selectedDests.length) return 'Please select at least one destination.';
    if (!selectedStyles.length) return 'Please select at least one travel style.';
    return null;
  };

  const getRecs = async () => {
    setError(null);
    const ve = validate();
    if (ve) { setError(ve); return; }

    setLoading(true);
    const payload = {
      destinations: selectedDests,
      budget_inr: parseInt(budget),
      duration_days: parseInt(duration),
      travel_style: selectedStyles
    };

    try {
      const apiBase = AI_API_BASE;
      console.log(`Calling AI API at: ${apiBase}`);

      const res = await fetch(`${apiBase}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server returned ${res.status}: ${errorText || res.statusText}`);
      }

      const data = await res.json();

      if (data.status === 'success') {
        setResults(data.recommendations);
        // Scroll to results after a short delay
        setTimeout(() => {
          document.getElementById('results-sec')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (e) {
      console.error('Fetch error:', e);
      const apiBase = AI_API_BASE;
      setError(`Connection Error: ${e.message}. (Target: ${apiBase}). Please verify the AI service is running and CORS is allowed.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommender-wrapper">
      {/* HERO */}
      <section className="req-hero">
        <div className="req-hero-flag">🇮🇳 &nbsp; India Travel Recommender</div>
        <h1>Discover Your <em>Perfect</em><br />Indian Adventure</h1>
        <p>Tell us your preferences and our AI will match you with the best travel packages across India.</p>
      </section>

      {/* FORM */}
      <div className="req-form-wrap">
        <div className="req-form-card">
          <div className="req-form-grid">

            {/* Budget */}
            <div className="req-fg">
              <label>Your Budget (₹ INR)</label>
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="e.g. 20000"
                min="1000"
              />
            </div>

            {/* Duration */}
            <div className="req-fg">
              <label>Trip Duration (Days)</label>
              <input
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="e.g. 7"
                min="1"
                max="30"
              />
            </div>

            {/* Destinations */}
            <div className="req-fg req-full">
              <label>Preferred Destinations <span style={{ color: 'var(--req-mid-gray)', fontSize: '.68rem', textTransform: 'none', letterSpacing: 0 }}>(Select all that apply)</span></label>
              <div className="req-dest-scroll">
                <div className="req-chips">
                  {destinations.map(d => (
                    <div
                      key={d.id}
                      className={`req-chip ${selectedDests.includes(d.id) ? 'req-sel' : ''}`}
                      onClick={() => toggleDest(d.id)}
                    >
                      {d.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Travel Style */}
            <div className="req-fg req-full">
              <label>Travel Style <span style={{ color: 'var(--req-mid-gray)', fontSize: '.68rem', textTransform: 'none', letterSpacing: 0 }}>(Select all that apply)</span></label>
              <div className="req-chips">
                {travelStyles.map(s => (
                  <div
                    key={s.id}
                    className={`req-chip ${selectedStyles.includes(s.id) ? 'req-sel' : ''}`}
                    onClick={() => toggleStyle(s.id)}
                  >
                    {s.label}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {error && <div className="req-err" style={{ display: 'block' }}>{error}</div>}

          <button className="req-submit-btn" onClick={getRecs} disabled={loading}>
            {!loading ? <span>Find My Perfect India Trip</span> : <div className="req-spinner" style={{ display: 'block' }}></div>}
          </button>
        </div>
      </div>

      {/* RESULTS */}
      {results.length > 0 && (
        <div className="req-results-sec" id="results-sec">
          <div className="req-res-header">
            <h2>Your Recommendations</h2>
            <span className="req-res-count">{results.length} matches found</span>
          </div>
          <div id="res-container">
            {results.map((p, i) => (
              <div key={i} className="req-res-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="req-res-emoji">{p.image_emoji || '✈️'}</div>
                <div className="req-res-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
                    <div className="req-res-name">{p.name}</div>
                    <span className="req-score-b">#{i + 1} · {p.score}pts</span>
                  </div>
                  <div className="req-res-state">📍 {p.state} &nbsp;|&nbsp; 🗓️ Best time: {p.best_time}</div>
                  <div className="req-res-desc">{p.description}</div>
                  <div className="req-res-hi">
                    {p.highlights.map((h, idx) => (
                      <span key={idx} className="req-hi-tag">{h}</span>
                    ))}
                  </div>
                  <div className="req-res-meta">
                    <div className="req-meta">💰 <strong>₹{p.budget_inr?.toLocaleString('en-IN') || p.budget_inr}</strong>/person</div>
                    <div className="req-meta">📅 <strong>{p.duration_days} days</strong></div>
                    <div className="req-meta">🏷️ <strong>{(p.style || []).join(', ')}</strong></div>
                  </div>
                  <div className="req-match-r">✓ {p.match_reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRACKING */}
      <div className="req-track-sec">
        <div className="req-track-card">
          <div className="req-track-head">
            <h3>Transparency &amp; Tracking</h3>
            <span className="req-track-tag">How it works</span>
          </div>
          <div className="req-track-body">
            <p>Every recommendation request and result is logged on both the <strong>frontend</strong> (your session) and the <strong>backend server</strong> for full transparency. Only travel preferences are stored — no personal data.</p>
            <code>
              Backend logs:<br />
              📄 user_log.json &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ Your input preferences<br />
              📄 recommendation_log.json → Packages recommended to you<br /><br />
              Admin API Endpoints:<br />
              GET /api/logs/users &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ All user inputs<br />
              GET /api/logs/recommendations &nbsp;→ All recommendation results<br />
              GET /api/stats &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ Aggregated stats
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
