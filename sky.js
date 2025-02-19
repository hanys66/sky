import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = 8889;

// Function to Scrape Data
async function scrapeNews() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    //await page.goto('https://news.sky.com/entertainment/', { waitUntil: 'domcontentloaded' });
    //await page.goto('https://news.sky.com/money/', { waitUntil: 'domcontentloaded' });
    //await page.goto('https://news.sky.com/politics/', { waitUntil: 'domcontentloaded' });
    await page.goto('https://news.sky.com/data-and-forensics/', { waitUntil: 'domcontentloaded' });
    // ✅ Ensure the headline is present before extracting
    await page.waitForSelector('.ui-story-content a', { timeout: 5000 });

    const quotes = await page.evaluate(() => {
        const quoteElements = document.querySelectorAll('.ui-story-wrap');
        const quotesArray = [];

        quoteElements.forEach(quoteElement => {
            const titleElement = quoteElement.querySelector('.ui-story-content a'); // ✅ Corrected selector
            const linkElement = quoteElement.querySelector('.ui-story-content a');
            const imgElement = quoteElement.querySelector('.ui-story-media-container img');
            const timeElement = quoteElement.querySelector('time');
            if (titleElement && linkElement && imgElement && timeElement)
            {
                quotesArray.push({
                    title: titleElement ? titleElement.textContent.trim() : 'No title',
                    url: linkElement ? 'https://news.sky.com' + linkElement.getAttribute('href') : null,
                    img: imgElement ? imgElement.getAttribute('src') : 'No image',
                    time: timeElement ? timeElement.getAttribute('datetime') : 'No timestamp'
                });
            };

        });
        return quotesArray;
    });
    await browser.close();
    return quotes;
}// end of the function- scrapeNews

// Express Route to Serve Scraped Data
app.get('/money', async (req, res) => {
    try {
        const data = await scrapeNews();
        res.json({ success: 'ok', articles: data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/money`);
});
