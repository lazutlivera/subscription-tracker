export const subscriptionCategories = [
  'Streaming & Entertainment',
  'Music & Audio',
  'Cloud Storage',
  'Productivity',
  'Gaming',
  'News & Reading',
  'Fitness & Health',
  'Learning & Education',
  'Security & VPN',
  'Business & Professional',
  'Social & Communication',
  'Other'
] as const;

export type SubscriptionCategory = typeof subscriptionCategories[number];

// Mapping subscriptions to their default categories
export const defaultCategories: Record<string, SubscriptionCategory> = {
  // Streaming & Entertainment
  'Netflix': 'Streaming & Entertainment',
  'Disney+': 'Streaming & Entertainment',
  'Amazon Prime': 'Streaming & Entertainment',
  'Apple TV+': 'Streaming & Entertainment',
  'NOW TV': 'Streaming & Entertainment',
  'YouTube Premium': 'Streaming & Entertainment',
  'Hulu': 'Streaming & Entertainment',
  'HBO Max': 'Streaming & Entertainment',

  // Music & Audio
  'Spotify': 'Music & Audio',
  'Apple Music': 'Music & Audio',
  'Tidal': 'Music & Audio',
  'Deezer': 'Music & Audio',
  'Splice': 'Music & Audio',
  'FL Studio': 'Music & Audio',

  // Cloud Storage
  'Dropbox': 'Cloud Storage',
  'Google One': 'Cloud Storage',
  'iCloud+': 'Cloud Storage',
  'OneDrive': 'Cloud Storage',

  // Productivity
  'Microsoft 365': 'Productivity',
  'Notion': 'Productivity',
  'Evernote': 'Productivity',
  'Trello': 'Productivity',
  'Slack': 'Productivity',
  'Adobe Creative Cloud': 'Productivity',
  'Canva Pro': 'Productivity',

  // Gaming
  'Xbox Game Pass': 'Gaming',
  'PlayStation Plus': 'Gaming',
  'Nintendo Switch Online': 'Gaming',

  // News & Reading
  'Medium': 'News & Reading',
  'The Times': 'News & Reading',
  'Financial Times': 'News & Reading',
  'Kindle Unlimited': 'News & Reading',

  // Fitness & Health
  'Strava': 'Fitness & Health',
  'Fitbod': 'Fitness & Health',
  'MyFitnessPal': 'Fitness & Health',
  'Calm': 'Fitness & Health',
  'Headspace': 'Fitness & Health',

  // Learning & Education
  'Duolingo Plus': 'Learning & Education',
  'Skillshare': 'Learning & Education',
  'MasterClass': 'Learning & Education',
  'Coursera': 'Learning & Education',
  'Udemy': 'Learning & Education',

  // Security & VPN
  'NordVPN': 'Security & VPN',
  'LastPass': 'Security & VPN',
  'ExpressVPN': 'Security & VPN',
  '1Password': 'Security & VPN',

  // Business & Professional
  'LinkedIn Premium': 'Business & Professional',
  'GitHub': 'Business & Professional',
  'Zoom': 'Business & Professional',
}; 