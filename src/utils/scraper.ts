import * as puppeteer from 'puppeteer';
import { Page } from 'puppeteer';
import { Offer } from '../entity/Offer';

export class FlaschenpostScraper {
    private readonly baseUrl: string;

    private timeout = 10000;

    private headless = true;

    private browserArgs = ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'];

    private categories: string[] = [
        'pils',
        'helles',
        // 'export',
        'weizen-weissbier',
        'alkoholfrei',
        'radler',
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

    async postCodeExists(pc: string, page?: Page): Promise<boolean> {
        let browser;
        const shouldClose = page == null;

        if (page == null) {
            browser = await puppeteer.launch({
                args: this.browserArgs,
                headless: this.headless,
            });
            page = await browser.newPage();
        }

        try {
            await page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
            await page.waitFor('.fp_modal_container');
            await page.type('.fp_input', pc);
            await page.click('.fp_button');

            const noDelivery = await page.evaluate(() => {
                const link = document.getElementsByClassName('fp_link')[0] as HTMLElement;
                return link.offsetParent
            });

            if (noDelivery != null)
                return false;

            await page.type('.fp_input', pc);

            return true;
        } catch (error) {
            console.log('Error: ', error);
        } finally {
            if (shouldClose)
                await browser.close();
        }
        return false;
    }

    private async getOffers(category: string, page) {
        return await page.evaluate(async category => {
            const elements: any = [...document.getElementsByClassName('isOffer')];
            const tmp = [];

            elements
                .filter(e => {
                    if (e.innerText.includes('TOP-ANGEBOT')) {
                        return e;
                    }
                })
                .map(element => {
                    const regexNumber = /\d+\,?\d*/g;

                    const name = element.getElementsByClassName('fp_product_name')[0].textContent.trim();
                    console.log(element.innerText);
                    const bottleOffers: any = [...element.getElementsByClassName('fp_article bottleTypeExists')];

                    bottleOffers.map(bottleOffer => {
                        const bottleDetails = bottleOffer.getElementsByClassName('fp_article_bottleInfo')[0].innerText;

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

                        if (bottleOffer.getElementsByClassName('fp_article_price').length > 0) {
                            const result = bottleOffer
                                .getElementsByClassName('fp_article_price')[0]
                                .innerText.match(regexNumber);
                            offer.oldPrice = parseFloat(result[0].replace(',', '.'));
                        } else {
                            return;
                        }

                        if (bottleOffer.getElementsByClassName('fp_article_price_stroked').length > 0) {
                            const result = bottleOffer
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
                });
            return await new Promise(resolve => {
                resolve(tmp);
            });
        }, category);
    }

    async getOffersForPostCodes(postCode: string): Promise<Offer[]> {
        const browser = await puppeteer.launch({
            args: this.browserArgs,
            headless: this.headless,
        });
        
        try {
            const page = await browser.newPage();

            if (!await this.postCodeExists(postCode, page))
                return [];

            let result = [];

            for (const category of this.categories) {
                console.log(`Checking offers for ${postCode}: ${category}`);

                await page.goto(`${this.baseUrl}/bier/${category}`, { timeout: this.timeout, waitUntil: 'networkidle0' });

                const exists = await page.evaluate(() => {
                    const header = document.getElementsByClassName('products_list_vue_container');
                    console.log("header: %o", header);
                    return header != null;
                });

                if (!exists) {
                    console.log(`Skipping category ${category} because it does not exist at postcode ${postCode}`);
                    continue;
                }

                await page.waitForSelector('.fp_modal_container', { timeout: this.timeout });

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
            console.log('Scraper Error: ', err);
        } finally {
            await browser.close();
        }
    }
}
