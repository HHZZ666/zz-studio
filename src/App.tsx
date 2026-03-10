import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Layers, 
  Image as ImageIcon, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ChevronRight,
  Download,
  Plus,
  History,
  Settings,
  ShieldCheck,
  Building2,
  LayoutDashboard,
  MessageSquare,
  X,
  Maximize2,
  Sparkles,
  Pencil,
  HelpCircle,
  Aperture,
  Archive,
  Palette,
  Library,
  ChevronDown,
  ChevronUp,
  Activity,
  Database,
  Cpu,
  Globe,
  Zap,
  Brain,
  Code,
  ExternalLink,
  Lock,
  User,
  Mail,
  LogOut,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateReview, generateImage, searchRegulationsWithAI, optimizePrompt } from './services/gemini';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ModuleGuide = ({ title, steps, onClose }: { title: string, steps: string[], onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#D9D5CC]/30 p-5 z-50"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2 text-[#6B6A4C]">
        <HelpCircle size={16} />
        <h4 className="text-xs font-bold uppercase tracking-widest">使用说明 · {title}</h4>
      </div>
      <button onClick={onClose} className="text-[#AAA396] hover:text-[#1A1A1A]">
        <X size={14} />
      </button>
    </div>
    <div className="space-y-3">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3">
          <span className="w-5 h-5 rounded-full bg-[#6B6A4C]/10 text-[#6B6A4C] text-[10px] font-bold flex items-center justify-center shrink-0">
            {i + 1}
          </span>
          <p className="text-[11px] text-[#4A463D] leading-relaxed font-medium">{step}</p>
        </div>
      ))}
    </div>
    <div className="mt-4 pt-4 border-t border-[#D9D5CC]/30">
      <p className="text-[9px] text-[#AAA396] italic">如有疑问，请联系观象技术支持团队。</p>
    </div>
  </motion.div>
);

const Login = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      if (email === 'admin@guanxiang.ai' && password === 'admin123') {
        onLogin({ name: '观象管理员', email, role: 'admin' });
      } else if (email === 'user@example.com' && password === 'user123') {
        onLogin({ name: '建筑设计师', email, role: 'user' });
      } else {
        setError('邮箱或密码错误，请重试。');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F2] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-white rounded-[40px] shadow-2xl border border-[#D9D5CC]/30 overflow-hidden"
      >
        <div className="p-10 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-[#1A1A1A] rounded-[24px] flex items-center justify-center text-white shadow-xl">
              <Logo className="w-12 h-12" />
            </div>
            <div className="space-y-1">
              <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">观象建筑 AI</h1>
              <p className="text-[10px] text-[#8C877C] uppercase tracking-[0.3em] font-bold">Architectural Intelligence Platform</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#8C877C] uppercase tracking-widest ml-1">电子邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAA396]" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@guanxiang.ai"
                    className="w-full h-[54px] bg-[#F5F5F2] rounded-[20px] pl-12 pr-6 text-sm font-medium outline-none border border-transparent focus:border-[#6B6A4C]/30 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#8C877C] uppercase tracking-widest ml-1">登录密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAA396]" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-[54px] bg-[#F5F5F2] rounded-[20px] pl-12 pr-6 text-sm font-medium outline-none border border-transparent focus:border-[#6B6A4C]/30 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-red-500 text-[11px] font-bold bg-red-50 p-3 rounded-xl border border-red-100"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-[54px] bg-[#1A1A1A] text-white rounded-[20px] font-bold flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-black/10"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <ChevronRight size={20} />}
              {loading ? "验证中..." : "进入系统"}
            </button>
          </form>

          <div className="pt-4 text-center space-y-4">
            <p className="text-[10px] text-[#AAA396] font-medium">
              测试账号: admin@guanxiang.ai / admin123
            </p>
            <div className="h-px bg-[#D9D5CC]/30 w-full" />
            <p className="text-[9px] text-[#AAA396] leading-relaxed">
              © 2026 观象建筑科技 · 意象引擎 v2.1<br/>
              专业建筑人工智能合规与生成平台
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Logo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Outer Octagon */}
    <path d="M35 15 L65 15 L85 35 L85 65 L65 85 L35 85 L15 65 L15 35 Z" />
    {/* Inner Octagon */}
    <path d="M42 28 L58 28 L72 42 L72 58 L58 72 L42 72 L28 58 L28 42 Z" strokeWidth="1.5" />
    {/* Grid Lines */}
    <line x1="50" y1="15" x2="50" y2="85" strokeWidth="1" />
    <line x1="15" y1="50" x2="85" y2="50" strokeWidth="1" />
    {/* Center Symbol */}
    <path d="M46 50 H54 M50 46 V54" strokeWidth="2.5" />
    <path d="M44 44 L47 47 M53 44 L56 47 M44 56 L47 53 M53 56 L56 53" strokeWidth="1.5" />
    {/* Connecting lines */}
    <line x1="35" y1="15" x2="42" y2="28" strokeWidth="1" />
    <line x1="65" y1="15" x2="58" y2="28" strokeWidth="1" />
    <line x1="85" y1="35" x2="72" y2="42" strokeWidth="1" />
    <line x1="85" y1="65" x2="72" y2="58" strokeWidth="1" />
    <line x1="65" y1="85" x2="58" y2="72" strokeWidth="1" />
    <line x1="35" y1="85" x2="42" y2="72" strokeWidth="1" />
    <line x1="15" y1="65" x2="28" y2="58" strokeWidth="1" />
    <line x1="15" y1="35" x2="28" y2="42" strokeWidth="1" />
  </svg>
);

