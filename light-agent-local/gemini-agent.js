const ENDPOINT_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const REQUEST_TIMEOUT_MS = 15000;

function buildModelUrl(model, apiKey) {
  return `${ENDPOINT_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`请求超时（>${Math.round(timeoutMs / 1000)}秒），请检查网络、代理或模型可用性`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function buildSchema() {
  return {
    type: 'object',
    properties: {
      project_name: { type: 'string' },
      scene_type: { type: 'string' },
      asset_type: { type: 'string' },
      business_type: { type: 'string' },
      tone_atmosphere: { type: 'string' },
      tone_custom: { type: 'string' },
      tone_expanded: { type: 'string' },
      function_goal: { type: 'string' },
      style: { type: 'string' },
      geo: { type: 'string' },
      obj: { type: 'string' },
      convert: { type: 'string' },
      ratio: { type: 'string' },
      location: { type: 'string' },
      time: { type: 'string' },
      envlight: { type: 'string' },
      sun_mode: { type: 'string' },
      sun_orientation: { type: 'string' },
      sun_azimuth: { type: 'string' },
      sun_altitude: { type: 'string' },
      volumetric: { type: 'boolean' },
      lights: { type: 'array', items: { type: 'string' } },
      lightqual: { type: 'string' },
      camera: { type: 'string' },
      aperture: { type: 'string' },
      shutter: { type: 'string' },
      tech: { type: 'array', items: { type: 'string' } },
      res: { type: 'string' },
      render: { type: 'string' }
    },
    required: []
  };
}

function buildInputParts({ prompt, images = [] }) {
  const parts = [{ text: prompt }];
  for (const img of images) {
    if (!img || !img.base64 || !img.mimeType) continue;
    parts.push({
      inline_data: {
        mime_type: img.mimeType,
        data: img.base64
      }
    });
  }
  return parts;
}

function buildStructPrompt({ input, currentState, fieldOptions, multiOptions, hasImage }) {
  return [
    '你是室内/建筑可视化提示词结构化助手。',
    '任务：根据文本与截图输出 JSON patch。',
    '要求：仅输出 JSON；不确定字段可省略；需要给出太阳光方向（朝向或方位角模式）。',
    '如果用户输入了自定义调性，请将 tone_atmosphere 设为“自定义（由用户输入）”，并在 tone_custom 保留原文，在 tone_expanded 输出你的专业扩展描述（材质、光色、对比、情绪）。',
    hasImage ? '输入包含截图，请先判断空间类型、时间、太阳方向、材质与灯光。' : '输入不含截图，仅根据文本推断。',
    '',
    '当前状态：', JSON.stringify(currentState, null, 2),
    '',
    '单选字段：', JSON.stringify(fieldOptions, null, 2),
    '',
    '多选字段：', JSON.stringify(multiOptions, null, 2),
    '',
    '用户输入：', input || '请给出专业可视化建议'
  ].join('\n');
}

function firstTextPart(data) {
  const parts = ((((data || {}).candidates || [])[0] || {}).content || {}).parts || [];
  for (const p of parts) {
    if (p && typeof p.text === 'string' && p.text.trim()) return p.text.trim();
  }
  return '';
}

export async function runGeminiAgent({ apiKey, model, input, currentState, fieldOptions, multiOptions, images = [] }) {
  if (!apiKey) throw new Error('缺少 Gemini API Key');
  if ((!input || !input.trim()) && images.length === 0) throw new Error('请输入需求或上传截图');

  const url = buildModelUrl(model, apiKey);
  const body = {
    contents: [{
      role: 'user',
      parts: buildInputParts({
        prompt: buildStructPrompt({ input, currentState, fieldOptions, multiOptions, hasImage: images.length > 0 }),
        images
      })
    }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: buildSchema()
    }
  };

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error(`Gemini 请求失败：${response.status} ${await response.text()}`);
  const data = await response.json();
  const text = firstTextPart(data);
  if (!text) throw new Error('Gemini 未返回可解析内容');

  let patch;
  try {
    patch = JSON.parse(text);
  } catch {
    throw new Error('Gemini 返回 JSON 无法解析');
  }
  return { patch, raw: data };
}

export async function runGeminiToneExpand({ apiKey, model, toneCustom, assetType, businessType, functionGoal }) {
  if (!apiKey) throw new Error('缺少 Gemini API Key');
  if (!toneCustom || !toneCustom.trim()) throw new Error('请先输入自定义调性');

  const url = buildModelUrl(model, apiKey);
  const prompt = [
    '你是空间视觉总监。',
    '请将用户提供的“调性短语”扩展为一条专业可执行描述。',
    '输出要求：中文一句话，不超过60字，包含材质倾向、光色倾向、对比与情绪，不要分点。',
    `业态属性：${assetType || ''}`,
    `具体业态：${businessType || ''}`,
    `功能目标：${functionGoal || ''}`,
    `用户调性：${toneCustom}`
  ].join('\n');

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.5 }
  };

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error(`Gemini 调性扩展失败：${response.status} ${await response.text()}`);
  const data = await response.json();
  const text = firstTextPart(data);
  if (!text) throw new Error('Gemini 未返回调性扩展文本');
  return text.replace(/\n+/g, ' ').trim();
}

function buildRenderPrompt({ statePrompt, negativePrompt, userIntent }) {
  return [
    '你是建筑可视化导演，请执行白模渲染出图。',
    '输入图1 = SU白模图（必须保持几何和构图）',
    '输入图2 = 风格参考图（提取材质、灯光、色调）',
    '输出目标：高质量写实摄影风格，避免CG感。',
    '',
    '结构化正向要求：',
    statePrompt,
    '',
    '负面要求：',
    negativePrompt,
    '',
    '用户补充要求：',
    userIntent || '无',
    '',
    '请直接返回一张最终渲染图。'
  ].join('\n');
}

function extractInlineImages(responseData) {
  const parts = ((((responseData || {}).candidates || [])[0] || {}).content || {}).parts || [];
  const images = [];
  for (const p of parts) {
    const inline = p && (p.inline_data || p.inlineData);
    if (inline && inline.data) {
      const mime = inline.mime_type || inline.mimeType || 'image/png';
      images.push(`data:${mime};base64,${inline.data}`);
    }
  }
  return images;
}

export async function runGeminiRenderImage({ apiKey, model, whiteModelImage, styleRefImage, statePrompt, negativePrompt, userIntent }) {
  if (!apiKey) throw new Error('缺少 Gemini API Key');
  if (!whiteModelImage || !whiteModelImage.base64) throw new Error('请上传 SU白模图');
  if (!styleRefImage || !styleRefImage.base64) throw new Error('请上传 风格参考图');

  const url = buildModelUrl(model, apiKey);
  const body = {
    contents: [{
      role: 'user',
      parts: buildInputParts({
        prompt: buildRenderPrompt({ statePrompt, negativePrompt, userIntent }),
        images: [whiteModelImage, styleRefImage]
      })
    }],
    generationConfig: {
      temperature: 0.6,
      responseModalities: ['TEXT', 'IMAGE']
    }
  };

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error(`Gemini 出图失败：${response.status} ${await response.text()}`);
  const data = await response.json();
  const images = extractInlineImages(data);
  const text = firstTextPart(data);
  if (!images.length) throw new Error('Gemini 未返回图片，请尝试切换出图模型或重试');
  return { images, text, raw: data };
}

export async function runGeminiKeyTest({ apiKey, model }) {
  if (!apiKey) throw new Error('缺少 Gemini API Key');
  const url = buildModelUrl(model, apiKey);
  const body = {
    contents: [{ role: 'user', parts: [{ text: 'Reply with OK only.' }] }],
    generationConfig: { temperature: 0, maxOutputTokens: 8 }
  };

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`连接失败：${response.status} ${msg}`);
  }

  const data = await response.json();
  const text = firstTextPart(data);
  return { ok: true, text: text || 'OK' };
}
