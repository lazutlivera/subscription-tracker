import { subscriptionCategories, defaultCategories, SubscriptionCategory } from '@/utils/categories';

describe('categories', () => {
  test('subscriptionCategories should contain all predefined categories', () => {
    const expectedCategories = [
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
    ];
    
    // Check if all expected categories are in the subscriptionCategories array
    expectedCategories.forEach(category => {
      expect(subscriptionCategories).toContain(category);
    });
    
    // Check if lengths match to ensure no extra categories
    expect(subscriptionCategories.length).toBe(expectedCategories.length);
  });

  test('defaultCategories should map services to correct categories', () => {
    // Test a sample of mappings
    expect(defaultCategories['Netflix']).toBe('Streaming & Entertainment');
    expect(defaultCategories['Spotify']).toBe('Music & Audio');
    expect(defaultCategories['Dropbox']).toBe('Cloud Storage');
    expect(defaultCategories['Microsoft 365']).toBe('Productivity');
    expect(defaultCategories['Xbox Game Pass']).toBe('Gaming');
    expect(defaultCategories['Medium']).toBe('News & Reading');
    expect(defaultCategories['Strava']).toBe('Fitness & Health');
    expect(defaultCategories['Duolingo Plus']).toBe('Learning & Education');
    expect(defaultCategories['NordVPN']).toBe('Security & VPN');
    expect(defaultCategories['LinkedIn Premium']).toBe('Business & Professional');
  });

  test('all defaultCategories should have valid category types', () => {
    // Get all categories used in defaultCategories
    const usedCategories = new Set(Object.values(defaultCategories));
    
    // Check that each used category is in the subscriptionCategories list
    usedCategories.forEach(category => {
      expect(subscriptionCategories).toContain(category);
    });
  });

  test('defaultCategories should contain mappings for popular subscriptions', () => {
    const popularServices = [
      'Netflix', 'Disney+', 'Spotify', 'Apple Music', 
      'Microsoft 365', 'Adobe Creative Cloud', 'iCloud+', 'Google One'
    ];
    
    popularServices.forEach(service => {
      expect(defaultCategories).toHaveProperty(service);
    });
  });
}); 