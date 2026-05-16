import { MCQ } from './types.ts';

export const SAMPLE_MCQS: MCQ[] = [
  {
    id: 's1',
    subject: 'physics',
    chapter: 'ভৌত জগৎ ও পরিমাপ',
    question: 'নিচের কোনটি মৌলিক রাশি নয়?',
    options: ['ভর', 'সময়', 'তাপমাত্রা', 'বিভব'],
    answer: 3,
    explanation: 'বিভব একটি লব্ধ রাশি। মৌলিক রাশিগুলো হলো ভর, দৈর্ঘ্য, সময়, তাপমাত্রা, তড়িৎ প্রবাহ, দীপন তীব্রতা ও পদার্থের পরিমাণ।',
    year: '২০২৪',
    type: 'Board'
  },
  {
    id: 's2',
    subject: 'physics',
    chapter: 'ভৌত জগৎ ও পরিমাপ',
    question: 'মাত্রা সমীকরণ প্রকাশের জন্য কোন বন্ধনী ব্যবহার করা হয়?',
    options: ['প্রথম বন্ধনী', 'দ্বিতীয় বন্ধনী', 'তৃতীয় বন্ধনী', 'কোনটিই নয়'],
    answer: 2,
    explanation: 'মাত্রা সমীকরণ সাধারণত তৃতীয় বন্ধনী [ ] দ্বারা প্রকাশ করা হয়।',
    year: '২০২৩',
    type: 'Admission'
  }
];
