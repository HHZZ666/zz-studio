import { defaultState, fieldOptions, multiOptions } from './schema.js';
import { presets } from './presets.js';
import { buildJSON, buildPrompt, buildIndoorLightDesc, buildNegativePrompt } from './builder.js';
import { runRuleAgent } from './rules-agent.js';
import { runGeminiAgent, runGeminiRenderImage, runGeminiToneExpand, runGeminiKeyTest } from './gemini-agent.js';

const STORAGE_KEY = 'su-light-agent-state-v7';
const GEMINI_KEY_STORAGE = 'su-light-agent-gemini-key';
const GEMINI_MODEL_STORAGE = 'su-light-agent-gemini-model';
const RENDER_MODEL_STORAGE = 'su-light-agent-render-model';

const BLOCKBUSTER_PATCH = {
  lightqual: '电影级布光，柔和漫反射，真实阴影层次，高动态光影对比。',
  volumetric: true,
  res: '超高分辨率（8K）',
  aperture: 'f/8',
  shutter: '1s',
  render: '写实室内摄影，质感通透，细节丰富，电影级后期调色。',
  tech: [
    '高动态范围（HDR）拍摄，包围曝光，确保暗部不失真、亮部不过曝。',
    '移轴镜头拍摄，校正透视畸变，保证垂直线条平行。'
  ],
  lights: ['天花灯带', '天花射灯', '墙面壁灯', '落地灯', '柜底灯带'],
  sun_mode: '专业参数模式（方位角）',
  sun_orientation: '西南',
  sun_azimuth: '225°（西南向）',
  sun_altitude: '低角度 10°-20°'
};

let state = loadState();
let activePreset = '';
let isBusy = false;
let sceneImageData = null;
let whiteModelImage = null;
let styleRefImage = null;
let currentMode = 'analyze';
let loadingGuardTimer = null;


const TONE_LEXICON = {
  '高级': ['高级克制，低饱和中性材质，柔和侧光与层次阴影，整体沉稳精致', '高端冷静，金属与石材微反射，光比克制，空间秩序清晰'],
  '温暖': ['温暖松弛，木质与织物占比提升，偏暖色温，阴影柔和不过黑', '暖调亲和，漫反射主导，低对比高包裹感，生活气息明显'],
  '戏剧': ['艺术戏剧化，定向主光+深阴影，明暗反差明显，重点界面被强调', '电影张力，低角度切光与局部高光，气氛浓郁但细节保留'],
  '商务': ['商务专业，色彩中性偏冷，材质干净，照度均匀并保持识别效率', '品牌展示感，主次照明清晰，界面信息明确，空间气质稳重']
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...structuredClone(defaultState), ...BLOCKBUSTER_PATCH, project_name: 'LumiScene 可视化方案' };
    return { ...structuredClone(defaultState), ...BLOCKBUSTER_PATCH, ...JSON.parse(raw) };
  } catch {
    return { ...structuredClone(defaultState), ...BLOCKBUSTER_PATCH, project_name: 'LumiScene 可视化方案' };
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function sanitizePatch(patch) {
  const next = { ...patch };
  for (const [key, value] of Object.entries(next)) if (value === undefined || value === null) delete next[key];

  if (Array.isArray(next.lights)) next.lights = next.lights.filter(v => multiOptions.lights.includes(v));
  if (Array.isArray(next.tech)) next.tech = next.tech.filter(v => multiOptions.tech.includes(v));

  // 调性字段：允许自定义文本，不要被枚举误删
  if ('tone_atmosphere' in next && !fieldOptions.tone_atmosphere.includes(next.tone_atmosphere)) {
    if (!next.tone_custom) next.tone_custom = String(next.tone_atmosphere);
    next.tone_atmosphere = '自定义（由用户输入）';
  }

  for (const [key, options] of Object.entries(fieldOptions)) {
    if (key in next && !options.includes(next[key])) delete next[key];
  }

  return next;
}

function ensureBlockbusterName(nextState) {
  const name = String(nextState.project_name || '').trim();
  if (!name) return 'LumiScene 可视化方案';
  if (name.includes('LumiScene')) return name;
  return `${name}`;
}

function applyBlockbusterMode(patch = {}) {
  const merged = { ...patch, ...BLOCKBUSTER_PATCH };
  merged.project_name = ensureBlockbusterName({ ...state, ...patch });
  return merged;
}

function setState(patch) {
  const blockbusterPatch = applyBlockbusterMode(sanitizePatch(patch));
  state = { ...state, ...sanitizePatch(blockbusterPatch) };
  persistState();
  syncUI();
  renderOutputs();
}

function initSelect(id, options) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = options.map(v => `<option value="${escapeAttr(String(v))}">${String(v)}</option>`).join('');
  el.addEventListener('change', () => {
    const value = id === 'volumetric' ? el.value === 'true' : el.value;
    setState({ [id]: value });
  });
}

