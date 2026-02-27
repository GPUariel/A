
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  JUDGEMENT = 'JUDGEMENT',
  FILL_IN_BLANK = 'FILL_IN_BLANK',
  SHORT_ANSWER = 'SHORT_ANSWER'
}

export interface MultipleChoiceQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface JudgementQuestion {
  question: string;
  answer: boolean;
  explanation: string;
}

export interface FillInBlankQuestion {
  question: string;
  answer: string;
  explanation: string;
}

export interface ShortAnswerQuestion {
  question: string;
  sampleAnswer: string;
  keyPoints: string[];
}

export interface QuizSet {
  multipleChoice: MultipleChoiceQuestion[];
  judgement: JudgementQuestion[];
  fillInBlank: FillInBlankQuestion[];
  shortAnswer: ShortAnswerQuestion[];
}

export interface GenerationState {
  isGenerating: boolean;
  progress: number;
  message: string;
  error?: string;
}
