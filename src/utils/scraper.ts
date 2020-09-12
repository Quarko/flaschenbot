import * as puppeteer from 'puppeteer';
import { Offer } from '../entity/Offer';

export class FlaschenpostScraper {
    private readonly baseUrl: string;

    private offerKey = 'TOP-ANGEBOT';
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

    async pcIsAvailable(pc: string): Promise<boolean> {
        const browser = await puppeteer.launch({
            args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            headless: true,
        });
        const page = await browser.newPage();

        try {
            await page.goto(this.baseUrl);
            await page.waitFor('input.fp-input--hasVal');
            await page.type('input.fp-input--hasVal', pc);
            await page.click('button.zip--button');
            const result = await page.evaluate(() => {
                const header = document.getElementsByClassName('fp-header_cat').length;
                return header > 0;
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
            const elements: any = [...document.getElementsByClassName('fp-productList_highlight')];
            const tmp = [];

            elements
                .filter(e => {
                    if (e.innerText === 'TOP-ANGEBOT') {
                        return e;
                    }
                })
                .map(e => {
                    //for(const e of elements) {
                    if (e.innerText === 'TOP-ANGEBOT') {
                        const element = e.parentElement;
                        const name = element
                            .getElementsByClassName('fp-productList_productName')[0]
                            .textContent.split('\n')[1]
                            .trim();

                        const priceOffer = element.getElementsByClassName('fp-productList_detail')[0];

                        const bottleDetails = priceOffer.getElementsByClassName('fp-productList_bottleInfo')[0]
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
                            const split = bottleDetails.split(' ');
                            offer.bottleAmount = parseInt(split[split.length - 4]);
                            offer.bottleSize = parseFloat(split[split.length - 2].replace('L', '').replace(',', '.'));
                        }

                        if (priceOffer.getElementsByClassName('fp-productList_price--stroke').length > 0) {
                            offer.oldPrice = parseFloat(
                                priceOffer
                                    .getElementsByClassName('fp-productList_price--stroke')[0]
                                    .innerText.split(' ')[0]
                                    .replace(',', '.'),
                            );
                        } else {
                            return;
                        }

                        if (priceOffer.getElementsByClassName('fp-price-is-special-offer').length > 0) {
                            offer.price = parseFloat(
                                priceOffer
                                    .getElementsByClassName('fp-price-is-special-offer')[0]
                                    .innerText.split(' ')[0]
                                    .replace(',', '.'),
                            );
                        } else {
                            return;
                        }

                        if (!tmp.some(x => JSON.stringify(x) === JSON.stringify(offer))) {
                            tmp.push(offer);
                        }
                    }
                });
            return await new Promise(resolve => {
                resolve(tmp);
            });
        }, category);
    }

    async runWithPC(pc: string): Promise<Offer[]> {
        const browser = await puppeteer.launch({
            args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            headless: true,
        });
        const page = await browser.newPage();

        try {
            await page.goto(this.baseUrl);
            await page.waitFor('input.fp-input--hasVal');
            await page.type('input.fp-input--hasVal', pc);
            await page.click('button.zip--button');
            await page.waitForSelector('.fp-modal_inner', { timeout: this.timeout, hidden: true });

            let result = [];

            for (const category of this.categories) {
                console.log(`Checking offers for ${pc}: ${category}`);

                await page.goto(`${this.baseUrl}/bier/${category}`);

                const exists = await page.evaluate(() => {
                    const header = document.getElementsByTagName('h2').length;

                    return header > 0;
                });

                if (exists) {
                    console.log(`Skipping category ${category} because it does not exist at postcode ${pc}`);
                    continue;
                }

                await page.waitForSelector('#fp-productList', { timeout: this.timeout });

                let offers: Offer[];

                try {
                    offers = await this.getOffers(category, page);
                } catch (error) {
                    continue;
                }

                console.log(`Found ${offers.length} results for ${pc}`);

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
