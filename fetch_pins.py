import urllib.request
import xml.etree.ElementTree as ET
import re
import json

url = 'https://tr.pinterest.com/everly940/fashion-girls.rss'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        xml_data = response.read()
    root = ET.fromstring(xml_data)
    urls = []
    for item in root.findall('./channel/item/description'):
        match = re.search(r'src="([^"]+)"', item.text)
        if match:
            # Try to get higher res
            img_url = match.group(1).replace('236x', '736x')
            urls.append(img_url)
    print("Found", len(urls), "images.")
    print(json.dumps(urls))
except Exception as e:
    print('Error:', e)
