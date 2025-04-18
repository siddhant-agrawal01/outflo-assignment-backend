// import puppeteer from "puppeteer";
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import { Lead } from "../src/models/Lead";
// import { GoogleGenAI } from '@google/genai';

// dotenv.config();

// const LINKEDIN_URL = "https://www.linkedin.com";
// const SEARCH_QUERY = "AI Engineer San Francisco";
// const MAX_PROFILES = 20; // Increased to 20 profiles
// const genAI = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY!,
// });
// // Helper function for random delays to mimic human behavior
// const randomDelay = async (min: number, max: number) => {
//   const delay = Math.floor(Math.random() * (max - min + 1)) + min;
//   console.log(`Waiting for ${delay}ms to mimic human behavior`);
//   return new Promise((resolve) => setTimeout(resolve, delay));
// };

// const generateSummary = async (lead: any) => {
//   const prompt = `Summarize this LinkedIn profile:
// Name: ${lead.name}
// Job Title: ${lead.job_title}
// Company: ${lead.company}
// Location: ${lead.location}

// Provide a short summary (2-3 sentences) for networking or outreach.`;

//   try {
//     const response = await genAI.models.generateContentStream({
//       model: "gemini-2.0-flash",
//       config: {
//         responseMimeType: 'text/plain',
//       },
//       contents: [{ role: "user", parts: [{ text: prompt }] }],
//     });

//     let generatedSummary = "";
//     for await (const chunk of response) {
//       generatedSummary += chunk.text;
//     }

//     return generatedSummary.trim();
//   } catch (err) {
//     console.error("Gemini API error:", err);
//     return "Summary unavailable.";
//   }
// };

// async function scrapeLinkedInLeads() {
//   await mongoose.connect(process.env.MONGO_URI || "");

//   const browser = await puppeteer.launch({
//     headless: false,
//     args: [
//       "--no-sandbox",
//       "--disable-setuid-sandbox",
//       "--disable-notifications",
//     ],
//     protocolTimeout: 60000
//   });

//   const page = await browser.newPage();

//   // Set a more realistic viewport and user agent
//   await page.setViewport({ width: 1280, height: 800 });
//   await page.setUserAgent(
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
//   );

//   try {
//     console.log("Navigating to LinkedIn login page...");
//     await page.goto(`${LINKEDIN_URL}/login`, {
//       waitUntil: "networkidle2",
//       timeout: 60000,
//     });

//     // Random delay before login to mimic human behavior
//     await randomDelay(2000, 5000);

//     console.log("Logging in...");
//     await page.type("#username", process.env.LINKEDIN_EMAIL || "", {
//       delay: 100,
//     }); // Slow typing like a human
//     await randomDelay(800, 1500);
//     await page.type("#password", process.env.LINKEDIN_PASSWORD || "", {
//       delay: 150,
//     }); // Varying typing speed
//     await randomDelay(1000, 2000);

//     // Before clicking submit, set up a promise to catch navigation
//     const navigationPromise = page
//       .waitForNavigation({
//         waitUntil: "networkidle2",
//         timeout: 60000, // Increased timeout
//       })
//       .catch((err) => {
//         console.log("Navigation after login timed out, but continuing...");
//         return null; // Return null instead of rejecting
//       });

//     // Click the submit button
//     await page.click('button[type="submit"]');

//     // Wait for navigation with the custom promise handling
//     await navigationPromise;

//     // Add a longer delay to ensure we're fully logged in
//     console.log("Waiting for login to complete...");
//     await randomDelay(8000, 12000); // Variable wait time

//     // Take a screenshot to see what we're looking at
//     await page.screenshot({ path: "after-login.png" });
//     console.log("Current URL:", page.url());

//     // Check if we need to handle security verification/CAPTCHA
//     const currentUrl = page.url();
//     if (
//       currentUrl.includes("/checkpoint/") ||
//       currentUrl.includes("/authwall") ||
//       currentUrl.includes("/uas/login") ||
//       !currentUrl.includes("linkedin.com")
//     ) {
//       console.log(
//         "Security verification may be required - please check the browser"
//       );
//       console.log("Waiting for manual intervention...");
//       // Wait for manual intervention - increase timeout
//       await new Promise((resolve) => setTimeout(resolve, 45000)); // Give user 45 seconds to handle CAPTCHA
//       console.log("Continuing after waiting for manual intervention");
//     }

