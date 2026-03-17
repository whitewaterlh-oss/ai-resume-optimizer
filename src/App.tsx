import { extractTextFromPdf } from './utils/pdf';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Briefcase, Sparkles, AlertCircle, CheckCircle2, ChevronRight, Loader2, Copy, Check, Upload, Image as ImageIcon, X, File as FileIcon, Target, Globe, QrCode, ArrowLeft, Compass, Star, Map, MessageCircle, Search, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { QRCodeSVG } from 'qrcode.react';
import { analyzeResume } from './services/gemini';
import { ResumeAnalysisResult, FileData } from './types';

export default function App() {
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<FileData | null>(null);
  
  const [jobText, setJobText] = useState('');
  const [jobImages, setJobImages] = useState<FileData[]>([]);
  
  const [view, setView] = useState<'input' | 'analyzing' | 'result' | 'exhibition'>('input');
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const jobImageInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
    });
  };

const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.type !== 'application/pdf') {
    setError('请上传 PDF 格式的简历文件。');
    return;
  }

  try {
    const base64 = await fileToBase64(file);
    setResumeFile({ base64, mimeType: file.type, name: file.name });

    const extractedText = await extractTextFromPdf(file);

    const cleanedText = extractedText
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    setResumeText(cleanedText);
    setError(null);
  } catch (err) {
    console.error('读取 PDF 文件失败:', err);
    setError('PDF 解析失败，请手动粘贴简历文字。');
  }
};

  const handleJobImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages: FileData[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('请上传有效的图片文件 (PNG, JPEG)。');
        continue;
      }
      try {
        const base64 = await fileToBase64(file);
        newImages.push({ base64, mimeType: file.type, name: file.name });
      } catch (err) {
        console.error('读取图片失败:', err);
      }
    }

    setJobImages([...jobImages, ...newImages]);
    if (jobImageInputRef.current) jobImageInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() && !resumeFile) {
      setError('请提供你的简历（文本或 PDF）。');
      return;
    }
    if (!jobText.trim() && jobImages.length === 0) {
      setError('请提供目标岗位描述（文本或截图）。');
      return;
    }

    setView('analyzing');
    setError(null);
    
    try {
      const analysis = await analyzeResume(resumeText, resumeFile, jobText, jobImages);
      setResult(analysis);
      setView('result');
    } catch (err) {
      console.error(err);
      setError('分析简历时发生错误，请重试。');
      setView('input');
    }
  };

  const copyToClipboard = () => {
    if (result?.optimizedResume) {
      navigator.clipboard.writeText(result.optimizedResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Sparkles size={18} />
          </div>
          <h1 className="font-semibold text-lg tracking-tight">AI 简历优化大师</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {view === 'input' && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <div className="text-center pt-8 pb-4">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                  AI 驱动的职业情报局
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-12">
                  上传你的简历和目标岗位 JD。我们的高级 AI 将为你深度分析岗位匹配度，挖掘隐藏的招聘需求，并为你量身定制高分简历。
                </p>
                
                {/* Feature Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileText size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm mb-2">简历精修优化</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">精准匹配 JD 关键词，打造 HR 一眼心动的满分简历。</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Search size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm mb-2">JD 深度防坑分析</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">扒掉 JD 包装外衣，还原真实工作内容与隐藏招人动机。</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Target size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm mb-2">职场竞争力测评</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">挖掘你的核心优势与短板，探索更多职业发展可能。</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Compass size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm mb-2">玄学职业指南</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">结合八字与星座，为你指点职场迷津与最佳发展方位。</p>
                  </div>
                </div>
              </div>

              {/* Input Section */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-800 font-medium">
                        <FileText size={20} className="text-blue-600" />
                        <h2>你的当前简历</h2>
                      </div>
                      <button 
                        onClick={() => resumeFileInputRef.current?.click()}
                        className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Upload size={16} /> 上传 PDF
                      </button>
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        className="hidden" 
                        ref={resumeFileInputRef}
                        onChange={handleResumeFileUpload}
                      />
                    </div>
                    
                    {resumeFile ? (
                      <div className="w-full h-[45vh] p-6 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 flex flex-col items-center justify-center text-center">
                        <FileIcon size={48} className="text-blue-500 mb-4" />
                        <p className="font-medium text-slate-800 mb-1">{resumeFile.name}</p>
                        <p className="text-sm text-slate-500 mb-4">已上传 PDF 简历</p>
                        <button 
                          onClick={() => setResumeFile(null)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-red-100"
                        >
                          <X size={16} /> 移除文件
                        </button>
                      </div>
                    ) : (
                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="在此粘贴你的简历文本，或上传 PDF 文件..."
                        className="w-full h-[45vh] p-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none transition-all"
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-800 font-medium">
                        <Briefcase size={20} className="text-blue-600" />
                        <h2>目标岗位 JD</h2>
                      </div>
                      <button 
                        onClick={() => jobImageInputRef.current?.click()}
                        className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ImageIcon size={16} /> 添加截图
                      </button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        className="hidden" 
                        ref={jobImageInputRef}
                        onChange={handleJobImageUpload}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-3 h-[45vh]">
                      <textarea
                        value={jobText}
                        onChange={(e) => setJobText(e.target.value)}
                        placeholder="在此粘贴岗位描述（JD），或上传 JD 截图..."
                        className="w-full flex-1 p-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none transition-all"
                      />
                      
                      {jobImages.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {jobImages.map((img, idx) => (
                            <div key={idx} className="relative shrink-0 w-24 h-24 rounded-xl border border-slate-200 overflow-hidden group">
                              <img src={`data:${img.mimeType};base64,${img.base64}`} alt="JD Screenshot" className="w-full h-full object-cover" />
                              <button 
                                onClick={() => setJobImages(jobImages.filter((_, i) => i !== idx))}
                                className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center mt-10 pt-8 border-t border-slate-100">
                  {error && (
                    <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                      <AlertCircle size={18} />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  )}
                  <button
                    onClick={handleAnalyze}
                    disabled={(!resumeText.trim() && !resumeFile) || (!jobText.trim() && jobImages.length === 0)}
                    className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white px-10 py-4 rounded-full font-medium text-lg transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-0.5"
                  >
                    <Sparkles size={20} className={(!resumeText.trim() && !resumeFile) || (!jobText.trim() && jobImages.length === 0) ? 'text-slate-400' : 'text-blue-400'} />
                    开始深度分析 & 优化简历
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'analyzing' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <Loader2 size={48} className="text-blue-600 animate-spin mb-6" />
              <h3 className="text-2xl font-semibold mb-2">正在深度分析你的匹配度...</h3>
              <p className="text-slate-500 max-w-md">
                AI 正在对比你的经历与岗位需求，挖掘隐藏信息，并为你量身定制优化建议。
              </p>
            </motion.div>
          )}

          {view === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">分析与优化结果</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setView('exhibition')}
                    className="text-white font-medium flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-full transition-colors shadow-sm shadow-indigo-200"
                  >
                    <Globe size={18} /> 生成个人网页
                  </button>
                  <button
                    onClick={() => {
                      setResult(null);
                      setResumeText(result.optimizedResume);
                      setResumeFile(null); // Clear file so they can edit the text
                      setView('input');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 bg-blue-50 px-4 py-2.5 rounded-full transition-colors"
                  >
                    再次编辑 <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                  {/* Score Card */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">岗位匹配度</h3>
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" className="text-slate-100" strokeWidth="12" fill="none" stroke="currentColor" />
                        <circle 
                          cx="64" cy="64" r="56" 
                          className={result.matchScore >= 80 ? 'text-emerald-500' : result.matchScore >= 60 ? 'text-amber-500' : 'text-red-500'} 
                          strokeWidth="12" fill="none" stroke="currentColor" 
                          strokeDasharray={351.86} 
                          strokeDashoffset={351.86 - (351.86 * result.matchScore) / 100} 
                          strokeLinecap="round" 
                        />
                      </svg>
                      <span className="absolute text-4xl font-bold">{result.matchScore}</span>
                    </div>
                    <p className="mt-4 text-slate-600 text-sm leading-relaxed">{result.analysis}</p>
                  </div>

                  {/* Deficiencies Card */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Target size={20} className="text-red-500" />
                      能力差距分析
                    </h3>
                    <ul className="space-y-3">
                      {result.deficiencies.map((deficiency, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{deficiency}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggestions Card */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <CheckCircle2 size={20} className="text-blue-600" />
                      核心优化建议
                    </h3>
                    <ul className="space-y-3">
                      {result.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Metaphysical Analysis Card */}
                  {result.metaphysicalAnalysis?.birthdayFound && (
                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 shadow-sm border border-indigo-800 text-white">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-100">
                        <Compass size={20} className="text-purple-300" />
                        玄学职业指南
                      </h3>
                      <div className="space-y-4 text-sm text-indigo-100/80">
                        <div className="flex justify-between items-center border-b border-indigo-800/50 pb-3">
                          <span className="flex items-center gap-1.5"><Star size={16}/> 星座</span>
                          <span className="font-medium text-white">{result.metaphysicalAnalysis.zodiac}</span>
                        </div>
                        <div className="border-b border-indigo-800/50 pb-3">
                          <span className="flex items-center gap-1.5 mb-2"><Sparkles size={16}/> 八字简析</span>
                          <p className="font-medium text-white text-xs leading-relaxed">{result.metaphysicalAnalysis.bazi}</p>
                        </div>
                        <div className="border-b border-indigo-800/50 pb-3">
                          <span className="flex items-center gap-1.5 mb-2"><Briefcase size={16}/> 适合角色</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {result.metaphysicalAnalysis.suitableRoles?.map((role, i) => (
                              <span key={i} className="bg-indigo-800/50 px-2.5 py-1 rounded-md text-xs border border-indigo-700/50">{role}</span>
                            ))}
                          </div>
                        </div>
                        <div className="border-b border-indigo-800/50 pb-3">
                          <span className="flex items-center gap-1.5 mb-2"><Map size={16}/> 吉利方位</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {result.metaphysicalAnalysis.auspiciousDirections?.map((dir, i) => (
                              <span key={i} className="bg-purple-800/50 px-2.5 py-1 rounded-md text-xs border border-purple-700/50">{dir}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="flex items-center gap-1.5 mb-2"><MessageCircle size={16}/> 专属建议</span>
                          <p className="text-xs leading-relaxed">{result.metaphysicalAnalysis.guidance}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-8">
                  {/* Job Analysis Card */}
                  {result.jobAnalysis && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Search size={18} className="text-amber-600" />
                          JD 深度防坑分析
                        </h3>
                      </div>
                      <div className="p-6 md:p-8 space-y-6">
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                            <Briefcase size={16} className="text-amber-600" /> 岗位真实定位
                          </h4>
                          <p className="text-sm text-slate-600 leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                            {result.jobAnalysis.positioning}
                          </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                              <AlertCircle size={16} className="text-rose-500" /> 还原真实工作内容
                            </h4>
                            <ul className="space-y-2">
                              {result.jobAnalysis.realWorkContent.map((content, i) => (
                                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                                  <span className="leading-relaxed">{content}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                              <Sparkles size={16} className="text-blue-500" /> 隐藏人才画像
                            </h4>
                            <ul className="space-y-2">
                              {result.jobAnalysis.hiddenTalentPersona.map((persona, i) => (
                                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                  <span className="leading-relaxed">{persona}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Career Assessment Card */}
                  {result.careerAssessment && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Target size={18} className="text-purple-600" />
                          职场竞争力测评
                        </h3>
                      </div>
                      <div className="p-6 md:p-8 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                              <CheckCircle2 size={16} /> 核心优势
                            </h4>
                            <ul className="space-y-2">
                              {result.careerAssessment.strengths.map((s, i) => (
                                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-rose-700 mb-3 flex items-center gap-2">
                              <AlertCircle size={16} /> 潜在短板
                            </h4>
                            <ul className="space-y-2">
                              {result.careerAssessment.weaknesses.map((w, i) => (
                                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                  <span>{w}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                          <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                            <Briefcase size={16} /> 推荐发展方向
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {result.careerAssessment.suitableRoles.map((role, i) => (
                              <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-100">
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                          <h4 className="font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                            <MessageCircle size={16} /> 模拟面试问题
                          </h4>
                          <ul className="space-y-3">
                            {result.careerAssessment.testQuestions.map((q, i) => (
                              <li key={i} className="text-sm text-slate-700 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                                <span className="font-medium text-indigo-600 mr-2">Q{i + 1}.</span>
                                {q}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
                    <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Sparkles size={18} className="text-blue-600" />
                        AI 优化后简历草稿
                      </h3>
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
                      >
                        {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        {copied ? '已复制!' : '复制文本'}
                      </button>
                    </div>
                    <div className="p-6 md:p-8 overflow-y-auto max-h-[800px] prose prose-slate prose-blue max-w-none">
                      <ReactMarkdown>{result.optimizedResume}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'exhibition' && result && (
            <motion.div
              key="exhibition"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-6xl mx-auto"
            >
              <div className="mb-6 flex items-center justify-between">
                <button
                  onClick={() => setView('result')}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
                >
                  <ArrowLeft size={20} /> 返回结果页
                </button>
                <div className="flex items-center gap-2 text-indigo-600 font-medium bg-indigo-50 px-4 py-2 rounded-full">
                  <Globe size={18} /> 个人网页展示模式
                </div>
              </div>

              <div className="grid md:grid-cols-12 gap-6">
                {/* 左侧：个人主页信息卡片 */}
                <div className="md:col-span-4 space-y-6">
                  {/* 核心档案卡 */}
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 relative">
                      <div className="absolute -bottom-10 left-8 w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center border-4 border-white overflow-hidden">
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400">
                          <User size={32} />
                        </div>
                      </div>
                    </div>
                    <div className="pt-14 pb-8 px-8">
                      <h1 className="text-2xl font-bold text-slate-800 mb-1">我的专业档案</h1>
                      <p className="text-slate-500 text-sm mb-6 flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-emerald-500" /> AI 认证高优候选人
                      </p>
                      
                      {result.careerAssessment && (
                        <div className="space-y-5">
                          <div>
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">核心优势标签</h3>
                            <div className="flex flex-wrap gap-2">
                              {result.careerAssessment.strengths.map((s, i) => (
                                <span key={i} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-blue-100">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">推荐发展方向</h3>
                            <div className="flex flex-wrap gap-2">
                              {result.careerAssessment.suitableRoles.map((role, i) => (
                                <span key={i} className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-emerald-100">
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 二维码联系卡 */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <QrCode size={20} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">扫码联系我</h3>
                    <p className="text-xs text-slate-500 mb-4">
                      扫描二维码查看完整在线简历
                    </p>
                    <div className="bg-white p-3 rounded-2xl border-2 border-slate-50 inline-block shadow-sm">
                      <QRCodeSVG 
                        value={window.location.href} 
                        size={120}
                        level="H"
                        includeMargin={false}
                        fgColor="#0f172a"
                      />
                    </div>
                  </div>
                </div>

                {/* 右侧：详细简历内容 */}
                <div className="md:col-span-8">
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10 min-h-full">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800">详细履历</h2>
                        <p className="text-slate-500 text-sm mt-0.5">Professional Experience & Details</p>
                      </div>
                    </div>
                    
                    <div className="prose prose-slate prose-blue max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h1:mb-6 prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100 prose-li:marker:text-blue-500 prose-p:text-slate-600 prose-p:leading-relaxed">
                      <ReactMarkdown>{result.optimizedResume}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
