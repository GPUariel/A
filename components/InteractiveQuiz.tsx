
import React, { useState } from 'react';
import { QuizSet, QuestionType } from '../types';
import { Button } from './Button';

interface InteractiveQuizProps {
  quiz: QuizSet;
  onReset: () => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ quiz, onReset }) => {
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [objectiveScore, setObjectiveScore] = useState(0);
  const [saScores, setSaScores] = useState<number[]>([0, 0, 0]); // Manual self-grading for SA

  const handleAnswerChange = (id: string, value: string | boolean) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    
    // Total objective questions = 27 (10 MC + 10 Judgement + 7 Fill)
    quiz.multipleChoice.forEach((q, idx) => {
      if (answers[`mc-${idx}`] === q.answer) correctCount += 1;
    });

    quiz.judgement.forEach((q, idx) => {
      if (answers[`jd-${idx}`] === q.answer) correctCount += 1;
    });

    quiz.fillInBlank.forEach((q, idx) => {
      const userAns = (answers[`fb-${idx}`] as string || '').trim().toLowerCase();
      const correctAns = q.answer.trim().toLowerCase();
      if (userAns === correctAns) correctCount += 1;
    });

    // Objective score = (Correct Count / 27) * 70
    const calculatedObjective = (correctCount / 27) * 70;
    setObjectiveScore(calculatedObjective);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaScoreChange = (idx: number, score: number) => {
    const newScores = [...saScores];
    newScores[idx] = score;
    setSaScores(newScores);
  };

  const totalPossibleObjective = 70;
  const totalPossibleSa = 30;
  const totalSaCurrent = saScores.reduce((a, b) => a + b, 0);
  const finalScore = Math.round(objectiveScore + totalSaCurrent);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {isSubmitted && (
        <div className="mb-8 bg-white p-8 rounded-3xl shadow-xl border-t-8 border-indigo-600 animate-fadeIn text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">测试评分报告</h2>
          <div className="flex justify-center items-end gap-2 my-4">
            <div className="text-7xl font-black text-indigo-600 leading-none">
              {finalScore}
            </div>
            <div className="text-2xl text-gray-400 font-bold pb-2">/ 100 分</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <p className="text-xs text-gray-400 font-bold uppercase">客观题得分</p>
              <p className="text-xl font-bold text-gray-700">{Math.round(objectiveScore)} / 70</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl">
              <p className="text-xs text-gray-400 font-bold uppercase">简答题得分</p>
              <p className="text-xl font-bold text-gray-700">{totalSaCurrent} / 30</p>
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            客观题包含选择、判断、填空（共 27 题），占 70 分。<br/>
            简答题共 3 题，每题 10 分，请在下方对照参考答案进行自评打分。
          </p>
          
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => setIsSubmitted(false)}>修改客观题</Button>
            <Button variant="primary" onClick={onReset}>生成新测验</Button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-4 z-10">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">100 分制在线测验</h2>
          <p className="text-gray-500 font-medium">10 选择 + 10 判断 + 7 填空 + 3 简答</p>
        </div>
        {!isSubmitted && (
          <Button onClick={calculateScore} variant="primary">结束答题并评分</Button>
        )}
      </div>

      {/* Multiple Choice Section */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-indigo-500 pl-4 flex items-center gap-2">
          一、单项选择题 <span className="text-sm font-normal text-gray-400">(每题约 2.6 分)</span>
        </h3>
        <div className="space-y-6">
          {quiz.multipleChoice.map((q, idx) => {
            const id = `mc-${idx}`;
            const isCorrect = isSubmitted && answers[id] === q.answer;
            const isWrong = isSubmitted && answers[id] !== undefined && answers[id] !== q.answer;
            
            return (
              <div key={id} className={`bg-white p-6 rounded-2xl border transition-all ${isCorrect ? 'border-emerald-500 bg-emerald-50/30' : isWrong ? 'border-red-500 bg-red-50/30' : 'border-gray-100'}`}>
                <p className="text-lg font-medium text-gray-800 mb-4">{idx + 1}. {q.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt) => {
                    const optKey = opt.trim().charAt(0);
                    const isSelected = answers[id] === optKey;
                    return (
                      <button
                        key={opt}
                        disabled={isSubmitted}
                        onClick={() => handleAnswerChange(id, optKey)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-indigo-200'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {isSubmitted && (
                  <div className="mt-4 p-4 rounded-xl bg-white border border-gray-200 text-sm">
                    <p className="font-bold text-indigo-600 mb-1">正确答案: {q.answer}</p>
                    <p className="text-gray-600 italic">解析: {q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Judgement Section */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-indigo-500 pl-4 flex items-center gap-2">
          二、判断题 <span className="text-sm font-normal text-gray-400">(每题约 2.6 分)</span>
        </h3>
        <div className="space-y-6">
          {quiz.judgement.map((q, idx) => {
            const id = `jd-${idx}`;
            const isCorrect = isSubmitted && answers[id] === q.answer;
            const isWrong = isSubmitted && answers[id] !== undefined && answers[id] !== q.answer;

            return (
              <div key={id} className={`bg-white p-6 rounded-2xl border transition-all ${isCorrect ? 'border-emerald-500 bg-emerald-50/30' : isWrong ? 'border-red-500 bg-red-50/30' : 'border-gray-100'}`}>
                <p className="text-lg font-medium text-gray-800 mb-4">{idx + 1}. {q.question}</p>
                <div className="flex gap-4">
                  {[true, false].map((val) => (
                    <button
                      key={val.toString()}
                      disabled={isSubmitted}
                      onClick={() => handleAnswerChange(id, val)}
                      className={`px-8 py-3 rounded-xl border-2 transition-all ${
                        answers[id] === val ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-gray-100 bg-gray-50 text-gray-600'
                      }`}
                    >
                      {val ? '正确' : '错误'}
                    </button>
                  ))}
                </div>
                {isSubmitted && (
                  <div className="mt-4 p-4 rounded-xl bg-white border border-gray-200 text-sm">
                    <p className="font-bold text-indigo-600 mb-1">正确答案: {q.answer ? '正确' : '错误'}</p>
                    <p className="text-gray-600 italic">解析: {q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Fill in Blank Section */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-indigo-500 pl-4 flex items-center gap-2">
          三、填空题 <span className="text-sm font-normal text-gray-400">(每题约 2.6 分)</span>
        </h3>
        <div className="space-y-6">
          {quiz.fillInBlank.map((q, idx) => {
            const id = `fb-${idx}`;
            const isCorrect = isSubmitted && (answers[id] as string || '').trim().toLowerCase() === q.answer.trim().toLowerCase();
            const isWrong = isSubmitted && (answers[id] as string || '').trim().toLowerCase() !== q.answer.trim().toLowerCase();

            return (
              <div key={id} className={`bg-white p-6 rounded-2xl border transition-all ${isCorrect ? 'border-emerald-500 bg-emerald-50/30' : isWrong ? 'border-red-500 bg-red-50/30' : 'border-gray-100'}`}>
                <p className="text-lg font-medium text-gray-800 mb-4">{idx + 1}. {q.question}</p>
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={answers[id] as string || ''}
                  onChange={(e) => handleAnswerChange(id, e.target.value)}
                  placeholder="请输入答案..."
                  className="w-full md:w-1/2 p-3 rounded-xl border-2 border-gray-100 focus:border-indigo-500 outline-none transition-all"
                />
                {isSubmitted && (
                  <div className="mt-4 p-4 rounded-xl bg-white border border-gray-200 text-sm">
                    <p className="font-bold text-indigo-600 mb-1">正确答案: {q.answer}</p>
                    <p className="text-gray-600 italic">解析: {q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Short Answer Section */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-indigo-500 pl-4 flex items-center gap-2">
          四、简答题 <span className="text-sm font-normal text-gray-400">(每题 10 分，共 30 分)</span>
        </h3>
        <div className="space-y-6">
          {quiz.shortAnswer.map((q, idx) => (
            <div key={`sa-${idx}`} className="bg-white p-6 rounded-2xl border border-gray-100">
              <p className="text-lg font-medium text-gray-800 mb-4">{idx + 1}. {q.question}</p>
              <textarea
                disabled={isSubmitted}
                placeholder="在此输入您的回答..."
                className="w-full h-32 p-4 rounded-xl border-2 border-gray-100 focus:border-indigo-500 outline-none transition-all resize-none"
              />
              
              {isSubmitted && (
                <div className="mt-6 animate-fadeIn">
                  <div className="p-6 rounded-xl bg-indigo-50 border border-indigo-100 mb-6">
                    <p className="font-bold text-indigo-900 mb-2">参考答案:</p>
                    <p className="text-indigo-800 mb-4 leading-relaxed">{q.sampleAnswer}</p>
                    <div>
                      <p className="text-indigo-900 text-sm font-bold mb-2">核心得分点:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {q.keyPoints.map((kp, kIdx) => (
                          <li key={kIdx} className="text-indigo-700 text-sm">{kp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-700">请为自己的回答打分 (0-10分):</p>
                    <div className="flex items-center gap-2">
                      <select 
                        value={saScores[idx]} 
                        onChange={(e) => handleSaScoreChange(idx, parseInt(e.target.value))}
                        className="p-2 border-2 border-gray-200 rounded-lg outline-none focus:border-indigo-500 bg-white"
                      >
                        {[...Array(11).keys()].map(n => (
                          <option key={n} value={n}>{n} 分</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      
      {!isSubmitted && (
        <div className="mt-12 flex justify-center">
          <Button onClick={calculateScore} className="h-16 px-16 text-xl shadow-2xl">完成客观题答题</Button>
        </div>
      )}
    </div>
  );
};
