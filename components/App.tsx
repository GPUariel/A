
import React, { useState, useEffect, useRef } from 'react';
import { Button } from './components/Button';
import { InteractiveQuiz } from './components/InteractiveQuiz';
import { generateQuizFromMaterial } from './services/geminiService';
import { extractTextFromFile } from './services/fileParser';
import { QuizSet, GenerationState } from './types';

interface FileInfo {
  name: string;
  size: string;
}

const App: React.FC = () => {
  const [materials, setMaterials] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);
  const [quiz, setQuiz] = useState<QuizSet | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    message: '等待上传资料...'
  });

  const loadingMessages = [
    "正在深度解析您的多份资料内容...",
    "正在交叉比对知识点并构思题目...",
    "正在核对题目答案的准确性...",
    "正在生成符合 100 分制的评分逻辑...",
    "即将完成，正在进行最后的排版..."
  ];

  useEffect(() => {
    let interval: any;
    if (status.isGenerating) {
      let msgIdx = 0;
      interval = setInterval(() => {
        msgIdx = (msgIdx + 1) % loadingMessages.length;
        setStatus(prev => ({
          ...prev,
          message: loadingMessages[msgIdx],
          progress: Math.min(prev.progress + 15, 95)
        }));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [status.isGenerating]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setStatus(prev => ({ ...prev, message: `正在读取 ${files.length} 个文件...` }));
    
    const newMaterials = { ...materials };
    const newFileInfos = [...uploadedFiles];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await extractTextFromFile(file);
        newMaterials[file.name] = text;
        newFileInfos.push({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB'
        });
      } catch (err: any) {
        alert(`文件 ${file.name} 解析失败: ${err.message}`);
      }
    }

    setMaterials(newMaterials);
    setUploadedFiles(newFileInfos);
    setStatus(prev => ({ ...prev, message: '资料添加成功，您可以继续上传或开始生成。' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (name: string) => {
    const newMaterials = { ...materials };
    delete newMaterials[name];
    setMaterials(newMaterials);
    setUploadedFiles(uploadedFiles.filter(f => f.name !== name));
  };

  const handleGenerate = async () => {
    const combinedMaterial = Object.values(materials).join('\n\n--- NEXT DOCUMENT ---\n\n');
    if (!combinedMaterial.trim()) {
      alert('请先上传至少一份文件。');
      return;
    }

    setStatus({
      isGenerating: true,
      progress: 10,
      message: loadingMessages[0]
    });

    try {
      const result = await generateQuizFromMaterial(combinedMaterial);
      setQuiz(result);
      setStatus({
        isGenerating: false,
        progress: 100,
        message: '生成成功！'
      });
    } catch (error: any) {
      setStatus({
        isGenerating: false,
        progress: 0,
        message: '生成失败',
        error: error.message || '未知错误'
      });
    }
  };

  const reset = () => {
    setQuiz(null);
    setMaterials({});
    setUploadedFiles([]);
    setStatus({
      isGenerating: false,
      progress: 0,
      message: '等待上传资料...'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Smart Quiz Crafter Pro</h1>
              <p className="text-sm text-gray-500 font-medium">多文档支持 & 100分制评分系统</p>
            </div>
          </div>
          {quiz && (
            <Button variant="outline" onClick={reset}>清空并重置</Button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {!quiz && !status.isGenerating && (
          <div className="max-w-3xl mx-auto animate-fadeIn">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                多源资料，一键出题
              </h2>
              <p className="text-lg text-gray-600">
                支持同时上传多份 PDF, Word, Excel 资料。<br/>
                AI 将整合所有知识点，生成 100 分制的在线测验。
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 border border-gray-100">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`group cursor-pointer border-4 border-dashed rounded-3xl p-8 text-center transition-all border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload}
                  className="hidden" 
                  multiple
                  accept=".pdf,.docx,.xlsx,.xls,.txt"
                />
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">添加学习资料</h3>
                <p className="text-gray-500 text-sm">点击上传或拖拽多个文件到此处</p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-8 space-y-2">
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1 mb-3">已上传文件 ({uploadedFiles.length})</p>
                  {uploadedFiles.map((file) => (
                    <div key={file.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group animate-fadeIn">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-bold text-gray-800 truncate max-w-xs">{file.name}</p>
                          <p className="text-xs text-gray-400">{file.size}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFile(file.name)}
                        className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l18 18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-10 pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-500 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span> 客观题 70分 (27题)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> 简答题 30分 (3题)
                  </div>
                </div>
                <Button 
                  onClick={handleGenerate} 
                  className="w-full md:w-auto h-16 px-12 text-lg shadow-xl"
                  disabled={uploadedFiles.length === 0}
                >
                  融合资料并出题
                </Button>
              </div>
            </div>
          </div>
        )}

        {status.isGenerating && (
          <div className="max-w-2xl mx-auto py-20 text-center animate-pulse">
            <div className="relative inline-block mb-12">
              <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center animate-bounce">
                <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">正在创作您的测验内容...</h2>
            <p className="text-gray-600 mb-10 text-lg">{status.message}</p>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-700 ease-out shadow-lg shadow-indigo-200"
                style={{ width: `${status.progress}%` }}
              ></div>
            </div>
            <p className="text-sm font-bold text-indigo-600 tracking-widest">{status.progress}% 完成</p>
          </div>
        )}

        {quiz && !status.isGenerating && (
          <InteractiveQuiz quiz={quiz} onReset={reset} />
        )}

        {status.error && (
          <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-red-900 font-bold mb-2">生成出错</h3>
            <p className="text-red-700 text-sm mb-6">{status.error}</p>
            <Button onClick={reset} variant="primary" className="bg-red-600 hover:bg-red-700">返回重试</Button>
          </div>
        )}
      </main>

      <footer className="mt-auto py-12 border-t border-gray-200 text-center text-gray-400 text-sm">
        <p>© 2024 Smart Quiz Crafter Pro. Powered by Gemini Flash 3.0</p>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
