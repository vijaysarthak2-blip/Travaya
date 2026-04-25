export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
export const AI_API_BASE = process.env.NEXT_PUBLIC_AI_API_BASE || "http://localhost:5001";

export const config = {
    API_BASE,
    AI_API_BASE,
};

export default config;