const AnnotationOverlay = ({ annotations }: { annotations: any[] }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {annotations.map((ann, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.1 }}
        className="absolute"
        style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
      >
        <div className="relative">
          {/* Annotation Point */}
          <div className="w-3 h-3 bg-[#6B6A4C] rounded-full border-2 border-white shadow-lg" />
          
          {/* Annotation Line */}
          <div className="absolute left-1.5 top-1.5 w-12 h-px bg-[#6B6A4C] origin-left rotate-45" />
          
          {/* Annotation Label */}
          <div className="absolute left-10 top-6 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#D9D5CC] shadow-xl whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white text-[9px] font-bold flex items-center justify-center">
                {ann.id}
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#1A1A1A]">{ann.label}</span>
                {ann.dimension && (
                  <span className="text-[8px] font-bold text-[#6B6A4C]">{ann.dimension}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

export default function App() {
  const [activeCategory, setActiveCategory] = useState('creation_workshop');
  const [activePage, setActivePage] = useState('creation_workshop');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['creation_workshop', 'inspection_center']);

  // Knowledge Base State
  const [regulations, setRegulations] = useState<any[]>([]);
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [regSearch, setRegSearch] = useState('');
  const [selectedLibraryTag, setSelectedLibraryTag] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('selectedModel') || 'gemini-3.1-pro');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('google');
  const [platformSearch, setPlatformSearch] = useState('');
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [platformConfigs, setPlatformConfigs] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('platformConfigs');
    if (saved) return JSON.parse(saved);
    
    // Default configs
    return {
      google: { enabled: true, apiKey: '••••••••••••••••', endpoint: 'https://generativelanguage.googleapis.com', models: ['gemini-3.1-pro', 'gemini-3.1-flash'] },
      openai: { enabled: true, apiKey: '', endpoint: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4-turbo'] },
      anthropic: { enabled: false, apiKey: '', endpoint: 'https://api.anthropic.com/v1', models: ['claude-3.5-sonnet', 'claude-3-opus'] },
      deepseek: { enabled: true, apiKey: '', endpoint: 'https://api.deepseek.com', models: ['deepseek-v3', 'deepseek-chat'] },
      alibaba: { enabled: true, apiKey: '', endpoint: 'https://dashscope.aliyuncs.com/api/v1', models: ['qwen-max', 'qwen-plus'] },
      moonshot: { enabled: false, apiKey: '', endpoint: 'https://api.moonshot.cn/v1', models: ['kimi-latest'] },
      bytedance: { enabled: false, apiKey: '', endpoint: 'https://ark.cn-beijing.volces.com/api/v3', models: ['doubao-pro'] },
      tencent: { enabled: false, apiKey: '', endpoint: 'https://hunyuan.tencentcloudapi.com', models: ['hunyuan-turbo'] },
      baichuan: { enabled: false, apiKey: '', endpoint: 'https://api.baichuan-ai.com/v1', models: ['baichuan-4'] },
      xai: { enabled: false, apiKey: '', endpoint: 'https://api.x.ai/v1', models: ['grok-1'] },
      mistral: { enabled: false, apiKey: '', endpoint: 'https://api.mistral.ai/v1', models: ['mistral-large'] },
    };
  });

  const [isUpdatingModels, setIsUpdatingModels] = useState<Record<string, boolean>>({});
  const [isTestingConnection, setIsTestingConnection] = useState<Record<string, boolean>>({});

  const handleTestConnection = async (platformId: string) => {
    const config = platformConfigs[platformId];
    if (!config || !config.apiKey) {
      alert('请先配置 API 密钥');
      return;
    }

    setIsTestingConnection(prev => ({ ...prev, [platformId]: true }));
    try {
      if (platformId === 'google') {
        const response = await fetch(`${config.endpoint}/v1beta/models?key=${config.apiKey}`);
        if (response.ok) {
          alert('连接成功！API 密钥有效。');
        } else {
          const error = await response.json();
          alert(`连接失败: ${error.error?.message || response.statusText}`);
        }
      } else {
        let url = config.endpoint;
        if (!url.endsWith('/v1') && !url.includes('/v1/')) {
          if (platformId === 'deepseek' || platformId === 'moonshot' || platformId === 'baichuan') {
             if (!url.endsWith('/v1')) url += '/v1';
          }
        }
        const response = await fetch(`${url}/models`, {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`
          }
        });
        if (response.ok) {
          alert('连接成功！API 密钥有效。');
        } else {
          const error = await response.json();
          alert(`连接失败: ${error.error?.message || response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Test connection error:', error);
      alert('连接失败，请检查网络或配置');
    } finally {
      setIsTestingConnection(prev => ({ ...prev, [platformId]: false }));
    }
  };

  const handleUpdateModels = async (platformId: string) => {
    const config = platformConfigs[platformId];
    if (!config || !config.apiKey) {
      alert('请先配置 API 密钥');
      return;
    }

    setIsUpdatingModels(prev => ({ ...prev, [platformId]: true }));
    try {
      let newModels: string[] = [];
      
      if (platformId === 'google') {
        const response = await fetch(`${config.endpoint}/v1beta/models?key=${config.apiKey}`);
        const data = await response.json();
        if (data.models) {
          newModels = data.models
            .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: any) => m.name.replace('models/', ''));
        }
      } else {
        // OpenAI compatible
        let url = config.endpoint;
        if (!url.endsWith('/v1') && !url.includes('/v1/')) {
          // Some providers might need /v1 suffix if not present
          if (platformId === 'deepseek' || platformId === 'moonshot' || platformId === 'baichuan') {
             if (!url.endsWith('/v1')) url += '/v1';
          }
        }
        
        const response = await fetch(`${url}/models`, {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.data) {
          newModels = data.data.map((m: any) => m.id);
        }
      }

      if (newModels.length > 0) {
        const updatedConfigs = {
          ...platformConfigs,
          [platformId]: { ...platformConfigs[platformId], models: newModels }
        };
        setPlatformConfigs(updatedConfigs);
        localStorage.setItem('platformConfigs', JSON.stringify(updatedConfigs));
        alert(`成功更新 ${newModels.length} 个模型`);
      } else {
        alert('未获取到模型列表，请检查配置或网络');
      }
    } catch (error) {
      console.error('Update models error:', error);
      alert('更新失败，请检查网络或 API 密钥是否正确');
    } finally {
      setIsUpdatingModels(prev => ({ ...prev, [platformId]: false }));
    }
  };

  const handleSaveConfig = () => {
    setIsSaving(true);
    localStorage.setItem('platformConfigs', JSON.stringify(platformConfigs));
    localStorage.setItem('selectedModel', selectedModel);
    setTimeout(() => {
      setIsSaving(false);
    }, 800);
  };

  const platforms = [
    { id: 'google', name: 'Gemini', icon: Cpu, color: 'text-blue-500' },
    { id: 'openai', name: 'OpenAI', icon: Brain, color: 'text-green-600' },
    { id: 'anthropic', name: 'Anthropic', icon: MessageSquare, color: 'text-orange-500' },
    { id: 'deepseek', name: 'DeepSeek', icon: Code, color: 'text-blue-600' },
    { id: 'alibaba', name: '阿里云百炼', icon: Globe, color: 'text-orange-600' },
    { id: 'moonshot', name: '月之暗面', icon: Layers, color: 'text-purple-600' },
    { id: 'bytedance', name: '火山引擎', icon: Zap, color: 'text-blue-400' },
    { id: 'tencent', name: '腾讯云混元', icon: Building2, color: 'text-blue-700' },
    { id: 'baichuan', name: '百川智能', icon: Database, color: 'text-red-500' },
    { id: 'xai', name: 'xAI Grok', icon: Activity, color: 'text-white' },
    { id: 'mistral', name: 'Mistral AI', icon: ShieldCheck, color: 'text-orange-400' },
  ];

  const filteredPlatforms = platforms.filter(p => 
    p.name.toLowerCase().includes(platformSearch.toLowerCase()) || 
    p.id.toLowerCase().includes(platformSearch.toLowerCase())
  );
  
  // AI Annotation State
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [showAnnotationInput, setShowAnnotationInput] = useState(false);
  const [annotationPrompt, setAnnotationPrompt] = useState('');

  // Sources State
  const [sources, setSources] = useState<any[]>([]);
  const [collectionLogs, setCollectionLogs] = useState<any[]>([]);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [crawlLoading, setCrawlLoading] = useState(false);
  const [newSource, setNewSource] = useState({
    source_name: '',
    official_domain: '',
    country_region: '中国大陆',
    discipline: '综合',
    source_type: 'official_website',
    update_frequency: 'weekly_scan'
  });

  // AI Search State
  const [aiSearchResult, setAiSearchResult] = useState<any>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleAiSearch = async () => {
    if (!regSearch) return;
    setIsAiSearching(true);
    setAiSearchResult(null);
    try {
      const result = await searchRegulationsWithAI(regSearch);
      setAiSearchResult(result);
    } catch (error) {
      console.error("AI Search Error:", error);
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleOptimizePrompt = async () => {
    if (!input || isOptimizing) return;
    setIsOptimizing(true);
    try {
      const optimized = await optimizePrompt(input, outputType);
      setInput(optimized);
    } catch (error) {
      console.error("Optimize Prompt Error:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleOptimizeRefinePrompt = async () => {
    if (!refineInput || isOptimizing) return;
    setIsOptimizing(true);
    try {
      const optimized = await optimizePrompt(refineInput, outputType);
      setRefineInput(optimized);
    } catch (error) {
      console.error("Optimize Refine Prompt Error:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const fetchRegulations = async () => {
    const res = await fetch(`/api/regulations?q=${regSearch}`);
    const data = await res.json();
    setRegulations(data);
  };

  const fetchSources = async () => {
    const res = await fetch('/api/regulation-sources');
    const data = await res.json();
    setSources(data);
  };

  const fetchLogs = async () => {
    const res = await fetch('/api/collection-logs');
    const data = await res.json();
    setCollectionLogs(data);
  };

  const handleAddSource = async () => {
    await fetch('/api/regulation-sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSource)
    });
    setShowSourceModal(false);
    fetchSources();
  };

  const handleRunCollection = async (sourceId: number) => {
    setCrawlLoading(true);
    await fetch('/api/regulation-collection/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_id: sourceId })
    });
    setCrawlLoading(false);
    fetchLogs();
  };

  useEffect(() => {
    if (activePage === 'code_knowledge_base') fetchRegulations();
    if (activePage === 'source_management') fetchSources();
    if (activePage === 'official_collection_engine') fetchLogs();
  }, [activePage, regSearch]);

  const NAVIGATION = [
    {
      id: "inspection_center",
      name: "观象审图",
      icon: ShieldCheck,
      pages: [
        { id: "code_review", name: "规范审查" },
        { id: "issue_detection", name: "问题识别" },
        { id: "compliance_check", name: "条文比对" },
        { id: "code_knowledge_base", name: "规范象库" },
        { id: "official_collection_engine", name: "采集引擎" },
        { id: "review_report", name: "审查报告" },
      ]
    },
    {
      id: "review_archive",
      name: "审图档案",
      icon: Archive,
      pages: [
        { id: "project_records", name: "项目记录" },
        { id: "review_history", name: "审查历史" },
        { id: "report_archive", name: "报告归档" },
        { id: "version_history", name: "版本记录" },
      ]
    },
    {
      id: "image_library",
      name: "图象库",
      icon: Layers,
      pages: [
        { id: "drawing_library", name: "图纸库" },
        { id: "render_library", name: "效果图库" },
        { id: "analysis_library", name: "分析图库" },
        { id: "reference_library", name: "参考图库" },
      ]
    },
    {
      id: "creation_workshop",
      name: "造象工坊",
      icon: Sparkles,
      pages: []
    },
    {
      id: "style_library",
      name: "象谱库",
      icon: Palette,
      pages: [
        { id: "style_library_page", name: "风格库" },
        { id: "drawing_styles", name: "图纸表达" },
        { id: "analysis_templates", name: "分析图模板" },
        { id: "project_master", name: "项目母版" },
      ]
    },
    {
      id: "system_center",
      name: "系统枢",
      icon: Settings,
      pages: [
        { id: "source_management", name: "法规源管理" },
        { id: "engine_config", name: "模型与 API 配置" },
        { id: "permission_management", name: "权限管理" },
        { id: "system_logs", name: "系统日志" },
      ]
    }
  ];

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const getSummary = (res: any) => {
    if (!res || !res.structured_output) return "无摘要信息";
    const out = res.structured_output;
    if (res.mode === 'FULL_REVIEW') {
      return out.compliance_summary?.summary_statement || out.conclusion?.summary || "完整审查报告";
    }
    if (res.mode === 'DRAWING_ANALYSIS') {
      return out.analysis_summary || "图纸分析报告";
    }
    if (res.mode === 'QNA') {
      return out.question_rewrite || "问答记录";
    }
    return "审查报告摘要";
  };

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [outputType, setOutputType] = useState<'render' | 'drawing' | 'analysis' | 'concept'>('render');
  const [consistencyEnabled, setConsistencyEnabled] = useState(true);
  const [consistencyLevel, setConsistencyLevel] = useState<'basic' | 'strict' | 'master_locked'>('strict');
  const [consistencyItems, setConsistencyItems] = useState({
    style: true,
    line: true,
    color: true,
    annotation: true,
    layout: true,
    material: true
  });
  const [projectMasterName, setProjectMasterName] = useState('');
  const [primaryReferenceBinding, setPrimaryReferenceBinding] = useState('auto');
  const [styleCategory, setStyleCategory] = useState('写实摄影');
  const [selectedTags, setSelectedTags] = useState<string[]>(["写实摄影", "建筑摄影", "电影感摄影"]);
  const [referenceImages, setReferenceImages] = useState<{preview: string, data: string, weight: number, type: string}[]>([]);
  const [drawingTypes, setDrawingTypes] = useState<string[]>(["floor_plan"]);
  const [analysisTypes, setAnalysisTypes] = useState<string[]>(["function_analysis"]);
  const [conceptTypes, setConceptTypes] = useState<string[]>(["concept_sketch"]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasKey, setHasKey] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<{file: File, preview: string, type: string}[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [imageHistory, setImageHistory] = useState<any[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchDrawings, setBatchDrawings] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [refiningIdx, setRefiningIdx] = useState<number | null>(null);
  const [refineInput, setRefineInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const analysisInputRef = useRef<HTMLInputElement>(null);
  const renderInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFFFF", // Use pure white for professional PDF
        onclone: (clonedDoc) => {
          const reportEl = clonedDoc.querySelector('[ref="reportRef"]') || clonedDoc.body.querySelector('.bg-white.rounded-3xl');
          if (reportEl instanceof HTMLElement) {
            // Force a professional document width for the export
            reportEl.style.width = '1024px';
            reportEl.style.margin = '0 auto';
            reportEl.style.borderRadius = '0'; // Remove rounded corners for PDF
            reportEl.style.boxShadow = 'none';
            reportEl.style.padding = '40px';
          }

          // Fix for "oklab" color function error in html2canvas (common in Tailwind v4)
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            
            // Aggressively ensure professional typography for PDF
            if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H4') {
              el.style.color = '#1A1A1A';
              el.style.letterSpacing = '-0.01em';
            }

            // Force standard hex for common background classes to avoid oklch issues
            if (el.classList.contains('bg-emerald-50')) el.style.backgroundColor = '#ecfdf5';
            if (el.classList.contains('bg-red-50')) el.style.backgroundColor = '#fef2f2';
            if (el.classList.contains('bg-amber-50')) el.style.backgroundColor = '#fffbeb';
            if (el.classList.contains('bg-blue-50')) el.style.backgroundColor = '#eff6ff';
            if (el.classList.contains('bg-emerald-500')) el.style.backgroundColor = '#10b981';
            if (el.classList.contains('bg-red-500')) el.style.backgroundColor = '#ef4444';
            if (el.classList.contains('bg-amber-500')) el.style.backgroundColor = '#f59e0b';
            if (el.classList.contains('bg-[#6B6A4C]')) el.style.backgroundColor = '#6B6A4C';
            if (el.classList.contains('bg-[#F5F5F0]')) el.style.backgroundColor = '#F5F5F0';
            
            // Also check for text colors
            if (el.classList.contains('text-emerald-600')) el.style.color = '#059669';
            if (el.classList.contains('text-red-600')) el.style.color = '#dc2626';
            if (el.classList.contains('text-amber-600')) el.style.color = '#d97706';
            if (el.classList.contains('text-blue-600')) el.style.color = '#2563eb';

            // Handle print-only and no-print classes for PDF export
            if (el.classList.contains('no-print')) {
              el.style.display = 'none';
            }
            if (el.classList.contains('print-only')) {
              el.style.display = 'flex';
            }
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`观象AI审查报告-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  const handleAnalyzeDrawing = async (imgUrl: string) => {
    setLoading(true);
    try {
      const base64Data = imgUrl.split(',')[1];
      const mimeType = imgUrl.split(';')[0].split(':')[1];
      const imageParts = [{
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }];
      const data = await generateReview("请作为哈萨克斯坦国家设计院的 AI 审查官，深度分析这张图纸。识别其中的所有工程元素，并根据 SN RK / SP RK 规范评估其合规性。请务必自动匹配并引用相关的法规条例（如 SN RK 3.02-01-2018 等），并给出明确的审查结论。", imageParts);
      setResult(data);
      setActiveCategory('inspection_center');
      setActivePage('review_report');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleAnalyzeDrawing(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRenderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const idx = (e.target as any).targetIdx;
    if (file) {
      handleReferenceDrop(file, idx !== undefined ? idx : referenceImages.length);
    }
  };

  const handleReferenceDrop = (file: File, idx: number) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newRefs = [...referenceImages];
      newRefs[idx] = {
        preview: reader.result as string,
        data: (reader.result as string).split(',')[1],
        weight: 0.6,
        type: '主参考'
      };
      setReferenceImages(newRefs.slice(0, 4));
    };
    reader.readAsDataURL(file);
  };

  const handleBatchGenerate = async (issueLog: any[]) => {
    if (!issueLog || issueLog.length === 0) return;
    setBatchLoading(true);
    setBatchDrawings([]);
    
    const filteredIssues = issueLog.filter(i => i.severity === 'C1' || i.severity === 'C2').slice(0, 4); // Limit to 4 issues (8 images) to avoid timeout
    
    const newDrawings: any[] = [];
    
    for (let idx = 0; idx < filteredIssues.length; idx++) {
      const issue = filteredIssues[idx];
      const figNum = idx + 1;

      // 1. Location Map
      const locPrompt = `Professional engineering CAD location map for issue: ${issue.summary}. Location: ${issue.location}. Scale 1:200, black and white line drawing, architectural standards.`;
      try {
        const locImg = await generateImage(locPrompt, { aspectRatio: "1:1" });
        if (locImg) {
          newDrawings.push({
            img: locImg,
            fig: `Fig.${figNum}-A`,
            title: `LOCATION_MAP: ${issue.summary}`,
            issueId: issue.issue_id
          });
          setImageHistory(prev => [{
            img: locImg,
            prompt: locPrompt,
            timestamp: Date.now(),
            aspectRatio: "1:1"
          }, ...prev]);
        }
      } catch (e) { console.error(e); }

      // 2. Remediation Diagram
      const remPrompt = `Professional engineering CAD remediation diagram showing: ${issue.recommendation}. Based on issue: ${issue.summary}. Scale 1:20, detailed technical drawing, labels, black and white.`;
      try {
        const remImg = await generateImage(remPrompt, { aspectRatio: "1:1" });
        if (remImg) {
          newDrawings.push({
            img: remImg,
            fig: `Fig.${figNum}-B`,
            title: `REMEDIATION_DIAGRAM: ${issue.recommendation}`,
            issueId: issue.issue_id
          });
          setImageHistory(prev => [{
            img: remImg,
            prompt: remPrompt,
            timestamp: Date.now(),
            aspectRatio: "1:1"
          }, ...prev]);
        }
      } catch (e) { console.error(e); }
      
      // Update state incrementally to show progress
      setBatchDrawings([...newDrawings]);
    }
    
    setBatchLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFiles(prev => [...prev, {
          file,
          preview: reader.result as string,
          type: file.type
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const checkKey = async () => {
      const aiStudio = (window as any).aistudio;
      if (aiStudio?.hasSelectedApiKey) {
        const selected = await aiStudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true); // Fallback for environments without the selector
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio?.openSelectKey) {
      await aiStudio.openSelectKey();
      setHasKey(true); // Assume success as per guidelines
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [result, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    try {
      // Convert uploaded images to base64 parts for Gemini
      const imageParts = uploadedFiles
        .filter(f => f.type.startsWith('image/'))
        .map(f => ({
          inlineData: {
            data: f.preview.split(',')[1],
            mimeType: f.type
          }
        }));

      const data = await generateReview(input, imageParts);
      if (data.error && data.error.code === 403) {
        setHasKey(false);
        return;
      }

      // Fetch Real Articles from Code Knowledge Base (审查调用接口)
      if (data.tool_input_regulation_search?.queries?.length > 0) {
        try {
          const query = data.tool_input_regulation_search.queries[0];
          const res = await fetch(`/api/regulations?q=${encodeURIComponent(query)}`);
          const regs = await res.json();
          if (regs.length > 0) {
            const detailRes = await fetch(`/api/regulations/${regs[0].id}`);
            const detail = await detailRes.json();
            data.official_articles = detail.articles.slice(0, 5); // Attach top 5 articles as official basis
          }
        } catch (e) {
          console.error("Failed to fetch official articles", e);
        }
      }

      setResult(data);
      setHistory(prev => [{ input, result: data, timestamp: new Date().toISOString() }, ...prev]);
      setUploadedFiles([]); // Clear uploads after success
      setActiveCategory('inspection_center');
      setActivePage('review_report');
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('403') || error.status === 'PERMISSION_DENIED') {
        setHasKey(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async (userPrompt: string) => {
    setImageLoading(true);
    setGenerationStatus("正在深度理解工程语义...");
    try {
      // 1. Semantic Understanding via Gemini Pro (Thinking Mode)
      const context = `
        输出类型: ${outputType}
        风格类别: ${styleCategory}
        选定标签: ${selectedTags.join(', ')}
        一致性开启: ${consistencyEnabled}
        一致性级别: ${consistencyLevel}
        一致性项目: ${Object.entries(consistencyItems).filter(([_, v]) => v).map(([k]) => k).join(', ')}
        图纸/分析/概念类型: ${outputType === 'drawing' ? drawingTypes.join(', ') : outputType === 'analysis' ? analysisTypes.join(', ') : conceptTypes.join(', ')}
      `;
      
      const imageParts = referenceImages.map(img => ({
        inlineData: {
          data: img.data,
          mimeType: "image/png"
        }
      }));

      const reviewResult = await generateReview(`用户请求生成${outputType === 'drawing' ? '图纸' : outputType === 'analysis' ? '分析图' : '概念图'}，请理解其复杂的工程需求并转化为专业的 CAD 绘图提示词。
      如果提供了参考图（效果图），请深度分析其空间结构、建筑形式和构造细节，并将其转化为精确的工程图纸表达。
      上下文信息：${context}
      用户输入：${userPrompt}`, imageParts);
      
      let finalPrompt = userPrompt;
      if (reviewResult.tool_input_drawing_generator?.prompt) {
        finalPrompt = reviewResult.tool_input_drawing_generator.prompt;
        console.log("Optimized Prompt:", finalPrompt);
      }

      setGenerationStatus("正在使用 Nano Banana 2 引擎绘制图纸...");
      
      // 2. Image Generation via Flash Image
      const img = await generateImage(finalPrompt, { aspectRatio }, imageParts);
      if (img) {
        setGeneratedImages(prev => [img, ...prev]);
        setImageHistory(prev => [{
          img,
          prompt: userPrompt,
          timestamp: Date.now(),
          aspectRatio,
          outputType,
          styleCategory,
          selectedTags: [...selectedTags]
        }, ...prev]);
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('403') || error.status === 'PERMISSION_DENIED') {
        setHasKey(false);
      }
    } finally {
      setImageLoading(false);
      setGenerationStatus("");
    }
  };

  const handleGenerateRendering = async (userPrompt: string) => {
    setImageLoading(true);
    setGenerationStatus("正在进行商业美学转化...");
    try {
      // 1. Professional Rendering Prompt Conversion
      const context = `
        输出类型: 效果图渲染
        风格类别: ${styleCategory}
        选定标签: ${selectedTags.join(', ')}
        一致性开启: ${consistencyEnabled}
        一致性级别: ${consistencyLevel}
        一致性项目: ${Object.entries(consistencyItems).filter(([_, v]) => v).map(([k]) => k).join(', ')}
      `;

      const imageParts = referenceImages.map(ref => ({
        inlineData: {
          data: ref.data,
          mimeType: "image/png"
        }
      }));

      const reviewResult = await generateReview(`用户请求生成建筑效果图，请将其自然语言描述转化为具有商业美学、专业光影和材质细节的渲染提示词。
      如果提供了参考图，请在保持一致性的基础上进行美学增强或变体生成。
      上下文信息：${context}
      用户输入：${userPrompt}`, imageParts);
      
      let finalPrompt = userPrompt;
      if (reviewResult.tool_input_drawing_generator?.prompt) {
        finalPrompt = reviewResult.tool_input_drawing_generator.prompt;
      }

      setGenerationStatus("正在执行专业建筑渲染...");
      
      // 2. Image Generation via Flash Image
      const img = await generateImage(finalPrompt, { aspectRatio }, imageParts);
      if (img) {
        setGeneratedImages(prev => [img, ...prev]);
        setImageHistory(prev => [{
          img,
          prompt: userPrompt,
          timestamp: Date.now(),
          aspectRatio,
          outputType: 'render',
          styleCategory,
          selectedTags: [...selectedTags]
        }, ...prev]);
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('403') || error.status === 'PERMISSION_DENIED') {
        setHasKey(false);
      }
    } finally {
      setImageLoading(false);
      setGenerationStatus("");
    }
  };

  const handleAiAnnotate = async () => {
    if (!annotationPrompt.trim() || isAnnotating) return;
    
    setIsAnnotating(true);
    setGenerationStatus("AI 正在识别构件并生成标注...");
    
    try {
      // Simulate AI recognition delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnnotations = [
        { id: '01', x: 25, y: 30, label: '承重墙 (C30)', dimension: '200mm' },
        { id: '02', x: 55, y: 45, label: '剪力墙 (C40)', dimension: '300mm' },
        { id: '03', x: 75, y: 20, label: '电梯井', dimension: '2400x2400' },
        { id: '04', x: 40, y: 70, label: '双跑楼梯', dimension: 'W=1200' },
        { id: '05', x: 15, y: 85, label: '外墙保温层', dimension: '100mm' }
      ];
      
      // Filter or modify based on prompt if needed
      const filtered = mockAnnotations.filter(ann => 
        annotationPrompt.includes(ann.label) || 
        annotationPrompt.includes('全部') || 
        annotationPrompt.length < 5
      );

      setAnnotations(filtered.length > 0 ? filtered : mockAnnotations);
      setShowAnnotationInput(false);
      setAnnotationPrompt('');
    } catch (error) {
      console.error("Annotation error:", error);
    } finally {
      setIsAnnotating(false);
      setGenerationStatus("");
    }
  };

  const handleRefineImage = async (idx: number) => {
    if (!refineInput) return;
    const originalImage = generatedImages[idx];
    
    setImageLoading(true);
    setGenerationStatus("正在启用内置 nanobana-2 引擎进行精准重绘...");
    
    try {
      const imageParts = [{
        inlineData: {
          data: originalImage.split(',')[1],
          mimeType: "image/png"
        }
      }];

      const reviewResult = await generateReview(`用户请求对已生成的${outputType === 'drawing' ? '图纸' : outputType === 'render' ? '效果图' : '分析图'}进行二次编辑。
      反馈意见：${refineInput}
      请理解修改需求，并将其转化为专业的绘图提示词。`, imageParts);
      
      let finalPrompt = refineInput;
      if (reviewResult.tool_input_drawing_generator?.prompt) {
        finalPrompt = reviewResult.tool_input_drawing_generator.prompt;
      }

      const img = await generateImage(finalPrompt, { aspectRatio }, imageParts);
      if (img) {
        setGeneratedImages(prev => [img, ...prev]);
        if (previewImage === originalImage) {
          setPreviewImage(img);
        }
        setImageHistory(prev => [{
          img,
          prompt: refineInput,
          timestamp: Date.now(),
          aspectRatio,
          outputType,
          styleCategory,
          selectedTags: [...selectedTags],
          isRefinement: true,
          originalImageIdx: idx
        }, ...prev]);
        setRefiningIdx(null);
        setRefineInput('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setImageLoading(false);
      setGenerationStatus("");
    }
  };

  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-[#1A1A1A]/5 text-center space-y-6">
          <div className="w-20 h-20 bg-[#6B6A4C] rounded-3xl flex items-center justify-center mx-auto text-white shadow-xl shadow-[#6B6A4C]/20">
            <Logo className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold">需要 API 密钥</h2>
            <p className="text-sm text-[#1A1A1A]/60">
              此系统使用付费版 Gemini 模型以提供高精度审查和图纸生成。请选择您的 Google Cloud 付费项目 API 密钥。
            </p>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-[#6B6A4C] underline block mt-2"
            >
              了解计费文档
            </a>
          </div>
          <button 
            onClick={handleOpenKeySelector}
            className="w-full py-4 bg-[#6B6A4C] text-white rounded-2xl font-bold hover:bg-[#4A4A30] transition-all"
          >
            选择 API 密钥
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-[#F0F0ED] text-[#1A1A1A] font-sans selection:bg-[#6B6A4C]/20">
      {/* Hidden Inputs for File Uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        multiple 
        className="hidden" 
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
      <input 
        type="file" 
        ref={renderInputRef} 
        onChange={handleRenderFileChange} 
        className="hidden" 
        accept="image/*"
      />
      <input 
        type="file" 
        ref={analysisInputRef} 
        onChange={handleAnalysisFileChange} 
        className="hidden" 
        accept="image/*"
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-[#F5F5F2] border-r border-[#D9D5CC] z-50 flex flex-col overflow-hidden">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-white shadow-lg">
              <Logo className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-tight text-[#1A1A1A] leading-none mb-1">观象AI</h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#8C877C] font-bold">GuanXiang AI</p>
            </div>
          </div>
          <p className="text-[9px] text-[#8C877C] font-medium mt-2 border-l-2 border-[#6B6A4C] pl-2">
            观象以制器 · 建筑智能系统
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-hide">
          {NAVIGATION.map((category) => (
            <div key={category.id} className="space-y-1">
              <button 
                onClick={() => {
                  toggleCategory(category.id);
                  if (category.pages.length === 0) {
                    setActiveCategory(category.id);
                    setActivePage(category.id);
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  activeCategory === category.id ? "bg-[#1A1A1A]/5 text-[#1A1A1A]" : "text-[#1A1A1A]/60 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A]"
                )}
              >
                <div className="flex items-center gap-3">
                  <category.icon size={18} className={cn(activeCategory === category.id ? "text-[#6B6A4C]" : "text-[#1A1A1A]/40 group-hover:text-[#6B6A4C]")} />
                  <span className="text-sm font-bold tracking-tight">{category.name}</span>
                </div>
                {expandedCategories.includes(category.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              <AnimatePresence initial={false}>
                {expandedCategories.includes(category.id) && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-9 space-y-1"
                  >
                    {category.pages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => {
                          setActiveCategory(category.id);
                          setActivePage(page.id);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all",
                          activePage === page.id ? "text-[#6B6A4C] bg-[#6B6A4C]/5 font-bold" : "text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5"
                        )}
                      >
                        {page.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-[#D9D5CC]/50 bg-[#F5F5F2]/80 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-2xl border border-[#D9D5CC]/50 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#6B6A4C]/10 rounded-lg flex items-center justify-center text-[#6B6A4C]">
                <Cpu size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#1A1A1A]">观象 Agent</p>
                <p className="text-[8px] text-[#8C877C] uppercase font-bold">System Status</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-[#1A1A1A]/60">在线 · 安全运行中</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[280px] min-h-screen flex flex-col bg-[#F0F0ED]">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#D9D5CC] flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[#8C877C]">
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {NAVIGATION.find(c => c.id === activeCategory)?.name}
              </span>
              <ChevronRight size={12} />
              <span className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest">
                {NAVIGATION.find(c => c.id === activeCategory)?.pages.find(p => p.id === activePage)?.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F2] rounded-full border border-[#D9D5CC]/50">
              <Activity size={14} className="text-[#6B6A4C]" />
              <span className="text-[10px] font-bold text-[#1A1A1A]/60">意象引擎 v2.1</span>
            </div>
            <button 
              onClick={() => {
                setActiveCategory('system_center');
                setActivePage('model_config');
                if (!expandedCategories.includes('system_center')) {
                  setExpandedCategories(prev => [...prev, 'system_center']);
                }
              }}
              className="p-2 hover:bg-[#1A1A1A]/5 rounded-full transition-colors text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
            >
              <Settings size={18} />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowGuide(showGuide === activePage ? null : activePage)}
                className={cn(
                  "p-2 rounded-full transition-all",
                  showGuide === activePage ? "bg-[#6B6A4C] text-white" : "hover:bg-[#1A1A1A]/5 text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                )}
              >
                <HelpCircle size={18} />
              </button>
              <AnimatePresence>
                {showGuide === activePage && (
                  <ModuleGuide 
                    title={NAVIGATION.find(c => c.id === activeCategory)?.pages.find(p => p.id === activePage)?.name || NAVIGATION.find(c => c.id === activePage)?.name || "功能模块"}
                    onClose={() => setShowGuide(null)}
                    steps={
                      activePage === 'code_review' ? [
                        "在下方输入框中描述您的建筑设计需求或上传设计图纸。",
                        "AI 将自动识别设计意图并检索相关的国家及地方建筑规范。",
                        "系统会实时输出合规性审查建议，并标注潜在的违规风险。",
                        "您可以点击审查结果中的条文编号，直接跳转至法规原文查看详情。"
                      ] :
                      activePage === 'creation_workshop' ? [
                        "选择您想要生成的输出类型：效果图、图纸、分析图或概念图。",
                        "输入详细的文字描述，或拖拽参考图到 STEP 2 区域作为视觉引导。",
                        "在 STEP 3 中选择特定的建筑风格标签，以确保生成结果符合审美预期。",
                        "点击“开始生成”，在右侧预览窗口实时查看 AI 的创作成果。"
                      ] :
                      activePage === 'drawing_library' ? [
                        "左侧边栏列出了所有自动提取的标签，点击标签可快速筛选相关图像。",
                        "使用顶部的搜索框，通过提示词关键字或生成类型进行精准检索。",
                        "点击图像可进入全屏预览模式，支持下载高清原图或进行 AI 智能分析。",
                        "您可以将生成的图像直接拖拽回“造像工坊”作为新的参考图使用。"
                      ] :
                      activePage === 'code_knowledge_base' ? [
                        "在搜索框输入规范名称、编号或关键字进行全局检索。",
                        "左侧分类树支持按国家标准、行业标准、地方标准进行层级浏览。",
                        "点击条文可查看详细内容，系统会自动关联相关的图集和解释说明。",
                        "支持“AI 问答”模式，直接向法规库提问，获取精准的条文引用建议。"
                      ] :
                      activePage === 'official_collection_engine' ? [
                        "系统实时监控全国各级政府及住建部门的官方信源。",
                        "“采集日志”展示了最新的法规更新动态和政策解读文件。",
                        "点击“立即同步”可手动触发特定信源的增量数据采集任务。",
                        "所有新采集的法规需经过人工或 AI 预审后方可入库生效。"
                      ] :
                      activePage === 'source_management' ? [
                        "管理系统接入的官方信源，支持添加新的政府门户或行业网站。",
                        "您可以配置每个信源的采集频率（如：每日扫描、每周扫描）。",
                        "“健康状态”显示了信源链接的可访问性及数据解析的成功率。",
                        "支持对信源进行分类标签管理，方便采集引擎进行优先级调度。"
                      ] :
                      activePage === 'review_history' ? [
                        "这里记录了您所有的 AI 审查任务，支持按项目名称或时间排序。",
                        "点击历史记录可重新加载完整的审查对话和生成的合规报告。",
                        "支持对历史审查结果进行“二次复核”，AI 会基于最新法规进行比对。",
                        "您可以一键导出历史审查报告的 PDF 或 Excel 版本。"
                      ] :
                      ["欢迎使用观象建筑 AI 平台，该模块的功能说明正在完善中..."]
                    }
                  />
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-full bg-[#1A1A1A] border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold hover:scale-105 transition-transform overflow-hidden"
              >
                {user.name.substring(0, 2)}
              </button>
              
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-3 w-64 bg-white rounded-[24px] shadow-2xl border border-[#D9D5CC]/30 p-2 z-50"
                  >
                    <div className="p-4 border-b border-[#D9D5CC]/30 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#6B6A4C]/10 rounded-full flex items-center justify-center text-[#6B6A4C]">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1A1A1A]">{user.name}</p>
                          <p className="text-[10px] text-[#AAA396] font-medium">{user.email}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#6B6A4C]/10 text-[#6B6A4C] text-[9px] font-bold rounded-full uppercase tracking-widest">
                          {user.role === 'admin' ? '系统管理员' : '普通用户'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F5F5F2] rounded-xl transition-all">
                        <Settings size={14} />
                        个人设置
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F5F5F2] rounded-xl transition-all">
                        <ShieldCheck size={14} />
                        安全中心
                      </button>
                      <div className="h-px bg-[#D9D5CC]/30 my-1 mx-2" />
                      <button 
                        onClick={() => {
                          setUser(null);
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <LogOut size={14} />
                        退出登录
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto" ref={scrollRef}>
          <AnimatePresence mode="wait">
            {activePage === 'code_review' && (
              <motion.div 
                key="code_review"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                {/* Welcome / Info */}
                <div className="text-center py-20 space-y-6">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-[#1A1A1A]/5 mx-auto flex items-center justify-center">
                    <Building2 size={40} className="text-[#6B6A4C]" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-serif text-3xl font-bold">观象AI 智能审查系统</h2>
                    <p className="text-[#1A1A1A]/60 max-w-md mx-auto">
                      集成建筑合规审查与工程图纸规划。支持多维度的规范体系与技术标准。
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-8">
                    {[
                      { icon: Search, label: "合规查询", desc: "SN/SP 规范快速检索" },
                      { icon: FileText, label: "项目审查", desc: "全专业合规性评估" },
                      { icon: Layers, label: "工程制图", desc: "标准 CAD 逻辑出图" }
                    ].map((item, i) => (
                      <div key={i} className="bg-white p-6 rounded-2xl border border-[#1A1A1A]/5 text-left space-y-3">
                        <item.icon size={24} className="text-[#6B6A4C]" />
                        <div>
                          <p className="font-bold text-sm">{item.label}</p>
                          <p className="text-xs text-[#1A1A1A]/50">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activePage === 'review_report' && (
              <motion.div 
                key="review_report"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                {!result && !loading && (
                  <div className="text-center py-20 space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center text-[#1A1A1A]/20">
                      <FileText size={32} />
                    </div>
                    <p className="text-[#1A1A1A]/40 font-bold">暂无审查报告，请先在“规范审查”中提交请求</p>
                    <button 
                      onClick={() => {
                        setActiveCategory('inspection_center');
                        setActivePage('code_review');
                      }}
                      className="px-6 py-2 bg-[#1A1A1A] text-white rounded-full text-sm font-bold"
                    >
                      前往审查
                    </button>
                  </div>
                )}

                {loading && (
                  <div className="text-center py-20 space-y-4">
                    <Loader2 size={40} className="animate-spin text-[#6B6A4C] mx-auto" />
                    <p className="text-[#1A1A1A]/60 font-bold">正在生成审查报告...</p>
                  </div>
                )}

                {result && (
                  <div className="space-y-6">
                    {/* Router Info */}
                    <div className="bg-white p-6 rounded-3xl border border-[#1A1A1A]/5 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <ChevronRight size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/40">Router Decision</p>
                          <p className="font-bold">{result.router?.selected_route}</p>
                        </div>
                      </div>
                      <p className="text-sm text-[#1A1A1A]/60 italic">"{result.router?.reason}"</p>
                    </div>

                    {/* Structured Output */}
                    <div ref={reportRef} className="bg-white rounded-3xl border border-[#1A1A1A]/5 shadow-sm overflow-hidden">
                      <div className="bg-[#1A1A1A] px-6 py-4 flex items-center justify-between no-print">
                        <h3 className="text-white font-bold text-sm">审查结果详情</h3>
                        <div className="flex gap-2">
                          <button 
                            onClick={handleExportPDF}
                            disabled={exporting}
                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors flex items-center gap-2 px-3"
                          >
                            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            <span className="text-xs font-bold">{exporting ? "导出中..." : "导出 PDF"}</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-8">
                        {/* PDF Only Header */}
                        <div className="hidden print-only flex items-center justify-between border-b-2 border-[#1A1A1A] pb-6 mb-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-white">
                              <ShieldCheck size={32} />
                            </div>
                            <div>
                              <h1 className="font-serif text-2xl font-bold">观象AI审查报告</h1>
                              <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/50 font-bold">观象建筑科技</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold">REPORT ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                            <p className="text-[10px] text-[#1A1A1A]/40 font-bold uppercase">Generated on {new Date().toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Compliance Summary (Global for Review Modes) */}
                        {(result.structured_output?.compliance_summary || result.structured_output?.conclusion) && (
                          <div className={cn(
                            "p-6 rounded-2xl border flex items-start gap-4",
                            (result.structured_output?.compliance_summary?.status || result.structured_output?.conclusion?.status) === 'COMPLIANT' ? "bg-emerald-50 border-emerald-100" :
                            (result.structured_output?.compliance_summary?.status || result.structured_output?.conclusion?.status) === 'NON_COMPLIANT' ? "bg-red-50 border-red-100" :
                            "bg-amber-50 border-amber-100"
                          )}>
                            {(result.structured_output?.compliance_summary?.status || result.structured_output?.conclusion?.status) === 'COMPLIANT' ? 
                              <CheckCircle2 className="text-emerald-600 mt-1 shrink-0" /> : 
                              <AlertCircle className="text-amber-600 mt-1 shrink-0" />
                            }
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-bold text-lg">
                                    {result.structured_output?.compliance_summary?.status || result.structured_output?.conclusion?.status}
                                  </h4>
                                  <span className="px-2 py-0.5 bg-black/5 rounded text-[10px] font-bold uppercase">
                                    {result.structured_output?.compliance_summary?.risk_level || result.structured_output?.conclusion?.risk_level}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-[#1A1A1A]/40 uppercase tracking-widest">合规性总结</span>
                              </div>
                              <p className="text-sm text-[#1A1A1A]/70 leading-relaxed">
                                {result.structured_output?.compliance_summary?.summary_statement || result.structured_output?.conclusion?.summary}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Official Basis from Code Knowledge Base */}
                        {result.official_articles && result.official_articles.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="font-bold text-sm flex items-center gap-2">
                              <ShieldCheck size={16} className="text-[#6B6A4C]" />
                              官方规范依据 (Code Knowledge Base)
                            </h4>
                            <div className="grid gap-3">
                              {result.official_articles.map((art: any, idx: number) => (
                                <div key={idx} className="p-4 bg-[#F5F5F2] rounded-2xl border border-[#D9D5CC]/30">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-[#6B6A4C] uppercase tracking-widest">
                                      {art.article_number || `条文 ${idx + 1}`}
                                    </span>
                                    <span className="px-2 py-0.5 bg-white rounded text-[8px] font-bold text-[#8C877C] uppercase">
                                      已验证版本
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#1A1A1A]/80 leading-relaxed">{art.article_text}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Drawing Analysis Output */}
                        {result.mode === 'DRAWING_ANALYSIS' && (
                          <div className="space-y-8">
                            <div className="p-6 bg-[#F5F5F0] rounded-3xl border border-[#1A1A1A]/5">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/40 mb-4">图纸智能分析摘要</h4>
                              <p className="text-sm leading-relaxed text-[#1A1A1A]/80">{result.structured_output?.analysis_summary}</p>
                            </div>

                            {result.structured_output?.detected_elements?.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-bold text-sm flex items-center gap-2">
                                  <Layers size={16} className="text-[#6B6A4C]" />
                                  识别到的工程元素
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {result.structured_output.detected_elements.map((el: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-white border border-[#1A1A1A]/10 rounded-full text-xs font-medium">
                                      {el}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {result.structured_output?.compliance_findings?.length > 0 && (
                              <div className="space-y-4">
                                <h4 className="font-bold text-sm flex items-center gap-2">
                                  <ShieldCheck size={16} className="text-[#6B6A4C]" />
                                  合规性发现
                                </h4>
                                <div className="grid gap-4">
                                  {result.structured_output.compliance_findings.map((finding: any, i: number) => (
                                    <div key={i} className={cn(
                                      "p-4 rounded-2xl border flex items-start gap-4",
                                      finding.status === 'COMPLIANT' ? "bg-emerald-50 border-emerald-100" :
                                      finding.status === 'NON_COMPLIANT' ? "bg-red-50 border-red-100" :
                                      "bg-amber-50 border-amber-100"
                                    )}>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                          <p className="text-xs font-bold uppercase tracking-wider">{finding.element}</p>
                                          <span className="text-[10px] font-bold uppercase opacity-60">{finding.regulation_ref}</span>
                                        </div>
                                        <p className="text-sm text-[#1A1A1A]/70">{finding.finding}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {result.structured_output?.answers_to_user_questions?.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-bold text-sm flex items-center gap-2">
                                  <MessageSquare size={16} className="text-[#6B6A4C]" />
                                  问题解答
                                </h4>
                                <div className="space-y-3">
                                  {result.structured_output.answers_to_user_questions.map((ans: string, i: number) => (
                                    <div key={i} className="p-4 bg-white border border-[#1A1A1A]/5 rounded-2xl text-sm italic text-[#1A1A1A]/60">
                                      "{ans}"
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Render based on mode */}
                        {result.mode === 'QNA' && (
                          <div className="space-y-6">
                            <div className="p-4 bg-[#F5F5F0] rounded-2xl">
                              <p className="text-xs font-bold text-[#1A1A1A]/40 uppercase mb-2">问题重述</p>
                              <p className="text-sm font-medium">{result.structured_output?.question_rewrite}</p>
                            </div>
                            
                            {result.structured_output?.legal_basis?.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-bold text-sm flex items-center gap-2">
                                  <FileText size={16} className="text-[#6B6A4C]" />
                                  法律依据
                                </h4>
                                <div className="grid gap-3">
                                  {result.structured_output.legal_basis.map((basis: any, i: number) => (
                                    <div key={i} className="p-4 border border-[#1A1A1A]/5 rounded-xl hover:bg-[#F5F5F0] transition-colors">
                                      <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs font-bold text-[#6B6A4C]">{basis.doc_id} {basis.clause_id}</p>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-bold uppercase">{basis.status}</span>
                                      </div>
                                      <p className="text-xs font-bold mb-1">{basis.clause_title}</p>
                                      <p className="text-xs text-[#1A1A1A]/60 line-clamp-2 italic">"{basis.snippet}"</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {result.mode === 'FULL_REVIEW' && (
                          <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-[#F5F5F0] rounded-2xl">
                                <p className="text-[10px] font-bold text-[#1A1A1A]/40 uppercase mb-2">项目名称</p>
                                <p className="text-sm font-bold">{result.structured_output?.project_summary?.project_name}</p>
                              </div>
                              <div className="p-4 bg-[#F5F5F0] rounded-2xl">
                                <p className="text-[10px] font-bold text-[#1A1A1A]/40 uppercase mb-2">建筑类型</p>
                                <p className="text-sm font-bold">{result.structured_output?.project_summary?.building_type}</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-sm">审查问题日志 (Issue Log)</h4>
                                {result.structured_output?.issue_log?.length > 0 && (
                                  <button 
                                    onClick={() => handleBatchGenerate(result.structured_output.issue_log)}
                                    disabled={batchLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#6B6A4C] text-white text-xs font-bold rounded-xl hover:bg-[#4A4A30] transition-all disabled:opacity-50"
                                  >
                                    {batchLoading ? <Loader2 size={14} className="animate-spin" /> : <Layers size={14} />}
                                    {batchLoading ? "批量生成中..." : "批量生成 C1/C2 图纸"}
                                  </button>
                                )}
                              </div>

                              {batchDrawings.length > 0 && (
                                <div className="p-6 bg-[#F5F5F0] rounded-3xl border border-[#1A1A1A]/5 space-y-6">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/40">批量生成图纸集</h5>
                                    <span className="text-[10px] font-bold px-2 py-1 bg-white rounded border border-[#1A1A1A]/10">
                                      {batchDrawings.length} 张图像
                                    </span>
                                  </div>
                                  <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                                    {batchDrawings.map((draw, i) => (
                                      <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="break-inside-avoid bg-white p-3 rounded-2xl border border-[#1A1A1A]/10 shadow-sm space-y-3"
                                      >
                                        <div className="flex justify-between items-start">
                                          <span className="text-[10px] font-mono font-bold text-[#6B6A4C]">{draw.fig}</span>
                                          <span className="text-[10px] font-bold text-[#1A1A1A]/30">{draw.issueId}</span>
                                        </div>
                                        <div className="relative group cursor-pointer" onClick={() => setPreviewImage(draw.img)}>
                                          <img src={draw.img} alt={draw.title} className="w-full h-auto rounded-xl" referrerPolicy="no-referrer" />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); setPreviewImage(draw.img); }}
                                              className="p-2 bg-white rounded-full text-[#1A1A1A] hover:scale-110 transition-transform"
                                              title="放大预览"
                                            >
                                              <Maximize2 size={16} />
                                            </button>
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); handleAnalyzeDrawing(draw.img); }}
                                              className="p-2 bg-white rounded-full text-[#6B6A4C] hover:scale-110 transition-transform"
                                              title="AI 智能分析"
                                            >
                                              <Search size={16} />
                                            </button>
                                            <a 
                                              href={draw.img} 
                                              download={`${draw.fig}.png`}
                                              onClick={(e) => e.stopPropagation()}
                                              className="p-2 bg-white rounded-full text-[#1A1A1A] hover:scale-110 transition-transform"
                                            >
                                              <Download size={16} />
                                            </a>
                                          </div>
                                        </div>
                                        <p className="text-[10px] font-bold leading-tight line-clamp-2">{draw.title}</p>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="space-y-3">
                                {result.structured_output?.issue_log?.map((issue: any, i: number) => (
                                  <div key={i} className="border border-[#1A1A1A]/5 rounded-2xl p-5 space-y-3">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                        <span className={cn(
                                          "px-2 py-0.5 rounded text-[10px] font-bold text-white",
                                          issue.severity === 'C1' ? "bg-red-500" : "bg-amber-500"
                                        )}>{issue.severity}</span>
                                        <span className="text-xs font-bold text-[#1A1A1A]/40">{issue.discipline}</span>
                                      </div>
                                      <span className="text-xs font-medium text-[#1A1A1A]/60">{issue.location}</span>
                                    </div>
                                    <p className="font-bold text-sm">{issue.summary}</p>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                      <div>
                                        <p className="text-[#1A1A1A]/40 font-bold uppercase mb-1">规范要求</p>
                                        <p className="text-[#1A1A1A]/70">{issue.requirement}</p>
                                      </div>
                                      <div>
                                        <p className="text-[#1A1A1A]/40 font-bold uppercase mb-1">实际设计</p>
                                        <p className="text-[#1A1A1A]/70">{issue.actual_design}</p>
                                      </div>
                                    </div>
                                    <div className="pt-2 border-t border-[#1A1A1A]/5">
                                      <p className="text-xs font-bold text-[#6B6A4C]">建议措施：{issue.recommendation}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="p-6 bg-[#1A1A1A] text-white rounded-3xl flex items-center justify-between">
                              <div>
                                <p className="text-[10px] font-bold text-white/40 uppercase mb-1">最终裁定</p>
                                <h4 className="text-2xl font-serif font-bold">{result.structured_output?.verdict}</h4>
                              </div>
                              <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center">
                                <CheckCircle2 size={24} />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Drawing Output */}
                        {result.mode === 'DRAWING' && result.structured_output?.validated && (
                          <div className="space-y-6">
                            <div className="p-6 border-2 border-dashed border-[#1A1A1A]/10 rounded-3xl bg-[#F5F5F0]/50">
                              <div className="flex justify-between items-start mb-6">
                                <div>
                                  <p className="text-[10px] font-bold text-[#1A1A1A]/40 uppercase mb-1">Drawing Task</p>
                                  <h4 className="text-xl font-serif font-bold">{result.structured_output.drawing_task.sheet_title}</h4>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-[#1A1A1A]/40 uppercase mb-1">Fig No.</p>
                                  <p className="font-mono font-bold">{result.structured_output.drawing_task.fig_no}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-white p-3 rounded-xl border border-[#1A1A1A]/5">
                                  <p className="text-[10px] font-bold text-[#1A1A1A]/40 uppercase mb-1">Discipline</p>
                                  <p className="text-xs font-bold">{result.structured_output.drawing_task.discipline}</p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-[#1A1A1A]/5">
                                  <p className="text-[10px] font-bold text-[#1A1A1A]/40 uppercase mb-1">Scale</p>
                                  <p className="text-xs font-bold">{result.structured_output.drawing_task.scale}</p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-[#1A1A1A]/5">
                                  <p className="text-[10px] font-bold text-[#1A1A1A]/40 uppercase mb-1">Version</p>
                                  <p className="text-xs font-bold">{result.structured_output.drawing_task.version}</p>
                                </div>
                              </div>

                              {result.tool_input_drawing_generator && (
                                <button 
                                  onClick={() => handleGenerateImage(result.tool_input_drawing_generator.prompt)}
                                  disabled={imageLoading}
                                  className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#333] transition-all disabled:opacity-50"
                                >
                                  {imageLoading ? <Loader2 className="animate-spin" /> : <ImageIcon size={20} />}
                                  {imageLoading ? "正在生成工程图..." : "执行图纸生成器"}
                                </button>
                              )}
                            </div>

                            {generatedImages.length > 0 && (
                              <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                                {generatedImages.map((img, idx) => (
                                  <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="break-inside-avoid rounded-3xl overflow-hidden border border-[#1A1A1A]/10 shadow-lg"
                                    draggable="true"
                                    onDragStart={(e: any) => {
                                      e.dataTransfer.setData("text/plain", img);
                                      e.dataTransfer.effectAllowed = "copy";
                                    }}
                                  >
                                    <div className="relative group cursor-pointer" onClick={() => setPreviewImage(img)}>
                                      <img src={img} alt={`Generated Drawing ${idx}`} className="w-full h-auto" referrerPolicy="no-referrer" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setPreviewImage(img); }}
                                          className="p-3 bg-white rounded-full text-[#1A1A1A] hover:scale-110 transition-transform"
                                          title="放大预览"
                                        >
                                          <Maximize2 size={20} />
                                        </button>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleAnalyzeDrawing(img); }}
                                          className="p-3 bg-white rounded-full text-[#6B6A4C] hover:scale-110 transition-transform"
                                          title="AI 智能分析"
                                        >
                                          <Search size={20} />
                                        </button>
                                        <a 
                                          href={img} 
                                          download={`drawing-${idx}.png`}
                                          onClick={(e) => e.stopPropagation()}
                                          className="p-3 bg-white rounded-full text-[#1A1A1A] hover:scale-110 transition-transform"
                                        >
                                          <Download size={20} />
                                        </a>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tool Inputs (Manual Execution) */}
                        {result.tool_input_regulation_search && (
                          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                            <h4 className="text-xs font-bold text-blue-700 uppercase mb-3 flex items-center gap-2">
                              <Search size={14} />
                              需要手动法规检索
                            </h4>
                            <div className="space-y-2">
                              {result.tool_input_regulation_search.queries.map((q: string, i: number) => (
                                <div key={i} className="text-xs font-medium text-blue-800 bg-white/50 p-2 rounded-lg border border-blue-200/50">
                                  {q}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Letter Text */}
                    {result.letter_text && (
                      <div className="pt-8 border-t border-[#1A1A1A]/10 mt-8">
                        <div className="p-8 bg-[#F5F5F0] rounded-3xl border-2 border-dashed border-[#1A1A1A]/10">
                          <div className="max-w-2xl mx-auto bg-white p-12 shadow-2xl space-y-8 font-serif">
                            <div className="flex justify-between items-start border-b-2 border-[#1A1A1A] pb-6">
                              <div>
                                <h2 className="text-xl font-bold uppercase tracking-tighter">观象AI</h2>
                                <p className="text-[10px] font-sans font-bold text-[#1A1A1A]/40 uppercase">观象建筑科技</p>
                              </div>
                              <div className="text-right text-[10px] font-sans font-bold uppercase">
                                <p>Date: {new Date().toLocaleDateString()}</p>
                                <p>Ref: {result.mode}-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                              </div>
                            </div>
                            <div className="whitespace-pre-wrap text-sm leading-relaxed text-justify text-[#1A1A1A]">
                              {result.letter_text}
                            </div>
                            <div className="pt-12 flex justify-between items-end">
                              <div className="space-y-1">
                                <p className="text-xs font-bold uppercase">Authorized Signature</p>
                                <div className="w-32 h-px bg-[#1A1A1A]" />
                                <p className="text-[10px] text-[#1A1A1A]/40">AI Compliance Officer</p>
                              </div>
                              <div className="w-16 h-16 bg-[#6B6A4C]/10 rounded-full flex items-center justify-center border border-[#6B6A4C]/20">
                                <ShieldCheck size={32} className="text-[#6B6A4C]/40" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activePage === 'code_knowledge_base' && (
              <motion.div 
                key="code_knowledge_base"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">规范象库</h2>
                    <p className="text-sm text-[#8C877C] mt-1">结构化存储的建筑法规、技术标准与规范条文</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C877C]" size={18} />
                      <input 
                        type="text" 
                        placeholder="搜索法规名称或编号..."
                        value={regSearch}
                        onChange={(e) => setRegSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                        className="pl-12 pr-6 py-3 bg-white border border-[#D9D5CC] rounded-2xl text-sm outline-none focus:border-[#6B6A4C] w-80 shadow-sm"
                      />
                    </div>
                    <button 
                      onClick={handleAiSearch}
                      disabled={isAiSearching || !regSearch}
                      className="px-6 py-3 bg-[#1A1A1A] text-white rounded-2xl text-sm font-bold hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/5"
                    >
                      {isAiSearching ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-amber-400" />}
                      AI 联网搜索
                    </button>
                  </div>
                </div>

                {aiSearchResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Globe size={120} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center text-amber-400">
                            <Sparkles size={20} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{aiSearchResult.title}</h3>
                            <p className="text-xs text-white/40 mt-1">AI 联网匹配结果 • 来源: Google Search Grounding</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setAiSearchResult(null)}
                          className="p-2 hover:bg-white/10 rounded-full transition-all"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-6 mb-8">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">法规编号</p>
                          <p className="text-sm font-bold">{aiSearchResult.regulation_number || 'N/A'}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">发布机构</p>
                          <p className="text-sm font-bold">{aiSearchResult.issuing_authority || 'N/A'}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">生效日期</p>
                          <p className="text-sm font-bold">{aiSearchResult.effective_date || 'N/A'}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">当前状态</p>
                          <p className="text-sm font-bold text-amber-400">{aiSearchResult.status || '待核验'}</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">关键条文预览</h4>
                          <div className="grid gap-3">
                            {aiSearchResult.key_clauses?.map((clause: string, idx: number) => (
                              <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm text-white/80 leading-relaxed">
                                {clause}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-white/10">
                          <div className="flex gap-3">
                            {aiSearchResult.searchSources?.slice(0, 3).map((source: any, idx: number) => (
                              <a 
                                key={idx} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-2 text-[10px] text-white/40 hover:text-white transition-all bg-white/5 px-3 py-1.5 rounded-full"
                              >
                                <ExternalLink size={12} />
                                {source.title?.slice(0, 20)}...
                              </a>
                            ))}
                          </div>
                          <button 
                            onClick={async () => {
                              setCrawlLoading(true);
                              try {
                                const res = await fetch('/api/regulations/import-ai', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(aiSearchResult)
                                });
                                if (res.ok) {
                                  alert("AI 匹配法规已成功导入规范象库");
                                  setAiSearchResult(null);
                                  fetchRegulations();
                                } else {
                                  alert("导入失败，请重试");
                                }
                              } catch (error) {
                                console.error("Import Error:", error);
                                alert("导入过程中发生错误");
                              } finally {
                                setCrawlLoading(false);
                              }
                            }}
                            disabled={crawlLoading}
                            className="px-8 py-2.5 bg-white text-[#1A1A1A] rounded-full text-sm font-bold hover:bg-amber-400 transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            {crawlLoading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                            一键入库
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-4 space-y-4">
                    <div className="bg-white rounded-[32px] border border-[#1A1A1A]/5 shadow-sm overflow-hidden">
                      <div className="p-4 bg-[#F5F5F2] border-bottom border-[#D9D5CC]/30">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C877C]">法规列表</span>
                      </div>
                        <div className="max-h-[600px] overflow-y-auto">
                        {regulations.map((reg) => (
                          <div 
                            key={reg.id}
                            onClick={async () => {
                              const res = await fetch(`/api/regulations/${reg.id}`);
                              const data = await res.json();
                              setSelectedReg(data);
                            }}
                            className={cn(
                              "p-4 border-b border-[#1A1A1A]/5 cursor-pointer transition-all hover:bg-[#F5F5F2]",
                              selectedReg?.id === reg.id && "bg-[#6B6A4C]/5 border-l-4 border-l-[#6B6A4C]"
                            )}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="px-2 py-0.5 bg-[#6B6A4C]/10 text-[#6B6A4C] text-[10px] font-bold rounded">
                                {reg.discipline}
                              </span>
                              <span className="text-[10px] text-[#8C877C]">{reg.publish_date || '未知日期'}</span>
                            </div>
                            <h4 className="font-bold text-sm text-[#1A1A1A] line-clamp-2">{reg.title}</h4>
                            <p className="text-[10px] text-[#8C877C] mt-1">{reg.regulation_number}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-8">
                    {selectedReg ? (
                      <div className="bg-white rounded-[32px] border border-[#1A1A1A]/5 shadow-sm min-h-[600px] flex flex-col">
                        <div className="p-8 border-b border-[#D9D5CC]/30">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">{selectedReg.title}</h3>
                            <a 
                              href={selectedReg.detail_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-2 bg-[#F5F5F2] rounded-xl text-[#6B6A4C] hover:bg-[#6B6A4C] hover:text-white transition-all"
                            >
                              <Maximize2 size={18} />
                            </a>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 bg-[#F5F5F2] rounded-2xl">
                              <p className="text-[10px] font-bold text-[#8C877C] uppercase tracking-widest mb-1">法规编号</p>
                              <p className="text-xs font-bold">{selectedReg.regulation_number || 'N/A'}</p>
                            </div>
                            <div className="p-3 bg-[#F5F5F2] rounded-2xl">
                              <p className="text-[10px] font-bold text-[#8C877C] uppercase tracking-widest mb-1">生效状态</p>
                              <p className="text-xs font-bold text-emerald-600">{selectedReg.status}</p>
                            </div>
                            <div className="p-3 bg-[#F5F5F2] rounded-2xl">
                              <p className="text-[10px] font-bold text-[#8C877C] uppercase tracking-widest mb-1">发布机关</p>
                              <p className="text-xs font-bold">{selectedReg.issuing_authority || '官方发布'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 p-8 overflow-y-auto max-h-[500px] space-y-4">
                          {selectedReg.articles && selectedReg.articles.length > 0 ? (
                            selectedReg.articles.map((art: any, idx: number) => (
                              <div key={idx} className="p-5 bg-[#F5F5F2] rounded-2xl border border-[#D9D5CC]/30">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-[10px] font-bold text-[#6B6A4C] uppercase tracking-widest">
                                    {art.article_number || `条文 ${idx + 1}`}
                                  </span>
                                  {art.chapter_title && (
                                    <span className="text-[10px] text-[#8C877C] font-medium italic">
                                      {art.chapter_title}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-[#1A1A1A]/80 leading-relaxed">{art.article_text}</p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-20">
                              <p className="text-sm text-[#8C877C]">暂无结构化条文内容</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-[32px] border border-[#1A1A1A]/5 shadow-sm min-h-[600px] flex flex-col items-center justify-center text-center p-12">
                        <div className="w-20 h-20 bg-[#F5F5F2] rounded-full flex items-center justify-center text-[#D9D5CC] mb-6">
                          <Database size={40} />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">请选择法规</h3>
                        <p className="text-sm text-[#8C877C] mt-2 max-w-xs">从左侧列表中选择一个法规文件以查看其详细信息和结构化条文内容。</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activePage === 'official_collection_engine' && (
              <motion.div 
                key="official_collection_engine"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-5xl mx-auto space-y-6"
              >
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">官方采集引擎</h2>
                    <p className="text-sm text-[#8C877C] mt-1">自动巡检官方数据源，采集并解析最新法规条文</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => fetchLogs()}
                      className="p-3 bg-white border border-[#D9D5CC] rounded-2xl text-[#1A1A1A] hover:bg-[#F5F5F2] transition-all"
                    >
                      <Activity size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-1 space-y-6">
                    <div className="bg-[#1A1A1A] p-6 rounded-[32px] text-white shadow-xl">
                      <h4 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">快速采集任务</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">目标网址 URL</label>
                          <input 
                            type="text" 
                            placeholder="输入法规详情页网址..."
                            className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-2xl text-sm outline-none focus:border-white/30"
                          />
                        </div>
                        <button 
                          onClick={() => handleRunCollection(1)}
                          disabled={crawlLoading}
                          className="w-full py-3 bg-[#6B6A4C] text-white rounded-2xl text-sm font-bold hover:bg-[#5A593F] transition-all flex items-center justify-center gap-2"
                        >
                          {crawlLoading ? <Loader2 size={18} className="animate-spin" /> : <Cpu size={18} />}
                          立即执行采集
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-[#1A1A1A]/5 shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#8C877C] mb-4">采集统计</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#1A1A1A]/60">本周采集数</span>
                          <span className="font-bold">12</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#1A1A1A]/60">解析成功率</span>
                          <span className="font-bold text-emerald-600">98.5%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#1A1A1A]/60">待处理异常</span>
                          <span className="font-bold text-amber-600">2</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="bg-white rounded-[32px] border border-[#1A1A1A]/5 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-[#D9D5CC]/30 flex justify-between items-center">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#8C877C]">最近采集日志</h4>
                        <span className="text-[10px] text-[#8C877C]">显示最近 50 条记录</span>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[#F5F5F2] text-[10px] font-bold uppercase tracking-widest text-[#8C877C]">
                            <tr>
                              <th className="px-6 py-4">来源</th>
                              <th className="px-6 py-4">状态</th>
                              <th className="px-6 py-4">发现条文</th>
                              <th className="px-6 py-4">耗时</th>
                              <th className="px-6 py-4">时间</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1A1A1A]/5">
                            {collectionLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-[#F5F5F2]/50 transition-colors">
                                <td className="px-6 py-4 font-medium">{log.source_name}</td>
                                <td className="px-6 py-4">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                    log.task_status === 'success' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                  )}>
                                    {log.task_status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-mono">{log.items_found}</td>
                                <td className="px-6 py-4 text-[#8C877C]">1.2s</td>
                                <td className="px-6 py-4 text-[#8C877C] text-xs">
                                  {new Date(log.started_at).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activePage === 'source_management' && (
              <motion.div 
                key="source_management"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-5xl mx-auto space-y-6"
              >
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">法规源管理</h2>
                    <p className="text-sm text-[#8C877C] mt-1">配置官方数据来源、采集规则与同步频率</p>
                  </div>
                  <button 
                    onClick={() => setShowSourceModal(true)}
                    className="px-6 py-3 bg-[#1A1A1A] text-white rounded-2xl text-sm font-bold hover:bg-black transition-all flex items-center gap-2"
                  >
                    <Plus size={18} />
                    添加法规源
                  </button>
                </div>

                <div className="grid gap-4">
                  {sources.map((source) => (
                    <div key={source.id} className="bg-white p-6 rounded-[28px] border border-[#1A1A1A]/5 shadow-sm flex justify-between items-center group hover:border-[#6B6A4C]/30 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-[#F5F5F2] rounded-2xl flex items-center justify-center text-[#6B6A4C]">
                          <Building2 size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-[#1A1A1A]">{source.source_name}</h4>
                            <span className="px-2 py-0.5 bg-[#6B6A4C]/10 text-[#6B6A4C] text-[10px] font-bold rounded uppercase">
                              {source.discipline}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] text-[#8C877C] uppercase tracking-widest font-bold">
                            <span>{source.official_domain}</span>
                            <span>•</span>
                            <span>{source.country_region}</span>
                            <span>•</span>
                            <span>{source.update_frequency}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-4">
                          <p className="text-[10px] font-bold text-[#8C877C] uppercase tracking-widest mb-1">最后巡检</p>
                          <p className="text-xs font-medium">{source.last_checked_at ? new Date(source.last_checked_at).toLocaleDateString() : '从未巡检'}</p>
                        </div>
                        <button className="p-3 bg-[#F5F5F2] rounded-xl text-[#1A1A1A]/40 hover:bg-[#1A1A1A] hover:text-white transition-all">
                          <Settings size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {showSourceModal && (
                  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden"
                    >
                      <div className="p-8 border-b border-[#D9D5CC]/30 flex justify-between items-center">
                        <h3 className="font-serif text-2xl font-bold">新增法规源</h3>
                        <button onClick={() => setShowSourceModal(false)} className="p-2 hover:bg-[#F5F5F2] rounded-full transition-all">
                          <X size={20} />
                        </button>
                      </div>
                      <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8C877C]">来源名称</label>
                            <input 
                              type="text" 
                              value={newSource.source_name}
                              onChange={(e) => setNewSource({...newSource, source_name: e.target.value})}
                              className="w-full px-4 py-3 bg-[#F5F5F2] border border-[#D9D5CC]/50 rounded-2xl text-sm outline-none focus:border-[#6B6A4C]"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8C877C]">官方域名</label>
                            <input 
                              type="text" 
                              value={newSource.official_domain}
                              onChange={(e) => setNewSource({...newSource, official_domain: e.target.value})}
                              className="w-full px-4 py-3 bg-[#F5F5F2] border border-[#D9D5CC]/50 rounded-2xl text-sm outline-none focus:border-[#6B6A4C]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8C877C]">国家/地区</label>
                            <select 
                              value={newSource.country_region}
                              onChange={(e) => setNewSource({...newSource, country_region: e.target.value})}
                              className="w-full px-4 py-3 bg-[#F5F5F2] border border-[#D9D5CC]/50 rounded-2xl text-sm outline-none focus:border-[#6B6A4C]"
                            >
                              <option>中国大陆</option>
                              <option>中国香港</option>
                              <option>中国澳门</option>
                              <option>中国台湾</option>
                              <option>国际通用</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8C877C]">专业分类</label>
                            <select 
                              value={newSource.discipline}
                              onChange={(e) => setNewSource({...newSource, discipline: e.target.value})}
                              className="w-full px-4 py-3 bg-[#F5F5F2] border border-[#D9D5CC]/50 rounded-2xl text-sm outline-none focus:border-[#6B6A4C]"
                            >
                              <option>综合</option>
                              <option>建筑</option>
                              <option>结构</option>
                              <option>消防</option>
                              <option>给排水</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="p-8 bg-[#F5F5F2] flex justify-end gap-4">
                        <button onClick={() => setShowSourceModal(false)} className="px-6 py-2 text-sm font-bold text-[#8C877C]">取消</button>
                        <button 
                          onClick={handleAddSource}
                          className="px-8 py-2 bg-[#1A1A1A] text-white rounded-full text-sm font-bold hover:bg-black transition-all"
                        >
                          保存来源
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {activePage === 'review_history' && (
              <motion.div 
                key="review_history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">审查历史档案</h2>
                    <p className="text-sm text-[#8C877C] mt-1">记录所有已完成的智能审查任务与合规性报告</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-serif font-bold text-[#6B6A4C]">{history.length}</p>
                    <p className="text-[10px] font-bold uppercase text-[#8C877C] tracking-widest">Total Records</p>
                  </div>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-32 bg-white rounded-[32px] border-2 border-dashed border-[#D9D5CC] flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-[#F5F5F2] rounded-full flex items-center justify-center text-[#D9D5CC] mb-4">
                      <History size={32} />
                    </div>
                    <p className="text-[#8C877C] font-medium">暂无历史审查记录</p>
                    <button 
                      onClick={() => {
                        setActiveCategory('inspection_center');
                        setActivePage('code_review');
                      }}
                      className="mt-6 px-8 py-2.5 bg-[#1A1A1A] text-white rounded-full text-xs font-bold hover:scale-105 transition-transform"
                    >
                      开始首次审查
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {history.map((item, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white p-6 rounded-[28px] border border-[#1A1A1A]/5 hover:border-[#6B6A4C]/30 transition-all group shadow-sm hover:shadow-md"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#6B6A4C]/5 rounded-2xl flex items-center justify-center text-[#6B6A4C] group-hover:bg-[#6B6A4C] group-hover:text-white transition-colors">
                              <FileText size={22} />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="px-2 py-0.5 bg-[#6B6A4C]/10 text-[#6B6A4C] text-[10px] font-bold rounded uppercase tracking-wider">
                                  {item.result.mode}
                                </span>
                                <span className="text-[10px] font-bold text-[#8C877C] uppercase tracking-widest">
                                  {new Date(item.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <h3 className="font-bold text-[#1A1A1A] line-clamp-1 group-hover:text-[#6B6A4C] transition-colors">
                                {item.input}
                              </h3>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { 
                                setResult(item.result); 
                                setActiveCategory('inspection_center');
                                setActivePage('review_report'); 
                              }}
                              className="p-2.5 bg-[#F5F5F2] hover:bg-[#6B6A4C] hover:text-white text-[#1A1A1A]/40 rounded-xl transition-all"
                              title="查看完整报告"
                            >
                              <Maximize2 size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setResult(item.result);
                                // We switch to report page briefly to trigger export, or we could implement a silent export
                                setActiveCategory('inspection_center');
                                setActivePage('review_report');
                                setTimeout(() => handleExportPDF(), 500);
                              }}
                              className="p-2.5 bg-[#F5F5F2] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A]/40 rounded-xl transition-all"
                              title="导出 PDF"
                            >
                              <Download size={18} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="pl-16">
                          <div className="p-4 bg-[#F5F5F2] rounded-2xl border border-[#D9D5CC]/30">
                            <p className="text-[10px] font-bold text-[#8C877C] uppercase tracking-widest mb-2">报告摘要 · Summary</p>
                            <p className="text-xs text-[#1A1A1A]/70 leading-relaxed line-clamp-2 italic">
                              "{getSummary(item.result)}"
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activePage === 'drawing_library' && (
              <motion.div 
                key="drawing_library"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-7xl mx-auto space-y-10"
              >
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <h2 className="font-serif text-4xl font-bold text-[#222222]">项目图像库</h2>
                    <p className="text-[#8C877C] text-sm">所有生成的建筑效果图、工程图纸及分析图记录</p>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="relative">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAA396]" />
                      <input 
                        type="text"
                        placeholder="搜索提示词或类型..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white border border-[#D9D5CC] rounded-full pl-11 pr-6 py-2.5 text-xs outline-none w-64 focus:ring-2 focus:ring-[#6B6A4C]/20 shadow-sm"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        if (confirm("确定要清空所有图像历史记录吗？")) {
                          setImageHistory([]);
                        }
                      }}
                      className="text-[10px] font-bold uppercase text-red-500/60 hover:text-red-500 transition-colors"
                    >
                      清空记录
                    </button>
                    <div className="text-right border-l border-[#D9D5CC] pl-8">
                      <p className="text-3xl font-serif font-bold text-[#6B6A4C]">{imageHistory.length}</p>
                      <p className="text-[10px] font-bold uppercase text-[#AAA396] tracking-widest">Total Assets</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
                  {/* Tag Sidebar */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8C877C] mb-4">自动分类标签</h3>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => setSelectedLibraryTag(null)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all",
                            selectedLibraryTag === null ? "bg-[#6B6A4C] text-white shadow-md" : "bg-[#F1EFEB] text-[#8C877C] hover:bg-[#D9D5CC]"
                          )}
                        >
                          全部图像
                        </button>
                        {Array.from(new Set(imageHistory.flatMap(item => item.selectedTags || []))).map(tag => (
                          <button 
                            key={tag}
                            onClick={() => setSelectedLibraryTag(tag === selectedLibraryTag ? null : tag)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all",
                              selectedLibraryTag === tag ? "bg-[#6B6A4C] text-white shadow-md" : "bg-[#F1EFEB] text-[#8C877C] hover:bg-[#D9D5CC]"
                            )}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-5 bg-[#F5F5F2] rounded-[24px] border border-[#D9D5CC]/30">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8C877C] mb-3">库统计</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#AAA396]">效果图</span>
                          <span className="font-bold">{imageHistory.filter(i => i.outputType === 'render').length}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#AAA396]">图纸</span>
                          <span className="font-bold">{imageHistory.filter(i => i.outputType === 'drawing').length}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#AAA396]">分析图</span>
                          <span className="font-bold">{imageHistory.filter(i => i.outputType === 'analysis').length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Grid */}
                  <div className="space-y-6">
                    {imageHistory.length === 0 ? (
                      <div className="text-center py-40 bg-[#FCFBF8] rounded-[32px] border-2 border-dashed border-[#D9D5CC]">
                        <div className="w-20 h-20 bg-[#F1EFEB] rounded-full flex items-center justify-center mx-auto mb-6 text-[#AAA396]">
                          <ImageIcon size={40} />
                        </div>
                        <p className="text-[#8C877C] font-medium">暂无生成的图像记录</p>
                        <button 
                          onClick={() => {
                            setActiveCategory('creation_workshop');
                            setActivePage('creation_workshop');
                          }}
                          className="mt-6 px-8 py-3 bg-[#6B6A4C] text-white rounded-full text-sm font-bold shadow-lg shadow-[#6B6A4C]/20 hover:scale-105 transition-transform"
                        >
                          去生成第一张图像 →
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {imageHistory
                          .filter(item => {
                            const matchesSearch = item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                               (item.outputType || '').toLowerCase().includes(searchQuery.toLowerCase());
                            const matchesTag = !selectedLibraryTag || (item.selectedTags || []).includes(selectedLibraryTag);
                            return matchesSearch && matchesTag;
                          })
                          .map((item, idx) => (
                          <motion.div 
                            key={idx}
                            layoutId={`img-${item.timestamp}`}
                            className="bg-[#FCFBF8] rounded-[28px] border border-[#D9D5CC]/30 overflow-hidden shadow-soft hover:shadow-xl transition-all group"
                          >
                            <div className="relative aspect-[4/5] overflow-hidden bg-[#F1EFEB] cursor-pointer" onClick={() => setPreviewImage(item.img)}>
                              <img 
                                src={item.img} 
                                alt={item.prompt} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setPreviewImage(item.img); }}
                                  className="p-4 bg-white rounded-full text-[#111111] hover:scale-110 transition-transform shadow-xl"
                                >
                                  <Maximize2 size={24} />
                                </button>
                                <a 
                                  href={item.img} 
                                  download={`kndi-asset-${item.timestamp}.png`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-4 bg-white rounded-full text-[#111111] hover:scale-110 transition-transform shadow-xl"
                                >
                                  <Download size={24} />
                                </a>
                              </div>
                              <div className="absolute top-5 left-5 flex gap-2">
                                <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                                  {item.aspectRatio}
                                </span>
                                <span className="px-3 py-1.5 bg-[#6B6A4C]/80 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                                  {item.outputType === 'render' ? '效果图' : item.outputType === 'drawing' ? '图纸' : item.outputType === 'analysis' ? '分析图' : '概念图'}
                                </span>
                              </div>
                            </div>
                            <div className="p-6 space-y-4">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold text-[#AAA396] uppercase tracking-widest">
                                  {new Date(item.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs font-medium text-[#4A463D] line-clamp-2 leading-relaxed">
                                {item.prompt}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {item.selectedTags?.slice(0, 3).map((tag: string) => (
                                  <span key={tag} className="px-2 py-1 bg-[#F1EFEB] text-[#8C877C] text-[8px] font-bold rounded-full">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                              <div className="pt-2 flex gap-3">
                                <button 
                                  onClick={() => handleAnalyzeDrawing(item.img)}
                                  className="flex-1 py-2.5 bg-[#F1EFEB] hover:bg-[#6B6A4C] hover:text-white text-[#6B6A4C] rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm"
                                >
                                  AI 智能分析
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activePage === 'creation_workshop' && (
              <motion.div 
                key="creation_workshop"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-[1120px] mx-auto"
              >
                <div className="bg-white rounded-[32px] shadow-soft border border-[#D9D5CC]/30 overflow-hidden">
                  {/* Card Header */}
                  <div className="px-8 py-6 border-b border-[#D9D5CC]/30 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#1A1A1A]/5 rounded-2xl flex items-center justify-center text-[#1A1A1A]">
                        <Sparkles size={24} />
                      </div>
                      <div>
                        <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">图像生成工作台</h2>
                        <p className="text-[10px] text-[#8C877C] uppercase tracking-widest font-bold">Architectural Intelligence Generation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-[#F5F5F2] p-1 rounded-full">
                      {["1:1", "16:9", "9:16", "4:3", "3:4"].map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setAspectRatio(ratio)}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap",
                            aspectRatio === ratio ? "bg-[#1A1A1A] text-white shadow-sm" : "text-[#8C877C] hover:text-[#1A1A1A]"
                          )}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-hide">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Step 1: Output Type */}
                      <section className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C877C]">STEP 1: 选择输出类型</h3>
                        </div>
                        <div className="flex gap-1.5 bg-[#F5F5F2] p-1 rounded-full w-fit">
                          {[
                            { label: "效果图渲染", value: "render" },
                            { label: "图纸生成", value: "drawing" },
                            { label: "分析图生成", value: "analysis" },
                            { label: "概念图生成", value: "concept" }
                          ].map((type) => (
                            <button
                              key={type.value}
                              onClick={() => {
                                setOutputType(type.value as any);
                              }}
                              className={cn(
                                "px-5 py-2 rounded-full text-[11px] font-bold transition-all",
                                outputType === type.value ? "bg-[#1A1A1A] text-white shadow-md" : "text-[#1A1A1A]/60 hover:bg-black/5"
                              )}
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </section>

                      {/* Step 2: Prompt & Reference Images */}
                      <section 
                        className={cn(
                          "space-y-4 p-6 rounded-[28px] transition-all border-2 border-transparent",
                          dragOverIdx === -1 ? "bg-[#6B6A4C]/5 border-[#6B6A4C] scale-[1.01]" : "bg-[#F5F5F2]"
                        )}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverIdx(-1);
                        }}
                        onDragLeave={() => setDragOverIdx(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverIdx(null);
                          const file = e.dataTransfer.files?.[0];
                          if (file && file.type.startsWith('image/')) {
                            // Find first empty slot or overwrite first
                            const firstEmpty = [0, 1, 2, 3].find(i => !referenceImages[i]) ?? 0;
                            handleReferenceDrop(file, firstEmpty);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C877C]">STEP 2: 输入生成描述与参考图</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#AAA396]">{referenceImages.filter(Boolean).length}/4 参考图</span>
                            <button 
                              onClick={() => renderInputRef.current?.click()}
                              className="p-1.5 bg-white rounded-full text-[#6B6A4C] hover:bg-[#6B6A4C] hover:text-white transition-all shadow-sm"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="relative group">
                          <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={
                              outputType === 'render' ? "输入您的效果图需求...（例如：现代主义风格的湖边别墅，黄昏光影，大面积落地窗，混凝土与木材材质，电影感构图，高端建筑摄影）" :
                              outputType === 'drawing' ? "输入您的图纸生成需求...（例如：生成一层平面图，包含客厅、餐厅、厨房、主卧、两间次卧、两卫，现代简洁布局，黑白 CAD 风格）" :
                              outputType === 'analysis' ? "输入您的分析图需求...（例如：生成商业综合体首层功能分析图，区分主入口、交通流线、公共空间、店铺分区，使用清晰的建筑分析表达方式）" :
                              "输入您的概念图需求...（例如：生成一个滨水文化中心的概念草图，体块轻盈漂浮，具有公共平台与大屋顶，强调未来感与地域性融合）"
                            }
                            className="w-full h-32 bg-white/50 rounded-[20px] p-5 text-sm font-medium outline-none border-none resize-none focus:ring-2 focus:ring-[#6B6A4C]/20 transition-all pr-12"
                          />
                          <div className="absolute bottom-4 right-4 flex items-center gap-2">
                            <button
                              onClick={handleOptimizePrompt}
                              disabled={!input || isOptimizing}
                              className="p-2 bg-white/80 backdrop-blur-sm rounded-xl text-[#6B6A4C] hover:bg-[#6B6A4C] hover:text-white transition-all shadow-sm disabled:opacity-50 group/opt"
                              title="AI 自动优化提示词"
                            >
                              {isOptimizing ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Sparkles size={16} className="group-hover/opt:scale-110 transition-transform" />
                              )}
                            </button>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <p className="text-[10px] text-[#AAA396] font-bold">支持拖拽图片作为参考</p>
                            </div>
                          </div>
                        </div>

                        {/* Reference Images Grid inside Step 2 */}
                        <div className="grid grid-cols-4 gap-3">
                          {[0, 1, 2, 3].map((idx) => (
                            <div 
                              key={idx}
                              className={cn(
                                "aspect-square rounded-[18px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group relative",
                                referenceImages[idx] ? "border-[#6B6A4C] bg-white shadow-sm" : "border-[#D8D3C8] bg-white/30 hover:bg-white/50",
                                dragOverIdx === idx && "border-[#6B6A4C] bg-[#6B6A4C]/5 scale-[1.02]"
                              )}
                              onClick={() => {
                                if (!referenceImages[idx]) {
                                  renderInputRef.current?.click();
                                  (renderInputRef.current as any).targetIdx = idx;
                                }
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDragOverIdx(idx);
                              }}
                              onDragLeave={() => setDragOverIdx(null)}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDragOverIdx(null);
                                const file = e.dataTransfer.files?.[0];
                                if (file && file.type.startsWith('image/')) {
                                  handleReferenceDrop(file, idx);
                                }
                              }}
                            >
                              {referenceImages[idx] ? (
                                <>
                                  <img src={referenceImages[idx].preview} className="w-full h-full object-cover" alt={`ref-${idx}`} />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-2">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setReferenceImages(prev => prev.filter((_, i) => i !== idx)); }}
                                      className="p-1.5 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                  <div className="absolute bottom-1 left-1 right-1 bg-white/90 backdrop-blur-sm rounded-lg p-1">
                                    <div className="flex justify-between text-[7px] font-bold text-[#6B6A4C] mb-0.5 px-1">
                                      <span>权重</span>
                                      <span>{referenceImages[idx].weight}</span>
                                    </div>
                                    <input 
                                      type="range" 
                                      min="0" max="1" step="0.1" 
                                      value={referenceImages[idx].weight}
                                      onChange={(e) => {
                                        const newRefs = [...referenceImages];
                                        newRefs[idx].weight = parseFloat(e.target.value);
                                        setReferenceImages(newRefs);
                                      }}
                                      className="w-full h-1 bg-[#D9D5CC] rounded-full appearance-none accent-[#6B6A4C]"
                                    />
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <ImageIcon size={14} className="text-[#AAA396]" />
                                  <span className="text-[8px] font-bold text-[#AAA396]">参考图 {idx + 1}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Step 3: Style Selector */}
                      <section className="bg-white p-5 rounded-[22px] border border-[#D9D5CC]/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C877C]">STEP 3: 风格 / 表达方式</h3>
                          <div className="relative">
                            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AAA396]" />
                            <input 
                              type="text"
                              placeholder="搜索风格标签"
                              className="bg-[#F1EFEB] rounded-full pl-8 pr-3 py-1 text-[10px] outline-none w-40 focus:ring-2 focus:ring-[#6B6A4C]/20"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                            {(outputType === 'render' ? ["写实摄影", "插画风格", "艺术绘画", "3D渲染", "风格化艺术", "建筑专用"] :
                              outputType === 'drawing' ? ["技术图示", "图纸表达", "信息表达", "专业制图"] :
                              outputType === 'analysis' ? ["分析表达", "信息图示", "体块研究", "建筑策略"] :
                              ["概念表达", "艺术氛围", "手绘草图", "未来叙事"]
                            ).map((cat) => (
                              <button
                                key={cat}
                                onClick={() => setStyleCategory(cat)}
                                className={cn(
                                  "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap",
                                  styleCategory === cat ? "bg-[#6B6A4C] text-white shadow-sm" : "bg-[#EFECE5] text-[#4A463D] hover:bg-black/5"
                                )}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto scrollbar-hide">
                            {(
                              outputType === 'render' ? {
                                "写实摄影": ["电影感摄影", "纪实摄影", "产品摄影", "建筑摄影", "时尚摄影", "超写实"],
                                "插画风格": ["概念艺术", "奇幻插画", "绘本插画", "扁平插画", "矢量插画", "编辑插画"],
                                "艺术绘画": ["油画", "水彩", "水墨", "印象派", "表现主义", "古典绘画"],
                                "3D渲染": ["写实CG", "风格化3D", "卡通3D", "游戏引擎渲染", "产品渲染", "建筑可视化"],
                                "风格化艺术": ["赛博朋克", "蒸汽波", "超 surrealism", "故障艺术", "迷幻艺术", "复古未来"],
                                "建筑专用": ["现代极简", "黄昏氛围", "高端住宅", "商业综合体", "豪宅表现", "参数化建筑", "自然材质", "玻璃幕墙"]
                              } :
                              outputType === 'drawing' ? {
                                "技术图示": ["蓝图风格", "等轴测图", "爆炸结构图", "信息图表", "科幻界面"],
                                "图纸表达": ["黑白线稿", "CAD风格", "总平面图", "平面图表达", "立面图表达", "剖面图表达", "轴测图", "节点详图"],
                                "信息表达": ["图文混排", "标注增强", "尺寸表达", "功能分区", "编号系统", "图例系统"],
                                "专业制图": ["审图级表达", "施工图表达", "方案图表达", "报批图表达", "技术说明页", "多图拼版"]
                              } :
                              outputType === 'analysis' ? {
                                "分析表达": ["功能分析图", "流线分析图", "体块分析图", "日照分析图", "视线分析图", "分期分析图"],
                                "信息图示": ["图标化表达", "高对比信息图", "色块分析", "图例说明", "数据标注", "简洁图表"],
                                "体块研究": ["生成逻辑", "退台分析", "形体切割", "体量叠加", "轴线关系", "结构秩序"],
                                "建筑策略": ["场地响应", "交通组织", "公共界面", "景观渗透", "功能复合", "生态策略"]
                              } :
                              {
                                "概念表达": ["概念草图", "意向拼贴", "体块构想", "建筑叙事", "空间意境", "方案雏形"],
                                "艺术氛围": ["梦幻氛围", "诗性空间", "戏剧光影", "朦胧材质", "展览感", "未来诗学"],
                                "手绘草图": ["铅笔草图", "马克笔草图", "建筑手绘", "线稿草图", "水彩草图", "草模表达"],
                                "未来叙事": ["未来城市", "科技感建筑", "太空栖居", "复古未来", "乌托邦场景", "实验建筑"]
                              }
                            )[styleCategory as any]?.map((tag: string) => (
                              <button
                                key={tag}
                                onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                                className={cn(
                                  "px-2.5 py-1 rounded-full text-[10px] font-bold transition-all",
                                  selectedTags.includes(tag) ? "bg-[#6B6A4C] text-white shadow-sm" : "bg-[#EFECE5] text-[#4A463D] hover:bg-black/5"
                                )}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </section>

                      {/* Step 4: Type Selector */}
                      {outputType !== 'render' && (
                        <section className="space-y-3">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C877C]">
                            STEP 4: {outputType === 'drawing' ? '图纸类型选择' : outputType === 'analysis' ? '分析图类型选择' : '概念图类型选择'}
                          </h3>
                          <div className="flex flex-wrap gap-1.5">
                            {(
                              outputType === 'drawing' ? [
                                { label: "总平面图", value: "site_plan" },
                                { label: "平面图", value: "floor_plan" },
                                { label: "立面图", value: "elevation" },
                                { label: "剖面图", value: "section" },
                                { label: "轴测图", value: "axonometric" },
                                { label: "爆炸图", value: "exploded" },
                                { label: "节点详图", value: "detail" },
                                { label: "多图排版", value: "multi_sheet" }
                              ] :
                              outputType === 'analysis' ? [
                                { label: "功能分析图", value: "function_analysis" },
                                { label: "流线分析图", value: "circulation_analysis" },
                                { label: "体块分析图", value: "massing_analysis" },
                                { label: "日照分析图", value: "sunlight_analysis" },
                                { label: "视线分析图", value: "view_analysis" },
                                { label: "分期分析图", value: "phase_analysis" }
                              ] :
                              [
                                { label: "概念草图", value: "concept_sketch" },
                                { label: "意向拼贴", value: "mood_collage" },
                                { label: "体块构想", value: "massing_concept" },
                                { label: "空间意境", value: "spatial_mood" },
                                { label: "方案雏形", value: "scheme_seed" },
                                { label: "未来叙事图", value: "future_narrative" }
                              ]
                            ).map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => {
                                  const setter = outputType === 'drawing' ? setDrawingTypes : outputType === 'analysis' ? setAnalysisTypes : setConceptTypes;
                                  const current = outputType === 'drawing' ? drawingTypes : outputType === 'analysis' ? analysisTypes : conceptTypes;
                                  setter(current.includes(opt.value) ? current.filter(v => v !== opt.value) : [...current, opt.value]);
                                }}
                                className={cn(
                                  "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all",
                                  (outputType === 'drawing' ? drawingTypes : outputType === 'analysis' ? analysisTypes : conceptTypes).includes(opt.value) 
                                    ? "bg-[#6B6A4C] text-white shadow-sm" 
                                    : "bg-[#EFECE5] text-[#4A463D] hover:bg-black/5"
                                )}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Generation Preview Window */}
                      <section className="bg-white rounded-[24px] border border-[#D9D5CC]/30 overflow-hidden shadow-soft flex flex-col h-full min-h-[400px]">
                        <div className="px-5 py-4 border-b border-[#D9D5CC]/30 bg-[#F8F6F1] flex items-center justify-between">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C877C]">实时生成预览</h3>
                          {generatedImages.length > 0 && (
                            <span className="text-[9px] font-bold text-[#6B6A4C] bg-[#6B6A4C]/10 px-2 py-0.5 rounded-full">
                              已生成 {generatedImages.length} 张
                            </span>
                          )}
                        </div>
                        <div className="flex-1 p-4 flex items-center justify-center bg-[#F1EFEB]/30 relative group">
                          {imageLoading ? (
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-12 h-12 border-4 border-[#6B6A4C]/20 border-t-[#6B6A4C] rounded-full animate-spin" />
                              <p className="text-[10px] font-bold text-[#6B6A4C] animate-pulse">{generationStatus || "AI 正在构思中..."}</p>
                            </div>
                          ) : generatedImages.length > 0 ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <img 
                                src={generatedImages[generatedImages.length - 1]} 
                                alt="Latest Result" 
                                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                                referrerPolicy="no-referrer"
                              />
                              
                              {/* Annotation Overlay */}
                              {annotations.length > 0 && outputType === 'drawing' && (
                                <AnnotationOverlay annotations={annotations} />
                              )}

                              {/* Annotation Input Modal */}
                              <AnimatePresence>
                                {showAnnotationInput && (
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
                                  >
                                    <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-6 space-y-4 border border-[#D9D5CC]/30">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[#6B6A4C]">
                                          <Sparkles size={16} />
                                          <h4 className="text-xs font-bold uppercase tracking-widest">AI 辅助标注</h4>
                                        </div>
                                        <button onClick={() => setShowAnnotationInput(false)} className="text-[#AAA396] hover:text-[#1A1A1A]">
                                          <X size={16} />
                                        </button>
                                      </div>
                                      <p className="text-[10px] text-[#8C877C] leading-relaxed">
                                        请输入您想要标注的构件描述（如：标注所有承重墙和楼梯），AI 将尝试自动识别并添加规范标注。
                                      </p>
                                      <textarea 
                                        value={annotationPrompt}
                                        onChange={(e) => setAnnotationPrompt(e.target.value)}
                                        placeholder="例如：标注承重墙、电梯井和楼梯..."
                                        className="w-full h-24 bg-[#F5F5F2] rounded-2xl p-4 text-xs font-medium outline-none border border-transparent focus:border-[#6B6A4C]/30 resize-none"
                                      />
                                      <button 
                                        onClick={handleAiAnnotate}
                                        disabled={!annotationPrompt.trim() || isAnnotating}
                                        className="w-full py-3 bg-[#1A1A1A] text-white rounded-2xl text-xs font-bold hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                      >
                                        {isAnnotating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                        {isAnnotating ? "正在识别标注..." : "开始标注"}
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button 
                                  onClick={() => setPreviewImage(generatedImages[generatedImages.length - 1])}
                                  className="p-3 bg-white rounded-full text-[#111111] hover:scale-110 transition-transform shadow-lg"
                                  title="放大预览"
                                >
                                  <Maximize2 size={20} />
                                </button>
                                <button 
                                  onClick={() => setRefiningIdx(generatedImages.length - 1)}
                                  className="p-3 bg-white rounded-full text-[#111111] hover:scale-110 transition-transform shadow-lg"
                                  title="二次编辑"
                                >
                                  <Pencil size={20} />
                                </button>
                                {outputType === 'drawing' && (
                                  <button 
                                    onClick={() => setShowAnnotationInput(true)}
                                    className="p-3 bg-white rounded-full text-[#6B6A4C] hover:scale-110 transition-transform shadow-lg"
                                    title="AI 辅助标注"
                                  >
                                    <Sparkles size={20} />
                                  </button>
                                )}
                                <button 
                                  onClick={() => setActivePage('drawing_library')}
                                  className="p-3 bg-white rounded-full text-[#6B6A4C] hover:scale-110 transition-transform shadow-lg"
                                  title="在图像库中查看"
                                >
                                  <Library size={20} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center space-y-3">
                              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-[#D9D5CC]">
                                <ImageIcon size={32} />
                              </div>
                              <p className="text-[10px] font-bold text-[#AAA396]">等待生成指令...</p>
                            </div>
                          )}
                        </div>
                      </section>

                      {/* Step 3: Consistency Control (Moved up) */}
                      <section className="bg-[#F8F6F1] p-5 rounded-[24px] space-y-4 border border-[#D9D5CC]/30">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C877C]">STEP 3: 一致性控制</h3>
                            <p className="text-[9px] text-[#AAA396]">保证多张图像视觉语言统一</p>
                          </div>
                          <button 
                            onClick={() => setConsistencyEnabled(!consistencyEnabled)}
                            className={cn(
                              "w-10 h-5 rounded-full transition-all relative",
                              consistencyEnabled ? "bg-[#6B6A4C]" : "bg-[#D9D5CC]"
                            )}
                          >
                            <div className={cn(
                              "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all",
                              consistencyEnabled ? "left-5.5" : "left-0.5"
                            )} />
                          </button>
                        </div>

                        {consistencyEnabled && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4 pt-1"
                          >
                            <div className="flex gap-1 bg-white/50 p-0.5 rounded-full w-fit">
                              {[
                                { label: "基础", value: "basic" },
                                { label: "严格", value: "strict" },
                                { label: "母版", value: "master_locked" }
                              ].map((level) => (
                                <button
                                  key={level.value}
                                  onClick={() => setConsistencyLevel(level.value as any)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-full text-[9px] font-bold transition-all",
                                    consistencyLevel === level.value ? "bg-[#6B6A4C] text-white" : "text-[#8C877C] hover:bg-black/5"
                                  )}
                                >
                                  {level.label}
                                </button>
                              ))}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { label: "风格", key: "style" },
                                { label: "线稿", key: "line" },
                                { label: "色彩", key: "color" },
                                { label: "标注", key: "annotation" },
                                { label: "版式", key: "layout" },
                                { label: "材质", key: "material" }
                              ].map((item) => (
                                <button
                                  key={item.key}
                                  onClick={() => setConsistencyItems(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                                  className={cn(
                                    "px-2 py-1.5 rounded-full text-[9px] font-bold border transition-all flex items-center justify-center gap-1.5",
                                    consistencyItems[item.key as keyof typeof consistencyItems] 
                                      ? "bg-[#6B6A4C]/10 border-[#6B6A4C] text-[#6B6A4C]" 
                                      : "bg-white border-[#D9D5CC] text-[#8C877C]"
                                  )}
                                >
                                  {consistencyItems[item.key as keyof typeof consistencyItems] && <CheckCircle2 size={8} />}
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </section>

                      {/* Smart Hint Panel */}
                      <section className="bg-[#F7F5F0] p-5 rounded-[24px] space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C877C]">智能提示</h3>
                        <ul className="space-y-2">
                          {[
                            "建议描述建筑类型、场景时间、材质、氛围和镜头感。",
                            "可结合“黄昏氛围”“建筑摄影”等标签提升质量。"
                          ].map((hint, i) => (
                            <li key={i} className="flex gap-1.5 text-[9px] text-[#8C877C] leading-relaxed">
                              <span className="text-[#6B6A4C]">•</span>
                              {hint}
                            </li>
                          ))}
                        </ul>
                      </section>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-6 bg-[#F8F6F1] border-t border-[#D9D5CC]/30">
                    <button 
                      onClick={() => {
                        const prompt = input;
                        if (prompt) {
                          if (outputType === 'render') handleGenerateRendering(prompt);
                          else handleGenerateImage(prompt);
                        }
                      }}
                      disabled={imageLoading}
                      className="w-full h-[54px] bg-[#111111] text-white rounded-[20px] font-bold flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-black/10"
                    >
                      {imageLoading ? <Loader2 className="animate-spin" size={18} /> : <Aperture size={18} />}
                      {imageLoading ? (generationStatus || "正在生成...") : "开始生成"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            {activePage === 'engine_config' && (
              <motion.div
                key="engine_config"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-[calc(100vh-120px)] flex bg-white rounded-[32px] border border-[#D9D5CC]/30 shadow-sm overflow-hidden"
              >
                {/* Left Sidebar */}
                <div className="w-72 border-r border-[#D9D5CC]/30 flex flex-col bg-[#FBFBF9]">
                  <div className="p-4 border-b border-[#D9D5CC]/30">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AAA396]" size={14} />
                      <input 
                        type="text"
                        placeholder="搜索模型平台..."
                        value={platformSearch}
                        onChange={(e) => setPlatformSearch(e.target.value)}
                        className="w-full h-9 bg-white border border-[#D9D5CC] rounded-lg pl-9 pr-4 text-xs outline-none focus:border-[#1A1A1A] transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredPlatforms.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => setSelectedPlatform(platform.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl transition-all group",
                          selectedPlatform === platform.id 
                            ? "bg-white shadow-sm border border-[#D9D5CC]/50" 
                            : "hover:bg-[#F5F5F2]"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-[#D9D5CC]/30 shadow-sm",
                            platform.color
                          )}>
                            <platform.icon size={16} />
                          </div>
                          <span className={cn(
                            "text-xs font-bold",
                            selectedPlatform === platform.id ? "text-[#1A1A1A]" : "text-[#8C877C]"
                          )}>
                            {platform.name}
                          </span>
                        </div>
                        <div className={cn(
                          "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
                          platformConfigs[platform.id]?.enabled 
                            ? "bg-green-50 text-green-600 border border-green-200" 
                            : "bg-gray-100 text-gray-400 border border-gray-200"
                        )}>
                          {platformConfigs[platform.id]?.enabled ? 'ON' : 'OFF'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 flex flex-col bg-white">
                  {selectedPlatform && (
                    <>
                      {/* Header */}
                      <div className="p-6 border-b border-[#D9D5CC]/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-[#1A1A1A]">
                            {platforms.find(p => p.id === selectedPlatform)?.name}
                          </h3>
                          <button className="text-[#AAA396] hover:text-[#1A1A1A] transition-colors">
                            <ExternalLink size={16} />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#8C877C] uppercase tracking-wider">
                              {platformConfigs[selectedPlatform]?.enabled ? '已启用' : '已禁用'}
                            </span>
                            <button 
                              onClick={() => setPlatformConfigs({
                                ...platformConfigs,
                                [selectedPlatform]: { ...platformConfigs[selectedPlatform], enabled: !platformConfigs[selectedPlatform].enabled }
                              })}
                              className={cn(
                                "w-10 h-5 rounded-full transition-all relative",
                                platformConfigs[selectedPlatform]?.enabled ? "bg-orange-500" : "bg-[#D9D5CC]"
                              )}
                            >
                              <div className={cn(
                                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                platformConfigs[selectedPlatform]?.enabled ? "right-1" : "left-1"
                              )} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Config Area */}
                      <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        {/* API Key Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-[#1A1A1A]">API 密钥</h4>
                              <Settings size={12} className="text-[#AAA396]" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1 relative">
                              <input 
                                type={showApiKey[selectedPlatform] ? "text" : "password"}
                                value={platformConfigs[selectedPlatform]?.apiKey}
                                onChange={(e) => setPlatformConfigs({
                                  ...platformConfigs,
                                  [selectedPlatform]: { ...platformConfigs[selectedPlatform], apiKey: e.target.value }
                                })}
                                placeholder="请输入 API 密钥..."
                                className="w-full h-11 bg-[#FBFBF9] border border-[#D9D5CC] rounded-lg px-4 text-sm outline-none focus:border-[#1A1A1A] transition-all pr-10"
                              />
                              <button 
                                onClick={() => setShowApiKey({ ...showApiKey, [selectedPlatform]: !showApiKey[selectedPlatform] })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAA396] hover:text-[#1A1A1A]"
                              >
                                {showApiKey[selectedPlatform] ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                              <button 
                                onClick={() => handleTestConnection(selectedPlatform)}
                                disabled={isTestingConnection[selectedPlatform]}
                                className="px-5 h-11 border border-[#D9D5CC] rounded-lg text-xs font-bold text-[#1A1A1A] hover:bg-[#F5F5F2] transition-all disabled:opacity-50"
                              >
                                {isTestingConnection[selectedPlatform] ? <Loader2 className="animate-spin" size={14} /> : "检测"}
                              </button>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <button className="text-blue-500 hover:underline">点击这里获取密钥</button>
                            <span className="text-[#AAA396]">多个密钥使用逗号分隔</span>
                          </div>
                        </div>

                        {/* API Endpoint Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#1A1A1A]">API 地址</h4>
                            <div className="w-3 h-3 rounded-full border border-[#AAA396] flex items-center justify-center text-[8px] text-[#AAA396]">?</div>
                          </div>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={platformConfigs[selectedPlatform]?.endpoint}
                              onChange={(e) => setPlatformConfigs({
                                ...platformConfigs,
                                [selectedPlatform]: { ...platformConfigs[selectedPlatform], endpoint: e.target.value }
                              })}
                              className="flex-1 h-11 bg-[#FBFBF9] border border-[#D9D5CC] rounded-lg px-4 text-sm outline-none focus:border-[#1A1A1A] transition-all"
                            />
                            <button 
                              onClick={() => setPlatformConfigs({
                                ...platformConfigs,
                                [selectedPlatform]: { ...platformConfigs[selectedPlatform], endpoint: platforms.find(p => p.id === selectedPlatform)?.id === 'google' ? 'https://generativelanguage.googleapis.com' : 'https://api.openai.com/v1' }
                              })}
                              className="px-5 h-11 border border-red-200 text-red-500 rounded-lg text-xs font-bold hover:bg-red-50 transition-all"
                            >
                              重置
                            </button>
                          </div>
                          <p className="text-[10px] text-[#AAA396]">
                            预览: <span className="font-mono">{platformConfigs[selectedPlatform]?.endpoint}/chat/completions</span>
                          </p>
                        </div>

                        {/* Models Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <h4 className="text-xs font-bold text-[#1A1A1A]">模型</h4>
                              <span className="px-2 py-0.5 bg-[#F5F5F2] rounded-full text-[10px] font-bold text-[#8C877C]">
                                {platformConfigs[selectedPlatform]?.models?.length || 0}
                              </span>
                              <Search size={12} className="text-[#AAA396]" />
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleUpdateModels(selectedPlatform)}
                                disabled={isUpdatingModels[selectedPlatform]}
                                className={cn(
                                  "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all",
                                  isUpdatingModels[selectedPlatform] 
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                    : "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200"
                                )}
                              >
                                <RefreshCw size={12} className={cn(isUpdatingModels[selectedPlatform] && "animate-spin")} />
                                {isUpdatingModels[selectedPlatform] ? "更新中..." : "联网更新"}
                              </button>
                              <button className="text-[#AAA396] hover:text-[#1A1A1A]">
                                <Activity size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {platformConfigs[selectedPlatform]?.models?.map((model: string) => (
                              <div 
                                key={model}
                                className="flex items-center justify-between p-4 bg-[#FBFBF9] border border-[#D9D5CC]/50 rounded-xl hover:border-[#D9D5CC] transition-all group cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <ChevronRight size={14} className="text-[#AAA396]" />
                                  <span className="text-xs font-bold text-[#1A1A1A]">{model}</span>
                                </div>
                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="text-[#AAA396] hover:text-[#1A1A1A]"><Settings size={14} /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-6 border-t border-[#D9D5CC]/30 flex items-center justify-between bg-[#FBFBF9]">
                        <div className="flex items-center gap-2 text-[10px] text-[#8C877C]">
                          <ShieldCheck size={14} className="text-green-600" />
                          <span>配置已加密保存至本地浏览器</span>
                        </div>
                        <div className="flex gap-3">
                          <button className="px-6 py-2 border border-[#D9D5CC] rounded-xl font-bold text-xs hover:bg-[#F5F5F2] transition-all">
                            取消
                          </button>
                          <button 
                            onClick={handleSaveConfig}
                            disabled={isSaving}
                            className="px-8 py-2 bg-[#1A1A1A] text-white rounded-xl font-bold text-xs hover:bg-black transition-all shadow-lg shadow-black/5 flex items-center gap-2"
                          >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            {isSaving ? '正在保存...' : '保存配置'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
            {/* Coming Soon Placeholder for other pages */}
            {!['code_review', 'review_report', 'review_history', 'drawing_library', 'creation_workshop', 'engine_config'].includes(activePage) && (
              <motion.div
                key="coming_soon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-40 space-y-6"
              >
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-[#6B6A4C]/20">
                  <Database size={40} />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-[#1A1A1A]">功能开发中</h3>
                  <p className="text-sm text-[#8C877C] mt-1">
                    {NAVIGATION.find(c => c.id === activeCategory)?.pages.find(p => p.id === activePage)?.name || NAVIGATION.find(c => c.id === activePage)?.name} 模块正在接入观象引擎...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Bar */}
        {activePage === 'code_review' && (
          <div className="p-8 pt-0">
            <div className="max-w-4xl mx-auto mb-4">
              <AnimatePresence>
                {uploadedFiles.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex flex-wrap gap-3 p-4 bg-white rounded-3xl border border-[#1A1A1A]/5 shadow-sm"
                  >
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="relative group cursor-pointer" onClick={() => file.type.startsWith('image/') && setPreviewImage(file.preview)}>
                        {file.type.startsWith('image/') ? (
                          <img src={file.preview} alt="upload preview" className="w-16 h-16 object-cover rounded-xl border border-[#1A1A1A]/10" />
                        ) : (
                          <div className="w-16 h-16 bg-[#F0F0ED] rounded-xl flex items-center justify-center text-[#6B6A4C]">
                            <FileText size={24} />
                          </div>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Plus size={12} className="rotate-45" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <form 
              onSubmit={handleSubmit}
              className="max-w-4xl mx-auto relative group"
            >
              <div className="absolute inset-0 bg-[#6B6A4C] blur-2xl opacity-0 group-focus-within:opacity-10 transition-opacity duration-500" />
              <div className="relative flex items-center bg-white rounded-3xl shadow-xl shadow-[#1A1A1A]/5 border border-[#1A1A1A]/5 overflow-hidden p-2">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 text-[#1A1A1A]/60 hover:bg-[#1A1A1A]/5 rounded-2xl transition-colors"
                >
                  <Plus size={20} />
                </button>
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入审查请求、合规问题或项目详情..."
                  className="flex-1 px-4 py-4 text-sm font-medium outline-none"
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-[#1A1A1A] text-white p-4 rounded-2xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 no-print"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors"
              >
                <X size={32} />
              </button>
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                referrerPolicy="no-referrer"
              />

              {/* Refinement Input Window in Preview */}
              <div className="mt-6 w-full max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-xl rounded-[24px] p-1 border border-white/20 shadow-2xl flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-3 px-4 py-2">
                    <Sparkles size={18} className="text-white/40" />
                    <input 
                      type="text"
                      value={refineInput}
                      onChange={(e) => setRefineInput(e.target.value)}
                      placeholder="输入修改建议，启用 nanobana-2 引擎进行精准重绘..."
                      className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-white/30 pr-10"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && refineInput && !imageLoading) {
                          const idx = generatedImages.indexOf(previewImage);
                          if (idx !== -1) handleRefineImage(idx);
                        }
                      }}
                    />
                    <button
                      onClick={handleOptimizeRefinePrompt}
                      disabled={!refineInput || isOptimizing}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all disabled:opacity-50"
                      title="AI 自动优化修改建议"
                    >
                      {isOptimizing ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Sparkles size={14} />
                      )}
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      const idx = generatedImages.indexOf(previewImage);
                      if (idx !== -1) handleRefineImage(idx);
                    }}
                    disabled={!refineInput || imageLoading}
                    className="h-[44px] px-6 bg-white text-[#111111] rounded-[20px] font-bold text-xs flex items-center gap-2 hover:bg-white/90 transition-all disabled:opacity-50"
                  >
                    {imageLoading ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                    {imageLoading ? "重绘中..." : "确认修改"}
                  </button>
                </div>
                <p className="text-center text-white/40 text-[10px] mt-3 uppercase tracking-widest font-medium">
                  观象引擎已启用内置 nanobana-2 深度重绘技术
                </p>
              </div>

              <div className="absolute -bottom-20 left-0 right-0 flex justify-center gap-4">
                <a
                  href={previewImage}
                  download="drawing-preview.png"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold transition-colors"
                >
                  <Download size={16} />
                  下载原图
                </a>
                <button
                  onClick={() => {
                    setReferenceImages(prev => [
                      { preview: previewImage!, data: previewImage!.split(',')[1], weight: 0.8, type: 'ref' },
                      ...prev.slice(0, 2)
                    ]);
                    setPreviewImage(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-[#111111] rounded-full text-sm font-bold hover:bg-white/90 transition-colors"
                >
                  <Plus size={16} />
                  设为参考图
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
