from tetpyclient import RestClient
import pprint
import json
import os

API_ENDPOINT="https://medusa-cpoc.cisco.com"

# ``verify`` is an optional param to disable SSL server authentication.
# By default, Tetration appliance dashboard IP uses self signed cert after
# deployment. Hence, ``verify=False`` might be used to disable server
# authentication in SSL for API clients. If users upload their own
# certificate to Tetration appliance (from ``Settings > Company`` Tab)
# which is signed by their enterprise CA, then server side authentication
# should be enabled.
# credentials.json looks like:
# {
#   "api_key": "<hex string>",
#   "api_secret": "<hex string>"
# }

restclient = RestClient(API_ENDPOINT,
                credentials_file='api_cred.json',
                verify=False)

apps = []
resp = restclient.get('/applications')
if resp.status_code == 200 :
    respbody = json.loads(resp.text)
    with open('public/data/all.json', 'w+') as appf:
        appf.write( resp.text)
        respbody = json.loads( resp.text)
        for app in respbody:
            appnames = {}
            appnames['id'] = str(app['id'])
            appnames['name'] = str(app['name'])
            appnames['version'] = str(app['version'])
            apps.append( appnames)

for app in apps:
    resp = restclient.get('/applications/%s/details' %(app['id']))
    if resp.status_code == 200:
        try:
            os.mkdir('public/data/%s' %(app['id']))
        except:
            pass
        with open('public/data/%s.json' %(app['id']), "w+") as outf:
            outf.write( resp.text)
        with open('public/data/%s/%s.json' %(app['id'], app['version']), "w+") as outf2:
            outf2.write( resp.text)
