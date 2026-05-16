export const SUBJECTS = [
  { id: 'physics', name: 'পদার্থবিজ্ঞান', icon: 'Atom' },
  { id: 'chemistry', name: 'রসায়ন', icon: 'FlaskConical' },
  { id: 'biology', name: 'জীববিজ্ঞান', icon: 'Dna' },
  { id: 'math', name: 'উচ্চতর গণিত', icon: 'Binary' },
  { id: 'bangla', name: 'বাংলা', icon: 'Languages' },
  { id: 'english', name: 'English', icon: 'Type' },
];

export const INITIAL_STATS = {
  totalAttempts: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  streak: 0,
  lastActive: new Date().toISOString(),
  subjectAccuracy: {},
  chapterAccuracy: {},
  examHistory: [],
};
