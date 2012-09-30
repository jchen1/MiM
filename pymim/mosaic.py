#!/usr/bin/env python
# -*- encoding: utf-8 -*-
"""
Mosaic in Mosaic.
How to run locally:
(1) python mosaic.py
(2) go to localhost:8080
(3) there is no three
"""

from bottle import *
import json
import urllib

__author__ = "CMU Team 0"
__version__ = "0"
__requires__ = ['bottle']
__apikey__ = 'KloQFw7b0NkGEPsbHPBdlnz2VbA76Zmo555EghQ4ru2PpizJqV'

app = Bottle()


@app.get('/')
def home():
    html = ''
    with open('templates/main.html') as f:
        html = f.read()
    return html % ("""<img src="http://lorempixel.com/1200/500/" alt="image" class="bgimage" />""")


@app.post('/')
def tag():
    html = ''
    with open('templates/main.html') as f:
        html = f.read()
    requested_tag = request.forms.tag
    this_sucks = ""  # return value
    for url, width, height in tumblr_shit(requested_tag):
        this_sucks += """<img src="%s" alt="%s" class="bgimage" /><br/>""" % (url, requested_tag)
    return html % (''.join(this_sucks))


@app.get('/static/<filepath:path>')
def server_static(filepath):
    """Serves static files from the static directory."""
    return static_file(filepath, root='./static/')


def get_json_response(url):
    response = urllib.urlopen(url)
    return json.loads(response.read().decode('utf8'))


def tumblr_shit(tag):
    url = "http://api.tumblr.com/v2/tagged?tag=" + tag + '&api_key=' + __apikey__ + '&filter=text'
    data = get_json_response(url)
    photos = []
    try:
        for thing in data['response']:
            if u'photos' in thing:
                crap = thing['photos'][0]['original_size']
                photos.append((crap['url'], crap['width'], crap['height']))
    except Exception, e:
        return "error" + str(e)
    return photos

if __name__ == '__main__':
    run(app, host='localhost', port=8080)
