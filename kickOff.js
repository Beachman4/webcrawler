const argv = require('yargs').argv

import Crawl from './src/Crawl'

(new Crawl(argv.url)).run().then(function() {

})