function initTextInput(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', () => {
    if (id === 'project_name') {
      setState({ [id]: ensureBlockbusterName({ project_name: el.value }) });
      return;
    }
    if (id === 'tone_custom') {
      setState({ tone_atmosphere: '自定义（由用户输入）', tone_custom: el.value });
      return;
    }
    setState({ [id]: el.value });
  });
}

function initChipGroup(id, values) {
  const container = document.getElementById(id);
  if (!container) return;
  container.innerHTML = values.map(v => `<button type="button" class="chip" data-value="${escapeAttr(v)}">${v}</button>`).join('');
  container.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const value = chip.dataset.value;
    const current = new Set(state[id]);
    current.has(value) ? current.delete(value) : current.add(value);
    setState({ [id]: [...current] });
  });
}

function initPresets() {
  const wrap = document.getElementById('presetButtons');
  wrap.innerHTML = Object.keys(presets).map(key => `<button type="button" class="btn ghost preset-btn" data-key="${key}">${key}</button>`).join('');
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.preset-btn');
    if (!btn) return;
    const key = btn.dataset.key;
    activePreset = key;
    setState({ ...structuredClone(defaultState), ...presets[key] });
    setStatus(`已应用预设：${key}`);
  });
}

function initApiSettingsModal() {
  const modal = document.getElementById('apiSettingsModal');
  const openers = [
    document.getElementById('openApiSettingsBtn'),
    document.getElementById('openApiSettingsInlineBtn')
  ].filter(Boolean);
  const closer = document.getElementById('closeApiSettingsBtn');
  const backdrop = document.getElementById('closeApiSettingsBackdrop');
  if (!modal || !openers.length) return;

  const open = () => {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  };
  const close = () => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  };

  openers.forEach(btn => btn.addEventListener('click', open));
  closer?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

function initGeminiSettings() {
  const keyInput = document.getElementById('geminiApiKey');
  const modelInput = document.getElementById('geminiModel');
  const renderModelInput = document.getElementById('renderModel');
  keyInput.value = localStorage.getItem(GEMINI_KEY_STORAGE) || '';
  modelInput.value = localStorage.getItem(GEMINI_MODEL_STORAGE) || 'gemini-2.5-flash';
  renderModelInput.value = localStorage.getItem(RENDER_MODEL_STORAGE) || 'gemini-2.5-flash-image';
  keyInput.addEventListener('change', () => localStorage.setItem(GEMINI_KEY_STORAGE, keyInput.value.trim()));
  modelInput.addEventListener('change', () => localStorage.setItem(GEMINI_MODEL_STORAGE, modelInput.value));
  renderModelInput.addEventListener('change', () => localStorage.setItem(RENDER_MODEL_STORAGE, renderModelInput.value));
}

function updateSunControls() {
  const mode = state.sun_mode;
  const orientField = document.getElementById('sun_orientation')?.closest('.field');
  const azField = document.getElementById('sun_azimuth')?.closest('.field');
  if (!orientField || !azField) return;
  const pro = mode === '专业参数模式（方位角）';
  orientField.style.opacity = pro ? '0.45' : '1';
  azField.style.opacity = pro ? '1' : '0.45';
  document.getElementById('sun_orientation').disabled = pro;
  document.getElementById('sun_azimuth').disabled = !pro;
}

function updateToneControls() {
  const toneSelect = document.getElementById('tone_atmosphere');
  const toneCustom = document.getElementById('tone_custom');
  const toneExpanded = document.getElementById('tone_expanded');
  if (!toneSelect || !toneCustom || !toneExpanded) return;

  const isCustom = state.tone_atmosphere === '自定义（由用户输入）';
  toneCustom.disabled = !isCustom;
  toneCustom.style.opacity = isCustom ? '1' : '0.55';
  toneExpanded.value = state.tone_expanded || '';
  renderToneSuggestions();
}

