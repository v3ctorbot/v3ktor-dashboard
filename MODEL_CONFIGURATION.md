# 🤖 V3ktor Model Configuration Guide

This file documents all AI models available in V3ktor ecosystem and how to configure them for OpenCLAW.

> **Note (2026-02-19):** This document describes the *aspirational* model routing strategy.
> V3ktor's actual primary model is `anthropic/claude-sonnet-4-6` (not GLM-4.7), with
> `google/gemini-2.5-pro` for subagents, as configured in `~/.openclaw/openclaw.json`.
> The GLM-4.7 / LLAMA-4 routing described below is a planned optimization, not yet active.

---

## 📊 **Model Registry**

| Model Name | Type | Provider | Cost | Best For | Capabilities |
|-------------|------|----------|------|------------|--------------|
| **GLM-4.7** | Cloud | Zai | $0.6/1M (in), $2.2/1M (out) | Strategic Thinking, Planning, Architecture | Fast, Multimodal (text/image/code), Reliable |
| **GLM-4.7 Vision** | Cloud | Zai | Same as GLM-4.7 | Visual Analysis | Fast, Multimodal, Image Understanding |
| **GLM-4.7 Fast** | Cloud | Zai | $2.0/1M (in), $4.5/1M (out) | Real-Time, Low Latency | High-Speed Tasks, APIs, Coding |
| **GLM-4.7 Long** | Cloud | Zai | $1.0/1M (in), $2.0/1M (out) | Deep Research, Long Context (1M+ tokens) | Extended Thinking, Research, Complex Analysis |
| **GLM-4.7 Flash** | Cloud | Zai | $0.1/1M (in), $0.4/1M (out) | Rapid Prototyping, Quick Tasks | Fastest, Simple Queries, Coding Helpers |
| **LLAMA-4** | Local | Meta | FREE | Creative Writing, Code Generation, Privacy, Custom Fine-tuning | Text-only (no image), Slower than cloud, Open-source, 8B-70B params |
| **LLAMA-3** | Local | Meta | FREE | General Purpose, Creative | Text-only, Open-source, 8B-70B params |
| **Ollama-Qwen** | Local | Alibaba | FREE | Coding, Logic, Math, Reasoning | Text-only, Open-source, Optimized for code |
| **Gemma-3** | Local | Google | FREE | Research, Summarization, Reasoning | Text-only, Open-source, Lightweight |
| **MediaPipe** (Pose) | Local | Google | FREE | Video Analysis, Real-Time, Edge AI, Computer Vision, 33-point Pose Landmarks | Free for inference |

---

## 🎯 **Model Selection Guidelines**

### **For Strategic Thinking & Planning:**
→ Use **GLM-4.7** (Default Model)
- Reason: Superior reasoning, fast, cost-effective
- Use when: Architecture design, task decomposition, strategic decisions
- Cost: Only when "thinking deeply" (few thousand tokens per day)
- Token limit: ~1M context (sufficient for most planning)

### **For Coding & Execution:**
→ Use **LLAMA-4** (Free Generator)
- Reason: Unlimited tokens, no API rate limits, runs locally
- Use when: Generating code, writing documentation, creating content
- Performance: Slower than GLM-4.7, but FREE and unlimited
- Deployment: Runs on Mac Mini via Ollama

### **For Research & Complex Analysis:**
→ Use **GLM-4.7 Long**
- Reason: Extended thinking (1M+ context) for deep analysis
- Use when: Multi-step reasoning, strategic research, complex problem solving
- Cost: Higher than base GLM-4.7, but worth it for research tasks
- Token limit: ~1M context (extended)

### **For Real-Time & APIs:**
→ Use **GLM-4.7 Fast**
- Reason: Ultra-low latency, high throughput
- Use when: Real-time APIs, WebSocket connections, rapid responses
- Cost: Premium pricing, but justifiable for real-time systems

### **For Quick Prototyping:**
→ Use **GLM-4.7 Flash**
- Reason: Fastest model, minimal cost
- Use when: Quick queries, simple tasks, testing ideas
- Cost: Cheapest option for fast results

### **For Video Analysis:**
→ Use **MediaPipe Pose** (Built-in to Padel Analyzer)
- Reason: Real-time, runs on GPU (Modal), 33-point landmarks
- Use when: Any video analysis task (padel/tennis/golf)
- Cost: FREE inference (only GPU time costs)

### **For Creative Writing (No API Costs):**
→ Use **LLAMA-4** (Local)
- Reason: Unlimited generation, 100% privacy
- Use when: Writing blogs, emails, documentation, creative content
- Deployment: Runs on Mac Mini via Ollama

### **For Coding Helpers & Logic:**
→ Use **Ollama-Qwen**
- Reason: Optimized for code generation, better syntax
- Use when: Writing boilerplate, code completion, refactoring
- Deployment: Runs on Mac Mini via Ollama

### **For General Research:**
→ Use **Gemma-3**
- Reason: Lightweight, fast enough for research tasks
- Use when: Web scraping, data synthesis, quick research
- Deployment: Runs on Mac Mini via Ollama

---

## 🎯 **Cost Optimization Strategy**

### **Daily Cost Budget (Recommended):**
- **GLM-4.7 (Base):** ~$15-30/month (10K tokens/day)
- **GLM-4.7 Long (Research):** ~$5-10/month (3K tokens/day)
- **Total GLM-4.7:** ~$20-40/month

