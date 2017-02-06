"use strict";
require('dotenv-extended').load();
var request =  require('request');
var fs = require('fs');

var coupon_model = require('./models/coupon.js');
var raw_data = require('./sample_data.js');

function saveFile() {
	const dir = "./coupons";
	let filePath;
	
	function init() {
		if (!fs.existsSync(dir)){
		    fs.mkdirSync(dir);
		}

		let utc = new Date().toJSON().slice(0,10).replace(/-/g,'');
		filePath = dir + '/' + utc + '.json';
	}

	function save(JSONData) {
		let data = JSON.stringify(JSONData);
		fs.writeFile(filePath, data, function(err) {
			if (err) {
				return console.log(err);
			}
		});
	}

	init();
	return save;
}

function Parser() {
	const baseURL = process.env.LUIS_MODEL_URL + '&q=';
	const entitiesType = {
		"Free" : "free",
		"minimum::moeny" : "minimum_money",
		"Discount::Rs" : "discount_rupees",
		"Discount::percent" : "discount_percent",
		"Valid::ProductType" : "valid_productType",		
		"Valid::Bool" : "valid_bool"
	}

	let saveToFile; 
	let isParseCompleted = true;
	let parsedCoupons = []; 

	function getParsedCoupons() {
		if(isParseCompleted)
			return Array.from(parsedCoupons);
		else return false;
	}

	function parse(save) {
		saveToFile = save;
		console.log("\n *START* \n");
		isParseCompleted = false;
		raw_data.forEach(function(merchant, merchant_index, merchants) {
			
			console.log("\n*PARSING COUPONS OF " + merchant.name + '*');

			let merchantName = merchant.name;
			merchant.coupons.forEach(function(coupon, coupon_index, coupons) {
			
				console.log("\n*parsing coupon " + coupon_index + '*');

				let couponCode = coupon.code;
				let parsedCoupon = Object.assign({}, coupon_model, { merchant: merchantName, code: couponCode });
				coupon.strings.forEach(function(string, string_index, strings) {

					console.log("-sending request for string " + string);
			
					let url = baseURL + encodeURIComponent(string);
	 				let last_string = string_index == strings.length - 1;
	 				let last_coupon = (coupon_index == coupons.length - 1) && (merchant_index == merchants.length - 1); 
					sendRequest(url, parsedCoupon, last_string, last_coupon); 
				});
			});
		});
	}
	
	function sendRequest(url, parsedCoupon, last_string, last_coupon) {
		request.get(url, function(err, res, body) {
			console.log("Response recieved");
	  		if(err) throw err;
	  		let data = JSON.parse(res.body);
	  		saveData(data, parsedCoupon, last_string, last_coupon);
		});
	}

	function saveData(data, parsedCoupon, last_string, last_coupon) {
		data.entities.forEach(function(entity) {
			let value = entity.entity;
			let type = entitiesType[entity.type];
			if(parsedCoupon[type]) {
				parsedCoupon[type] += value;
			}
			else parsedCoupon[type] = value;
		});
		if(last_string) {
			cleanAndPush(parsedCoupon);
		}
		if(last_coupon) {
			saveToFile(Array.from(parsedCoupons));
		}
	}

	function cleanAndPush(parsedCoupon) {
		if(parsedCoupon.discount_rupees) 
			parsedCoupon.discount_rupees = parsedCoupon.discount_rupees.replace(/\D/g, '');
		if(parsedCoupon.discount_percent)
			parsedCoupon.discount_percent = parsedCoupon.discount_percent.replace(/\D/g, '');
		if(parsedCoupon.minimum_money)
			parsedCoupon.minimum_money = parsedCoupon.minimum_money.replace(/\D/g, '');
		if(parsedCoupon.valid_bool && (parsedCoupon.valid_bool.includes("not") || parsedCoupon.valid_bool.includes("Not")) ) 
			parsedCoupon.valid_bool = false;
		else parsedCoupon.valid_bool = true;
		parsedCoupons.push(parsedCoupon);
	}

	return {
		getParsedCoupons: getParsedCoupons,
		parse : parse
	};
}

let parser = Parser();
let save = saveFile();

parser.parse(save);

console.log("\n *EXIT* \n");
