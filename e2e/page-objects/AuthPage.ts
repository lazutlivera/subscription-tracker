import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AuthPage extends BasePage {
  // Selectors - updated based on page inspection
  readonly emailInput = '#email';  // Using ID instead of name
  readonly passwordInput = '#password';  // Using ID instead of name
  readonly loginButton = 'button:has-text("Sign In")';
  readonly signupButton = 'button:has-text("Sign Up")';
  readonly errorMessage = '.error-message, [id*="error"], [class*="error"]';
  readonly logoutButton = '#signout-button';
  
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(): Promise<void> {
    await this.goto('/signin');
    await this.waitForElement(this.emailInput);
  }

  /**
   * Login with provided credentials
   */
  async login(email: string, password: string): Promise<void> {
    await this.navigateToLogin();
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
    
    // Wait for navigation to dashboard or error
    try {
      // Check if we're redirected to home page
      await this.page.waitForURL('http://localhost:3000/', { timeout: 5000 });
    } catch (e) {
      // We might still be on login page due to error
      if (await this.elementExists(this.errorMessage)) {
        throw new Error(`Login failed: ${await this.page.locator(this.errorMessage).textContent()}`);
      }
      throw e;
    }
  }

  /**
   * Register a new user
   */
  async signup(email: string, password: string): Promise<void> {
    await this.goto('/signup');
    await this.waitForElement(this.emailInput);
    
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.signupButton);
    
    // Wait for navigation or error
    try {
      await this.page.waitForURL('http://localhost:3000/', { timeout: 5000 });
    } catch (e) {
      if (await this.elementExists(this.errorMessage)) {
        throw new Error(`Signup failed: ${await this.page.locator(this.errorMessage).textContent()}`);
      }
      throw e;
    }
  }

  /**
   * Logout the user
   */
  async logout(): Promise<void> {
    // Try both mobile and desktop logout buttons
    if (await this.elementExists(this.logoutButton)) {
      await this.page.click(this.logoutButton);
      await this.page.waitForURL('**/signin', { timeout: 5000 });
    }
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.elementExists(this.logoutButton);
  }
} 