//     console.log("Navigating to search results...");
//     const searchURL = `${LINKEDIN_URL}/search/results/people/?keywords=${encodeURIComponent(
//       SEARCH_QUERY
//     )}&origin=GLOBAL_SEARCH_HEADER`;

//     await page
//       .goto(searchURL, {
//         waitUntil: "networkidle2",
//         timeout: 60000,
//       })
//       .catch((err) => {
//         console.log(
//           "Navigation to search results timed out, but continuing..."
//         );
//       });

//     // Human-like delay before interacting with search results
//     await randomDelay(3000, 6000);

//     // Take another screenshot to see what we're looking at
//     await page.screenshot({ path: "search-results-page.png" });
//     console.log("Current URL after search:", page.url());

//     // Try multiple possible selectors for search results
//     const selectors = [
//       ".reusable-search__entity-result-list",
//       ".search-results-container",
//       ".scaffold-layout__list",
//       ".search-results",
//       "ul.reusable-search__entity-result-list",
//       ".pv5",
//       ".pb2",
//       '[aria-label="search results"]',
//       '[role="list"]',
//     ];

//     let resultSelector: string | null = null;
//     for (const selector of selectors) {
//       try {
//         console.log(`Trying selector: ${selector}...`);
//         // Reduced timeout for each attempt
//         await page.waitForSelector(selector, { timeout: 5000 });
//         resultSelector = selector;
//         console.log(`Found selector: ${selector}`);
//         break;
//       } catch (e) {
//         console.log(`Selector ${selector} not found`);
//       }
//     }

//     if (!resultSelector) {
//       // If we still can't find a selector, wait more and analyze the page content
//       console.log(
//         "Could not find search results container with known selectors"
//       );
//       await page.screenshot({ path: "linkedin-results-page.png" });

//       // Try a different approach - let's look for results after scrolling
//       console.log("Scrolling and trying to find results...");

//       // Scroll down a few times with random delays to load more results
//       for (let i = 0; i < 3; i++) {
//         await page.evaluate(() => {
//           window.scrollBy(0, Math.floor(Math.random() * 300) + 300);
//         });
//         await randomDelay(1000, 2500);
//       }

//       await new Promise((resolve) => setTimeout(resolve, 3000));
//     }

//     // Wait for any content to be available - more generic approach
//     await page
//       .waitForFunction(
//         () => {
//           return document.querySelectorAll("*").length > 10;
//         },
//         { timeout: 10000 }
//       )
//       .catch(() => console.log("Page seems to have content, continuing..."));

//     type LeadResult = {
//       summary: string;
//       name: string;
//       job_title: string;
//       location: string;
//       company: string;
//       profile_image_url: string;
//       profile_url: string;
//       scraped_at: string;
//     };

//     // We'll need to scroll more aggressively to load all 20 profiles
//     console.log("Scrolling to load more profiles...");

//     // More extensive scrolling to ensure we get all 20 profiles
//     for (let i = 0; i < 8; i++) {
//       await page.evaluate(() => {
//         window.scrollBy(0, window.innerHeight * 0.8);
//       });
//       await randomDelay(1500, 3000);

//       // Every other scroll, check how many profiles we have loaded
//       if (i % 2 === 1) {
//         const profileCount = await page.evaluate(() => {
//           return document.querySelectorAll(
//             "[data-entity-urn], .entity-result, .reusable-search__result-container"
//           ).length;
//         });
//         console.log(
//           `Scrolled ${i + 1} times, detected ${profileCount} profiles so far`
//         );

//         // If we've already found 20+ profiles, we can stop scrolling
//         if (profileCount >= 20) {
//           console.log("Found at least 20 profiles, stopping scroll");
//           break;
//         }
//       }
//     }

//     // Wait for a moment to let any async loading complete
//     await randomDelay(3000, 5000);

//     const leads: LeadResult[] = await page.evaluate(() => {
//       const results: {
//         name: string;
//         job_title: string;
//         location: string;
//         company: string;
//         profile_image_url: string;
//         profile_url: string;
//         scraped_at: string;
//         summary: any;
//       }[] = [];

