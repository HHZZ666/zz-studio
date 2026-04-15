export const presets = {
  modern: {
    project_name: 'SU截图转写实摄影 - 现代客厅定制版',
    style: '现代室内设计',
    time: '早上8点',
    location: '中国重庆',
    envlight: '远处外景进入的柔和自然天光，光线细腻有层次。',
    volumetric: true,
    lights: ['天花灯带', '天花射灯', '墙面壁灯', '落地灯'],
    render: '写实室内摄影，质感通透，细节丰富，电影级后期调色。'
  },
  french: {
    project_name: 'SU截图转写实摄影 - 法式风格',
    style: '法式古典室内设计',
    time: '黄金时刻日落前一小时',
    location: '法国巴黎',
    envlight: '黄金时刻暖色调斜射阳光，长影，浓郁氛围感。',
    volumetric: true,
    lights: ['天花吊灯', '墙面壁灯', '台灯'],
    camera: '徕卡 M11（Leica M11）',
    render: '暖调奶油色系，柔和质感，温馨氛围。'
  },
  nordic: {
    project_name: 'SU截图转写实摄影 - 北欧简约风',
    style: '北欧极简室内设计',
    time: '上午10点',
    location: '北欧斯堪的纳维亚',
    envlight: '柔和漫射的阴天散射光，无明显阴影，细节均匀。',
    volumetric: false,
    lights: [],
    lightqual: '自然光为主，最少人工干预，追求真实感。',
    camera: '索尼 A7R V（Sony A7RV）',
    render: '北欧白净风格，高亮度，低饱和，纯净通透。'
  },
  industrial: {
    project_name: 'SU截图转写实摄影 - 工业商业空间',
    scene_type: '商业空间',
    style: '工业风室内设计',
    time: '夜晚21点',
    location: '中国北京',
    envlight: '夜晚纯人工照明，无自然光介入。',
    volumetric: true,
    lights: ['天花射灯', '墙面壁灯', '柜底灯带'],
    lightqual: '商业摄影布光，高对比，强调产品质感。',
    camera: '佳能 EOS R5 C（Canon EOS R5C）',
    render: '高对比强饱和，杂志级商业效果图风格。'
  }
};
