import { clsx } from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}

export function formatTimestamp(date) {
  // Handle undefined or null
  if (!date) return 'Unknown time';
  
  // Convert string to Date if needed
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  // Validate it's a valid Date
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  const exactTime = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  if (seconds < 60) return `${seconds}s ago (${exactTime})`;
  if (minutes < 60) return `${minutes}m ago (${exactTime})`;
  if (hours < 24) return `${hours}h ago (${exactTime})`;
  return `${date.toLocaleDateString()} (${exactTime})`;
}

export function formatCurrency(value) {
  // Handle undefined or null
  if (value === undefined || value === null) return '$0';
  
  // Convert to number if string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle invalid numbers
  if (isNaN(numValue)) return '$0';
  
  // Format with commas and 0 decimal places for large numbers
  return `$${numValue.toLocaleString('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  })}`;
}

export function getThreatColor(score) {
  if (score >= 80) return 'text-threat-critical';
  if (score >= 60) return 'text-threat-high';
  if (score >= 40) return 'text-threat-medium';
  return 'text-threat-low';
}

export function getThreatBg(score) {
  if (score >= 80) return 'bg-threat-critical/10 border-threat-critical/50';
  if (score >= 60) return 'bg-threat-high/10 border-threat-high/50';
  if (score >= 40) return 'bg-threat-medium/10 border-threat-medium/50';
  return 'bg-threat-low/10 border-threat-low/50';
}

export function getSentimentColor(sentiment) {
  const colors = {
    positive: 'text-sentiment-positive',
    neutral: 'text-sentiment-neutral',
    negative: 'text-sentiment-negative',
    sarcastic: 'text-sentiment-sarcastic'
  };
  return colors[sentiment] || 'text-muted-foreground';
}

export function getSentimentBg(sentiment) {
  const colors = {
    positive: 'bg-sentiment-positive/10',
    neutral: 'bg-sentiment-neutral/10',
    negative: 'bg-sentiment-negative/10',
    sarcastic: 'bg-sentiment-sarcastic/10'
  };
  return colors[sentiment] || 'bg-muted';
}

export function generateAIReply(mention, replyType = 'auto') {
  // Auto mode - intelligently picks based on threat score and sentiment
  if (replyType === 'auto') {
    if (mention.aiThreatScore >= 85) replyType = 'crisis';
    else if (mention.aiSentiment === 'negative' && mention.aiThreatScore >= 60) replyType = 'correction';
    else if (mention.aiSentiment === 'positive') replyType = 'amplification';
    else replyType = 'official';
  }

  const templates = {
    crisis: [
      `Thank you for reaching out. We take this matter seriously and would like to address your concerns directly. Please DM us or email support@company.com so we can assist you privately and resolve this immediately.`,
      `We hear you and want to make this right. This conversation is important to us—let's continue it privately. Please send us a DM with your contact details so our team can reach out directly.`,
      `Your feedback matters to us. We'd like to discuss this further in a more private setting where we can address your specific concerns. Please email us at support@company.com with reference #${Math.random().toString(36).substr(2, 9).toUpperCase()}.`
    ],
    correction: [
      `Thanks for your comment. We'd like to clarify: [Correct Information]. For verified details, please see our official statement here: [link]. We're committed to transparency and accurate information.`,
      `We appreciate you raising this. However, the information shared is inaccurate. The facts are: [Correct Information]. Please refer to our official source for verified details: [link].`,
      `Thank you for engaging. To set the record straight: [Correct Information]. Our policies and values are clearly outlined here: [link]. We encourage everyone to verify facts from official sources.`
    ],
    official: [
      `Thank you for your inquiry. As stated in our official announcement: [Approved Statement]. For more details, please visit our press center or contact our media team at press@company.com.`,
      `We appreciate your interest. Per our official position: [Approved Statement]. For ongoing updates, please follow our verified channels and check our website regularly.`,
      `Thanks for reaching out. Our official statement on this matter is: [Approved Statement]. For any further questions, our support team is available through official channels.`
    ],
    boundary: [
      `This comment violates our community guidelines and platform policies. We maintain a respectful environment for all users. Continued violations may result in account restrictions. Please review our policies: [link].`,
      `We do not tolerate abusive language or behavior that violates our conduct policy. This content has been flagged and your account is under review. Our community standards are available here: [link].`,
      `Your comment has been removed for violating our terms of service. We expect all participants to engage respectfully. Repeated violations will result in account suspension. Review our policies: [link].`
    ],
    amplification: [
      `Thank you so much for the amazing support! 🙌 We're thrilled to have fans like you in our community. Your enthusiasm means the world to us—stay awesome!`,
      `This comment made our day! 🌟 We love hearing positive feedback from our community. Thank you for being such a loyal supporter—you're the best!`,
      `Wow, thank you! ❤️ Your positive energy is contagious! We're so grateful for community members like you. Keep spreading the good vibes!`
    ]
  };
  
  const selected = templates[replyType] || templates.official;
  return selected[Math.floor(Math.random() * selected.length)];
}
