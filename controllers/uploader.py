#stolen from
#https://bitbucket.org/luca_de_alfaro/web2py_start_2016/src/f1f53c41f65ffa3b1cd5aa6a772d1d2db5d290b2/controllers/uploader.py?at=luca-gcs-uploads&fileviewer=file-view-default

import base64
import json
import os
import time
import urllib

import Crypto.Hash.SHA256 as SHA256
import Crypto.PublicKey.RSA as RSA
import Crypto.Signature.PKCS1_v1_5 as PKCS1_v1_5

from gluon.utils import web2py_uuid
from gluon import current

def base64sign(plaintext, private_key):
    shahash = SHA256.new(plaintext)
    signer = PKCS1_v1_5.new(private_key)
    signature_bytes = signer.sign(shahash)
    return base64.b64encode(signature_bytes)

GCS_API_ENDPOINT = 'https://storage.googleapis.com'
BUCKET_NAME = '/cs183project/'

SIGNATURE_STRING = ('{verb}\n'
                    '{content_md5}\n'
                    '{content_type}\n'
                    '{expiration}\n'
                    '{resource}')

priv_folder = os.path.join(current.request.folder, 'private')
key_file = os.path.join(priv_folder, 'gcs_keys.json')
GCS_KEY_INFO = json.load(open('upbeat-plating-206601-ef8ac85747c9.json'))
#GCS_KEY_INFO = json.load(open(key_file))
#This is how it should be, but i don't know how to do it properly


def sign_url(path, expiration, account_email, keytext,
             verb='GET', content_type='', content_md5=''):
    """
    Forms and returns the full signed URL to access GCS.
    path: is the name of the GCS file to sign
    expiration: is a datetime object
    account_email: is the email of the account performing isgnature
    keytext: is the key to use for signing (assigned by google)
    verb: only 'GET' supported
    content_type: optional
    content_md5: also optional
    """
    private_key = RSA.importKey(keytext)
    if not path.startswith('/'):
        path = '/'+path
    base_url = '%s%s' % (GCS_API_ENDPOINT, path)
    string_to_sign = SIGNATURE_STRING.format(verb=verb,
                                             content_md5=content_md5,
                                             content_type=content_type,
                                             expiration=expiration,
                                             resource=path)
    logger.debug("String to sign: %r", string_to_sign)
    signature_signed = base64sign(string_to_sign, private_key)
    query_params = {'GoogleAccessId': account_email,
                    'Expires': str(expiration),
                    'Signature': signature_signed}
    return base_url+'?'+urllib.urlencode(query_params)


def gcs_url(path, verb='GET', expiration_secs=1000, content_type=''):
    """Generates a GCS path
    Given a path on GCS and an expiration_secs (seconds) it generates a signed URL valid for that
    number of seconds. keytext and gae_app and inferred from the environment, pass only to override
    gae_app is necessary when running locally and server_utils is not available.
    """
    expiration = int(time.time() + expiration_secs)
    signed_url = sign_url(path, verb=verb, expiration = expiration,
                          content_type=content_type,
                          account_email=GCS_KEY_INFO['client_email'],
                          keytext=GCS_KEY_INFO['private_key']
                          )
    return signed_url


def get_upload_url():
    """Returns a fresh URL with ID to post something to GCS.
    It returns a dictionary with two fields:
    - upload_url: used for uploading
    - download_url: used for retrieving the content"""
    # Invents a random name for the image.
    image_path = BUCKET_NAME + web2py_uuid() + ".jpg"
    signed_put_url = gcs_url(image_path, verb='PUT', content_type='image/jpeg')
    signed_get_url = gcs_url(image_path, verb='GET',
                             expiration_secs=3600 * 24 * 365)
    # This line is required; otherwise, cross-domain requests are not accepted.
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response.json(dict(
        signed_url=signed_put_url,
        access_url=signed_get_url
    ))