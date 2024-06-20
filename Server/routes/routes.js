import express from 'express';
import axios from 'axios';
import { Product } from "../models/product.model.js";

const router = express.Router();
let data;
const backendURL = 'https://transactecom.vercel.app' || 'http://localhost:3000' || 'https://apidash.vercel.app';

axios
    .get('https://s3.amazonaws.com/roxiler.com/product_transaction.json')
    .then(response => {
        data = response.data;
    });

function filteredTransactions(monthName) {
    const monthlyTransactions = data.filter(transaction => {
        const transactionDate = new Date(transaction.dateOfSale);
        return transactionDate.toLocaleString('default', { month: 'long' }) === monthName;
    });
    return monthlyTransactions;
}

router
    .get('/', async (req, res) => (res.status(200).json({ API_Data: data })))
    .get('/init@db', async (req, res) => {
        try {
            const count = await Product.countDocuments();
            if (count == 0) {
                await Product.insertMany(data);
                return res.status(200).json({ message: 'Initialized the Database' });
            }
            else if (count >= 60) {
                return res.status(200).json({ message: 'Database already initialized' })
            }
            else if (count < 60) {
                await Product.deleteMany({});
                await Product.insertMany(data);
                return res.status(200).json({ message: 'Deleted the incomplete collection and ReInitialized the Database' });
            }
        } catch (error) {
            console.error('Error initializing database:', error);
            res.status(500).json({ error: 'Failed to initialize database' });
        }
    })
    .get('/view@db', async (req, res) => {
        try {
            const databaseData = await Product.find({});
            return res.status(200).json(databaseData);
        } catch (error) {
            console.error('Error in Backend Post Transactions:', error);
            return res.status(500).json({ error: 'Error in Backend Post Filter' });
        }
    })
    .get('/transactions', async (req, res) => {
        try {
            const monthName = req.query.monthName;
            const monthlyTransactions = filteredTransactions(monthName);
            return res.status(200).json(monthlyTransactions);
        } catch (error) {
            console.error('Error in Backend transactions:', error);
            return res.status(500).json({ error: 'Error in Backend transactions' });
        }
    })
    .get('/statistics', async (req, res) => {
        try {
            const monthName = req.query.monthName;
            const monthlyTransactions = filteredTransactions(monthName);
            let monthlySale = 0, monthlySaleUnits = 0, monthlyNotSoldUnits = 0;

            monthlyTransactions.map(transaction => {
                monthlySale += transaction.price;
                if (transaction.sold) {
                    monthlySaleUnits++;
                }
                else {
                    monthlyNotSoldUnits++;
                }
            });

            return res.status(200).json({
                monthlySale,
                monthlySaleUnits,
                monthlyNotSoldUnits
            });
        } catch (error) {
            console.error('Error in Backend Statistics:', error);
            return res.status(500).json({ error: 'Error in Backend Statistics' });
        }
    })
    .get('/chartstats', async (req, res) => {
        try {
            const monthName = req.query.monthName;
            const monthlyTransactions = await filteredTransactions(monthName);

            let priceArray = [];
            monthlyTransactions.map(transaction => {
                priceArray.push(transaction.price);
            });
            const priceRanges = {
                '0 - 100': 0,
                '101 - 200': 0,
                '201 - 300': 0,
                '301 - 400': 0,
                '401 - 500': 0,
                '501 - 600': 0,
                '601 - 700': 0,
                '701 - 800': 0,
                '801 - 900': 0,
                '901 - above': 0,
            };

            priceArray.forEach(price => {
                if (price >= 0 && price <= 100) priceRanges['0 - 100']++;
                else if (price >= 101 && price <= 200) priceRanges['101 - 200']++;
                else if (price >= 201 && price <= 300) priceRanges['201 - 300']++;
                else if (price >= 301 && price <= 400) priceRanges['301 - 400']++;
                else if (price >= 401 && price <= 500) priceRanges['401 - 500']++;
                else if (price >= 501 && price <= 600) priceRanges['501 - 600']++;
                else if (price >= 601 && price <= 700) priceRanges['601 - 700']++;
                else if (price >= 701 && price <= 800) priceRanges['701 - 800']++;
                else if (price >= 801 && price <= 900) priceRanges['801 - 900']++;
                else priceRanges['901 - above']++;
            });

            const responseData = Object.keys(priceRanges).map(range => ({
                range,
                count: priceRanges[range]
            }));

            return res.status(200).json(responseData);
        } catch (error) {
            console.error('Error in Backend chartstats: ', error);
            return res.status(500).json({ error: 'Error in Backend chartstats' });
        }
    })
    .get('/piechartstats', async (req, res) => {
        try {
            const monthName = req.query.monthName;
            const monthlyTransactions = await filteredTransactions(monthName);
            let uniqueCategories = [];
            monthlyTransactions.map(transaction => {
                const existingCategory = uniqueCategories.find(item => item.category === transaction.category);
                if (existingCategory) {
                    existingCategory.count++;
                } else {
                    uniqueCategories.push({ category: transaction.category, count: 1 });
                }
            });
            return res.status(200).json(uniqueCategories);
        } catch (error) {
            return res.status(500).json({ error: 'Error in Backend piechartstats' });
        }
    })
    .get('/combined', async (req, res) => {
        try {
            const page = req.query.page;
            const limit = req.query.limit;
            const monthName = req.query.monthName;

            const [transactions, statistics, chartstats, piechartstats] = await Promise.all([
                axios.get(`${backendURL}/api/transactions?monthName=${monthName}&page=${page}&limit=${limit}`),
                axios.get(`${backendURL}/api/statistics?monthName=${monthName}`),
                axios.get(`${backendURL}/api/chartstats?monthName=${monthName}`),
                axios.get(`${backendURL}/api/piechartstats?monthName=${monthName}`),
            ]);

            const combinedResponse = {
                transactions: transactions.data,
                statistics: statistics.data,
                chartstats: chartstats.data,
                piechartstats: piechartstats.data
            };

            res.status(200).json(combinedResponse);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while combining responses' });
        }
    });

export default router;