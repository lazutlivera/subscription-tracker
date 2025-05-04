const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Go to login first
  console.log('Navigating to login page...');
  await page.goto('http://localhost:3000/signin');
  
  // Wait for the page to load
  await page.waitForTimeout(1000);
  
  // Fill in login form
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'TestPassword123!');
  await page.click('button:has-text("Sign In")');
  
  // Wait for navigation after login
  console.log('Logging in...');
  try {
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('Successfully logged in and redirected to homepage');
  } catch (e) {
    console.log('Failed to login or redirect: ', e.message);
    // Take a screenshot to see what happened
    await page.screenshot({ path: 'login-error.png' });
    await browser.close();
    return;
  }
  
  // Now inspect the home page for logout button
  console.log('\nInspecting home page for logout button...');
  
  // Look for any element that could be a logout/signout button
  console.log('All buttons:');
  const buttons = await page.$$('button');
  for (const button of buttons) {
    const text = await button.textContent();
    const id = await button.getAttribute('id');
    const onclick = await button.getAttribute('onclick');
    const ariaLabel = await button.getAttribute('aria-label');
    console.log({ text: text?.trim(), id, onclick, ariaLabel });
  }
  
  console.log('\nPotential logout elements:');
  const logoutSelectors = [
    '[id*="logout"]',
    '[id*="signout"]',
    '[class*="logout"]',
    '[class*="signout"]',
    'button:has-text("Logout")',
    'button:has-text("Sign Out")',
    'button:has-text("Sign out")',
    'a:has-text("Logout")',
    'a:has-text("Sign Out")',
    'a:has-text("Sign out")',
    '[aria-label*="logout"]',
    '[aria-label*="sign out"]'
  ];
  
  const logoutElements = await page.$$(logoutSelectors.join(', '));
  if (logoutElements.length === 0) {
    console.log('No logout elements found with common selectors');
    
    // Take screenshot for further inspection
    await page.screenshot({ path: 'home-page.png' });
    console.log('Took screenshot of home page at home-page.png');
  } else {
    for (const elem of logoutElements) {
      const text = await elem.textContent();
      const id = await elem.getAttribute('id');
      const className = await elem.getAttribute('class');
      const tagName = await elem.evaluate(el => el.tagName.toLowerCase());
      console.log({ text: text?.trim(), id, className, tagName });
    }
  }
  
  // Also check header/nav area which often contains logout
  console.log('\nHeader/Nav elements:');
  const headerElements = await page.$$('header, nav, .header, .nav');
  for (const elem of headerElements) {
    const html = await elem.evaluate(el => el.outerHTML);
    console.log(html.substring(0, 200) + '...');
  }
  
  console.log('\nDone inspecting the home page.');
  await page.waitForTimeout(5000);
  await browser.close();
})(); 