function syncUI() {
  const project = document.getElementById('project_name');
  if (project) project.value = state.project_name;

  for (const key of Object.keys(fieldOptions)) {
    const el = document.getElementById(key);
    if (el) el.value = String(state[key]);
  }

  const toneCustom = document.getElementById('tone_custom');
  if (toneCustom) toneCustom.value = state.tone_custom || '';

  for (const id of Object.keys(multiOptions)) {
    const selected = new Set(state[id]);
    document.querySelectorAll(`#${id} .chip`).forEach(chip => chip.classList.toggle('active', selected.has(chip.dataset.value)));
  }

  updateSunControls();
  updateToneControls();
  document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.key === activePreset));
}

function renderOutputs() {
  document.getElementById('jsonPreview').textContent = JSON.stringify(buildJSON(state), null, 2);
  document.getElementById('promptPreview').textContent = buildPrompt(state);
  document.getElementById('negativePromptPreview').textContent = buildNegativePrompt(state);
  document.getElementById('summaryStyle').textContent = `${state.asset_type} / ${state.business_type} · ${state.tone_atmosphere === '自定义（由用户输入）' ? (state.tone_custom || '自定义') : state.tone_atmosphere}`;
  document.getElementById('summaryLight').textContent = buildIndoorLightDesc(state);
  document.getElementById('summaryCamera').textContent = `${state.camera} / ${state.aperture} / ${state.shutter}`;
}

function setStatus(text, isError = false) {
  const el = document.getElementById('statusText');
  el.textContent = `状态：${text}`;
  el.style.color = isError ? '#ff9a9a' : '#dbe7f8';
}

function setBusy(flag) {
  isBusy = flag;
  document.body.classList.toggle('is-loading', flag);

  if (flag) {
    if (loadingGuardTimer) clearTimeout(loadingGuardTimer);
    loadingGuardTimer = setTimeout(() => {
      isBusy = false;
      document.body.classList.remove('is-loading');
      console.warn('[loading-guard] auto unlock triggered');
      setStatus('检测到长时间等待，已自动解除交互锁。', true);
    }, 15000);
  } else if (loadingGuardTimer) {
    clearTimeout(loadingGuardTimer);
    loadingGuardTimer = null;
  }
}

function handleRuleRecommend() {
  const input = document.getElementById('agentInput').value;
  const { patch, matchedRules } = runRuleAgent(input, state);
  setState(patch);
  setStatus(matchedRules.length
    ? `规则推荐完成，命中 ${matchedRules.length} 条规则。`
    : '未命中规则，已按默认参数生成。');
}

async function runGeminiFill({ requireSceneImage = false } = {}) {
  if (isBusy) return;
  const input = document.getElementById('agentInput').value.trim();
  const apiKey = document.getElementById('geminiApiKey').value.trim();
  const model = document.getElementById('geminiModel').value;
  if (requireSceneImage && !sceneImageData?.base64) {
    setStatus('请先上传 SU 截图。', true);
    return;
  }

  try {
    setBusy(true);
    setStatus(requireSceneImage ? 'Gemini 正在分析截图并回填...' : 'Gemini 正在填表...');
    const images = requireSceneImage ? [sceneImageData] : (sceneImageData ? [sceneImageData] : []);
    const { patch } = await runGeminiAgent({
      apiKey,
      model,
      input,
      currentState: state,
      fieldOptions,
      multiOptions,
      images
    });
    const safePatch = sanitizePatch(patch);
    setState(safePatch);
    setStatus(`Gemini 填充完成，更新 ${Object.keys(safePatch).length} 个字段。`);
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'Gemini 调用失败', true);
  } finally {
    setBusy(false);
  }
}

function renderResultCards(images, note = '') {
  const container = document.getElementById('renderResults');
  container.innerHTML = '';
  images.forEach((src, idx) => {
    const card = document.createElement('div');
    card.className = 'render-card';
    const img = document.createElement('img');
    img.src = src;
    img.alt = `render-${idx + 1}`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = note ? `结果 ${idx + 1} · ${note}` : `结果 ${idx + 1}`;
    const dl = document.createElement('a');
    dl.href = src;
    dl.download = `su-render-${Date.now()}-${idx + 1}.png`;
    dl.className = 'btn ghost sm';
    dl.textContent = '下载';
    dl.style.marginTop = '8px';
    dl.style.display = 'inline-block';
    card.appendChild(img);
    card.appendChild(meta);
    card.appendChild(dl);
    container.appendChild(card);
  });
}

