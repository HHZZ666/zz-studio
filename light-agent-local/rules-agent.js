const rules = [
  { pattern: /(法式|法式电影感)/, patch: { style: '法式古典室内设计', location: '法国巴黎', time: '黄金时刻日落前一小时', envlight: '黄金时刻暖色调斜射阳光，长影，浓郁氛围感。', camera: '徕卡 M11（Leica M11）', render: '暖调奶油色系，柔和质感，温馨氛围。' } },
  { pattern: /(现代|极简)/, patch: { style: '现代室内设计' } },
  { pattern: /(北欧)/, patch: { style: '北欧极简室内设计', location: '北欧斯堪的纳维亚', envlight: '柔和漫射的阴天散射光，无明显阴影，细节均匀。', render: '北欧白净风格，高亮度，低饱和，纯净通透。' } },
  { pattern: /(工业)/, patch: { style: '工业风室内设计', scene_type: '商业空间', time: '夜晚21点', envlight: '夜晚纯人工照明，无自然光介入。', lightqual: '商业摄影布光，高对比，强调产品质感。', render: '高对比强饱和，杂志级商业效果图风格。' } },
  { pattern: /(新中式|中式)/, patch: { style: '新中式室内设计', location: '中国北京' } },
  { pattern: /(奶油风)/, patch: { style: '奶油风室内设计', render: '暖调奶油色系，柔和质感，温馨氛围。' } },
  { pattern: /(侘寂)/, patch: { style: '侘寂风室内设计（Wabi-Sabi）', render: '真实住宅摄影感，避免过度CG效果。' } },
  { pattern: /(客厅|卧室|餐厅|住宅)/, patch: { scene_type: '室内空间' } },
  { pattern: /(办公)/, patch: { scene_type: '办公空间' } },
  { pattern: /(景观|园林)/, patch: { scene_type: '景观' } },
  { pattern: /(外观|建筑)/, patch: { scene_type: '建筑外观' } },
  { pattern: /(住宅|家居|居住)/, patch: { asset_type: '住宅空间', business_type: '高端住宅', function_goal: '日常居住体验' } },
  { pattern: /(公共空间|商业|酒店|餐饮|零售|展厅|会所|办公前厅)/, patch: { asset_type: '公共空间', business_type: '展陈空间', function_goal: '品牌形象表达' } },
  { pattern: /(温暖|松弛|治愈)/, patch: { tone_atmosphere: '温暖松弛' } },
  { pattern: /(高级|克制|精致)/, patch: { tone_atmosphere: '高级克制' } },
  { pattern: /(戏剧|张力|电影化)/, patch: { tone_atmosphere: '艺术戏剧化' } },

  { pattern: /(黄昏|傍晚)/, patch: { time: '傍晚18点', envlight: '黄金时刻暖色调斜射阳光，长影，浓郁氛围感。' } },
  { pattern: /(蓝调|蓝调时刻)/, patch: { envlight: '蓝调时刻（Blue Hour）柔和蓝紫色天光，室内外冷暖光线交融。', time: '傍晚18点' } },
  { pattern: /(朝南|南向)/, patch: { sun_mode: '朝向模式（快捷）', sun_orientation: '南' } },
  { pattern: /(朝东|东向)/, patch: { sun_mode: '朝向模式（快捷）', sun_orientation: '东' } },
  { pattern: /(朝西|西向|西晒)/, patch: { sun_mode: '朝向模式（快捷）', sun_orientation: '西' } },
  { pattern: /(朝北|北向)/, patch: { sun_mode: '朝向模式（快捷）', sun_orientation: '北' } },
  { pattern: /(方位角|azimuth|专业太阳)/, patch: { sun_mode: '专业参数模式（方位角）' } },
  { pattern: /(低角度|斜射|掠射)/, patch: { sun_altitude: '低角度 10°-20°' } },
  { pattern: /(高角度|顶光)/, patch: { sun_altitude: '高角度 55°-70°' } },

  { pattern: /(清晨|早上)/, patch: { time: '早上8点' } },
  { pattern: /(上午)/, patch: { time: '上午10点' } },
  { pattern: /(夜景|夜晚)/, patch: { time: '夜晚21点', envlight: '夜晚纯人工照明，无自然光介入。' } },
  { pattern: /(不改结构|保持结构|严格保留布局)/, patch: { geo: '严格保持原始 su 场景结构、物体位置和几何形状，严禁改变空间布局。' } },
  { pattern: /(允许调整|可优化)/, patch: { geo: '基本保持几何结构，允许细节优化和局部调整。' } },
  { pattern: /(真实住宅摄影|更真实|别太像效果图)/, patch: { render: '真实住宅摄影感，避免过度CG效果。', lightqual: '自然光为主，最少人工干预，追求真实感。' } },
  { pattern: /(电影感|大片感)/, patch: { lightqual: '电影级布光，柔和漫反射，真实阴影层次，高动态光影对比。' } },
  { pattern: /(商业|杂志)/, patch: { lightqual: '商业摄影布光，高对比，强调产品质感。' } },
  { pattern: /(8k|8K)/, patch: { res: '超高分辨率（8K）' } },
  { pattern: /(4k|4K)/, patch: { res: '超高分辨率（4K）' } },
  { pattern: /(哈苏)/, patch: { camera: '哈苏 X2D（Hasselblad X2D）' } },
  { pattern: /(徕卡)/, patch: { camera: '徕卡 M11（Leica M11）' } },
  { pattern: /(尼康)/, patch: { camera: '尼康 Z9（Nikon Z9）' } },
  { pattern: /(索尼)/, patch: { camera: '索尼 A7R V（Sony A7RV）' } },
  { pattern: /(体积光|丁达尔)/, patch: { volumetric: true } },
  { pattern: /(自然光|不要开灯)/, patch: { lights: [], volumetric: false, lightqual: '自然光为主，最少人工干预，追求真实感。' } },
  { pattern: /(暖光|温馨)/, patch: { lights: ['天花灯带', '墙面壁灯', '台灯'], volumetric: true } }
];

export function runRuleAgent(input, currentState) {
  const text = String(input || '').trim();
  if (!text) return { patch: {}, matchedRules: [] };

  const patch = {};
  const matchedRules = [];

  for (const rule of rules) {
    if (rule.pattern.test(text)) {
      Object.assign(patch, rule.patch);
      matchedRules.push(rule.pattern.toString());
    }
  }

  if (!patch.project_name) {
    const shortTitle = text.length > 24 ? text.slice(0, 24) + '...' : text;
    patch.project_name = `SU轻Agent - ${shortTitle}`;
  }

  if (!patch.lights && /夜|黄昏|暖光|电影感/.test(text)) {
    patch.lights = currentState.lights?.length ? currentState.lights : ['天花灯带', '墙面壁灯'];
  }

  return { patch, matchedRules };
}
