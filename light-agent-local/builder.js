export function buildIndoorLightDesc(state) {
  if (!state.lights.length) return '仅自然光，室内人工光全部关闭。';
  const base = `开启${state.lights.join('、')}`;
  return state.volumetric
    ? `${base}，形成丰富的立体照明效果（体积光/丁达尔效应），营造柔和通透的光影氛围。`
    : `${base}，营造层次丰富的照明效果。`;
}

export function buildSunlightDesc(state) {
  if (state.sun_mode === '专业参数模式（方位角）') {
    return `太阳方位角 ${state.sun_azimuth}，太阳高度 ${state.sun_altitude}。`;
  }
  return `太阳朝向 ${state.sun_orientation}，太阳高度 ${state.sun_altitude}。`;
}

export function buildJSON(state) {
  return {
    项目名称: state.project_name,
    空间定位: {
      空间类型: state.scene_type,
      业态属性: state.asset_type,
      具体业态: state.business_type,
      调性氛围: state.tone_atmosphere === '自定义（由用户输入）'
        ? (state.tone_custom || '自定义')
        : state.tone_atmosphere,
      调性扩展: state.tone_expanded || '无',
      功能目标: state.function_goal,
      风格参考: state.style
    },
    核心约束: {
      几何保真度: state.geo,
      物体完整性: state.obj,
      转换逻辑: state.convert,
      图像比例: state.ratio
    },
    场景与光效: {
      地点: state.location,
      时间: state.time,
      环境光: state.envlight,
      太阳光方向: buildSunlightDesc(state),
      室内光: buildIndoorLightDesc(state),
      光影品质: state.lightqual
    },
    摄影参数: {
      相机型号: state.camera,
      光圈: state.aperture,
      快门: state.shutter,
      拍摄技术: state.tech.join('，')
    },
    渲染精度: {
      分辨率: state.res,
      画面表现: state.render
    }
  };
}

export function buildPrompt(state) {
  const parts = [
    `项目：${state.project_name}`,
    `空间类型：${state.scene_type}`,
    `业态属性：${state.asset_type}`,
    `具体业态：${state.business_type}`,
    `调性氛围：${state.tone_atmosphere === '自定义（由用户输入）' ? (state.tone_custom || '自定义') : state.tone_atmosphere}`,
    `调性扩展：${state.tone_expanded || '无'}`,
    `功能目标：${state.function_goal}`,
    `风格参考：${state.style}`,
    `几何约束：${state.geo}`,
    `物体约束：${state.obj}`,
    `转换逻辑：${state.convert}`,
    `构图比例：${state.ratio}`,
    `地点：${state.location}`,
    `时间：${state.time}`,
    `环境光：${state.envlight}`,
    `太阳光方向：${buildSunlightDesc(state)}`,
    `室内光：${buildIndoorLightDesc(state)}`,
    `光影品质：${state.lightqual}`,
    `相机：${state.camera}`,
    `参数：${state.aperture}, ${state.shutter}`,
    `拍摄技术：${state.tech.join('，') || '无'}`,
    `分辨率：${state.res}`,
    `画面表现：${state.render}`
  ];
  return parts.join('\n');
}

export function buildNegativePrompt(state) {
  const negatives = [
    '避免明显CG渲染痕迹、游戏引擎感和过度锐化',
    '避免透视错误：垂直线倾斜、广角拉伸、空间比例失真',
    '避免太阳方向与投影方向不一致，避免阴影逻辑错误',
    '避免材质塑料感：反射失真、粗糙度错误、贴图重复',
    '避免光影问题：高光爆白、阴影死黑、噪点涂抹',
    '避免低质后期：边缘发虚、纹理丢失、色带与脏污'
  ];

  if (state.asset_type === '住宅空间') {
    negatives.push('避免空间过度商业化陈列，保持真实居住尺度与生活感');
  }
  if (state.asset_type === '公共空间') {
    negatives.push('避免导视、动线与界面识别度不足，保证公共空间功能清晰');
  }

  return negatives.join('；');
}