async function handleRenderImage() {
  if (isBusy) return;
  const apiKey = document.getElementById('geminiApiKey').value.trim();
  const model = document.getElementById('renderModel').value;
  const userIntent = document.getElementById('agentInput').value.trim();

  try {
    setBusy(true);
    setStatus('Gemini 正在执行：白模 + 参考图 出图...');

    const statePrompt = buildPrompt(state);
    const negativePrompt = buildNegativePrompt(state);

    const { images, text } = await runGeminiRenderImage({
      apiKey,
      model,
      whiteModelImage,
      styleRefImage,
      statePrompt,
      negativePrompt,
      userIntent
    });

    renderResultCards(images, '渲染结果');
    setStatus(images.length
      ? `出图完成：${images.length} 张。${text ? '附加说明已返回。' : ''}`
      : '出图完成。');
  } catch (error) {
    console.error(error);
    setStatus(error.message || '出图失败', true);
  } finally {
    setBusy(false);
  }
}

function readImageAsData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const [, base64 = ''] = result.split(',');
      resolve({
        name: file.name,
        mimeType: file.type || 'image/png',
        base64,
        previewUrl: result
      });
    };
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(file);
  });
}

async function bindImageInput(inputId, previewId, metaId, setter) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const meta = document.getElementById(metaId);
  if (!input || !preview || !meta) {
    console.warn('[bindImageInput] element missing:', inputId, previewId, metaId);
    return;
  }
  input.addEventListener('change', async (evt) => {
    const file = evt.target.files?.[0];
    if (!file) {
      setter(null);
      meta.textContent = '未选择图片';
      preview.classList.add('hidden');
      preview.removeAttribute('src');
      return;
    }
    try {
      const data = await readImageAsData(file);
      setter(data);
      meta.textContent = `已加载：${data.name}（${Math.round(file.size / 1024)} KB）`;
      preview.src = data.previewUrl;
      preview.classList.remove('hidden');
    } catch (e) {
      setter(null);
      meta.textContent = '图片读取失败';
      preview.classList.add('hidden');
      preview.removeAttribute('src');
      setStatus(e.message || '图片读取失败', true);
    }
  });
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => setStatus('复制成功。')).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    setStatus('复制成功。');
  });
}

function resetAll() {
  activePreset = '';
  sceneImageData = null;
  whiteModelImage = null;
  styleRefImage = null;

  ['sceneImageInput', 'whiteModelInput', 'styleRefInput'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  [
    ['imageMeta', '未选择图片'],
    ['whiteModelMeta', '未选择白模图'],
    ['styleRefMeta', '未选择参考图']
  ].forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  });
  ['imagePreview', 'whiteModelPreview', 'styleRefPreview'].forEach(id => {
    const img = document.getElementById(id);
    if (img) {
      img.classList.add('hidden');
      img.removeAttribute('src');
    }
  });
  document.getElementById('renderResults').innerHTML = '';

  setState({ ...structuredClone(defaultState) });
  setStatus('已重置。');
}

function saveSnapshot() {
  const name = window.prompt('给当前方案起个名字：', state.project_name || '我的方案');
  if (!name) return;
  localStorage.setItem(`su-light-agent-snapshot:${name}`, JSON.stringify(state));
  setStatus(`已保存：${name}`);
}

function escapeAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}


function buildToneSuggestions(text) {
  const q = String(text || '').trim();
  if (!q) return [];
  const hits = [];
  for (const [k, vals] of Object.entries(TONE_LEXICON)) {
    if (q.includes(k)) hits.push(...vals);
  }
  if (!hits.length) {
    return [
      `${q}，材质层次清晰，光色统一，对比适中，整体情绪稳定。`,
      `${q}，重点界面强化，非重点区域收敛，保证观感与功能兼顾。`
    ];
  }
  return [...new Set(hits)].slice(0, 4);
}

