import fs from 'fs';
import path from 'path';

export interface Transformation {
  id: string;
  original_text: string;
  transformed_text: string;
  transformation_type: string;
  created_at: string;
}

export interface TransformationFilters {
  search?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

// Ensure data directory exists
const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_FILE = path.join(DB_DIR, 'transformations.db');
const JSON_FALLBACK_FILE = path.join(DB_DIR, 'transformations_fallback.json');

let dbInstance: any = null;
let useFallback = false;

// Initialize SQLite database or fallback
function getDatabase() {
  if (useFallback) {
    return null;
  }

  if (!dbInstance) {
    try {
      // Dynamic require to prevent client-side bundle errors and allow graceful fallback
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Database = require('better-sqlite3');
      dbInstance = new Database(DB_FILE);
      dbInstance.pragma('journal_mode = WAL');

      // Create Transformation table matching exact schema requirements
      dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS Transformation (
          id TEXT PRIMARY KEY,
          original_text TEXT NOT NULL,
          transformed_text TEXT NOT NULL,
          transformation_type TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_transformation_created_at ON Transformation(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_transformation_type ON Transformation(transformation_type);
      `);

      // Seed initial samples if empty
      const countRow = dbInstance.prepare(`SELECT COUNT(*) as count FROM Transformation`).get() as { count: number };
      if (countRow.count === 0) {
        seedInitialRecords(dbInstance);
      }
    } catch (err) {
      console.warn('[DB] better-sqlite3 initialization note (using resilient fallback store):', (err as Error).message);
      useFallback = true;
      initJsonFallback();
    }
  }

  return dbInstance;
}

function seedInitialRecords(db: any) {
  const samples = [
    {
      id: 'tx_seed_001',
      original_text: 'Our Q3 developer survey across 4,200 software engineers revealed that automated code refactoring, rapid API documentation search, and contextual test generation saved an average of 6.4 engineering hours per week per engineer. However, security review bottlenecks remain a prime source of release friction.',
      transformed_text: `## Executive Summary: Q3 Developer Productivity Insights

**Key Findings:**
- **Productivity Gain:** Engineering teams saved an average of **6.4 hours/week per engineer** via automated refactoring, rapid API search, and smart test generation.
- **Critical Bottleneck:** Security and compliance audits remain the single largest inhibitor to weekly deployment velocity.
- **Strategic Recommendation:** Prioritize shift-left security tooling into developer CI pipelines to eliminate manual handoffs.`,
      transformation_type: 'Summarize',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'tx_seed_002',
      original_text: 'Building resilient cloud infrastructure requires decoupling monolithic workflows, establishing automated failover across availability zones, and implementing strict observability alerting thresholds before incidents escalate.',
      transformed_text: `### Arquitectura Cloud Resiliente (Traducción al Español)

La construcción de una infraestructura en la nube verdaderamente resistente exige:
1. **Desacoplamiento de flujos monolíticos:** Aislar dominios críticos para prevenir fallos en cascada.
2. **Conmutación por error automatizada:** Distribución dinámica a través de múltiples zonas de disponibilidad con recuperación RPO/RTO en milisegundos.
3. **Observabilidad preventiva:** Umbrales de alerta inteligentes que detecten anomalías antes de que degraden la experiencia del usuario final.`,
      transformation_type: 'Translate',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: 'tx_seed_003',
      original_text: '1. Why do tech startups fail? Mostly building for a phantom market.\n2. How to fix it: Talk to 20 potential customers before writing a single line of backend code.\n3. Validate willingness to pay through pre-orders or letters of intent.\n4. Build the smallest possible prototype that delivers 10x value on one specific task.',
      transformed_text: `# The Pre-Code Blueprint: Why the Best Startups Build Audience Before Architecture

![Startup Strategy](https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80)

Every month, thousands of talented engineers spend nights and weekends writing spotless code, configuring Kubernetes clusters, and tuning database indexes—for a product that nobody wants.

## 1. The Phantom Market Trap
The greatest risk in modern software development is no longer technical feasibility; it is market indifference. When you build in isolation, you risk optimizing for hypothetical problems.

## 2. The 20-Conversation Rule
Before you initialize a repository or register a domain:
- **Schedule discovery calls** with 20 professionals who experience the pain point daily.
- **Listen for frustration metrics:** What processes are currently causing them to lose time or revenue?
- **Secure validation:** Ask for a letter of intent or pilot prepayment. Real conviction involves commitment.

## The Takeaway
Fall in love with the problem, not the code. Deliver tenfold value on a solitary, acute pain point before expanding your scope.`,
      transformation_type: 'Rewrite as a Blog Post',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];

  try {
    const insertStmt = db.prepare(`
      INSERT INTO Transformation (id, original_text, transformed_text, transformation_type, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const s of samples) {
      insertStmt.run(s.id, s.original_text, s.transformed_text, s.transformation_type, s.created_at);
    }
  } catch (err) {
    console.warn('[DB] Seeding note:', err);
  }
}

// Resilient JSON Store fallback implementation
function initJsonFallback() {
  if (!fs.existsSync(JSON_FALLBACK_FILE)) {
    const initialSamples: Transformation[] = [
      {
        id: 'tx_seed_001',
        original_text: 'Our Q3 developer survey across 4,200 software engineers revealed that automated code refactoring, rapid API documentation search, and contextual test generation saved an average of 6.4 engineering hours per week per engineer. However, security review bottlenecks remain a prime source of release friction.',
        transformed_text: `## Executive Summary: Q3 Developer Productivity Insights\n\n**Key Findings:**\n- **Productivity Gain:** Engineering teams saved an average of **6.4 hours/week per engineer** via automated refactoring, rapid API search, and smart test generation.\n- **Critical Bottleneck:** Security and compliance audits remain the single largest inhibitor to weekly deployment velocity.\n- **Strategic Recommendation:** Prioritize shift-left security tooling into developer CI pipelines to eliminate manual handoffs.`,
        transformation_type: 'Summarize',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: 'tx_seed_002',
        original_text: 'Building resilient cloud infrastructure requires decoupling monolithic workflows, establishing automated failover across availability zones, and implementing strict observability alerting thresholds before incidents escalate.',
        transformed_text: `### Arquitectura Cloud Resiliente (Traducción al Español)\n\nLa construcción de una infraestructura en la nube verdaderamente resistente exige:\n1. **Desacoplamiento de flujos monolíticos:** Aislar dominios críticos para prevenir fallos en cascada.\n2. **Conmutación por error automatizada:** Distribución dinámica a través de múltiples zonas de disponibilidad con recuperación RPO/RTO en milisegundos.\n3. **Observabilidad preventiva:** Umbrales de alerta inteligentes que detecten anomalías antes de que degraden la experiencia del usuario final.`,
        transformation_type: 'Translate',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      },
      {
        id: 'tx_seed_003',
        original_text: '1. Why do tech startups fail? Mostly building for a phantom market.\n2. How to fix it: Talk to 20 potential customers before writing a single line of backend code.\n3. Validate willingness to pay through pre-orders or letters of intent.\n4. Build the smallest possible prototype that delivers 10x value on one specific task.',
        transformed_text: `# The Pre-Code Blueprint: Why the Best Startups Build Audience Before Architecture\n\nEvery month, thousands of talented engineers spend nights and weekends writing spotless code, configuring Kubernetes clusters, and tuning database indexes—for a product that nobody wants.\n\n## 1. The Phantom Market Trap\nThe greatest risk in modern software development is no longer technical feasibility; it is market indifference.\n\n## 2. The 20-Conversation Rule\nBefore you initialize a repository or register a domain:\n- Schedule discovery calls with 20 professionals who experience the pain point daily.\n- Listen for frustration metrics: What processes cause them to lose time or revenue?\n- Secure validation: Ask for a letter of intent or pilot prepayment.\n\n## The Takeaway\nFall in love with the problem, not the code. Deliver tenfold value on a solitary pain point.`,
        transformation_type: 'Rewrite as a Blog Post',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ];
    fs.writeFileSync(JSON_FALLBACK_FILE, JSON.stringify(initialSamples, null, 2), 'utf-8');
  }
}

function readJsonFallback(): Transformation[] {
  try {
    initJsonFallback();
    const data = fs.readFileSync(JSON_FALLBACK_FILE, 'utf-8');
    return JSON.parse(data) || [];
  } catch {
    return [];
  }
}

function writeJsonFallback(items: Transformation[]): void {
  try {
    initJsonFallback();
    fs.writeFileSync(JSON_FALLBACK_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB Fallback] Failed to write fallback file:', err);
  }
}

/**
 * Inserts a new Transformation record into the database
 */
export function createTransformation(record: {
  id: string;
  original_text: string;
  transformed_text: string;
  transformation_type: string;
  created_at?: string;
}): Transformation {
  const finalRecord: Transformation = {
    id: record.id,
    original_text: record.original_text,
    transformed_text: record.transformed_text,
    transformation_type: record.transformation_type,
    created_at: record.created_at || new Date().toISOString(),
  };

  const db = getDatabase();
  if (db && !useFallback) {
    try {
      const stmt = db.prepare(`
        INSERT INTO Transformation (id, original_text, transformed_text, transformation_type, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(
        finalRecord.id,
        finalRecord.original_text,
        finalRecord.transformed_text,
        finalRecord.transformation_type,
        finalRecord.created_at
      );
      return finalRecord;
    } catch (error) {
      console.warn('[DB] SQLite insert failed, falling back to JSON storage:', error);
      useFallback = true;
    }
  }

  // Fallback storage
  const list = readJsonFallback();
  list.unshift(finalRecord);
  writeJsonFallback(list);
  return finalRecord;
}

/**
 * Retrieves all transformations with optional filtering, search, and pagination
 */
export function getTransformations(filters: TransformationFilters = {}): Transformation[] {
  const { search, type, limit = 100, offset = 0 } = filters;
  const db = getDatabase();

  if (db && !useFallback) {
    try {
      let query = `SELECT id, original_text, transformed_text, transformation_type, created_at FROM Transformation WHERE 1=1`;
      const params: any[] = [];

      if (type && type.toLowerCase() !== 'all') {
        query += ` AND LOWER(transformation_type) = LOWER(?)`;
        params.push(type);
      }

      if (search && search.trim() !== '') {
        query += ` AND (original_text LIKE ? OR transformed_text LIKE ?)`;
        const wildcard = `%${search.trim()}%`;
        params.push(wildcard, wildcard);
      }

      query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const stmt = db.prepare(query);
      return stmt.all(...params) as Transformation[];
    } catch (error) {
      console.warn('[DB] SQLite query failed, falling back to JSON storage:', error);
      useFallback = true;
    }
  }

  // Fallback implementation
  let list = readJsonFallback();

  if (type && type.toLowerCase() !== 'all') {
    list = list.filter((item) => item.transformation_type.toLowerCase() === type.toLowerCase());
  }

  if (search && search.trim() !== '') {
    const s = search.toLowerCase().trim();
    list = list.filter(
      (item) =>
        item.original_text.toLowerCase().includes(s) ||
        item.transformed_text.toLowerCase().includes(s)
    );
  }

  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return list.slice(offset, offset + limit);
}

/**
 * Retrieves a single transformation by its ID
 */
export function getTransformationById(id: string): Transformation | null {
  const db = getDatabase();
  if (db && !useFallback) {
    try {
      const stmt = db.prepare(`SELECT * FROM Transformation WHERE id = ?`);
      const row = stmt.get(id);
      return (row as Transformation) || null;
    } catch {
      useFallback = true;
    }
  }

  const list = readJsonFallback();
  return list.find((item) => item.id === id) || null;
}

/**
 * Deletes a transformation record by ID
 */
export function deleteTransformation(id: string): boolean {
  const db = getDatabase();
  if (db && !useFallback) {
    try {
      const stmt = db.prepare(`DELETE FROM Transformation WHERE id = ?`);
      const result = stmt.run(id);
      return result.changes > 0;
    } catch {
      useFallback = true;
    }
  }

  const list = readJsonFallback();
  const initialLength = list.length;
  const filtered = list.filter((item) => item.id !== id);
  writeJsonFallback(filtered);
  return filtered.length < initialLength;
}

/**
 * Returns summary statistics for the dashboard
 */
export function getTransformationStats(): {
  total: number;
  byType: Record<string, number>;
  totalWordsProcessed: number;
} {
  const all = getTransformations({ limit: 10000 });
  const byType: Record<string, number> = {};
  let totalWordsProcessed = 0;

  for (const item of all) {
    byType[item.transformation_type] = (byType[item.transformation_type] || 0) + 1;
    const words = (item.original_text || '').trim().split(/\s+/).filter(Boolean).length;
    totalWordsProcessed += words;
  }

  return {
    total: all.length,
    byType,
    totalWordsProcessed,
  };
}
