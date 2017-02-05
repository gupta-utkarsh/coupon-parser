from bs4 import BeautifulSoup
import requests
import json

def checkForKeywords(str):
	# regex use karle cheap fuck
	# --------------------------
	# Python hai. FO.
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

def getCouponCode(offer):
	# logger use kar le bc
	print('in getCouponCode')
	container = offer.parent.parent
	off = container.find_all('div', class_='get-offer-code')
	if off:
		return off[0]['data-offer-value']
	return None

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
	offers = soup.find_all('div', class_='offer-desc')
	for offer in offers:
		# Remove random empty div's
		if offer.text != '':
			coupon = {'code':'', 'strings':list()}
			code = getCouponCode(offer)
			if code == None:
				continue
			coupon['code'] = code	
			statements = list(getCouponRange(offer))

			# Remove random empty li's
			if statements != []:
				coupon['strings'] = statements
			coupons.append(coupon)
	product['name'] =  MERCHANT_NAME
	product['coupons'] = coupons
	#print(product)
	with open('domi.json', 'w') as f:
		json.dump(product, f)
	print(json.dumps(product))