function renderToneSuggestions() {
  const box = document.getElementById('toneSuggestions');
  if (!box) return;
  const q = state.tone_custom || '';
  const suggestions = buildToneSuggestions(q);
  box.innerHTML = '';
  suggestions.forEach(s => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tone-suggestion-chip';
    btn.textContent = s;
    btn.addEventListener('click', () => {
      setState({ tone_atmosphere: '自定义（由用户输入）', tone_expanded: s });
      setStatus('已应用调性补全建议。');
    });
    box.appendChild(btn);
  });
}

async function handleToneAiExpand() {
  const apiKey = document.getElementById('geminiApiKey').value.trim();
  const model = document.getElementById('geminiModel').value;
  if (!state.tone_custom?.trim()) {
    setStatus('请先输入自定义调性。', true);
    return;
  }
  try {
    setBusy(true);
    setStatus('Gemini 正在扩展调性描述...');
    const text = await runGeminiToneExpand({
      apiKey,
      model,
      toneCustom: state.tone_custom,
      assetType: state.asset_type,
      businessType: state.business_type,
      functionGoal: state.function_goal
    });
    setState({ tone_atmosphere: '自定义（由用户输入）', tone_expanded: text });
    setStatus('AI 调性扩展完成。');
  } catch (e) {
    setStatus(e.message || 'AI 调性扩展失败', true);
  } finally {
    setBusy(false);
  }
}



function runUiSelfTest() {
  const report = [];
  try {
    const modeA = document.getElementById('modeAnalyzeBtn');
    const modeB = document.getElementById('modeRenderBtn');
    const analyzePanel = document.querySelector('[data-mode-panel="analyze"]');
    const renderPanel = document.querySelector('[data-mode-panel="render"]');
    const renderBtn = document.getElementById('renderImageBtn');
    const whiteInput = document.getElementById('whiteModelInput');
    const refInput = document.getElementById('styleRefInput');

    report.push(['modeA button', !!modeA]);
    report.push(['modeB button', !!modeB]);
    report.push(['analyze panel', !!analyzePanel]);
    report.push(['render panel', !!renderPanel]);
    report.push(['render button', !!renderBtn]);
    report.push(['whiteModel input', !!whiteInput]);
    report.push(['styleRef input', !!refInput]);

    if (modeB) modeB.click();
    const bVisible = !!renderPanel && !renderPanel.classList.contains('hidden');
    report.push(['modeB click -> render visible', bVisible]);

    if (modeA) modeA.click();
    const aVisible = !!analyzePanel && !analyzePanel.classList.contains('hidden');
    report.push(['modeA click -> analyze visible', aVisible]);

    const failed = report.filter(([, ok]) => !ok);
    if (failed.length) {
      console.error('[UI SELF TEST FAIL]', failed, report);
      setStatus('UI自检失败，请打开控制台查看 [UI SELF TEST FAIL]。', true);
      return false;
    }

    console.info('[UI SELF TEST PASS]', report);
    return true;
  } catch (e) {
    console.error('[UI SELF TEST ERROR]', e);
    setStatus(`UI自检异常：${e.message || e}`, true);
    return false;
  }
}

function setMode(mode) {
  currentMode = mode;
  const isAnalyze = mode === 'analyze';

  document.querySelectorAll('.mode-panel').forEach(panel => {
    const show = panel.dataset.modePanel === mode;
    panel.classList.toggle('hidden', !show);
  });

  document.querySelectorAll('.output-panel').forEach(panel => {
    const relatedMode = panel.dataset.outputMode || 'analyze';
    panel.classList.toggle('hidden', relatedMode !== mode);
  });

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  setStatus(isAnalyze
    ? '已切换到 模式A：SU截图分析填表（摘要/JSON/Prompt/Negative 已展开）'
    : '已切换到 模式B：白模+参考图渲染出图（无关输出已折叠）');
}

function initModeSwitch() {
  const analyzeBtn = document.getElementById('modeAnalyzeBtn');
  const renderBtn = document.getElementById('modeRenderBtn');
  analyzeBtn?.addEventListener('click', () => setMode('analyze'));
  renderBtn?.addEventListener('click', () => setMode('render'));

  // fallback: delegated click, 防止局部绑定失效
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.mode-btn');
    if (!btn) return;
    const mode = btn.dataset.mode;
    if (mode === 'analyze' || mode === 'render') setMode(mode);
  });

  setMode('analyze');
}


