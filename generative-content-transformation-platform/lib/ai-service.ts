/**
 * AI Service for Content Transformation
 * 
 * Supports:
 * 1. Intelligent Mock Mode (Default out-of-the-box, no API key needed)
 * 2. OpenAI GPT-4o / GPT-4o-mini Integration
 * 3. Google Gemini (1.5 Flash / 1.5 Pro) Integration
 * 
 * TO CONNECT REAL APIS:
 * ----------------------------------------------------------------------------
 * 1. For OpenAI:
 *    - Get your API key at: https://platform.openai.com/api-keys
 *    - In .env.local, set:
 *        AI_PROVIDER="openai"
 *        OPENAI_API_KEY="sk-your-openai-api-key"
 * 
 * 2. For Google Gemini:
 *    - Get your API key at: https://aistudio.google.com/app/apikey
 *    - In .env.local, set:
 *        AI_PROVIDER="gemini"
 *        GEMINI_API_KEY="your-gemini-api-key"
 * ----------------------------------------------------------------------------
 */

export interface TransformRequest {
  text: string;
  type: string;
  targetLanguage?: string;
  tone?: string;
  length?: 'concise' | 'standard' | 'detailed';
}

export interface TransformResponse {
  transformedText: string;
  provider: 'mock' | 'openai' | 'gemini';
  modelUsed: string;
  wordCount: number;
  processingTimeMs: number;
}

/**
 * Main dispatcher function for transformation requests
 */
export async function executeTransformation(params: TransformRequest): Promise<TransformResponse> {
  const startTime = Date.now();
  const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();

  let result = '';
  let modelUsed = 'Mock-Engine-v2';

  if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    result = await transformWithOpenAI(params);
    modelUsed = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  } else if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
    result = await transformWithGemini(params);
    modelUsed = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  } else {
    // Intelligent Mock Fallback
    result = await mockAiTransformation(params);
    modelUsed = 'Mock-Engine-v2 (Zero-Config)';
  }

  const duration = Date.now() - startTime;
  const wordCount = result.trim().split(/\s+/).filter(Boolean).length;

  return {
    transformedText: result,
    provider: (['openai', 'gemini'].includes(provider) && (process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY)) 
      ? (provider as 'openai' | 'gemini') 
      : 'mock',
    modelUsed,
    wordCount,
    processingTimeMs: duration,
  };
}

// ============================================================================
// 1. OPENAI INTEGRATION (Paste your OpenAI key in .env.local: OPENAI_API_KEY)
// ============================================================================
async function transformWithOpenAI(params: TransformRequest): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables.');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const systemPrompt = buildSystemPrompt(params.type, params.targetLanguage, params.tone, params.length);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: params.text },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// ============================================================================
// 2. GOOGLE GEMINI INTEGRATION (Paste your Gemini key in .env.local: GEMINI_API_KEY)
// ============================================================================
async function transformWithGemini(params: TransformRequest): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables.');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const systemPrompt = buildSystemPrompt(params.type, params.targetLanguage, params.tone, params.length);

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${systemPrompt}\n\nHere is the user's content to transform:\n\n${params.text}` },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2500,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Google Gemini API error (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

// ============================================================================
// 3. PROMPT GENERATOR FOR LLMS
// ============================================================================
function buildSystemPrompt(
  type: string,
  targetLanguage?: string,
  tone?: string,
  length?: string
): string {
  const toneDesc = tone ? `Use a ${tone} tone.` : 'Maintain a balanced and natural tone.';
  const lengthDesc = length === 'concise' ? 'Keep the output brief and direct.' : length === 'detailed' ? 'Provide an in-depth and comprehensive output.' : '';

  switch (type.toLowerCase()) {
    case 'summarize':
      return `You are an expert executive editor. Summarize the following content effectively, highlighting the core message and crucial takeaways while discarding fluff. ${toneDesc} ${lengthDesc}`;

    case 'translate':
      const lang = targetLanguage || 'Spanish';
      return `You are a certified professional translator. Accurately translate the provided text into ${lang}, preserving nuances, idioms, tone, and cultural context. Return only the translated text.`;

    case 'rewrite as a blog post':
      return `You are a top-tier digital content strategist and copywriter. Transform the user's raw notes or text into an engaging, well-structured blog post. Include an eye-catching headline, an engaging hook introduction, clear markdown headings (##, ###), bullet points where helpful, and a crisp conclusion with a call to action. ${toneDesc}`;

    case 'extract key points':
      return `You are an analytical researcher. Thoroughly extract the key points, core takeaways, and actionable items from the provided text. Present them as clean, prioritized bullet points with bold keywords. ${lengthDesc}`;

    case 'professional polish':
      return `You are an executive communications specialist. Polish, refine, and elevate the provided draft into clear, articulate, and persuasive professional communication suitable for executive leadership or clients. ${toneDesc}`;

    case 'explain like i\'m 5':
      return `You are a gifted educator who excels at breaking down complex concepts for beginners. Explain the provided text in simple, relatable language using vivid everyday analogies without jargon.`;

    case 'social media thread':
      return `You are a viral social media writer. Convert the provided content into an engaging Twitter / LinkedIn multi-part post thread with strong hooks, emojis, numbered tweets, and a concluding discussion prompt.`;

    default:
      return `You are a versatile AI content transformer. Process and enhance the following text according to the goal: "${type}". ${toneDesc}`;
  }
}

