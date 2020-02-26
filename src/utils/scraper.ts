import * as puppeteer from 'puppeteer';

export class FlaschenpostScraper {
    private readonly baseUrl: string;

    private offerKey = 'TOP-ANGEBOT';
    private timeout = 10000;

    private categories: string[] = [
        'pils',
        'helles',
        'export',
        'weissbier',
        'alkoholfrei',
        'radler',
        'biermischgetraenke',
        'altbier',
        'malzbier',
        'land-kellerbier',
        'spezialitaeten',
        'sonstige',
    ];

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async pcIsAvailable(pc: string): Promise<boolean> {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
        const page = await browser.newPage();

        try {
            await page.goto(this.baseUrl);
            await page.waitFor('input#validZipcode');
            await page.type('input#validZipcode', pc);
            await page.click('button.zip--button');
            await page.waitForSelector('.fp-modal_inner', {timeout: this.timeout, hidden: true});

            return true;
        } catch (error) {
            return false
        }
    }

    async runWithPC(pc: string): Promise<FlaschenpostOffer[]> {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
        const page = await browser.newPage();

        try {
            await page.goto(this.baseUrl);
            await page.waitFor('input#validZipcode');
            await page.type('input#validZipcode', pc);
            await page.click('button.zip--button');
            await page.waitForSelector('.fp-modal_inner', { timeout: this.timeout, hidden: true });

            const category = 'pils';
            await page.goto(`${this.baseUrl}/bier/${category}`);
            await page.waitForSelector('#fp-productList', { timeout: this.timeout });

            const offers: FlaschenpostOffer[] = await page.evaluate(() => {
                const elements: any = document.getElementsByClassName('fp-productList_highlight');
                const tmp = [];
                for (const e of elements) {
                    if (e.innerText === 'TOP-ANGEBOT') {
                        const element = e.parentElement;
                        const name = element
                            .getElementsByClassName('fp-productList_productName')[0]
                            .textContent.split('\n')[1]
                            .trim();
                        const priceOffers = element.getElementsByClassName('fp-productList_detail');
                        for (const priceOffer of priceOffers) {
                            const offer: FlaschenpostOffer = {
                                name: name,
                                bottleAmount: 0,
                                bottleSize: 0,
                                price: 0,
                                oldPrice: 0,
                                category: 'pils',
                            };

                            offer.name = name;

                            const bottleDetails = priceOffer
                                .getElementsByClassName('fp-productList_bottleDetails')[0]
                                .innerText.split('\n')[0];
                            offer.bottleAmount = parseInt(bottleDetails.split(' ')[0]);
                            offer.bottleSize = parseFloat(
                                bottleDetails
                                    .split(' ')[2]
                                    .replace('L', '')
                                    .replace(',', '.'),
                            );

                            if (priceOffer.getElementsByClassName('fp-productList_price--stroke').length > 0) {
                                offer.oldPrice = parseFloat(
                                    priceOffer
                                        .getElementsByClassName('fp-productList_price--stroke')[0]
                                        .innerText.split(' ')[0]
                                        .replace(',', '.'),
                                );
                            } else {
                                continue;
                            }

                            if (priceOffer.getElementsByClassName('fp-price-is-special-offer').length > 0) {
                                offer.price = parseFloat(
                                    priceOffer
                                        .getElementsByClassName('fp-price-is-special-offer')[0]
                                        .innerText.split(' ')[0]
                                        .replace(',', '.'),
                                );
                            } else {
                                continue;
                            }

                            if (!tmp.some(x => JSON.stringify(x) === JSON.stringify(offer))) {
                                tmp.push(offer);
                            }
                        }
                    }
                }
                return tmp;
            });
            await browser.close();

            return offers;
        } catch (err) {
            return err;
        }
    }
}

export interface FlaschenpostOffer {
    name: string;
    bottleSize: number;
    bottleAmount: number;
    oldPrice: number;
    price: number;
    category: string;
}