### **Free Token Pool:**
- **LLAMA-4:** Unlimited local tokens (saves ~$100/month vs cloud)
- **LLAMA-3:** Unlimited local tokens (backup)
- **MediaPipe:** FREE inference (only GPU costs)

### **Total Monthly Cost:**
- **With Optimization:** ~$20-40/month (GLM + GPU)
- **Without Optimization:** ~$200-400/month (all cloud LLMs)
- **Savings:** ~80-90% 💰

---

## 📋 **OpenCLAW Configuration**

### **Option 1: Default (Recommended)**
```json
{
  "models": {
    "strategic": "glm-4.7",
    "creative": "llama-4",
    "research": "glm-4.7-long",
    "realtime": "glm-4.7-fast",
    "prototyping": "glm-4.7-flash"
    "video": "mediapipe"
  },
  "providers": {
    "zai": {
      "key": "YOUR_ZAI_API_KEY",
      "base_url": "https://api.zai.com/v1"
    },
    "ollama": {
      "local": true,
      "base_url": "http://localhost:11434"
    },
    "mediapipe": {
      "local": true,
      "model": "pose_landmarker_full"
    }
  }
}
```

### **Option 2: Privacy First (No Cloud)**
```json
{
  "models": {
    "strategic": "llama-4",
    "creative": "llama-4",
    "research": "gemma-3",
    "coding": "ollama-qwen",
    "video": "mediapipe"
  },
  "providers": {
    "ollama": {
      "local": true,
      "base_url": "http://localhost:11434",
      "models": ["llama-4", "llama-3", "ollama-qwen", "gemma-3"]
    },
    "mediapipe": {
      "local": true,
      "model": "pose_landmarker_full"
    }
  }
}
```

---

## 🔧 **How to Use This Configuration**

### **In V3ktor Dashboard:**
1. Import this file
2. Parse the model configuration
3. Route tasks to appropriate models
4. Track token usage and costs per model

### **In Padel Analyzer (Modal):**
1. Send `model` parameter in request: `model: "glm4"` or `model: "llama-4"`
2. Use MediaPipe Pose for video analysis
3. Track `model_used` in Supabase results

### **In V3ktor Core (OpenCLAW):**
1. Load configuration on startup
2. Initialize model clients (Zai API, Ollama local)
3. Create router for task type → model mapping
4. Implement token usage tracking

---

## 💡 **Model Switching Logic**

### **Task Type Routing:**
```javascript
function selectModel(taskType) {
  const tasks = {
    'strategic': 'glm-4.7',
    'planning': 'glm-4.7',
    'architecture': 'glm-4.7',
    'coding': 'llama-4',
    'writing': 'llama-4',
    'creative': 'llama-4',
    'research': 'glm-4.7-long',
    'realtime': 'glm-4.7-fast',
    'prototyping': 'glm-4.7-flash',
    'video': 'mediapipe'
  };
  
  return tasks[taskType] || 'glm-4.7';  // Default to GLM-4.7
}
```

### **Cost Tracking:**
```javascript
function trackUsage(model, inputTokens, outputTokens) {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['default'];
  const cost = (inputTokens / 1_000_000) * pricing.input + 
              (outputTokens / 1_000_000) * pricing.output;
  
  return {
    model,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    cost: cost.toFixed(6),
    timestamp: new Date().toISOString()
  };
}
```

---

## 🚀 **Deployment Checklist**

### **For Mac Mini (Local Models):**
- [ ] Install Ollama: `brew install ollama`
- [ ] Pull models: `ollama pull llama4`, `ollama pull llama3`, `ollama pull qwen`, `ollama pull gemma`
- [ ] Start local server: `ollama serve`
- [ ] Verify models: `ollama list`
- [ ] Test local inference: `ollama run llama4 "test"`

### **For Cloud Models (Zai):**
- [ ] Add Zai API key to environment variables
- [ ] Implement Zai API client
- [ ] Test all GLM-4.7 variants
- [ ] Set up rate limiting and usage tracking

### **For Video Analysis (MediaPipe):**
- [ ] Install MediaPipe: `pip install mediapipe opencv-python-headless`
- [ ] Test pose detection on sample video
- [ ] Optimize for GPU usage
- [ ] Validate 33-point landmark output

---

## 📊 **Usage Recommendations**

### **Daily Quotas:**
- **GLM-4.7:** 10,000 tokens/day max
- **LLAMA-4:** Unlimited local tokens
- **MediaPipe:** 10 analyses/day max

### **Monthly Budget:**
- **Small:** $20/month (1 user)
- **Medium:** $50/month (2-3 users)
- **Large:** $100/month (5-10 users)

### **Scaling Strategy:**
1. Use free local models (LLAMA-4) for coding/content
2. Use GLM-4.7 for strategic thinking and APIs
3. Scale MediaPipe on GPU for video analysis
4. Add GLM-4.7 Long only when deep research is needed

---

## 🎯 **Summary**

**This configuration provides:**
- ✅ Complete model registry for all available AI capabilities
- ✅ Cost optimization strategy (save 80-90% vs all-cloud)
- ✅ Privacy options (100% local inference available)
- ✅ Scalability (cloud models for when needed)
- ✅ Flexibility (switch models based on task type)
- ✅ Reliability (multiple model options, no single point of failure)

**V3ktor is now ready for multi-agent AI development** 🚀

---

**Last Updated:** 2026-02-09 00:24:17 UTC