//       // Try different possible item selectors (more comprehensive list)
//       const items = document.querySelectorAll(
//         "[data-entity-urn], .reusable-search__result-container, .entity-result, " +
//           ".search-result, .search-entity, li.reusable-search__result-container, " +
//           "[data-chameleon-result-urn], [data-test-search-result], [data-item-index]"
//       );

//       // If no items found with specific selectors, try a more generic approach
//       let itemsList = items;
//       if (items.length === 0) {
//         // Look for list items that might contain people
//         itemsList = document.querySelectorAll("li");
//       }

//       console.log(`Found ${itemsList.length} potential profile items`);
//       const maxProfiles = 20;

//       for (let i = 0; i < Math.min(itemsList.length, maxProfiles); i++) {
//         const item = itemsList[i];

//         // Try different possible selectors for each field
//         const nameSelectors = [
//           'span[aria-hidden="true"]',
//           ".entity-result__title-text a",
//           ".app-aware-link",
//           "[data-test-user-name]",
//           "h3",
//           ".name",
//           'a[href*="/in/"]',
//           ".actor-name",
//         ];

//         const titleSelectors = [
//           ".entity-result__primary-subtitle",
//           ".entity-result__summary",
//           ".subline-level-1",
//           ".occupation",
//           "[data-test-user-occupation]",
//           "p",
//         ];

//         const locationSelectors = [
//           ".entity-result__secondary-subtitle",
//           ".people-search-card__location",
//           ".subline-level-2",
//           "[data-test-user-location]",
//           ".location",
//         ];

//         const imageSelectors = [
//           "img.presence-entity__image",
//           "img.ivm-view-attr__img--centered",
//           ".presence-entity__image",
//           ".entity-result__universal-image",
//           ".evi-image",
//           "img.EntityPhoto-circle-3",
//           "img.ghost-person",
//           "img.profile-picture",
//           "img.pv-top-card-profile-picture__image",
//           ".pv-top-card__photo",
//           "img[src*='profile-displayphoto']",
//         ];

//         const profileURLSelectors = [
//           'a[href*="/in/"]',
//           ".entity-result__title-text a",
//           ".app-aware-link[href*='/in/']",
//           '[data-field="title"] a',
//           ".search-result__result-link",
//           "a[data-test-app-aware-link]",
//         ];

//         let name: string | null = null;
//         for (const selector of nameSelectors) {
//           const element = item.querySelector(selector);
//           if (element && element.textContent) {
//             name = element.textContent.trim();
//             break;
//           }
//         }

//         let title: string | null = null;
//         for (const selector of titleSelectors) {
//           const element = item.querySelector(selector);
//           if (element && element.textContent) {
//             title = element.textContent.trim();
//             break;
//           }
//         }

//         let location: string | null = null;
//         for (const selector of locationSelectors) {
//           const element = item.querySelector(selector);
//           if (element && element.textContent) {
//             location = element.textContent.trim();
//             break;
//           }
//         }

//         // Extract profile image
//         let profileImageUrl: string = "";
//         for (const selector of imageSelectors) {
//           const imgElement = item.querySelector(selector) as HTMLImageElement;
//           if (imgElement && imgElement.src) {
//             profileImageUrl = imgElement.src;
//             break;
//           }
//         }

//         // Extract profile URL
//         let profileUrl: string = "";
//         for (const selector of profileURLSelectors) {
//           const element = item.querySelector(selector) as HTMLAnchorElement;
//           if (element && element.href) {
//             // Make sure we get the full URL
//             profileUrl = element.href;
//             if (!profileUrl.startsWith("http")) {
//               profileUrl = "https://www.linkedin.com" + profileUrl;
//             }
//             break;
//           }
//         }

//         // Extract company if available (might be part of the title)
//         let company = "";
//         if (title && title.includes(" at ")) {
//           const parts = title.split(" at ");
//           if (parts.length > 1) {
//             company = parts[1].trim();
//           }
//         }

