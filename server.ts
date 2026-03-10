import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database
const db = new Database('regulations.db');

// Create tables based on schema
db.exec(`
  CREATE TABLE IF NOT EXISTS gx_regulation_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_name TEXT NOT NULL,
    source_type TEXT,
    official_domain TEXT,
    country_region TEXT,
    discipline TEXT,
    list_page_urls_json TEXT,
    detail_rule_json TEXT,
    pdf_rule_json TEXT,
    update_frequency TEXT,
    enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_checked_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS gx_regulations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER,
    title TEXT NOT NULL,
    regulation_number TEXT,
    issuing_authority TEXT,
    country_region TEXT,
    discipline TEXT,
    publish_date TEXT,
    effective_date TEXT,
    expiry_date TEXT,
    status TEXT,
    language TEXT,
    detail_url TEXT,
    pdf_url TEXT,
    raw_text TEXT,
    clean_text TEXT,
    version_label TEXT,
    supersedes_regulation_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(source_id) REFERENCES gx_regulation_sources(id)
  );

  CREATE TABLE IF NOT EXISTS gx_regulation_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    regulation_id INTEGER,
    chapter_number TEXT,
    chapter_title TEXT,
    article_number TEXT,
    article_title TEXT,
    article_text TEXT,
    page_start INTEGER,
    page_end INTEGER,
    keywords_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(regulation_id) REFERENCES gx_regulations(id)
  );

  CREATE TABLE IF NOT EXISTS gx_collection_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER,
    task_type TEXT,
    task_status TEXT,
    items_found INTEGER DEFAULT 0,
    items_added INTEGER DEFAULT 0,
    items_updated INTEGER DEFAULT 0,
    error_message TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    finished_at DATETIME
  );
`);

