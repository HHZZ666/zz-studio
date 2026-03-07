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
  Aperture
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateReview, generateImage } from './services/gemini';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export default function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'review' | 'history' | 'library' | 'image_generation'>('image_generation');
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
            if (el.classList.contains('bg-[#5A5A40]')) el.style.backgroundColor = '#5A5A40';
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
      setActiveTab('review');
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
      setResult(data);
      setHistory(prev => [{ input, result: data, timestamp: new Date().toISOString() }, ...prev]);
      setUploadedFiles([]); // Clear uploads after success
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
      
      const reviewResult = await generateReview(`用户请求生成${outputType === 'drawing' ? '图纸' : outputType === 'analysis' ? '分析图' : '概念图'}，请理解其复杂的工程需求并转化为专业的 CAD 绘图提示词。
      上下文信息：${context}
      用户输入：${userPrompt}`);
      
      let finalPrompt = userPrompt;
      if (reviewResult.tool_input_drawing_generator?.prompt) {
        finalPrompt = reviewResult.tool_input_drawing_generator.prompt;
        console.log("Optimized Prompt:", finalPrompt);
      }

      setGenerationStatus("正在使用 Nano Banana 2 引擎绘制图纸...");
      
      // 2. Image Generation via Flash Image
      const img = await generateImage(finalPrompt, { aspectRatio });
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

      const reviewResult = await generateReview(`用户请求生成建筑效果图，请将其自然语言描述转化为具有商业美学、专业光影和材质细节的渲染提示词。
      上下文信息：${context}
      用户输入：${userPrompt}`);
      
      let finalPrompt = userPrompt;
      if (reviewResult.tool_input_drawing_generator?.prompt) {
        finalPrompt = reviewResult.tool_input_drawing_generator.prompt;
      }

      setGenerationStatus("正在执行专业建筑渲染...");
      
      const imageParts = referenceImages.map(ref => ({
        inlineData: {
          data: ref.data,
          mimeType: "image/png"
        }
      }));

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
              className="text-xs text-[#5A5A40] underline block mt-2"
            >
              了解计费文档
            </a>
          </div>
          <button 
            onClick={handleOpenKeySelector}
            className="w-full py-4 bg-[#5A5A40] text-white rounded-2xl font-bold hover:bg-[#4A4A30] transition-all"
          >
            选择 API 密钥
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans selection:bg-[#5A5A40]/20">
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
      <aside className="fixed left-0 top-0 bottom-0 w-[252px] bg-[#F8F6F1] border-r border-[#D9D5CC] z-50 flex flex-col p-6">
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-1">
            <div className="w-12 h-12 bg-[#6B6A4C] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#6B6A4C]/20">
              <Logo className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[#222222] leading-none mb-1">观象</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C877C] font-bold">VISIONFORM</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { key: 'review', label: '智能审查', icon: LayoutDashboard },
            { key: 'history', label: '审查历史', icon: History },
            { key: 'library', label: '图纸库', icon: Layers },
            { key: 'image_generation', label: '图像生成', icon: Sparkles },
          ].map((item) => (
            <button 
              key={item.key}
              onClick={() => setActiveTab(item.key as any)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-full transition-all duration-300 group",
                activeTab === item.key ? "bg-[#6B6A4C] text-white shadow-xl shadow-[#6B6A4C]/30" : "text-[#222222] hover:bg-[#6B6A4C]/5"
              )}
            >
              <item.icon size={20} className={cn(activeTab === item.key ? "text-white" : "text-[#222222]/60 group-hover:text-[#6B6A4C]")} />
              <span className="text-sm font-bold tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="bg-[#F1EFEB] p-5 rounded-[22px] border border-[#D9D5CC]/50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C877C] mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#79815C] rounded-full animate-pulse" />
              <span className="text-xs font-bold text-[#222222]">Online & Secure</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[252px] min-h-screen flex flex-col bg-[#ECEAE4]">
        {/* Header */}
        <header className="h-20 bg-[#F1EFEB] border-b border-[#D9D5CC] flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-[#8C877C] uppercase tracking-[0.15em]">Current Mode:</span>
            <div className="px-3 py-1.5 bg-[#E7E4DB] text-[#5D5A4C] rounded-full text-[10px] font-bold tracking-widest">
              {activeTab === 'image_generation' ? outputType.toUpperCase() : (result?.mode || 'IDLE')}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="p-2.5 hover:bg-[#6B6A4C]/5 rounded-full transition-colors text-[#8C877C] hover:text-[#6B6A4C]">
              <Settings size={22} />
            </button>
            <div className="w-11 h-11 rounded-full bg-[#8A8768] border-2 border-white shadow-md" />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto" ref={scrollRef}>
          <AnimatePresence mode="wait">
            {activeTab === 'review' && (
              <motion.div 
                key="review"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                {/* Welcome / Info */}
                {!result && !loading && (
                  <div className="text-center py-20 space-y-6">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-[#1A1A1A]/5 mx-auto flex items-center justify-center">
                      <Building2 size={40} className="text-[#5A5A40]" />
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
                          <item.icon size={24} className="text-[#5A5A40]" />
                          <div>
                            <p className="font-bold text-sm">{item.label}</p>
                            <p className="text-xs text-[#1A1A1A]/50">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Result Display */}
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
                      <div className="bg-[#5A5A40] px-6 py-4 flex items-center justify-between no-print">
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
                            <div className="w-12 h-12 bg-[#5A5A40] rounded-xl flex items-center justify-center text-white">
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
                                  <Layers size={16} className="text-[#5A5A40]" />
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
                                  <ShieldCheck size={16} className="text-[#5A5A40]" />
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
                                  <MessageSquare size={16} className="text-[#5A5A40]" />
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
                                  <FileText size={16} className="text-[#5A5A40]" />
                                  法律依据
                                </h4>
                                <div className="grid gap-3">
                                  {result.structured_output.legal_basis.map((basis: any, i: number) => (
                                    <div key={i} className="p-4 border border-[#1A1A1A]/5 rounded-xl hover:bg-[#F5F5F0] transition-colors">
                                      <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs font-bold text-[#5A5A40]">{basis.doc_id} {basis.clause_id}</p>
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
                                    className="flex items-center gap-2 px-4 py-2 bg-[#5A5A40] text-white text-xs font-bold rounded-xl hover:bg-[#4A4A30] transition-all disabled:opacity-50"
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
                                          <span className="text-[10px] font-mono font-bold text-[#5A5A40]">{draw.fig}</span>
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
                                              className="p-2 bg-white rounded-full text-[#5A5A40] hover:scale-110 transition-transform"
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
                                      <p className="text-xs font-bold text-[#5A5A40]">建议措施：{issue.recommendation}</p>
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
                                          className="p-3 bg-white rounded-full text-[#5A5A40] hover:scale-110 transition-transform"
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
                              <div className="w-16 h-16 bg-[#5A5A40]/10 rounded-full flex items-center justify-center border border-[#5A5A40]/20">
                                <ShieldCheck size={32} className="text-[#5A5A40]/40" />
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

            {activeTab === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto space-y-4"
              >
                <h2 className="font-serif text-2xl font-bold mb-6">审查历史记录</h2>
                {history.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#1A1A1A]/10">
                    <p className="text-[#1A1A1A]/40">暂无历史记录</p>
                  </div>
                ) : (
                  history.map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => { setResult(item.result); setActiveTab('review'); }}
                      className="bg-white p-6 rounded-2xl border border-[#1A1A1A]/5 hover:border-[#5A5A40]/30 cursor-pointer transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                        <span className="px-2 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] text-[10px] font-bold rounded uppercase">
                          {item.result.mode}
                        </span>
                      </div>
                      <p className="font-medium text-sm line-clamp-1 group-hover:text-[#5A5A40] transition-colors">{item.input}</p>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'library' && (
              <motion.div 
                key="library"
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

                {imageHistory.length === 0 ? (
                  <div className="text-center py-40 bg-[#FCFBF8] rounded-[32px] border-2 border-dashed border-[#D9D5CC]">
                    <div className="w-20 h-20 bg-[#F1EFEB] rounded-full flex items-center justify-center mx-auto mb-6 text-[#AAA396]">
                      <ImageIcon size={40} />
                    </div>
                    <p className="text-[#8C877C] font-medium">暂无生成的图像记录</p>
                    <button 
                      onClick={() => setActiveTab('image_generation')}
                      className="mt-6 px-8 py-3 bg-[#6B6A4C] text-white rounded-full text-sm font-bold shadow-lg shadow-[#6B6A4C]/20 hover:scale-105 transition-transform"
                    >
                      去生成第一张图像 →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {imageHistory
                      .filter(item => 
                        item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (item.outputType || '').toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((item, idx) => (
                      <motion.div 
                        key={idx}
                        layoutId={`img-${item.timestamp}`}
                        className="bg-[#FCFBF8] rounded-[28px] border border-[#D9D5CC]/30 overflow-hidden shadow-soft hover:shadow-xl transition-all group"
                        draggable="true"
                        onDragStart={(e: any) => {
                          e.dataTransfer.setData("text/plain", item.img);
                          e.dataTransfer.effectAllowed = "copy";
                        }}
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
              </motion.div>
            )}

            {activeTab === 'image_generation' && (
              <motion.div 
                key="image_generation"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-[1120px] mx-auto"
              >
                <div className="bg-[#FCFBF8] rounded-[32px] shadow-soft border border-[#D9D5CC]/30 overflow-hidden">
                  {/* Card Header */}
                  <div className="px-8 py-6 border-b border-[#D9D5CC]/30 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#6B6A4C]/10 rounded-2xl flex items-center justify-center text-[#6B6A4C]">
                        <Sparkles size={24} />
                      </div>
                      <div>
                        <h2 className="font-serif text-xl font-bold text-[#222222]">图像生成工作台</h2>
                        <p className="text-[10px] text-[#8C877C] uppercase tracking-widest font-bold">Architectural Intelligence Generation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-[#F1EFEB] p-1 rounded-full">
                      {["1:1", "16:9", "9:16", "4:3", "3:4"].map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setAspectRatio(ratio)}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap",
                            aspectRatio === ratio ? "bg-[#6B6A4C] text-white shadow-sm" : "text-[#8C877C] hover:text-[#222222]"
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
                        <div className="flex gap-1.5 bg-[#F1EFEB] p-1 rounded-full w-fit">
                          {[
                            { label: "效果图渲染", value: "render" },
                            { label: "图纸生成", value: "drawing" },
                            { label: "分析图生成", value: "analysis" },
                            { label: "概念图生成", value: "concept" }
                          ].map((type) => (
                            <button
                              key={type.value}
                              onClick={() => setOutputType(type.value as any)}
                              className={cn(
                                "px-5 py-2 rounded-full text-[11px] font-bold transition-all",
                                outputType === type.value ? "bg-[#6B6A4C] text-white shadow-md" : "text-[#4A463D] hover:bg-black/5"
                              )}
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </section>

                      {/* Step 2: Prompt */}
                      <section className="space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C877C]">STEP 2: 输入生成描述</h3>
                        <textarea 
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={
                            outputType === 'render' ? "输入您的效果图需求...（例如：现代主义风格的湖边别墅，黄昏光影，大面积落地窗，混凝土与木材材质，电影感构图，高端建筑摄影）" :
                            outputType === 'drawing' ? "输入您的图纸生成需求...（例如：生成一层平面图，包含客厅、餐厅、厨房、主卧、两间次卧、两卫，现代简洁布局，黑白 CAD 风格）" :
                            outputType === 'analysis' ? "输入您的分析图需求...（例如：生成商业综合体首层功能分析图，区分主入口、交通流线、公共空间、店铺分区，使用清晰的建筑分析表达方式）" :
                            "输入您的概念图需求...（例如：生成一个滨水文化中心的概念草图，体块轻盈漂浮，具有公共平台与大屋顶，强调未来感与地域性融合）"
                          }
                          className="w-full h-32 bg-[#F1EFEB] rounded-[20px] p-5 text-sm font-medium outline-none border-none resize-none focus:ring-2 focus:ring-[#6B6A4C]/20"
                        />
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
                      {/* Step 5: Multi-Reference Upload */}
                      <section className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C877C]">STEP 5: 上传参考图</h3>
                          <span className="text-[10px] font-bold text-[#AAA396]">{referenceImages.length}/4</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[0, 1, 2, 3].map((idx) => (
                            <div 
                              key={idx}
                              className={cn(
                                "aspect-square rounded-[20px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group relative",
                                referenceImages[idx] ? "border-[#6B6A4C] bg-white shadow-sm" : "border-[#D8D3C8] bg-[#FBFAF7] hover:bg-[#F1EFEB]",
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
                                setDragOverIdx(idx);
                              }}
                              onDragLeave={() => setDragOverIdx(null)}
                              onDrop={(e) => {
                                e.preventDefault();
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
                                    <p className="text-white text-[10px] font-bold">Ref {idx + 1}</p>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setReferenceImages(prev => prev.filter((_, i) => i !== idx)); }}
                                      className="p-1.5 bg-red-500 text-white rounded-full"
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                  <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-white/90 backdrop-blur-sm rounded-xl p-1.5">
                                    <div className="flex justify-between text-[8px] font-bold text-[#6B6A4C] mb-1 px-1">
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
                                <>
                                  <Plus size={18} className="text-[#AAA396] mb-1" />
                                  <span className="text-[10px] font-bold text-[#AAA396]">参考图 {idx + 1}</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Step 6: Consistency Control */}
                      <section className="bg-[#F8F6F1] p-5 rounded-[24px] space-y-4 border border-[#D9D5CC]/30">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C877C]">STEP 6: 一致性控制</h3>
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

                {generatedImages.length > 0 && (
                  <div className="mt-8 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-[#D9D5CC]" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C877C]">生成成果展示</p>
                      <div className="h-px flex-1 bg-[#D9D5CC]" />
                    </div>
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                      {generatedImages.map((img, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="break-inside-avoid rounded-[24px] overflow-hidden border border-[#D9D5CC]/30 shadow-soft bg-[#FCFBF8] p-2 group relative cursor-pointer"
                          onClick={() => setPreviewImage(img)}
                        >
                          <img src={img} alt={`Result ${idx}`} className="w-full h-auto rounded-[18px]" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPreviewImage(img); }}
                              className="p-3 bg-white rounded-full text-[#111111] hover:scale-110 transition-transform shadow-lg"
                            >
                              <Maximize2 size={18} />
                            </button>
                            <a 
                              href={img} 
                              download={`kndi-gen-${idx}.png`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-3 bg-white rounded-full text-[#111111] hover:scale-110 transition-transform shadow-lg"
                            >
                              <Download size={18} />
                            </a>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Bar */}
        {activeTab === 'review' && (
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
                          <div className="w-16 h-16 bg-[#F5F5F0] rounded-xl flex items-center justify-center text-[#5A5A40]">
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
              <div className="absolute inset-0 bg-[#5A5A40] blur-2xl opacity-0 group-focus-within:opacity-10 transition-opacity duration-500" />
              <div className="relative flex items-center bg-white rounded-3xl shadow-xl shadow-[#1A1A1A]/5 border border-[#1A1A1A]/5 overflow-hidden p-2">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 text-[#5A5A40] hover:bg-[#5A5A40]/5 rounded-2xl transition-colors"
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
                  className="bg-[#5A5A40] text-white p-4 rounded-2xl hover:bg-[#4A4A30] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-4">
                <a
                  href={previewImage}
                  download="drawing-preview.png"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold transition-colors"
                >
                  <Download size={16} />
                  下载原图
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