// ============================================================================
// 4. INTELLIGENT MOCK AI ENGINE
// High-quality contextual responses when no API key is configured yet.
// ============================================================================
async function mockAiTransformation(params: TransformRequest): Promise<string> {
  // Simulate network latency (400ms - 900ms) for realistic UX experience
  await new Promise((resolve) => setTimeout(resolve, 600));

  const text = params.text.trim();
  const sentences = text.split(/(?<=[.?!])\s+/).filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean);

  const cleanSample = text.length > 300 ? text.slice(0, 300) + '...' : text;
  const firstSentence = sentences[0] || text.slice(0, 100);
  const topic = extractKeywords(text);

  switch (params.type.toLowerCase()) {
    case 'summarize':
      return generateMockSummary(text, sentences, topic);

    case 'translate':
      return generateMockTranslation(text, params.targetLanguage || 'Spanish');

    case 'rewrite as a blog post':
      return generateMockBlogPost(text, sentences, topic);

    case 'extract key points':
      return generateMockKeyPoints(text, sentences, topic);

    case 'professional polish':
      return generateMockPolish(text, sentences);

    case 'explain like i\'m 5':
      return generateMockEli5(text, topic);

    case 'social media thread':
      return generateMockSocialThread(text, topic);

    default:
      return `### Transformed Content (${params.type})\n\n${text}\n\n*Optimized and structured for maximum clarity and impact.*`;
  }
}

// --- Mock Generation Helpers ---

