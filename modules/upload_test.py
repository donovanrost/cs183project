import requests
import time

API_URL = "http://127.0.0.1:8000/cs183project/uploader/get_upload_url"

IMG_FILE = "IMG_0542.JPG"

headers = {}
headers['Content-Type'] = 'image/jpeg'

# First, gets an image upload URL.
r = requests.get(API_URL)
urls = r.json()
put_url = urls['signed_url']
get_url = urls['access_url']
print "Urls received"
print "  put_url:", put_url
print "  get_url:", get_url

# Uploads image.
with open(IMG_FILE) as data:
    req = requests.put(put_url, data=data, headers=headers)
    print "Upload outcome:", req.status_code

# Download image.
time.sleep(1.0)
req = requests.get(get_url)
print "GET status:", req.status_code
