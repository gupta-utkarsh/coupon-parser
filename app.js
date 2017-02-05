"use strict";
require('dotenv-extended').load();

var request =  require('request');
var querystring = require('querystring');
var coupon_model = require('./models/coupon.js');
var raw_data = require('./data.js');

function Parser() {
	const baseURL = process.env.LUIS_MODEL_URL + '&q=';
	const entities = {
		"Free" : "free",
		"minimum::money" : "minimum.money",
		"Discount::Rs" : "discount.rupees",
		"Discount::percent" : "discount.percent",
		"Valid::ProductType" : "valid.productType",		
		"Valid::Bool" : "valid.bool"
	}

	let parsedCoupons = []; 

	function getParsedCoupons() {
		return Array.from(parsedCoupons);
	}

	function parse() {
		console.log("\n *START* \n");
		raw_data.forEach(function(merchant, merchant_index) {
			
			console.log("\n*PARSING COUPONS OF " + merchant.name + '*');

			let merchantName = merchant.name;
			merchant.coupons.forEach(function(coupon, coupon_index) {
			
				console.log("\n*parsing coupon " + coupon_index + '*');

				let parsedCoupon = Object.assign({}, coupon_model, { merchant: merchantName });
				coupon.forEach(function(string, string_index, strings) {

					console.log("-sending request for string " + string);
			
					let url = baseURL + encodeURIComponent(string);
	 				let last = string_index == strings.length - 1 ? true : false;
					sendRequest(url, parsedCoupon, last); 
				});
			});
		});
	}
	
	function sendRequest(url, parsedCoupon, last) {
		request.get(url, function(err, res, body) {
  		if(err) throw err;
  		let data = JSON.parse(res.body);
  		saveData(data, parsedCoupon, last);
		});
		saveData({}, parsedCoupon, last);
	}

	function saveData(data, parsedCoupon, last) {
		console.log(data, parsedCoupon, last);
	}

	return {
		getParsedCoupons: getParsedCoupons,
		parse : parse
	};
}

let parser = Parser();
// parser.parse();

console.log("\n *EXIT* \n");