// Seed initial source if empty
const sourceCount = db.prepare('SELECT count(*) as count FROM gx_regulation_sources').get() as { count: number };
if (sourceCount.count === 0) {
  db.prepare(`
    INSERT INTO gx_regulation_sources (source_name, source_type, official_domain, country_region, discipline, enabled)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('住房和城乡建设部', 'official_website', 'mohurd.gov.cn', '中国大陆', '综合', 1);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Regulation Sources API
  app.get("/api/regulation-sources", (req, res) => {
    const sources = db.prepare('SELECT * FROM gx_regulation_sources ORDER BY created_at DESC').all();
    res.json(sources);
  });

  app.post("/api/regulation-sources", (req, res) => {
    const { source_name, source_type, official_domain, country_region, discipline, update_frequency } = req.body;
    const result = db.prepare(`
      INSERT INTO gx_regulation_sources (source_name, source_type, official_domain, country_region, discipline, update_frequency)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(source_name, source_type, official_domain, country_region, discipline, update_frequency);
    res.json({ id: result.lastInsertRowid });
  });

  // Code Knowledge Base API
  app.get("/api/regulations", (req, res) => {
    const { q, discipline, country_region, status } = req.query;
    let sql = 'SELECT * FROM gx_regulations WHERE 1=1';
    const params: any[] = [];

    if (q) {
      sql += ' AND (title LIKE ? OR regulation_number LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }
    if (discipline) {
      sql += ' AND discipline = ?';
      params.push(discipline);
    }
    if (country_region) {
      sql += ' AND country_region = ?';
      params.push(country_region);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY publish_date DESC';
    const regulations = db.prepare(sql).all(...params);
    res.json(regulations);
  });

  app.get("/api/regulations/:id", (req, res) => {
    const regulation = db.prepare('SELECT * FROM gx_regulations WHERE id = ?').get(req.params.id);
    if (!regulation) return res.status(404).json({ error: 'Regulation not found' });
    
    const articles = db.prepare('SELECT * FROM gx_regulation_articles WHERE regulation_id = ? ORDER BY id ASC').all(req.params.id);
    res.json({ ...regulation, articles });
  });
  
  app.post("/api/regulations/import-ai", (req, res) => {
    const { title, regulation_number, issuing_authority, publish_date, effective_date, status, official_url, key_clauses } = req.body;
    
    try {
      const regId = db.prepare(`
        INSERT INTO gx_regulations (source_id, title, regulation_number, issuing_authority, publish_date, effective_date, status, detail_url, country_region, discipline)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(1, title, regulation_number, issuing_authority, publish_date, effective_date, status, official_url, '中国大陆', '综合').lastInsertRowid;

      if (key_clauses && Array.isArray(key_clauses)) {
        const insertArticle = db.prepare(`
          INSERT INTO gx_regulation_articles (regulation_id, article_text, article_number)
          VALUES (?, ?, ?)
        `);
        key_clauses.forEach((c, idx) => {
          insertArticle.run(regId, c, `AI Clause ${idx + 1}`);
        });
      }

      res.json({ success: true, id: regId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Collection Engine API
  app.get("/api/collection-logs", (req, res) => {
    const logs = db.prepare(`
      SELECT l.*, s.source_name 
      FROM gx_collection_logs l 
      JOIN gx_regulation_sources s ON l.source_id = s.id 
      ORDER BY started_at DESC LIMIT 50
    `).all();
    res.json(logs);
  });

  app.post("/api/regulation-collection/run", async (req, res) => {
    const { source_id, url } = req.body;
    if (!source_id && !url) return res.status(400).json({ error: "Source ID or URL is required" });

    const logId = db.prepare(`
      INSERT INTO gx_collection_logs (source_id, task_type, task_status)
      VALUES (?, ?, ?)
    `).run(source_id || 0, 'manual_sync', 'running').lastInsertRowid;

    try {
      const axios = (await import("axios")).default;
      const cheerio = await import("cheerio");
      const iconv = (await import("iconv-lite")).default;
      
      const targetUrl = url || (db.prepare('SELECT official_domain FROM gx_regulation_sources WHERE id = ?').get(source_id) as any)?.official_domain;
      
      if (!targetUrl) throw new Error("No URL found for collection");

      const response = await axios.get(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
        timeout: 15000,
        responseType: 'arraybuffer'
      });

      let contentType = response.headers['content-type'] || '';
      let charset = contentType.match(/charset=([^;]*)/i)?.[1] || 'utf-8';
      let html = iconv.decode(Buffer.from(response.data), charset);
      if (html.includes('charset=gbk') || html.includes('charset=gb2312')) {
        html = iconv.decode(Buffer.from(response.data), 'gbk');
      }

      const $ = cheerio.load(html);
      $('script, style, nav, footer, header, aside').remove();

      const title = $('title').text().trim() || "未命名法规文件";
      const clauses: string[] = [];
      
      $('p, li, div, tr, td').each((i, el) => {
        const text = $(el).text().trim().replace(/\s+/g, ' ');
        if (text.length > 15 && (
          /^\d+[\.\、\s]/.test(text) || 
          /^第[一二三四五六七八九十百]+[条|章|节]/.test(text) ||
          /^【/.test(text) ||
          /^[（(]\d+[）)]/.test(text)
        )) {
          clauses.push(text);
        }
      });

      // Structure and Save
      const regId = db.prepare(`
        INSERT INTO gx_regulations (source_id, title, status, detail_url, country_region, discipline)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(source_id || 1, title, '现行有效', targetUrl, '中国大陆', '综合').lastInsertRowid;

      const insertArticle = db.prepare(`
        INSERT INTO gx_regulation_articles (regulation_id, article_text, article_number)
        VALUES (?, ?, ?)
      `);

      clauses.forEach((c, idx) => {
        const numMatch = c.match(/^(\d+|第[一二三四五六七八九十百]+条)/);
        insertArticle.run(regId, c, numMatch ? numMatch[0] : `Clause ${idx + 1}`);
      });

      db.prepare(`
        UPDATE gx_collection_logs 
        SET task_status = 'success', items_found = ?, items_added = 1, finished_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(clauses.length, logId);

      res.json({ success: true, regulation_id: regId, clauses_count: clauses.length });
    } catch (error: any) {
      db.prepare(`
        UPDATE gx_collection_logs 
        SET task_status = 'failed', error_message = ?, finished_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(error.message, logId);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
