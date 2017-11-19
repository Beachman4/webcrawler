const cheerio = require('cheerio')
import axios from 'axios';
import { Webpage } from './models'
import { URL } from 'url'
var kue = require('kue')
    , queue = kue.createQueue();

axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36';


class Crawl {

    constructor (url) {
        this.url = url;
        this.hostname = (new URL(url)).hostname
    }

    run() {
        return new Promise(resolve => {
            this.getPage().then(data => {
                try {
                    this.saveToDB(data)
                    const links = this.getAllLinks(data)


                    const count = links.length
                    const validLinks = []
                    Object.keys(links).forEach((item) => {
                        let url = links[item]
                        let valid = true
                        try {
                            new URL(url)
                        } catch(e) {
                            valid = false
                        }

                        if (!valid) {
                            if (url.indexOf(this.hostname) === -1) {
                                url = this.hostname + url
                            }
                        }
                        if (url.substring(0, 2) == '//') {
                            url = url.substring(2)
                        }

                        if (url.substring(0, 4) != 'http') {
                            url = 'http://' + url
                        }
                        try {
                            const uri = new URL(url)
                            validLinks.push(uri.href)
                        } catch (e) {

                        }
                    })

                    this.addLinksToQueue(validLinks)

                } catch (e) {
                    Promise.reject()
                }
                resolve()
            })
        })
    }

    saveToDB (html) {
        Webpage.create({
            url: this.url,
            body: html
        })
    }

    getAllLinks (html) {
        const $ = cheerio.load(html);

        const test = $('a').toArray()

        const links = test.reduce((accum, item, index) => {
            accum[index] = item.attribs.href

            return accum
        }, {})

        return links
    }

    addLinksToQueue (links) {
        links.forEach(item => {
            queue.create('web-crawler', {
                url: item
            }).save()
        })
    }

    getPage() {
        return new Promise((resolve) => {
            axios.get(this.url).then(data => {
                resolve(data.data)
            }).catch(data => {
                if (data.response) {
                    resolve(data.response.data)
                } else {
                    resolve(data.message)
                }
            })
        })
    }
}

export default Crawl