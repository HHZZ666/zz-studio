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
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['creation_workshop']);

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

  // AI Search State
  const [isOptimizing, setIsOptimizing] = useState(false);

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


  const NAVIGATION = [
    {
      id: "creation_workshop",
      name: "造像工坊",
      icon: Sparkles,
      pages: []
    },
    {
      id: "image_library",
      name: "图纸库",
      icon: Layers,
      pages: [
        { id: "drawing_library", name: "图纸库" },
      ]
    },
    {
      id: "system_center",
      name: "系统枢",
      icon: Settings,
      pages: [
        { id: "engine_config", name: "模型与 API 配置" },
      ]
    }
  ];

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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

  const renderInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      <input 
        type="file" 
        ref={renderInputRef} 
        onChange={handleRenderFileChange} 
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
                      activePage === 'source_management' ? [
                        "管理系统接入的官方信源，支持添加新的政府门户或行业网站。",
                        "您可以配置每个信源的采集频率（如：每日扫描、每周扫描）。",
                        "“健康状态”显示了信源链接的可访问性及数据解析的成功率。",
                        "支持对信源进行分类标签管理，方便采集引擎进行优先级调度。"
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
          </AnimatePresence>
        </div>

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
