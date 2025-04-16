import puppeteer from "puppeteer";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Lead } from "../src/models/Lead";

dotenv.config();

const LINKEDIN_URL = "https://www.linkedin.com";
const SEARCH_QUERY = "AI Engineer San Francisco";

async function scrapeLinkedInLeads() {
  await mongoose.connect(process.env.MONGO_URI || "");

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-notifications",
    ],
  });

  const page = await browser.newPage();

  // Set a more realistic viewport and user agent
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  try {
    console.log("Navigating to LinkedIn login page...");
    await page.goto(`${LINKEDIN_URL}/login`, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("Logging in...");
    await page.type("#username", process.env.LINKEDIN_EMAIL || "");
    await page.type("#password", process.env.LINKEDIN_PASSWORD || "");

    // Before clicking submit, set up a promise to catch navigation
    const navigationPromise = page
      .waitForNavigation({
        waitUntil: "networkidle2",
        timeout: 60000, // Increased timeout
      })
      .catch((err) => {
        console.log("Navigation after login timed out, but continuing...");
        return null; // Return null instead of rejecting
      });

    // Click the submit button
    await page.click('button[type="submit"]');

    // Wait for navigation with the custom promise handling
    await navigationPromise;

    // Add a longer delay to ensure we're fully logged in
    console.log("Waiting for login to complete...");
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Take a screenshot to see what we're looking at
    await page.screenshot({ path: "after-login.png" });
    console.log("Current URL:", page.url());

    // Check if we need to handle security verification/CAPTCHA
    const currentUrl = page.url();
    if (
      currentUrl.includes("/checkpoint/") ||
      currentUrl.includes("/authwall") ||
      currentUrl.includes("/uas/login") ||
      !currentUrl.includes("linkedin.com")
    ) {
      console.log(
        "Security verification may be required - please check the browser"
      );
      console.log("Waiting for manual intervention...");
      // Wait for manual intervention - increase timeout
      await new Promise((resolve) => setTimeout(resolve, 30000)); // Give user 30 seconds to handle CAPTCHA
      console.log("Continuing after waiting for manual intervention");
    }

    console.log("Navigating to search results...");
    const searchURL = `${LINKEDIN_URL}/search/results/people/?keywords=${encodeURIComponent(
      SEARCH_QUERY
    )}`;
    await page
      .goto(searchURL, {
        waitUntil: "networkidle2",
        timeout: 60000,
      })
      .catch((err) => {
        console.log(
          "Navigation to search results timed out, but continuing..."
        );
      });

    // Take another screenshot to see what we're looking at
    await page.screenshot({ path: "search-results-page.png" });
    console.log("Current URL after search:", page.url());

    // Try multiple possible selectors for search results
    const selectors = [
      ".reusable-search__entity-result-list",
      ".search-results-container",
      ".scaffold-layout__list",
      ".search-results",
      "ul.reusable-search__entity-result-list",
      ".pv5",
      ".pb2",
      '[aria-label="search results"]',
      '[role="list"]',
    ];

    let resultSelector: string | null = null;
    for (const selector of selectors) {
      try {
        console.log(`Trying selector: ${selector}...`);
        // Reduced timeout for each attempt
        await page.waitForSelector(selector, { timeout: 5000 });
        resultSelector = selector;
        console.log(`Found selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`Selector ${selector} not found`);
      }
    }

    if (!resultSelector) {
      // If we still can't find a selector, wait more and analyze the page content
      console.log(
        "Could not find search results container with known selectors"
      );
      await page.screenshot({ path: "linkedin-results-page.png" });

      // Try a different approach - let's look for results after scrolling
      console.log("Scrolling and trying to find results...");
      await page.evaluate(() => {
        window.scrollBy(0, 500);
      });
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    // Wait for any content to be available - more generic approach
    await page
      .waitForFunction(
        () => {
          return document.querySelectorAll("*").length > 10;
        },
        { timeout: 10000 }
      )
      .catch(() => console.log("Page seems to have content, continuing..."));

    type LeadResult = {
      name: string;
      job_title: string;
      location: string;
      company: string;
      scraped_at: string;
    };

    const leads: LeadResult[] = await page.evaluate(() => {
      const results: {
        name: string;
        job_title: string;
        location: string;
        company: string;
        scraped_at: string;
      }[] = [];

      // Try different possible item selectors (more comprehensive list)
      const items = document.querySelectorAll(
        "[data-entity-urn], .reusable-search__result-container, .entity-result, " +
          ".search-result, .search-entity, li.reusable-search__result-container, " +
          "[data-chameleon-result-urn], [data-test-search-result], [data-item-index]"
      );

      // If no items found with specific selectors, try a more generic approach
      let itemsList = items;
      if (items.length === 0) {
        // Look for list items that might contain people
        itemsList = document.querySelectorAll("li");
      }

      for (let i = 0; i < Math.min(itemsList.length, 10); i++) {
        const item = itemsList[i];

        // Try different possible selectors for each field
        const nameSelectors = [
          'span[aria-hidden="true"]',
          ".entity-result__title-text a",
          ".app-aware-link",
          "[data-test-user-name]",
          "h3",
          ".name",
          'a[href*="/in/"]',
          ".actor-name",
        ];

        const titleSelectors = [
          ".entity-result__primary-subtitle",
          ".entity-result__summary",
          ".subline-level-1",
          ".occupation",
          "[data-test-user-occupation]",
          "p",
        ];

        const locationSelectors = [
          ".entity-result__secondary-subtitle",
          ".people-search-card__location",
          ".subline-level-2",
          "[data-test-user-location]",
          ".location",
        ];

        let name: string | null = null;
        for (const selector of nameSelectors) {
          const element = item.querySelector(selector);
          if (element && element.textContent) {
            name = element.textContent.trim();
            break;
          }
        }

        let title: string | null = null;
        for (const selector of titleSelectors) {
          const element = item.querySelector(selector);
          if (element && element.textContent) {
            title = element.textContent.trim();
            break;
          }
        }

        let location: string | null = null;
        for (const selector of locationSelectors) {
          const element = item.querySelector(selector);
          if (element && element.textContent) {
            location = element.textContent.trim();
            break;
          }
        }

        // Extract company if available (might be part of the title)
        let company = "";
        if (title && title.includes(" at ")) {
          const parts = title.split(" at ");
          if (parts.length > 1) {
            company = parts[1].trim();
          }
        }

        // Only add if we have at least a name (to filter out non-person entries)
        if (name) {
          results.push({
            name: name,
            job_title: title || "Unknown",
            location: location || "Unknown",
            company: company,
            scraped_at: new Date().toISOString(),
          });
        }
      }

      return results;
    });

    console.log("Scraped leads:", leads);

    if (leads.length > 0) {
      await Lead.insertMany(leads);
      console.log(`Successfully saved ${leads.length} leads to database`);
    } else {
      console.log("No leads found to save");
      await page.screenshot({ path: "no-leads-found.png" });

      // Last resort - let's log some debug info
      const pageContent = await page.content();
      console.log("Page title:", await page.title());
      // Don't log the entire content, just check if we have certain keywords
      console.log(
        "Page has search results:",
        pageContent.includes("search-results")
      );
      console.log(
        "Page has entity results:",
        pageContent.includes("entity-result")
      );
    }
  } catch (error) {
    console.error("Scraping failed:", error);
    await page.screenshot({ path: "error-screenshot.png" });
  } finally {
    await browser.close();
    await mongoose.connection.close();
    console.log("Browser and database connection closed");
  }
}

scrapeLinkedInLeads().catch(console.error);
