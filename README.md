# About

Simple project to automate downloading a transaction report from 365online in order to run some reports on daily activity. Very much a work in progress.

Due to the lack of API from BOI, download of the transactions has to be performed by opening a headless browser (Puppeteer), logging into 365online, navigating to the transactions screen and exporting the latest transactions as CSV.

This process is be automated via Lambda. Downloaded transactions are uploaded to S3 and from there imported into a datastore (TBC) - Dynamo, RDS or Athena all possible options.

The Puppeteer Lambda uses a layer provided by shelf.io which provides the chromium runtime. https://codissimo.sinumo.tech/2019/12/27/serverless-puppeteer-with-aws-lambda-layers-and-node-js/

CICD automation with CDK. This is very much a pet project being worked on in the little spare time I have.
