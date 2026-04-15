#!/usr/bin/env python3
from __future__ import annotations

import json
import mimetypes
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib import request, error

ROOT = Path(__file__).resolve().parent
HOST = '127.0.0.1'
PORT = 8787
CONFIG_PATH = ROOT / 'config.local.json'
ENDPOINT_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'


def load_config() -> dict:
    config = {}
    if CONFIG_PATH.exists():
        try:
            config = json.loads(CONFIG_PATH.read_text(encoding='utf-8'))
        except Exception:
            config = {}
    env_key = os.environ.get('GEMINI_API_KEY', '').strip()
    if env_key:
        config['geminiApiKey'] = env_key
    return config


def build_schema() -> dict:
    return {
        'type': 'object',
        'properties': {
            'project_name': {'type': 'string'},
            'scene_type': {'type': 'string'},
            'geo': {'type': 'string'},
            'obj': {'type': 'string'},
            'convert': {'type': 'string'},
            'ratio': {'type': 'string'},
            'style': {'type': 'string'},
            'location': {'type': 'string'},
            'time': {'type': 'string'},
            'envlight': {'type': 'string'},
            'volumetric': {'type': 'boolean'},
            'lights': {'type': 'array', 'items': {'type': 'string'}},
            'lightqual': {'type': 'string'},
            'camera': {'type': 'string'},
            'aperture': {'type': 'string'},
            'shutter': {'type': 'string'},
            'tech': {'type': 'array', 'items': {'type': 'string'}},
            'res': {'type': 'string'},
            'render': {'type': 'string'},
        },
        'required': []
    }


def build_prompt(payload: dict) -> str:
    return '\n'.join([
        '你是一个室内/建筑可视化提示词结构化助手。',
        '任务：根据用户自然语言需求，把输入映射为一个 JSON patch。',
        '规则：',
        '1. 只输出 JSON。',
        '2. 只能返回用户明确提到或高概率推断出的字段；不确定就省略。',
        '3. 优先沿用当前状态，不要无端覆盖。',
        '4. lights 和 tech 如有推荐，返回数组。',
        '5. 输出必须适合 SU 转真实摄影提示词工作流。',
        '',
        '当前状态：',
        json.dumps(payload.get('currentState', {}), ensure_ascii=False, indent=2),
        '',
        '允许的单选字段枚举：',
        json.dumps(payload.get('fieldOptions', {}), ensure_ascii=False, indent=2),
        '',
        '允许的多选字段枚举：',
        json.dumps(payload.get('multiOptions', {}), ensure_ascii=False, indent=2),
        '',
        '用户输入：',
        str(payload.get('input', '')),
    ])


def call_gemini(api_key: str, model: str, payload: dict) -> dict:
    url = f'{ENDPOINT_BASE}/{model}:generateContent'
    body = {
        'contents': [
            {
                'role': 'user',
                'parts': [{'text': build_prompt(payload)}]
            }
        ],
        'generationConfig': {
            'temperature': 0.2,
            'responseMimeType': 'application/json',
            'responseSchema': build_schema(),
        },
    }
    req = request.Request(
        url,
        data=json.dumps(body).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'x-goog-api-key': api_key,
        },
        method='POST',
    )
    try:
        with request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode('utf-8')
    except error.HTTPError as exc:
        detail = exc.read().decode('utf-8', errors='ignore')
        raise RuntimeError(f'Gemini HTTPError {exc.code}: {detail}')
    except Exception as exc:
        raise RuntimeError(f'Gemini 请求失败: {exc}')

    data = json.loads(raw)
    text = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text')
    if not text:
        raise RuntimeError('Gemini 未返回可解析内容')
    try:
        patch = json.loads(text)
    except Exception as exc:
        raise RuntimeError(f'Gemini 返回 JSON 无法解析: {exc}')
    return {'patch': patch}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ('/', '/index.html'):
            return self.serve_file(ROOT / 'index.html')
        path = (ROOT / self.path.lstrip('/')).resolve()
        if not str(path).startswith(str(ROOT)) or not path.exists() or path.is_dir():
            self.send_json({'error': 'Not Found'}, 404)
            return
        self.serve_file(path)

    def do_POST(self):
        if self.path != '/api/gemini':
            self.send_json({'error': 'Not Found'}, 404)
            return
        length = int(self.headers.get('Content-Length', '0') or '0')
        raw = self.rfile.read(length).decode('utf-8') if length else '{}'
        try:
            payload = json.loads(raw)
        except Exception:
            self.send_json({'error': '无效 JSON'}, 400)
            return

        config = load_config()
        api_key = str(config.get('geminiApiKey', '')).strip()
        if not api_key:
            self.send_json({'error': '未配置 Gemini API Key。请在 config.local.json 中填写 geminiApiKey，或启动前设置 GEMINI_API_KEY 环境变量。'}, 500)
            return

        model = str(payload.get('model', 'gemini-2.5-flash')).strip() or 'gemini-2.5-flash'
        try:
            result = call_gemini(api_key, model, payload)
            self.send_json(result, 200)
        except Exception as exc:
            self.send_json({'error': str(exc)}, 502)

    def serve_file(self, path: Path):
        ctype, _ = mimetypes.guess_type(str(path))
        if path.suffix == '.js':
            ctype = 'application/javascript; charset=utf-8'
        elif path.suffix == '.css':
            ctype = 'text/css; charset=utf-8'
        elif path.suffix == '.html':
            ctype = 'text/html; charset=utf-8'
        elif path.suffix == '.json':
            ctype = 'application/json; charset=utf-8'
        self.send_response(200)
        self.send_header('Content-Type', ctype or 'application/octet-stream')
        self.end_headers()
        self.wfile.write(path.read_bytes())

    def send_json(self, data: dict, status: int = 200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args):
        return


if __name__ == '__main__':
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f'Local proxy server started at http://{HOST}:{PORT}')
    print('Gemini key source: config.local.json or GEMINI_API_KEY env')
    server.serve_forever()
