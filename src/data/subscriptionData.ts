import { SubscriptionCategory } from '@/utils/categories';

interface SubscriptionTemplate {
  name: string;
  default_price: number;
  logo: string;
  category: SubscriptionCategory;
}

export const subscriptionData: SubscriptionTemplate[] = [
  // Streaming & Entertainment
  { name: 'Netflix', default_price: 10.99, logo: 'https://logo.clearbit.com/netflix.com', category: 'Streaming & Entertainment' },
  { name: 'Disney+', default_price: 7.99, logo: 'https://logo.clearbit.com/disney.com', category: 'Streaming & Entertainment' },
  { name: 'Amazon Prime', default_price: 8.99, logo: 'https://logo.clearbit.com/amazon.com', category: 'Streaming & Entertainment' },
  { name: 'Apple TV+', default_price: 8.99, logo: 'https://logo.clearbit.com/apple.com', category: 'Streaming & Entertainment' },
  { name: 'YouTube Premium', default_price: 12.99, logo: 'https://logo.clearbit.com/youtube.com', category: 'Streaming & Entertainment' },
  { name: 'NOW TV', default_price: 9.99, logo: 'https://logo.clearbit.com/nowtv.com', category: 'Streaming & Entertainment' },
  { name: 'Hulu', default_price: 7.99, logo: 'https://logo.clearbit.com/hulu.com', category: 'Streaming & Entertainment' },
  { name: 'HBO Max', default_price: 9.99, logo: 'https://logo.clearbit.com/hbomax.com', category: 'Streaming & Entertainment' },

  // Music & Audio
  { name: 'Spotify', default_price: 10.99, logo: 'https://logo.clearbit.com/spotify.com', category: 'Music & Audio' },
  { name: 'Apple Music', default_price: 10.99, logo: 'https://logo.clearbit.com/apple.com', category: 'Music & Audio' },
  { name: 'Tidal', default_price: 9.99, logo: 'https://logo.clearbit.com/tidal.com', category: 'Music & Audio' },
  { name: 'Deezer', default_price: 11.99, logo: 'https://logo.clearbit.com/deezer.com', category: 'Music & Audio' },
  { name: 'Splice', default_price: 7.99, logo: 'https://logo.clearbit.com/splice.com', category: 'Music & Audio' },
  { name: 'FL Studio', default_price: 9.99, logo: 'https://logo.clearbit.com/image-line.com', category: 'Music & Audio' },

  // Cloud Storage
  { name: 'Dropbox', default_price: 11.99, logo: 'https://logo.clearbit.com/dropbox.com', category: 'Cloud Storage' },
  { name: 'Google One', default_price: 1.99, logo: 'https://logo.clearbit.com/google.com', category: 'Cloud Storage' },
  { name: 'iCloud+', default_price: 2.99, logo: 'https://logo.clearbit.com/icloud.com', category: 'Cloud Storage' },
  { name: 'OneDrive', default_price: 1.99, logo: 'https://logo.clearbit.com/microsoft.com', category: 'Cloud Storage' },

  // Productivity
  { name: 'Microsoft 365', default_price: 7.99, logo: 'https://logo.clearbit.com/microsoft.com', category: 'Productivity' },
  { name: 'Notion', default_price: 8, logo: 'https://logo.clearbit.com/notion.so', category: 'Productivity' },
  { name: 'Evernote', default_price: 7.99, logo: 'https://logo.clearbit.com/evernote.com', category: 'Productivity' },
  { name: 'Trello', default_price: 5, logo: 'https://logo.clearbit.com/trello.com', category: 'Productivity' },
  { name: 'Slack', default_price: 7.25, logo: 'https://logo.clearbit.com/slack.com', category: 'Productivity' },
  { name: 'Adobe Creative Cloud', default_price: 54.99, logo: 'https://logo.clearbit.com/adobe.com', category: 'Productivity' },
  { name: 'Canva Pro', default_price: 12.99, logo: 'https://logo.clearbit.com/canva.com', category: 'Productivity' },

  // Gaming
  { name: 'Xbox Game Pass', default_price: 12.99, logo: 'https://logo.clearbit.com/xbox.com', category: 'Gaming' },
  { name: 'PlayStation Plus', default_price: 13.99, logo: 'https://logo.clearbit.com/playstation.com', category: 'Gaming' },
  { name: 'Nintendo Switch Online', default_price: 3.49, logo: 'https://logo.clearbit.com/nintendo.com', category: 'Gaming' },

  // News & Reading
  { name: 'Medium', default_price: 5, logo: 'https://logo.clearbit.com/medium.com', category: 'News & Reading' },
  { name: 'The Times', default_price: 26, logo: 'https://logo.clearbit.com/thetimes.co.uk', category: 'News & Reading' },
  { name: 'Financial Times', default_price: 35, logo: 'https://logo.clearbit.com/ft.com', category: 'News & Reading' },
  { name: 'Kindle Unlimited', default_price: 8.99, logo: 'https://logo.clearbit.com/amazon.com', category: 'News & Reading' },

  // Fitness & Health
  { name: 'Strava', default_price: 5.99, logo: 'https://logo.clearbit.com/strava.com', category: 'Fitness & Health' },
  { name: 'Fitbod', default_price: 12.99, logo: 'https://logo.clearbit.com/fitbod.me', category: 'Fitness & Health' },
  { name: 'MyFitnessPal', default_price: 9.99, logo: 'https://logo.clearbit.com/myfitnesspal.com', category: 'Fitness & Health' },
  { name: 'Calm', default_price: 7.99, logo: 'https://logo.clearbit.com/calm.com', category: 'Fitness & Health' },
  { name: 'Headspace', default_price: 9.99, logo: 'https://logo.clearbit.com/headspace.com', category: 'Fitness & Health' },

  // Learning & Education
  { name: 'Duolingo Plus', default_price: 12.99, logo: 'https://logo.clearbit.com/duolingo.com', category: 'Learning & Education' },
  { name: 'Skillshare', default_price: 13.99, logo: 'https://logo.clearbit.com/skillshare.com', category: 'Learning & Education' },
  { name: 'MasterClass', default_price: 15.99, logo: 'https://logo.clearbit.com/masterclass.com', category: 'Learning & Education' },
  { name: 'Coursera', default_price: 49, logo: 'https://logo.clearbit.com/coursera.org', category: 'Learning & Education' },
  { name: 'Udemy', default_price: 29.99, logo: 'https://logo.clearbit.com/udemy.com', category: 'Learning & Education' },

  // Security & VPN
  { name: 'NordVPN', default_price: 8.99, logo: 'https://logo.clearbit.com/nordvpn.com', category: 'Security & VPN' },
  { name: 'LastPass', default_price: 3.99, logo: 'https://logo.clearbit.com/lastpass.com', category: 'Security & VPN' },
  { name: 'ExpressVPN', default_price: 12.95, logo: 'https://logo.clearbit.com/expressvpn.com', category: 'Security & VPN' },
  { name: '1Password', default_price: 2.99, logo: 'https://logo.clearbit.com/1password.com', category: 'Security & VPN' },

  // Business & Professional
  { name: 'LinkedIn Premium', default_price: 29.99, logo: 'https://logo.clearbit.com/linkedin.com', category: 'Business & Professional' },
  { name: 'GitHub', default_price: 4, logo: 'https://logo.clearbit.com/github.com', category: 'Business & Professional' },
  { name: 'Zoom Pro', default_price: 14.99, logo: 'https://logo.clearbit.com/zoom.us', category: 'Business & Professional' },
];

export const subscriptionsByCategory = subscriptionData.reduce((acc: Record<string, SubscriptionTemplate[]>, sub: SubscriptionTemplate) => {
  if (!acc[sub.category]) {
    acc[sub.category] = [];
  }
  acc[sub.category].push(sub);
  return acc;
}, {}); 