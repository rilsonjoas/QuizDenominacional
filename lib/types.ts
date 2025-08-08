export interface Option {
  value: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export type Beliefs = {
  [key: string]: string;
};

export interface Denomination {
  name: string;
  beliefs: Beliefs;
}

export interface Scores {
  [key: string]: number;
}

export interface ResultItem {
    name: string;
    score: number;
    percentage: number;
}