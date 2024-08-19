import puppeteer from "puppeteer";
import fs from "fs";

const getQuotes = async () => {
  // Start a Puppeteer session
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();

  // Array to hold all quotes
  let allQuotes = [];

  // Function to scrape quotes from the current page
  const scrapeQuotesFromPage = async () => {
    // Get all quotes on the current page
    const quotes = await page.evaluate(() => {
      // Fetch all elements with class "quote"
      const quoteElements = document.querySelectorAll(".quote");

      // Extract the text and author from each quote element
      const quotesArray = [];
      quoteElements.forEach((quoteElement) => {
        const text = quoteElement.querySelector(".text").innerText;
        const author = quoteElement.querySelector(".author").innerText;
        quotesArray.push({ text, author });
      });

      return quotesArray;
    });

    // Add the quotes to the allQuotes array
    allQuotes = allQuotes.concat(quotes);
  };

  // Go to the website and wait until the DOM content is loaded
  await page.goto("http://quotes.toscrape.com/", {
    waitUntil: "domcontentloaded",
  });

  // Scrape the first page
  await scrapeQuotesFromPage();

  // Check if there is a next page and scrape it
  let hasNextPage = true;
  while (hasNextPage) {
    try {
      // Click on the next page button
      await page.click(".pager > .next > a");

      // Wait for the new page to load
      await page.waitForSelector(".quote"); // Wait for the quotes to be loaded

      // Scrape quotes from the new page
      await scrapeQuotesFromPage();
    } catch (error) {
      // If there is no next page or an error occurs, exit the loop
      hasNextPage = false;
    }
  }

  // Save the quotes to a file
  fs.writeFile("quotes.json", JSON.stringify(allQuotes, null, 2), (err) => {
    if (err) {
      console.error("Error writing to file", err);
    } else {
      console.log("Quotes successfully saved to quotes.json");
    }
  });

  // Close the browser
  await browser.close();
};

// Start the scraping
getQuotes();