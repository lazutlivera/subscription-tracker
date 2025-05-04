import { Page, Locator, expect } from '@playwright/test';

/**
 * Base page object that all other page objects will extend
 */
export class BasePage {
  readonly page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL path
   */
  async goto(path: string = '/'): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for an element to be visible
   */
  async waitForElement(selector: string, timeout: number = 5000): Promise<Locator> {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible({ timeout });
    return element;
  }

  /**
   * Check if an element exists on the page
   */
  async elementExists(selector: string): Promise<boolean> {
    const count = await this.page.locator(selector).count();
    return count > 0;
  }

  /**
   * Take screenshot with a custom name
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `./e2e/screenshots/${name}.png` });
  }
} 