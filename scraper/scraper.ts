import puppeteer from "puppeteer";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Lead } from "../src/models/Lead";
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const LINKEDIN_URL = "https://www.linkedin.com";
const SEARCH_QUERY = "AI Engineer San Francisco";
const MAX_PROFILES = 20;

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const randomDelay = async (min: number, max: number) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

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
      config: {
        responseMimeType: 'text/plain',
      },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let generatedSummary = "";
    for await (const chunk of response) {
      generatedSummary += chunk.text;
    }

    return generatedSummary.trim();
  } catch (err) {
    console.error("Gemini API error:", err);
    return "Summary unavailable.";
  }
};

async function scrapeLinkedInLeads() {
  await mongoose.connect(process.env.MONGO_URI || "");
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-notifications"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  try {
    console.log("Navigating to LinkedIn...");
    await page.goto(`${LINKEDIN_URL}/login`, { waitUntil: "networkidle2", timeout: 60000 });
    await randomDelay(2000, 5000);

    await page.type("#username", process.env.LINKEDIN_EMAIL || "", { delay: 100 });
    await randomDelay(800, 1500);
    await page.type("#password", process.env.LINKEDIN_PASSWORD || "", { delay: 150 });
    await randomDelay(1000, 2000);

    const navigationPromise = page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(() => null);
    await page.click('button[type="submit"]');
    await navigationPromise;
    await randomDelay(8000, 12000);

    await page.screenshot({ path: "after-login.png" });

    const currentUrl = page.url();
    if (
      currentUrl.includes("/checkpoint/") ||
      currentUrl.includes("/authwall") ||
      currentUrl.includes("/uas/login") ||
      !currentUrl.includes("linkedin.com")
    ) {
      console.log("Security verification required - please check browser");
      await new Promise((resolve) => setTimeout(resolve, 45000));
    }

    const searchURL = `${LINKEDIN_URL}/search/results/people/?keywords=${encodeURIComponent(SEARCH_QUERY)}&origin=GLOBAL_SEARCH_HEADER`;
    await page.goto(searchURL, { waitUntil: "networkidle2", timeout: 60000 }).catch(() => null);
    await randomDelay(3000, 6000);

    for (let i = 0; i < 8; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.8));
      await randomDelay(1500, 3000);
      if (i % 2 === 1) {
        const profileCount = await page.evaluate(() => {
          return document.querySelectorAll(
            "[data-entity-urn], .entity-result, .reusable-search__result-container"
          ).length;
        });
        if (profileCount >= MAX_PROFILES) break;
      }
    }

    await randomDelay(3000, 5000);

    const leads = await page.evaluate(() => {
      const results = [];
      const items = document.querySelectorAll(
        "[data-entity-urn], .reusable-search__result-container, .entity-result"
      );
      for (let i = 0; i < Math.min(items.length, 20); i++) {
        const item = items[i];
        const name =
          item.querySelector("span[aria-hidden='true']")?.textContent?.trim() || "";
        const title =
          item.querySelector(".entity-result__primary-subtitle")?.textContent?.trim() || "";
        const location =
          item.querySelector(".entity-result__secondary-subtitle")?.textContent?.trim() || "";
        const profileImageUrl =
          item.querySelector("img")?.src || "";
        let profileUrl = item.querySelector("a[href*='/in/']")?.href || "";
        if (profileUrl && !profileUrl.startsWith("http")) {
          profileUrl = "https://www.linkedin.com" + profileUrl;
        }
        let company = "";
        if (title.includes(" at ")) {
          const parts = title.split(" at ");
          if (parts.length > 1) company = parts[1].trim();
        }

        if (name) {
          results.push({
            name,
            job_title: title || "Unknown",
            location: location || "Unknown",
            company,
            profile_image_url: profileImageUrl,
            profile_url: profileUrl,
            scraped_at: new Date().toISOString(),
          });
        }
      }
      return results;
    }) as {
      summary: any;
      name: string;
      job_title: string;
      location: string;
      company: string;
      profile_image_url: string;
      profile_url: string;
      scraped_at: string;
    }[];

    console.log(`Scraped ${leads.length} leads`);

    for (let lead of leads) {
      lead.summary = await generateSummary(lead);
    }

    if (leads.length > 0) {
      await Lead.insertMany(leads);
      console.log(`Saved ${leads.length} leads with AI summaries ✅`);
    } else {
      console.log("No leads found to save.");
      await page.screenshot({ path: "no-leads-found.png" });
    }
  } catch (error) {
    console.error("Scraping failed:", error);
    await page.screenshot({ path: "error-screenshot.png" });
  } finally {
    await browser.close();
    await mongoose.connection.close();
    console.log("Browser and DB connections closed 🔒");
  }
}

scrapeLinkedInLeads().catch(console.error);
