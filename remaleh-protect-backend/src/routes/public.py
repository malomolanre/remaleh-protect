from flask import Blueprint, request, jsonify
from datetime import datetime
import urllib.request
import xml.etree.ElementTree as ET

public_bp = Blueprint('public', __name__)

@public_bp.route('/blog-feed', methods=['GET'])
def blog_feed():
    """Fetch and return Remaleh blog RSS feed as JSON (titles and links)."""
    feed_url = 'https://www.remaleh.com.au/blog/feed/'
    limit = request.args.get('limit', 6, type=int)
    try:
        with urllib.request.urlopen(feed_url, timeout=8) as resp:
            data = resp.read()
        # Parse RSS XML
        root = ET.fromstring(data)
        # Typical RSS: rss/channel/item
        items = []
        channel = root.find('channel') if root is not None else None
        entries = channel.findall('item') if channel is not None else []
        for item in entries[:limit]:
            title_el = item.find('title')
            link_el = item.find('link')
            date_el = item.find('pubDate')
            title = title_el.text.strip() if title_el is not None and title_el.text else ''
            link = link_el.text.strip() if link_el is not None and link_el.text else ''
            pub_date = date_el.text.strip() if date_el is not None and date_el.text else None
            items.append({
                'title': title,
                'link': link,
                'pubDate': pub_date
            })
        return jsonify({'items': items, 'source': 'rss'}), 200
    except Exception as e:
        return jsonify({'items': [], 'error': str(e), 'source': 'rss'}), 200


