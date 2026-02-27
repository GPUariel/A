
import React, { useState } from 'react';
import { QuizSet, QuestionType } from '../types';

interface QuizDisplayProps {
  quiz: QuizSet;
}

export const QuizDisplay: React.FC<QuizDisplayProps> = ({ quiz }) => {
  const [showAnswers, setShowAnswers] = useState(false);

  const renderSection = (title: string, questions: any[], type: QuestionType) => {
    if (questions.length === 0) return null;

    return (
      <div className="mb-12">
        <h3 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-indigo-500 pl-4">{title}</h3>
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </span>
                <div className="flex-grow">
                  <p className="text-gray-800 text-lg mb-4 font-medium leading-relaxed">{q.question}</p>
                  
                  {type === QuestionType.MULTIPLE_CHOICE && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {q.options.map((opt: string, i: number) => (
                        <div key={i} className="p-3 rounded-lg border border-gray-100 bg-gray-50 text-gray-700">
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {showAnswers && (
                    <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100 animate-fadeIn">
                      <p className="text-emerald-800 font-semibold mb-1">
                        答案: <span className="font-bold">{type === QuestionType.JUDGEMENT ? (q.answer ? '正确 (True)' : '错误 (False)') : q.answer || q.sampleAnswer}</span>
                      </p>
                      {q.explanation && (
                        <p className="text-emerald-700 text-sm italic">解析: {q.explanation}</p>
                      )}
                      {q.keyPoints && (
                        <div className="mt-2">
                          <p className="text-emerald-800 text-sm font-semibold">关键点:</p>
                          <ul className="list-disc list-inside text-emerald-700 text-sm">
                            {q.keyPoints.map((kp: string, kIdx: number) => (
                              <li key={kIdx}>{kp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm sticky top-4 z-10 border border-gray-100">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">生成的测验</h2>
          <p className="text-gray-500">共 30 道题目</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAnswers(!showAnswers)}
            className={`px-6 py-2 rounded-xl font-medium transition-colors ${showAnswers ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            {showAnswers ? '隐藏答案' : '显示答案'}
          </button>
          <button 
            onClick={() => window.print()}
            className="px-6 py-2 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            打印测验
          </button>
        </div>
      </div>

      {renderSection("一、单项选择题 (10题)", quiz.multipleChoice, QuestionType.MULTIPLE_CHOICE)}
      {renderSection("二、判断题 (10题)", quiz.judgement, QuestionType.JUDGEMENT)}
      {renderSection("三、填空题 (7题)", quiz.fillInBlank, QuestionType.FILL_IN_BLANK)}
      {renderSection("四、简答题 (3题)", quiz.shortAnswer, QuestionType.SHORT_ANSWER)}
    </div>
  );
};
