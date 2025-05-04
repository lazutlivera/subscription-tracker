const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Navigating to login page...');
  await page.goto('http://localhost:3000/signin');
  
  // Wait for the page to load
  await page.waitForTimeout(2000);
  
  // Log all input elements and their attributes
  console.log('Input elements:');
  const inputs = await page.$$('input');
  for (const input of inputs) {
    const name = await input.getAttribute('name');
    const id = await input.getAttribute('id');
    const type = await input.getAttribute('type');
    const placeholder = await input.getAttribute('placeholder');
    console.log({ name, id, type, placeholder });
  }
  
  // Log all button elements and their text
  console.log('\nButton elements:');
  const buttons = await page.$$('button');
  for (const button of buttons) {
    const text = await button.textContent();
    const id = await button.getAttribute('id');
    console.log({ text: text.trim(), id });
  }
  
  // Log all visible error message elements
  console.log('\nError message elements:');
  const errorElems = await page.$$('.error-message, [id*="error"], [class*="error"]');
  for (const elem of errorElems) {
    const text = await elem.textContent();
    const id = await elem.getAttribute('id');
    const className = await elem.getAttribute('class');
    console.log({ text: text?.trim(), id, className });
  }
  
  // Log links that might be logout buttons
  console.log('\nPotential logout elements:');
  const logoutElems = await page.$$('[id*="logout"], [id*="signout"], [class*="logout"], button:has-text("Logout"), button:has-text("Sign Out")');
  for (const elem of logoutElems) {
    const text = await elem.textContent();
    const id = await elem.getAttribute('id');
    const className = await elem.getAttribute('class');
    console.log({ text: text?.trim(), id, className });
  }
  
  console.log('\nDone inspecting the page.');
  await page.waitForTimeout(5000);
  await browser.close();
})(); 