async function handleApiKeyTest() {
  const apiKey = document.getElementById('geminiApiKey')?.value?.trim();
  const model = document.getElementById('geminiModel')?.value || 'gemini-2.5-flash';
  const resultEl = document.getElementById('apiTestResult');
  if (resultEl) {
    resultEl.className = 'subtle pending';
    resultEl.textContent = '测试中...';
  }

  try {
    await runGeminiKeyTest({ apiKey, model });
    if (resultEl) {
      resultEl.className = 'subtle ok';
      resultEl.textContent = '连接成功';
    }
    setStatus('Gemini API 连接成功。');
  } catch (e) {
    if (resultEl) {
      resultEl.className = 'subtle fail';
      resultEl.textContent = '连接失败';
    }
    setStatus(e.message || 'API 连接失败', true);
  }
}

function bindActions() {
  const recommendBtn = document.getElementById('recommendBtn');
  const geminiFillBtn = document.getElementById('geminiFillBtn');
  const analyzeImageBtn = document.getElementById('analyzeImageBtn');
  const renderImageBtn = document.getElementById('renderImageBtn');

  if (!recommendBtn || !geminiFillBtn || !analyzeImageBtn || !renderImageBtn) {
    throw new Error('核心按钮缺失，页面结构与脚本不一致');
  }

  recommendBtn.addEventListener('click', handleRuleRecommend);
  geminiFillBtn.addEventListener('click', () => runGeminiFill({ requireSceneImage: false }));
  analyzeImageBtn.addEventListener('click', () => runGeminiFill({ requireSceneImage: true }));
  renderImageBtn.addEventListener('click', handleRenderImage);

  document.getElementById('clearAgentBtn').addEventListener('click', () => {
    document.getElementById('agentInput').value = '';
    setStatus('已清空输入。');
  });

  document.getElementById('toneSuggestBtn')?.addEventListener('click', () => {
    const suggestions = buildToneSuggestions(state.tone_custom || '');
    if (!suggestions.length) {
      setStatus('请输入自定义调性后再补全。', true);
      return;
    }
    setState({ tone_atmosphere: '自定义（由用户输入）', tone_expanded: suggestions[0] });
    setStatus('已应用词库补全。');
  });
  document.getElementById('toneAiExpandBtn')?.addEventListener('click', handleToneAiExpand);

  document.getElementById('copyJsonBtn').addEventListener('click', () => copyText(JSON.stringify(buildJSON(state), null, 2)));
  document.getElementById('copyPromptBtn').addEventListener('click', () => copyText(buildPrompt(state)));
  document.getElementById('copyNegativeBtn').addEventListener('click', () => copyText(buildNegativePrompt(state)));

  document.getElementById('resetBtn').addEventListener('click', resetAll);
  document.getElementById('tone_atmosphere')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val !== '自定义（由用户输入）') {
      setState({ tone_atmosphere: val, tone_custom: '', tone_expanded: '' });
    } else {
      setState({ tone_atmosphere: val });
    }
  });
  document.getElementById('testApiBtn')?.addEventListener('click', handleApiKeyTest);
  document.getElementById('savePresetBtn').addEventListener('click', saveSnapshot);
}

async function boot() {
  try {
    initTextInput('project_name');
    initTextInput('tone_custom');
    Object.entries(fieldOptions).forEach(([id, options]) => initSelect(id, options));
    initChipGroup('lights', multiOptions.lights);
    initChipGroup('tech', multiOptions.tech);
    initPresets();
    initGeminiSettings();
    initApiSettingsModal();
    initModeSwitch();

    await bindImageInput('sceneImageInput', 'imagePreview', 'imageMeta', v => { sceneImageData = v; });
    await bindImageInput('whiteModelInput', 'whiteModelPreview', 'whiteModelMeta', v => { whiteModelImage = v; });
    await bindImageInput('styleRefInput', 'styleRefPreview', 'styleRefMeta', v => { styleRefImage = v; });

    bindActions();
    syncUI();
    renderOutputs();
    setStatus('就绪：支持白模图+参考图出图。');
  } catch (err) {
    console.error('[boot failed]', err);
    const status = document.getElementById('statusText');
    if (status) status.textContent = `状态：初始化失败 - ${err.message || err}`;
    alert(`页面初始化失败：${err.message || err}\n请刷新后重试。`);
  }
}

boot();

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    isBusy = false;
    document.body.classList.remove('is-loading');
    setStatus('已手动解除交互锁。');
  }
});
