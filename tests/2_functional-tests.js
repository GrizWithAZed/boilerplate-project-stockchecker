'use strict';

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    
    // Test for viewing one stock
    test('Viewing one stock: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.property(res.body, 'stockData');
                assert.property(res.body.stockData, 'stock');
                assert.property(res.body.stockData, 'price');
                assert.property(res.body.stockData, 'likes'); // Must exist for a single stock
                assert.isNumber(res.body.stockData.likes);
                done();
            });
    });

    // Test for viewing one stock and liking it
    test('Viewing one stock and liking it: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG&like=true')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.property(res.body, 'stockData');
                assert.property(res.body.stockData, 'stock');
                assert.property(res.body.stockData, 'price');
                assert.property(res.body.stockData, 'likes');
                assert.isAbove(res.body.stockData.likes, 0); // Likes should increase
                done();
            });
    });

    // Test for viewing the same stock and liking it again (should NOT increase likes)
    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG&like=true')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.property(res.body, 'stockData');
                assert.property(res.body.stockData, 'stock');
                assert.property(res.body.stockData, 'price');
                assert.property(res.body.stockData, 'likes');
                done();
            });
    });

    // Test for viewing two stocks
    test('Viewing two stocks: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG&stock=MSFT')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body.stockData); // Must be an array
                assert.lengthOf(res.body.stockData, 2); // Must return two stock objects
                assert.property(res.body.stockData[0], 'stock');
                assert.property(res.body.stockData[0], 'price');
                assert.property(res.body.stockData[0], 'rel_likes'); // Must be 'rel_likes'
                assert.property(res.body.stockData[1], 'stock');
                assert.property(res.body.stockData[1], 'price');
                assert.property(res.body.stockData[1], 'rel_likes'); // Must be 'rel_likes'
                done();
            });
    });

    // Test for viewing two stocks and liking them
    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG&stock=MSFT&like=true')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body.stockData);
                assert.lengthOf(res.body.stockData, 2);
                assert.property(res.body.stockData[0], 'stock');
                assert.property(res.body.stockData[0], 'price');
                assert.property(res.body.stockData[0], 'rel_likes'); // Must be 'rel_likes'
                assert.property(res.body.stockData[1], 'stock');
                assert.property(res.body.stockData[1], 'price');
                assert.property(res.body.stockData[1], 'rel_likes');
                done();
            });
    });

});