//         // Only add if we have at least a name (to filter out non-person entries)
//         if (name) {
//           results.push({
//             name: name,
//             job_title: title || "Unknown",
//             location: location || "Unknown",
//             company: company,
//             profile_image_url: profileImageUrl || "",
//             profile_url: profileUrl || "",
//             scraped_at: new Date().toISOString(),
//             summary: "", // Placeholder for summary
//           });
//         }
//       }

//       return results;
//     });

//     console.log(`Scraped ${leads.length} leads:`);
//     console.log(leads.slice(0, 3)); // Just log first 3 for brevity
//     for (let lead of leads) {
//       lead.summary = await generateSummary(lead);
//     }
//     if (leads.length > 0) {
//       // Update the Lead model to include the profile_image_url and profile_url fields
//       await Lead.insertMany(leads);
//       console.log(`Successfully saved ${leads.length} leads to database`);
//     } else {
//       console.log("No leads found to save");
//       await page.screenshot({ path: "no-leads-found.png" });

//       // Last resort - let's log some debug info
//       const pageContent = await page.content();
//       console.log("Page title:", await page.title());
//       // Don't log the entire content, just check if we have certain keywords
//       console.log(
//         "Page has search results:",
//         pageContent.includes("search-results")
//       );
//       console.log(
//         "Page has entity results:",
//         pageContent.includes("entity-result")
//       );
//     }
//   } catch (error) {
//     console.error("Scraping failed:", error);
//     await page.screenshot({ path: "error-screenshot.png" });
//   } finally {
//     await browser.close();
//     await mongoose.connection.close();
//     console.log("Browser and database connection closed");
//   }
// }

// scrapeLinkedInLeads().catch(console.error);
import puppeteer from "puppeteer";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Lead } from "../src/models/Lead";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const LINKEDIN_URL = "https://www.linkedin.com";
const SEARCH_QUERY = "software Engineer california";
const MAX_PROFILES = 20;
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Helper function for random delays
const randomDelay = (min: number, max: number) =>
  new Promise(resolve =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min)
  );

