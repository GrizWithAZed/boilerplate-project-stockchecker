'use strict';

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    
    // Test for viewing one stock without liking it
    test('Viewing one stock: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG')
            .end((err, res) => {
                assert.equal(res.status, 200); // Ensure the response status is 200 (OK)
                assert.isObject(res.body); // The response should be an object
                assert.property(res.body, 'stock'); // Should contain 'stock' property
                assert.property(res.body, 'price'); // Should contain 'price' property
                assert.property(res.body, 'likes'); // Should contain 'likes' property
                assert.isNumber(res.body.likes); // Likes should be a number
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
                assert.property(res.body, 'stock');
                assert.property(res.body, 'price');
                assert.property(res.body, 'likes');
                assert.isAbove(res.body.likes, 0); // Likes count should be greater than zero
                done();
            });
    });

    // Test for viewing the same stock and liking it again to verify it does not increase from the same IP
    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG&like=true')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.property(res.body, 'stock');
                assert.property(res.body, 'price');
                assert.property(res.body, 'likes');
                assert.isAbove(res.body.likes, 0); // Ensure likes do not increase multiple times from the same IP
                done();
            });
    });

    // Test for viewing two different stocks without likes
    test('Viewing two stocks: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG&stock=MSFT')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body); // The response should be an array containing stock objects
                assert.lengthOf(res.body, 2); // The array should contain exactly two stock objects
                assert.property(res.body[0], 'stock');
                assert.property(res.body[0], 'price');
                assert.property(res.body[0], 'likes');
                assert.property(res.body[1], 'stock');
                assert.property(res.body[1], 'price');
                assert.property(res.body[1], 'likes');
                done();
            });
    });

    // Test for viewing two stocks and liking them both
    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG&stock=MSFT&like=true')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.lengthOf(res.body, 2);
                assert.property(res.body[0], 'stock');
                assert.property(res.body[0], 'price');
                assert.property(res.body[0], 'likes');
                assert.property(res.body[1], 'stock');
                assert.property(res.body[1], 'price');
                assert.property(res.body[1], 'likes');
                assert.isAbove(res.body[0].likes, 0); // Ensure likes were added for both stocks
                assert.isAbove(res.body[1].likes, 0);
                done();
            });
    });
});
