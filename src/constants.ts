import { Category } from "./gemini";

export interface Therapist {
  name: string;
  specialties: Category[];
  bio: string;
}

export const THERAPISTS: Therapist[] = [
  {
    name: "Lucie",
    specialties: ["Anxiety"],
    bio: "Lucie specializes in cognitive behavioral techniques to help manage intrusive thoughts and find inner calm."
  },
  {
    name: "Dominic",
    specialties: ["Depression"],
    bio: "Dominic provides a supportive space for those navigating low energy and negative outlooks, focusing on gentle recovery."
  },
  {
    name: "James",
    specialties: ["ADHD"],
    bio: "James helps individuals develop strategies for focus and organization in a world that often feels overwhelming."
  },
  {
    name: "May",
    specialties: ["Anxiety", "ADHD"],
    bio: "May understands the intersection of racing thoughts and focus challenges, offering balanced guidance for both."
  },
  {
    name: "Palsy",
    specialties: ["Anxiety", "Depression"],
    bio: "Palsy offers compassionate care for those feeling both overwhelmed by worry and weighed down by low mood."
  },
  {
    name: "Jasper",
    specialties: ["Depression", "ADHD"],
    bio: "Jasper works with clients to find motivation and clarity when facing both concentration hurdles and emotional lows."
  }
];

export interface Question {
  text: string;
  options: {
    text: string;
    category: Category;
  }[];
}

export const QUESTIONS: Question[] = [
  {
    text: "How have you been feeling lately?",
    options: [
      { text: "Consistently worried and on edge", category: "Anxiety" },
      { text: "Negative outlook and low energy", category: "Depression" },
      { text: "Scattered, unable to concentrate", category: "ADHD" }
    ]
  },
  {
    text: "How has your sleep been?",
    options: [
      { text: "Difficulty falling asleep, racing & intrusive thoughts", category: "Anxiety" },
      { text: "Sleeping more than normal, trouble staying awake", category: "Depression" },
      { text: "Irregular sleep, staying up late and can't get into a schedule", category: "ADHD" }
    ]
  },
  {
    text: "How organized do you feel?",
    options: [
      { text: "Heavily organized, extremely intense", category: "Anxiety" },
      { text: "Disorganized, messy, trouble cleaning up", category: "Depression" },
      { text: "Always disoriented and forgetful", category: "ADHD" }
    ]
  },
  {
    text: "How do you feel socially?",
    options: [
      { text: "Overanalyzing interactions, overwhelmed by large crowds", category: "Anxiety" },
      { text: "Withdrawing from people, not wanting to be social", category: "Depression" },
      { text: "Zoning out, accidentally interrupting, racing thoughts", category: "ADHD" }
    ]
  },
  {
    text: "How do you react to stress?",
    options: [
      { text: "Overthinking and panicking", category: "Anxiety" },
      { text: "Ignoring and blocking the stress out", category: "Depression" },
      { text: "Hyper-fixating, scattered thoughts", category: "ADHD" }
    ]
  }
];
