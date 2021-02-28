import * as puppeteer from 'puppeteer';
import { Offer } from '../entity/Offer';

export class FlaschenpostScraper {
    private readonly baseUrl: string;

    private timeout = 10000;

    private categories: string[] = [
        'pils',
        'helles',
        // 'export',
        'weizen-weissbier',
        'alkoholfrei',
        // 'radler',
        // 'biermischgetraenke',
        'altbier',
        // 'malzbier',
        // 'land-kellerbier',
        // 'spezialitaeten',
        // 'sonstige',
    ];

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async postCodeExists(pc: string): Promise<boolean> {
        const browser = await puppeteer.launch({
            args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            headless: true,
        });
        const page = await browser.newPage();

        try {
            await page.goto(this.baseUrl);
            await page.waitFor('input#validZipcode');
            await page.type('input#validZipcode', pc);
            await page.click('button.zip--button');
            const result = await page.evaluate(() => {
                const header = document.getElementsByClassName('hightraffic--nodeliver').length;
                return !(header > 0);
            });
            return result;
        } catch (error) {
            console.log('Error: ', error);
        } finally {
            await browser.close();
        }
    }

    private async getOffers(category: string, page) {
        return await page.evaluate(async category => {
            const elements: any = [...document.getElementsByClassName('isHighlight')];
            const tmp = [];

            elements
                .filter(e => {

                    if (e.innerText.includes('TOP-ANGEBOT')) {
                        return e;
                    }
                })
                .map(element => {
                    const regexNumber = /\d+\,?\d*/g;

                    const name = element
                        .getElementsByClassName('fp_product_name')[0]
                        .textContent
                        .trim();

                    const priceOffer = element.getElementsByClassName('fp_product_details')[0];

                    const bottleDetails = priceOffer.getElementsByClassName('fp_article_bottleInfo')[0]
                        .innerText;

                    const offer = {
                        name: name,
                        category: category,
                        bottleAmount: 0,
                        bottleSize: 0,
                        oldPrice: 0.0,
                        price: 0.0,
                    };

                    if (bottleDetails.length >= 2) {
                        const results = bottleDetails.match(regexNumber);
                        if (results.length >= 2) {
                            offer.bottleAmount = parseInt(results[results.length - 2].replace(',', '.'));
                            offer.bottleSize = parseFloat(results[results.length - 1].replace(',', '.'));
                        }
                    }

                    if (priceOffer.getElementsByClassName('fp_article_price').length > 0) {
                        const result = priceOffer
                            .getElementsByClassName('fp_article_price')[0]
                            .innerText.match(regexNumber);
                        offer.oldPrice = parseFloat(result[0].replace(',', '.'));
                    } else {
                        return;
                    }

                    if (priceOffer.getElementsByClassName('fp_article_price_stroked').length > 0) {
                        const result = priceOffer
                            .getElementsByClassName('fp_article_price_stroked')[0]
                            .innerText.match(regexNumber);
                        offer.price = parseFloat(result[0].replace(',', '.'));
                    } else {
                        return;
                    }

                    if (!tmp.some(x => JSON.stringify(x) === JSON.stringify(offer))) {
                        tmp.push(offer);
                    }
                });
            return await new Promise(resolve => {
                resolve(tmp);
            });
        }, category);
    }

    async getOffersForPostCodes(postCode: string): Promise<Offer[]> {
        const browser = await puppeteer.launch({
            args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            headless: true,
        });
        const page = await browser.newPage();

        try {
            await page.goto(this.baseUrl);
            await page.waitFor('input#validZipcode');
            await page.type('input#validZipcode', postCode);
            await page.click('button.zip--button');
            await page.waitForSelector('.inactive', { timeout: this.timeout });

            let result = [];

            for (const category of this.categories) {
                console.log(`Checking offers for ${postCode}: ${category}`);

                await page.goto(`${this.baseUrl}/bier/${category}`);

                const exists = await page.evaluate(() => {
                    const header = document.getElementById('products_vue_container');
                    console.log("Header: %o", header);
                    return header != null;
                });

                if (!exists) {
                    console.log(`Skipping category ${category} because it does not exist at postcode ${postCode}`);
                    continue;
                }

                await page.waitForSelector('#products_vue_container', { timeout: this.timeout });

                let offers: Offer[];

                try {
                    offers = await this.getOffers(category, page);
                } catch (error) {
                    console.log('Error: ', error);
                    continue;
                }

                console.log(`Found ${offers.length} results for ${postCode}`);

                result = [...result, ...offers];
            }
            return result;
        } catch (err) {
            await browser.close();

            console.log('Scraper Error: ', err);
        } finally {
            await browser.close();
        }
    }
}
