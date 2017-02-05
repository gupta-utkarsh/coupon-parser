from bs4 import BeautifulSoup
import requests
import json

def checkForKeywords(str):
	keywords = ['order', 'buy' 'cashback', 'valid', 'not', 'only', 'available', 'applicable', 'flat']
	for keyword in keywords:
		if keyword in str:
			return True
	return False

# Generator object to get all statements for a particular offer
def getCouponRange(offer):
	lis = offer.find_all('li')
	if lis:
		for index, li in enumerate(lis):
			if index == OL_MAX_DEPTH:
				break
			#print(li.text, 'from', index)
			content = li.text
			if content is not None:
				if checkForKeywords(content):
					#print(li.text, 'from', index)
					yield content
	elif offer.text != '' and checkForKeywords(offer.text):
		print('no li in this')
		yield offer.text

OL_MAX_DEPTH = 3

MERCHANT_NAME = 'Dominos'

page = requests.get('http://localhost/projects/domi.html')

product = dict()
coupons = list()
if not page.status_code == 200:
	print('some error in fetching')

else:
	soup = BeautifulSoup(page.content, 'html.parser')
	#print(soup.prettify())
	#print(list(soup.children)[0])
	offersdesc = soup.find_all('div', class_='offer-desc')
	for offer in offersdesc:
		statements = list(getCouponRange(offer))
		if statements != []:
			coupons.append(statements)
	product['name'] =  MERCHANT_NAME
	product['coupons'] = coupons
	#print(product)
	with open('domi.json', 'w') as f:
		json.dump(product, f)
	print(json.dumps(product))


