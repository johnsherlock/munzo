"use strict";

const parse = require('csv-parse');
const fs = require('fs');
const moment = require('moment-mini');

class TransactionParser {    

    constructor(transactionCSVFile) {
        this.transactions = new Promise((resolve, reject) => {
            fs.readFile(transactionCSVFile, (err, fileData) => {
                parse(fileData, {}, function(err, rows) {
                    // console.log('rows', rows, err)
                    rows.shift();
                    const mappedRows = rows.map((row, i) => {                    
                        return {
                            date: row[0],
                            details: row[1],
                            debit: row[2],
                            credit: row[3],
                            balance: row[4]
                        }
                    });
                    resolve(mappedRows);
                });
            });
        });
    }    

    async getTransactions() {
        return await this.transactions;
    }

}

module.exports = TransactionParser;