const generateSummary = async (lead: any) => {
  const prompt = `Summarize this LinkedIn profile:
Name: ${lead.name}
Job Title: ${lead.job_title}
Company: ${lead.company}
Location: ${lead.location}

Provide a short summary (2-3 sentences) for networking or outreach.`;

  try {
    const response = await genAI.models.generateContentStream({
      model: "gemini-2.0-flash",
      config: { responseMimeType: "text/plain" },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let summary = "";
    for await (const chunk of response) summary += chunk.text;
    return summary.trim();
  } catch (err) {
    console.error("Gemini API error:", err);
    return "Summary unavailable.";
  }
};

async function scrapeLinkedInLeads() {
  await mongoose.connect(process.env.MONGO_URI!);

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-notifications"],
    protocolTimeout: 60000,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  try {
    // Login to LinkedIn
    await page.goto(`${LINKEDIN_URL}/login`, { waitUntil: "networkidle2", timeout: 60000 });
    await randomDelay(2000, 5000);
    await page.type("#username", process.env.LINKEDIN_EMAIL!, { delay: 100 });
    await randomDelay(800, 1500);
    await page.type("#password", process.env.LINKEDIN_PASSWORD!, { delay: 150 });
    await randomDelay(1000, 2000);

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(() =>
        console.log("Navigation after login timed out, continuing...")
      ),
    ]);

    await randomDelay(8000, 12000);
    await page.screenshot({ path: "after-login.png" });

    // Handle potential security verification
    const currentUrl = page.url();
    if (currentUrl.includes("/checkpoint/") || currentUrl.includes("/authwall")) {
      console.log("Security verification required, waiting for manual intervention...");
      await randomDelay(45000, 45000);
    }

    // Navigate to search results
    const searchURL = `${LINKEDIN_URL}/search/results/people/?keywords=${encodeURIComponent(SEARCH_QUERY)}&origin=GLOBAL_SEARCH_HEADER`;
    await page.goto(searchURL, { waitUntil: "networkidle2", timeout: 60000 }).catch(() =>
      console.log("Navigation to search results timed out, continuing...")
    );
    await randomDelay(3000, 6000);
    await page.screenshot({ path: "search-results-page.png" });

    // Find search results container
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

    const resultSelector = selectors.find(async selector => {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        return true;
      } catch {
        return false;
      }
    });

    if (!resultSelector) {
      console.log("Could not find search results container, scrolling to load content...");
      await page.screenshot({ path: "linkedin-results-page.png" });
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollBy(0, Math.random() * 300 + 300));
        await randomDelay(1000, 2500);
      }
      await randomDelay(3000, 3000);
    }

    // Scroll to load profiles
    for (let i = 0; i < 8; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.8));
      await randomDelay(1500, 3000);

      if (i % 2 === 1) {
        const profileCount = await page.evaluate(() =>
          document.querySelectorAll("[data-entity-urn], .entity-result, .reusable-search__result-container").length
        );
        console.log(`Scrolled ${i + 1} times, detected ${profileCount} profiles`);
        if (profileCount >= MAX_PROFILES) {
          console.log("Found sufficient profiles, stopping scroll");
          break;
        }
      }
    }

    await randomDelay(3000, 5000);

    // Extract leads
    interface LeadResult {
      summary: string;
      name: string;
      job_title: string;
      location: string;
      company: string;
      profile_image_url: string;
      profile_url: string;
      scraped_at: string;
    }

    const leads: LeadResult[] = await page.evaluate((maxProfiles: number) => {
      const results: LeadResult[] = [];
      const items = document.querySelectorAll(
        "[data-entity-urn], .reusable-search__result-container, .entity-result, " +
          ".search-result, .search-entity, li.reusable-search__result-container, " +
          "[data-chameleon-result-urn], [data-test-search-result], [data-item-index]"
      ) || document.querySelectorAll("li");

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

      const imageSelectors = [
        "img.presence-entity__image",
        "img.ivm-view-attr__img--centered",
        ".presence-entity__image",
        ".entity-result__universal-image",
        ".evi-image",
        "img.EntityPhoto-circle-3",
        "img.ghost-person",
        "img.profile-picture",
        "img.pv-top-card-profile-picture__image",
        ".pv-top-card__photo",
        "img[src*='profile-displayphoto']",
      ];

      const profileURLSelectors = [
        'a[href*="/in/"]',
        ".entity-result__title-text a",
        ".app-aware-link[href*='/in/']",
        '[data-field="title"] a',
        ".search-result__result-link",
        "a[data-test-app-aware-link]",
      ];

      for (const item of Array.from(items).slice(0, maxProfiles)) {
        const getText = (selectors: string[]) =>
          selectors
            .map(s => item.querySelector(s)?.textContent?.trim())
            .find(text => text) || "";

        const name = getText(nameSelectors);
        const title = getText(titleSelectors) || "Unknown";
        const location = getText(locationSelectors) || "Unknown";

        const profileImageUrl =
          Array.from(imageSelectors)
            .map(s => (item.querySelector(s) as HTMLImageElement)?.src)
            .find(src => src) || "";

        let profileUrl =
          Array.from(profileURLSelectors)
            .map(s => (item.querySelector(s) as HTMLAnchorElement)?.href)
            .find(href => href) || "";
        if (profileUrl && !profileUrl.startsWith("http")) {
          profileUrl = "https://www.linkedin.com" + profileUrl;
        }

        const company = title.includes(" at ") ? title.split(" at ")[1].trim() : "";

        if (name) {
          results.push({
            name,
            job_title: title,
            location,
            company,
            profile_image_url: profileImageUrl,
            profile_url: profileUrl,
            scraped_at: new Date().toISOString(),
            summary: "",
          });
        }
      }

      return results;
    }, MAX_PROFILES);

    console.log(`Scraped ${leads.length} leads:`, leads.slice(0, 3));

    // Generate summaries and save leads
    for (const lead of leads) {
      lead.summary = await generateSummary(lead);
    }

    if (leads.length) {
      await Lead.insertMany(leads);
      console.log(`Saved ${leads.length} leads to database`);
    } else {
      console.log("No leads found");
      await page.screenshot({ path: "no-leads-found.png" });
      console.log("Page title:", await page.title());
      console.log("Page has search results:", (await page.content()).includes("search-results"));
      console.log("Page has entity results:", (await page.content()).includes("entity-result"));
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