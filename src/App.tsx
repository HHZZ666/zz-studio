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
  MessageSquare
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

export default function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'review' | 'history' | 'image'>('review');
  const [imageLoading, setImageLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [batchDrawings, setBatchDrawings] = useState<{img: string, fig: string, title: string, issueId: string}[]>([]);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{file: File, preview: string, type: string}[]>([]);
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");

  const fileInputRef = useRef<HTMLInputElement>(null);
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
      pdf.save(`KNDI-Review-Report-${new Date().getTime()}.pdf`);
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
      const data = await generateReview("请分析这张图纸，识别其中的工程元素并评估其合规性。如果是针对特定问题的图纸，请说明其解决策略。", imageParts);
      setResult(data);
      setActiveTab('review');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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

  const handleGenerateImage = async (prompt: string) => {
    setImageLoading(true);
    try {
      const img = await generateImage(prompt, { aspectRatio });
      if (img) setGeneratedImages(prev => [img, ...prev]);
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('403') || error.status === 'PERMISSION_DENIED') {
        setHasKey(false);
      }
    } finally {
      setImageLoading(false);
    }
  };

  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-[#1A1A1A]/5 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto text-amber-600">
            <ShieldCheck size={40} />
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
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#1A1A1A]/10 z-50 flex flex-col">
        <div className="p-6 border-bottom border-[#1A1A1A]/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#5A5A40] rounded-lg flex items-center justify-center text-white">
              <ShieldCheck size={20} />
            </div>
            <h1 className="font-serif text-lg font-bold leading-tight">KNDI AI</h1>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/50 font-bold">Review System v3</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('review')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeTab === 'review' ? "bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20" : "hover:bg-[#1A1A1A]/5"
            )}
          >
            <LayoutDashboard size={20} />
            <span className="text-sm font-medium">智能审查</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeTab === 'history' ? "bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20" : "hover:bg-[#1A1A1A]/5"
            )}
          >
            <History size={20} />
            <span className="text-sm font-medium">审查历史</span>
          </button>
          <button 
            onClick={() => setActiveTab('image')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeTab === 'image' ? "bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20" : "hover:bg-[#1A1A1A]/5"
            )}
          >
            <ImageIcon size={20} />
            <span className="text-sm font-medium">图纸生成</span>
          </button>
        </nav>

        <div className="p-4 border-t border-[#1A1A1A]/10">
          <div className="bg-[#F5F5F0] p-4 rounded-2xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/40 mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium">Online & Secure</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#1A1A1A]/10 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1A1A1A]/40 uppercase tracking-widest">Current Mode:</span>
            <span className="text-xs font-bold px-2 py-1 bg-[#5A5A40]/10 text-[#5A5A40] rounded-md">
              {result?.mode || 'IDLE'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-[#1A1A1A]/5 rounded-full transition-colors">
              <Settings size={20} className="text-[#1A1A1A]/60" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5A5A40] to-[#8A8A6A] border-2 border-white shadow-sm" />
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
                      <h2 className="font-serif text-3xl font-bold">哈萨克斯坦国家设计院 AI 审查系统</h2>
                      <p className="text-[#1A1A1A]/60 max-w-md mx-auto">
                        集成哈萨克斯坦建筑合规审查与工程图纸规划。支持 SN RK, SP RK, SNiP RK 等规范体系。
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
                              <h1 className="font-serif text-2xl font-bold">KNDI AI REVIEW REPORT</h1>
                              <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/50 font-bold">Kazakh National Design Institute</p>
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
                                        <div className="relative group">
                                          <img src={draw.img} alt={draw.title} className="w-full h-auto rounded-xl" referrerPolicy="no-referrer" />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
                                            <button 
                                              onClick={() => handleAnalyzeDrawing(draw.img)}
                                              className="p-2 bg-white rounded-full text-[#5A5A40] hover:scale-110 transition-transform"
                                              title="AI 智能分析"
                                            >
                                              <Search size={16} />
                                            </button>
                                            <a 
                                              href={draw.img} 
                                              download={`${draw.fig}.png`}
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
                                  >
                                    <div className="relative group">
                                      <img src={img} alt={`Generated Drawing ${idx}`} className="w-full h-auto" referrerPolicy="no-referrer" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button 
                                          onClick={() => handleAnalyzeDrawing(img)}
                                          className="p-3 bg-white rounded-full text-[#5A5A40] hover:scale-110 transition-transform"
                                          title="AI 智能分析"
                                        >
                                          <Search size={20} />
                                        </button>
                                        <a 
                                          href={img} 
                                          download={`drawing-${idx}.png`}
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
                                <h2 className="text-xl font-bold uppercase tracking-tighter">KNDI</h2>
                                <p className="text-[10px] font-sans font-bold text-[#1A1A1A]/40 uppercase">Kazakh National Design Institute</p>
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

            {activeTab === 'image' && (
              <motion.div 
                key="image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div className="bg-white p-8 rounded-3xl border border-[#1A1A1A]/5 shadow-sm space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#5A5A40]/10 rounded-2xl flex items-center justify-center text-[#5A5A40]">
                      <ImageIcon size={24} />
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl font-bold">Nano Banana 2: 图纸生成器</h2>
                      <p className="text-sm text-[#1A1A1A]/50">使用 Gemini 3.1 Flash Image 引擎生成专业工程表达图</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                      {["1:1", "16:9", "9:16", "4:3", "3:4"].map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setAspectRatio(ratio)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                            aspectRatio === ratio ? "bg-[#5A5A40] text-white" : "bg-[#F5F5F0] text-[#1A1A1A]/60 hover:bg-[#1A1A1A]/5"
                          )}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                    <textarea 
                      placeholder="描述您需要生成的工程图纸细节... (例如: 1:100 比例的住宅楼标准层平面图，包含轴线、墙体、门窗标注)"
                      className="w-full h-32 bg-[#F5F5F0] rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-[#5A5A40] outline-none border-none resize-none"
                      id="image-prompt"
                    />
                    <button 
                      onClick={() => {
                        const prompt = (document.getElementById('image-prompt') as HTMLTextAreaElement).value;
                        if (prompt) handleGenerateImage(prompt);
                      }}
                      disabled={imageLoading}
                      className="w-full py-4 bg-[#5A5A40] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#4A4A30] transition-all disabled:opacity-50"
                    >
                      {imageLoading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                      {imageLoading ? "正在生成..." : "生成工程图纸"}
                    </button>
                  </div>
                </div>

                {generatedImages.length > 0 && (
                  <div className="space-y-6">
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                      {generatedImages.map((img, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="break-inside-avoid rounded-3xl overflow-hidden border border-[#1A1A1A]/10 shadow-lg bg-white p-2 group relative"
                        >
                          <img src={img} alt={`Generated ${idx}`} className="w-full h-auto rounded-2xl" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <a 
                              href={img} 
                              download={`drawing-${idx}.png`}
                              className="p-3 bg-white rounded-full text-[#1A1A1A] hover:scale-110 transition-transform"
                            >
                              <Download size={20} />
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
                      <div key={idx} className="relative group">
                        {file.type.startsWith('image/') ? (
                          <img src={file.preview} alt="upload preview" className="w-16 h-16 object-cover rounded-xl border border-[#1A1A1A]/10" />
                        ) : (
                          <div className="w-16 h-16 bg-[#F5F5F0] rounded-xl flex items-center justify-center text-[#5A5A40]">
                            <FileText size={24} />
                          </div>
                        )}
                        <button 
                          onClick={() => removeFile(idx)}
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
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  multiple 
                  className="hidden" 
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
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
    </div>
  );
}
