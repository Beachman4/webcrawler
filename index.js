var kue = require('kue')
    , cluster = require('cluster')
    , queue = kue.createQueue();
import Crawl from './src/Crawl'
var clusterWorkerSize = require('os').cpus().length;


if (cluster.isMaster) {
    kue.app.listen(3456)
    for (var i = 0; i < clusterWorkerSize; i++) {
        cluster.fork()
    }
} else {
    queue.process('web-crawler', 20, function(job, done) {
        const url = job.data.url

        const crawl = new Crawl(url)

        crawl.run().then(function() {
            done()
        }).catch(function() {
            done()
        })
    })
}