function extractKeywords(text: string): string {
  const commonWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'have', 'from', 'they', 'will', 'would', 'there', 'their', 'what', 'about', 'which', 'when', 'make', 'like', 'time', 'just', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us']);
  const tokens = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const freq: Record<string, number> = {};
  tokens.forEach(w => {
    if (!commonWords.has(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 3).map(e => e[0]).join(', ') || 'core concept';
}

function generateMockSummary(text: string, sentences: string[], topic: string): string {
  const mainIdea = sentences[0] || 'The submitted text outlines several key strategic ideas.';
  const middleIdea = sentences[Math.floor(sentences.length / 2)] || 'Multiple factors contribute to the overall trajectory and impact.';
  const conclusion = sentences[sentences.length - 1] || 'Immediate implementation and continuous alignment are suggested.';

  return `## Executive Summary

**Primary Theme:** ${topic ? topic.toUpperCase() : 'Strategic Overview'}

${mainIdea}

### Critical Insights
- **Core Premise:** ${middleIdea}
- **Impact Factor:** Effective synthesis of this material unlocks streamlined workflows and measurable performance improvements.
- **Strategic Direction:** ${conclusion}

> **Bottom Line:** The central narrative demonstrates clear momentum around ${topic || 'the discussed objectives'}, offering actionable paths toward meaningful execution.`;
}

function generateMockTranslation(text: string, targetLanguage: string): string {
  const translations: Record<string, { greeting: string; prefix: string; sample: string }> = {
    spanish: {
      greeting: 'Versión traducida al Español',
      prefix: 'Traducción profesional certificada:',
      sample: 'El contenido original ha sido procesado y adaptado contextualmente para reflejar con precisión el tono, vocabulario e intención del documento en lengua castellana.',
    },
    french: {
      greeting: 'Version traduite en Français',
      prefix: 'Traduction professionnelle certifiée:',
      sample: 'Le contenu original a été rigoureusement traduit et localisé afin de préserver la subtilité, le vocabulaire technique et la fluidité stylistique.',
    },
    german: {
      greeting: 'Deutsche Übersetzung',
      prefix: 'Zertifizierte Fachübersetzung:',
      sample: 'Der Ausgangstext wurde unter Berücksichtigung aller grammatikalischen Feinheiten sowie branchenspezifischer Terminologie präzise ins Deutsche übertragen.',
    },
    japanese: {
      greeting: '日本語翻訳版 (Japanese Translation)',
      prefix: 'プロフェッショナル翻訳:',
      sample: '原文のニュアンス、敬語表現、および文脈的背景を正確に反映し、自然で洗練された日本語テキストへと変換されました。',
    },
    chinese: {
      greeting: '中文翻译版 (Chinese Translation)',
      prefix: '专业精准翻译:',
      sample: '原内容已根据语言习惯和语境进行深度本地化润色，忠实传达原文主旨与关键信息。',
    },
  };

  const normalized = targetLanguage.toLowerCase();
  const info = translations[normalized] || {
    greeting: `Translated to ${targetLanguage}`,
    prefix: `Professional localization into ${targetLanguage}:`,
    sample: `The provided text has been translated with grammatical fidelity and idiomatic phrasing for ${targetLanguage} native speakers.`,
  };

  return `### ${info.greeting}
*${info.prefix}*

${info.sample}

---
**Texto traducido / Transformed Body:**
"${text}"
*(Note: Full neural translation is generated via OpenAI/Gemini when API keys are configured in .env.local)*`;
}

function generateMockBlogPost(text: string, sentences: string[], topic: string): string {
  const hook = sentences[0] || 'In today’s rapidly evolving landscape, standing still is the fastest way to fall behind.';
  const point1 = sentences[1] || 'Understanding the fundamental principles is the cornerstone of any sustainable breakthrough.';
  const point2 = sentences[2] || 'Real progress happens when ideas are paired with structured execution and measurable metrics.';
  
  return `# Mastering the Shift: A Modern Guide to ${topic ? topic.charAt(0).toUpperCase() + topic.slice(1) : 'Content Excellence'}

![Banner](https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80)

*Published by AI Content Studio • 4 min read*

---

${hook}

Whether you are scaling a modern enterprise, crafting thoughtful communications, or architecting digital products, the way you frame your message defines your outcome.

## 1. Deconstructing the Foundations

${point1}

When we look deeper into the original premises, several foundational truths emerge:
- **Clarity over complexity:** Direct messaging always outperforms convoluted jargon.
- **Targeted relevance:** Understanding your audience’s pain points turns passive readers into active champions.

## 2. Practical Implementation Steps

${point2}

To turn these concepts into tangible reality, adopt a three-pillar framework:
1. **Audit current workflows:** Pinpoint bottlenecks where friction and ambiguity slow down momentum.
2. **Iterate relentlessly:** Deploy smaller, testable variations rather than waiting for hypothetical perfection.
3. **Measure what matters:** Establish quantifiable milestones that align directly with long-term vision.

## The Takeaway

Transformation is not an event—it is an intentional, continuous discipline. By taking the essence of your initial thoughts and structuring them with intention, you bridge the gap between ideation and lasting impact.

---
*What are your thoughts on this strategy? Share your perspectives in the comments below!*`;
}

function generateMockKeyPoints(text: string, sentences: string[], topic: string): string {
  const points = sentences.slice(0, 5).map((s, idx) => {
    const boldWord = s.split(' ')[0] || `Point ${idx + 1}`;
    return `${idx + 1}. **${boldWord.replace(/[^a-zA-Z]/g, '')}:** ${s.trim()}`;
  });

  if (points.length === 0) {
    points.push('1. **Primary Insight:** Essential thematic focus identified in input text.');
  }

  return `## Key Actionable Takeaways

**Subject Focus:** ${topic ? topic.toUpperCase() : 'Analytical Breakdown'}

${points.join('\n\n')}

---

### Recommended Next Steps
- [ ] Review identified priorities with key project stakeholders.
- [ ] Integrate core findings into ongoing strategic roadmap.
- [ ] Establish feedback loop to track ongoing progression.`;
}

function generateMockPolish(text: string, sentences: string[]): string {
  return `### Refined & Polished Communication

**Tone:** Executive / Professional Clarity

---

Dear Colleagues and Valued Partners,

I am writing to share an important update regarding our ongoing initiatives and strategic priorities.

${text}

Should you have any questions or require additional details regarding these matters, please do not hesitate to reach out. I look forward to our continued collaboration and achieving our shared objectives.

Warm regards,

**Executive Communications**`;
}

function generateMockEli5(text: string, topic: string): string {
  return `## Explain Like I'm 5 (ELI5) 🎈

Imagine you have a giant box of colorful LEGO bricks, but they are all scattered across the living room floor!

That is kind of like what this topic (**${topic || 'this big idea'}**) is about:

1. **The Big Picture:** Instead of trying to pick up every single brick at once, you group them by color and build a really cool castle step by step.
2. **Why It Matters:** When everything is organized, building fun things becomes super easy and you don't step on sharp pieces in the dark!
3. **The Simple Rule:** Keep things simple, take one bite at a time, and always remember to have fun while building!

*In short:* Take a big, confusing thing, break it down into friendly little pieces, and solve it one smile at a time! 😊`;
}

function generateMockSocialThread(text: string, topic: string): string {
  return `🧵 **Thread: The Blueprint for Modern ${topic ? topic.toUpperCase() : 'Transformation'}**

1/5 🚀 Most people struggle with this because they overcomplicate the basics. Here is the unvarnished breakdown:

2/5 💡 **The Core Problem:**
${text.slice(0, 140)}...

3/5 ⚡ **The Solution:**
Stop optimizing for noise. Focus strictly on signal, measurable feedback, and sustainable execution.

4/5 📊 **The 3 Rules to Remember:**
• Rule 1: Clarity is your highest leverage advantage.
• Rule 2: Iterate faster than your competition can plan.
• Rule 3: Consistency always beats sporadic brilliance.

5/5 🔁 If you found this breakdown valuable:
- Repost to share with your network
- Bookmark for later reference
- Drop your thoughts below! 👇`;
}
