// TrivaChatbot.jsx — Travaya AI Chatbot (with Continuous Learning Feedback)
// --------------------------------------------------------------------------
// Usage : import TrivaChatbot from './TrivaChatbot';  →  <TrivaChatbot />
// Needs : Python chatbot_api.py running on port 5001

import { useState, useRef, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_AI_API_BASE || "http://localhost:5001/api";
const WELCOME = {
  id: 0, role: "bot", text:
    "Namaste! 🙏 I'm Triva, your Travaya travel assistant.\nAsk me about any Indian destination, travel package, or trip planning advice!",
  time: now(), tag: null, showFeedback: false, feedback: null
};

function now() {
  return new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
}

const QUICK = [
  "Show all packages", "Best beaches in India",
  "Budget trips", "Tell me about Kerala",
  "Adventure destinations", "Tell me about Rajasthan"
];

export default function TrivaChatbot() {
  const [open,     setOpen]     = useState(false);
  const [msgs,     setMsgs]     = useState([WELCOME]);
  const [input,    setInput]    = useState("");
  const [typing,   setTyping]   = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [msgs, typing]);

  // ── Send message ─────────────────────────────────────────
  const send = async (text) => {
    const userText = (text || input).trim();
    if (!userText) return;

    const userMsg = { id: Date.now(), role:"user", text:userText, time:now() };
    setMsgs(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const res  = await fetch(`${API}/chat`, {
        method : "POST",
        headers: { "Content-Type":"application/json" },
        body   : JSON.stringify({ message: userText })
      });
      const data = await res.json();

      const botMsg = {
        id          : Date.now() + 1,
        role        : "bot",
        text        : data.response || "Sorry, I couldn't process that.",
        time        : now(),
        tag         : data.tag,
        userMessage : userText,
        showFeedback: true,
        feedback    : null   // null = not yet given, true = 👍, false = 👎
      };
      setMsgs(prev => [...prev, botMsg]);

    } catch {
      setMsgs(prev => [...prev, {
        id: Date.now()+1, role:"bot", time:now(),
        text: "⚠️ Could not connect. Make sure the Python API is running on port 5001.",
        showFeedback: false, feedback: null
      }]);
    } finally {
      setTyping(false);
    }
  };

  // ── Submit feedback ──────────────────────────────────────
  const submitFeedback = async (msgId, botMsg, isHelpful) => {
    // Optimistic UI update
    setMsgs(prev => prev.map(m =>
      m.id === msgId ? { ...m, feedback: isHelpful } : m
    ));

    // Fetch accuracy update
    try {
      const res  = await fetch(`${API}/feedback`, {
        method : "POST",
        headers: { "Content-Type":"application/json" },
        body   : JSON.stringify({
          user_message : botMsg.userMessage,
          bot_response : botMsg.text,
          tag          : botMsg.tag || "unknown",
          is_helpful   : isHelpful
        })
      });
      const data = await res.json();
      if (data.current_accuracy) setAccuracy(data.current_accuracy);
    } catch { /* silent fail — feedback not critical */ }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(p => !p)} style={S.floatBtn} title="Chat with Triva">
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div style={S.window}>

          {/* Header */}
          <div style={S.header}>
            <div style={S.hLeft}>
              <div style={S.avatar}>T</div>
              <div>
                <div style={S.hName}>Triva &nbsp;
                  {accuracy && <span style={S.acc}>⭐ {accuracy} helpful</span>}
                </div>
                <div style={S.hSub}>● Online · India Travel AI</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={S.closeBtn}>✕</button>
          </div>

          {/* Messages */}
          <div style={S.msgs}>
            {msgs.map(msg => (
              <div key={msg.id}>
                <div style={{ ...S.row, justifyContent: msg.role==="user" ? "flex-end":"flex-start" }}>
                  {msg.role==="bot" && <div style={S.botIcon}>T</div>}
                  <div style={msg.role==="user" ? S.userBub : S.botBub}>
                    <div style={S.msgTxt}>{msg.text}</div>
                    <div style={S.msgTime}>{msg.time}</div>
                  </div>
                </div>

                {/* Feedback buttons — only on bot messages */}
                {msg.role==="bot" && msg.showFeedback && (
                  <div style={S.fbRow}>
                    {msg.feedback === null ? (
                      <>
                        <span style={S.fbLabel}>Was this helpful?</span>
                        <button
                          style={{ ...S.fbBtn, ...(msg.feedback===true ? S.fbActive:{}) }}
                          onClick={() => submitFeedback(msg.id, msg, true)}
                          title="Yes, helpful"
                        >👍</button>
                        <button
                          style={{ ...S.fbBtn, ...(msg.feedback===false ? S.fbActiveRed:{}) }}
                          onClick={() => submitFeedback(msg.id, msg, false)}
                          title="Not helpful"
                        >👎</button>
                      </>
                    ) : (
                      <span style={S.fbThanks}>
                        {msg.feedback ? "✅ Thanks for your feedback!" : "📝 Noted! We'll improve."}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Typing dots */}
            {typing && (
              <div style={{ ...S.row, justifyContent:"flex-start" }}>
                <div style={S.botIcon}>T</div>
                <div style={S.botBub}>
                  <div style={S.dots}>
                    {[0,1,2].map(i => <span key={i} style={{ ...S.dot, animationDelay:`${i*0.2}s` }}/>)}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick replies */}
          {msgs.length <= 2 && (
            <div style={S.quick}>
              {QUICK.map(q => (
                <button key={q} style={S.qBtn} onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={S.inputArea}>
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey} disabled={typing}
              placeholder="Ask about any Indian destination..."
              style={S.input}
            />
            <button onClick={() => send()} disabled={typing||!input.trim()} style={S.sendBtn}>➤</button>
          </div>

        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)}
        }
      `}</style>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────
const S = {
  floatBtn : {
    position:"fixed", bottom:28, right:28, zIndex:9999,
    width:56, height:56, borderRadius:"50%",
    background:"linear-gradient(135deg,#1a7c5e,#25a87e)",
    color:"#fff", fontSize:24, border:"none", cursor:"pointer",
    boxShadow:"0 4px 20px rgba(26,124,94,0.4)",
    display:"flex", alignItems:"center", justifyContent:"center",
  },
  window : {
    position:"fixed", bottom:96, right:28, zIndex:9998,
    width:370, maxHeight:580,
    background:"#fff", borderRadius:16,
    boxShadow:"0 8px 40px rgba(0,0,0,0.15)",
    display:"flex", flexDirection:"column",
    fontFamily:"'Segoe UI',sans-serif", overflow:"hidden",
  },
  header  : { background:"linear-gradient(135deg,#1a7c5e,#25a87e)", padding:"13px 15px",
               display:"flex", alignItems:"center", justifyContent:"space-between" },
  hLeft   : { display:"flex", alignItems:"center", gap:10 },
  avatar  : { width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,0.2)",
               display:"flex", alignItems:"center", justifyContent:"center",
               color:"#fff", fontWeight:700, fontSize:16 },
  hName   : { color:"#fff", fontWeight:600, fontSize:14, display:"flex", alignItems:"center", gap:6 },
  acc     : { fontSize:10, background:"rgba(255,255,255,0.2)", padding:"2px 7px",
               borderRadius:100, fontWeight:400 },
  hSub    : { color:"rgba(255,255,255,0.8)", fontSize:11 },
  closeBtn: { background:"none", border:"none", color:"#fff", fontSize:16, cursor:"pointer" },

  msgs    : { flex:1, overflowY:"auto", padding:"12px 11px",
               display:"flex", flexDirection:"column", gap:8, background:"#f8f9fa" },
  row     : { display:"flex", alignItems:"flex-end", gap:6 },
  botIcon : { width:26, height:26, borderRadius:"50%", background:"#1a7c5e",
               color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
               fontSize:11, fontWeight:700, flexShrink:0 },
  botBub  : { background:"#fff", borderRadius:"12px 12px 12px 2px", padding:"9px 12px",
               maxWidth:"78%", boxShadow:"0 1px 4px rgba(0,0,0,0.08)" },
  userBub : { background:"linear-gradient(135deg,#1a7c5e,#25a87e)",
               borderRadius:"12px 12px 2px 12px", padding:"9px 12px", maxWidth:"78%",
               boxShadow:"0 1px 4px rgba(26,124,94,0.2)" },
  msgTxt  : { fontSize:13, lineHeight:1.55, whiteSpace:"pre-wrap" },
  msgTime : { fontSize:10, marginTop:3, opacity:.6, textAlign:"right" },
  dots    : { display:"flex", gap:4, padding:"2px 0" },
  dot     : { width:7, height:7, borderRadius:"50%", background:"#aaa",
               display:"inline-block", animation:"bounce 1.2s infinite ease-in-out" },

  // Feedback
  fbRow     : { display:"flex", alignItems:"center", gap:6, marginLeft:32,
                 marginTop:2, marginBottom:4 },
  fbLabel   : { fontSize:11, color:"#aaa" },
  fbBtn     : { background:"none", border:"1px solid #ddd", borderRadius:6,
                 padding:"2px 7px", cursor:"pointer", fontSize:13, transition:"all .2s" },
  fbActive  : { background:"#e8f5f0", borderColor:"#1a7c5e" },
  fbActiveRed:{ background:"#fdf2f2", borderColor:"#e74c3c" },
  fbThanks  : { fontSize:11, color:"#1a7c5e" },

  quick   : { padding:"7px 11px", display:"flex", flexWrap:"wrap",
               gap:5, borderTop:"1px solid #eee", background:"#fff" },
  qBtn    : { padding:"4px 9px", borderRadius:100, border:"1.5px solid #1a7c5e",
               background:"#fff", color:"#1a7c5e", fontSize:11, cursor:"pointer", fontWeight:500 },
  inputArea:{ display:"flex", padding:"9px 11px", gap:7,
               borderTop:"1px solid #eee", background:"#fff" },
  input   : { flex:1, padding:"8px 12px", borderRadius:100,
               border:"1.5px solid #ddd", fontSize:13, outline:"none",
               fontFamily:"inherit" },
  sendBtn : { width:36, height:36, borderRadius:"50%",
               background:"linear-gradient(135deg,#1a7c5e,#25a87e)",
               color:"#fff", border:"none", cursor:"pointer",
               display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 },
};
