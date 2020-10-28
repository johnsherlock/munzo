"use strict";

const moment = require('moment-mini');
const numeral = require('numeral');

const _dateFormat = 'DD/MM/YYYY';

class TransactionSerivce {

    constructor(telegramService, transactionParser) {
        this.telegramService = telegramService;
        this.transactionParser = transactionParser;
    }

    async transactionSummary() {
        const transactions = await this.yesterdaysTransactions();
        const yesterday = moment().subtract(1, 'days').format('ddd DD MMM');
        if(transactions.length == 0){
            return `No transactions from yesterday - ${yesterday}`;
        }
        const title = `Here are the transactions on your joint account from yesterday - ${yesterday}.`;
        const debits = this.summarise(transactions, 'debit') ;
        const credits = this.summarise(transactions, 'credit');
        const balance = this.mostRecentBalance(transactions);
        return `${title}\n\n<b>Debit</b>\n<code>${debits}</code>\n<b>Credit</b>\n<code>${credits}</code>\n<b>Balance</b>: ${balance}`;
    }

    mostRecentBalance(transactions) {
        if(transactions.length == 0){
            return 'Unavailable';
        }
        else {
            return this.formatBalance(transactions.find(transaction => transaction.balance !== '').balance);
        }
    }

    paddedCurrency(value){    
        return `€${numeral(value).format('0,0.00').padStart(7)}`
    }

    formatBalance(balance){
        return `€ ${numeral(balance).format('0,0[.]00')}`;
    }

    async yesterdaysTransactions() {
        return await this.recentTransactions(moment().subtract(1, 'days'), moment().subtract(1, 'days'));
    }

    async recentTransactions(from = moment(), to = moment()) {
        const transactions = await this.transactionParser.getTransactions();
        return transactions.filter(transaction => {
            return moment(transaction.date, _dateFormat).isBetween(from, to, 'days', '[]');
        });
        console.log(`Transactions: ${JSON.stringify(transactions)}`);
        return transactions;
    }


    summarise(transactions, property){
        const filteredTransactions = transactions.filter(transaction => transaction[property] !== '');
        if(filteredTransactions.length == 0) {
            return 'N/A\n'
        }
        else {
            const transactionSummary = filteredTransactions.reduce((summary, transaction) => {
                return `${summary}${transaction.details.padEnd(23, ' ')}${this.paddedCurrency(transaction[property])}\n`
            }, '');
            if (filteredTransactions.length == 1){
                return transactionSummary
            }
            else {
                const transactionTotal = filteredTransactions.reduce((total, transaction) => {
                    return total + parseFloat(transaction[property]);
                }, 0);
                return `${transactionSummary}${''.padEnd(23, ' ')}${this.paddedCurrency(transactionTotal)}\n`
            }
        }
    }

    async sendDailySummary() {
        const summary = await this.transactionSummary(1)
        console.log(`Summary: ${summary}`);
        await this.telegramService.sendMessage(summary);
    }
}

module.exports = TransactionSerivce;