import * as puppeteer from 'puppeteer';
import { Offer } from '../entity/Offer';

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
            await page.waitForSelector('.fp-modal_inner', { timeout: this.timeout, hidden: true });
            await browser.close();
            return true;
        } catch (error) {
            await browser.close();

            return false;
        }
    }

    async runWithPC(pc: string): Promise<Offer[]> {
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
            await page.waitForSelector('.fp-modal_inner', { timeout: this.timeout, hidden: true });

            const category = 'pils';
            await page.goto(`${this.baseUrl}/bier/${category}`);
            await page.waitForSelector('#fp-productList', { timeout: this.timeout });

            const getOffers = async () => {
                return await page.evaluate(async (category) => {
                    const elements: any = [...document.getElementsByClassName('fp-productList_highlight')];
                    const tmp = [];

                    elements
                        .filter(e => {
                            if (e.innerText === 'TOP-ANGEBOT') {
                                return e;
                            }
                        })
                        .map(e => {
                            console.log("e: ", e);
                            //for(const e of elements) {
                            if (e.innerText === 'TOP-ANGEBOT') {
                                const element = e.parentElement;
                                const name = element
                                    .getElementsByClassName('fp-productList_productName')[0]
                                    .textContent.split('\n')[1]
                                    .trim();

                                const priceOffer = element.getElementsByClassName('fp-productList_detail')[0];

                                const bottleDetails = priceOffer
                                    .getElementsByClassName('fp-productList_bottleInfo')[0]
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
                                    offer.bottleSize = parseFloat(
                                        split[split.length - 2]
                                            .replace('L', '')
                                            .replace(',', '.'),
                                    );
                                }

                                if (priceOffer.getElementsByClassName('fp-productList_price--stroke').length > 0) {

                                    offer.oldPrice = parseFloat(
                                        priceOffer
                                            .getElementsByClassName('fp-productList_price--stroke')[0]
                                            .innerText.split(' ')[0]
                                            .replace(',', '.'),
                                    );
                                }
                                else {
                                    return;
                                }

                                if (priceOffer.getElementsByClassName('fp-price-is-special-offer').length > 0) {

                                    offer.price = parseFloat(
                                        priceOffer
                                            .getElementsByClassName('fp-price-is-special-offer')[0]
                                            .innerText.split(' ')[0]
                                            .replace(',', '.'),
                                    );
                                }
                                else {
                                    return;
                                }

                                if (!tmp.some(x => JSON.stringify(x) === JSON.stringify(offer))) {
                                    tmp.push(offer);
                                }
                            }
                        });
                    return await new Promise(resolve => {
                        resolve(tmp);
                    })
                }, 'pils');
            }
            return await getOffers();
            // .map(offer => {
            //     const tmp = new Offer();

            //     tmp.name = offer.name;
            //     tmp.category = offer.category;
            //     tmp.bottleAmount = offer.bottleAmount;
            //     tmp.bottleSize = offer.bottleSize;
            //     tmp.oldPrice = offer.oldPrice;
            //     tmp.price = offer.price;

            //     return tmp;
            // });
        } catch (err) {
            await browser.close();

            return err;
        } finally {
            await browser.close();
        }
    }
}
