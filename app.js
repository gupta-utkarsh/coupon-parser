var fs = require("fs");
var request =  require('request');
var querystring = require('querystring');
console.log("\n *START* \n");
var content = JSON.parse(fs.readFileSync("data.json"));
var query = content[0].coupons[0][0];
var url = encodeURIComponent(query);
var final = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/a1571a7c-a529-4942-8559-77b2ac06996a?subscription-key=2ce69e2f40a1471eb70dea8344bf8b0b&q='+url;
console.log(final);
request.get(final,function(err,res,body){
  if(err) throw err;
  console.log(res.body);
});
console.log("\n *EXIT* \n");