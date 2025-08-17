from flask import Blueprint, request, jsonify
from datetime import datetime
import urllib.request
import xml.etree.ElementTree as ET

public_bp = Blueprint('public', __name__)

@public_bp.route('/blog-feed', methods=['GET'])
def blog_feed():
    """Fetch and return Remaleh blog RSS feed as JSON (titles and links)."""
    limit = request.args.get('limit', 6, type=int)
    # Prefer the provided blog RSS; fallback to legacy path
    feed_candidates = [
        'https://www.remaleh.com.au/blog/blog-feed.xml',
        'https://www.remaleh.com.au/blog/feed/'
    ]
    last_error = None
    for feed_url in feed_candidates:
        try:
            with urllib.request.urlopen(feed_url, timeout=8) as resp:
                data = resp.read()
            # Parse RSS XML
            root = ET.fromstring(data)
            items = []
            # Try RSS 2.0 (rss/channel/item)
            channel = root.find('channel') if root is not None else None
            entries = []
            if channel is not None:
                entries = channel.findall('item')
            else:
                # Try Atom (feed/entry)
                entries = root.findall('{http://www.w3.org/2005/Atom}entry')
            for item in entries[:limit]:
                title_el = item.find('title') or item.find('{http://www.w3.org/2005/Atom}title')
                link_el = item.find('link') or item.find('{http://www.w3.org/2005/Atom}link')
                date_el = item.find('pubDate') or item.find('{http://www.w3.org/2005/Atom}updated')
                title = title_el.text.strip() if title_el is not None and title_el.text else ''
                # Atom link may be attribute href
                link = ''
                if link_el is not None:
                    link = (link_el.text or '').strip()
                    href = link_el.attrib.get('href')
                    if href:
                        link = href.strip()
                pub_date = date_el.text.strip() if date_el is not None and date_el.text else None
                items.append({'title': title, 'link': link, 'pubDate': pub_date})
            return jsonify({'items': items, 'source': feed_url}), 200
        except Exception as e:
            last_error = str(e)
            continue
    return jsonify({'items': [], 'error': last_error or 'feed_unavailable', 'source': 'none'}), 200


