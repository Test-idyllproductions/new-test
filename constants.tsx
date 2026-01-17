
export const MOTIVATIONAL_QUOTES = [
  "The only way to do great work is to love what you do.",
  "Discipline is the bridge between goals and accomplishment.",
  "Focus on being productive instead of busy.",
  "Quality is not an act, it is a habit.",
  "Efficiency is doing things right; effectiveness is doing the right things.",
  "Success is not final; failure is not fatal: it is the courage to continue that counts.",
  "Don't count the days, make the days count.",
  "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
  "Strive for excellence, not perfection.",
  "The secret of getting ahead is getting started.",
  "Great things are done by a series of small things brought together.",
  "Innovation distinguishes between a leader and a follower.",
  "Action is the foundational key to all success.",
  "The goal is not to be perfect by the end, the goal is to be better today.",
  "Productivity is never an accident. It is always the result of a commitment to excellence.",
  "Hard work beats talent when talent doesn't work hard.",
  "Small daily improvements are the key to staggering long-term results.",
  "Focus on the process, not just the outcome.",
  "Clarity equals speed.",
  "Consistency is the playground of masters.",
];

export const getQuoteForDay = () => {
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
};
