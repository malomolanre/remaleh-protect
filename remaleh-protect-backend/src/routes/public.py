from flask import Blueprint, request, jsonify, Response
from datetime import datetime, timezone
import urllib.request
import requests
from urllib.parse import urlparse
import xml.etree.ElementTree as ET
import re
import html as html_lib
import email.utils as email_utils
import ssl

public_bp = Blueprint('public', __name__)

@public_bp.route('/blog-feed', methods=['GET'])
def blog_feed():
    """Fetch and return Remaleh blog RSS/Atom feed as JSON with rich fields."""
    limit = request.args.get('limit', 6, type=int)
    # Prefer the provided blog RSS; fallback to legacy path
    feed_candidates = [
        'https://www.remaleh.com.au/blog/blog-feed.xml',
        'https://www.remaleh.com.au/blog/feed/',
        # Non-www fallbacks in case of SNI/cert differences
        'https://remaleh.com.au/blog/blog-feed.xml',
        'https://remaleh.com.au/blog/feed/'
    ]
    last_error = None
    for feed_url in feed_candidates:
        try:
            # Try requests first (often handles SNI/certs better)
            try:
                r = requests.get(feed_url, headers={
                    'User-Agent': 'Mozilla/5.0 (compatible; RemalehProtect/1.0)',
                    'Accept': 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5'
                }, timeout=10)
                r.raise_for_status()
                data = r.content
            except Exception:
                # Fallback to urllib
                req = urllib.request.Request(
                    feed_url,
                    headers={
                        'User-Agent': 'Mozilla/5.0 (compatible; RemalehProtect/1.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
                        'Accept': 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5'
                    }
                )
                ctx = ssl.create_default_context()
                with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
                    data = resp.read()
            # Parse RSS XML
            root = ET.fromstring(data)
            items = []
            ns = {
                'atom': 'http://www.w3.org/2005/Atom',
                'dc': 'http://purl.org/dc/elements/1.1/',
                'media': 'http://search.yahoo.com/mrss/',
                'content': 'http://purl.org/rss/1.0/modules/content/'
            }
            # Try RSS 2.0 (rss/channel/item)
            channel = root.find('channel') if root is not None else None
            entries = []
            if channel is not None:
                entries = channel.findall('item')
            else:
                # Try Atom (feed/entry)
                entries = root.findall('{http://www.w3.org/2005/Atom}entry')

            def text_or_none(el):
                return el.text.strip() if el is not None and el.text else None

            def strip_html(text):
                if not text:
                    return None
                no_tags = re.sub(r'<[^>]+>', '', text)
                return html_lib.unescape(no_tags).strip()

            def extract_image(item_el):
                thumb = item_el.find('media:thumbnail', ns)
                if thumb is not None and thumb.attrib.get('url'):
                    return thumb.attrib.get('url')
                media_content = item_el.find('media:content', ns)
                if media_content is not None and media_content.attrib.get('url'):
                    url = media_content.attrib.get('url')
                    m_type = media_content.attrib.get('type', '')
                    if not m_type or m_type.startswith('image/'):
                        return url
                enclosure = item_el.find('enclosure')
                if enclosure is not None:
                    url = enclosure.attrib.get('url')
                    m_type = enclosure.attrib.get('type', '')
                    if url and (not m_type or m_type.startswith('image/')):
                        return url
                desc_html = text_or_none(item_el.find('description')) or text_or_none(item_el.find('content:encoded', ns))
                if not desc_html:
                    atom_summary = item_el.find('atom:summary', ns)
                    if atom_summary is not None and atom_summary.text:
                        desc_html = atom_summary.text
                    atom_content = item_el.find('atom:content', ns)
                    if not desc_html and atom_content is not None and atom_content.text:
                        desc_html = atom_content.text
                if desc_html:
                    m = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', desc_html, re.IGNORECASE)
                    if m:
                        return m.group(1)
                return None

            def extract_categories(item_el):
                cats = []
                for c in item_el.findall('category'):
                    t = text_or_none(c)
                    if t:
                        cats.append(t)
                for c in item_el.findall('atom:category', ns):
                    term = c.attrib.get('term')
                    if term:
                        cats.append(term)
                return cats
            for item in entries[:limit]:
                title_el = item.find('title') or item.find('{http://www.w3.org/2005/Atom}title')
                link_el = item.find('link') or item.find('{http://www.w3.org/2005/Atom}link')
                date_el = (
                    item.find('pubDate') or
                    item.find('{http://www.w3.org/2005/Atom}updated') or
                    item.find('{http://www.w3.org/2005/Atom}published') or
                    item.find('dc:date', ns)
                )
                title = title_el.text.strip() if title_el is not None and title_el.text else ''
                # Atom link may be attribute href
                link = ''
                if link_el is not None:
                    link = (link_el.text or '').strip()
                    href = link_el.attrib.get('href')
                    if href:
                        link = href.strip()
                pub_date = date_el.text.strip() if date_el is not None and date_el.text else None

                desc_html = text_or_none(item.find('description'))
                if not desc_html:
                    desc_html = text_or_none(item.find('content:encoded', ns))
                if not desc_html:
                    desc_html = text_or_none(item.find('atom:summary', ns)) or text_or_none(item.find('atom:content', ns))
                excerpt = strip_html(desc_html) if desc_html else None
                if excerpt and len(excerpt) > 240:
                    excerpt = excerpt[:237].rstrip() + '...'

                author = text_or_none(item.find('dc:creator', ns))
                if not author:
                    atom_author = item.find('atom:author', ns)
                    if atom_author is not None:
                        author = text_or_none(atom_author.find('atom:name', ns)) or text_or_none(atom_author.find('name'))

                categories = extract_categories(item)
                image = extract_image(item)

                items.append({
                    'title': title,
                    'link': link,
                    'pubDate': pub_date,
                    'excerpt': excerpt,
                    'author': author,
                    'categories': categories,
                    'image': image
                })
            # Sort items by pubDate desc if available
            def _parse_date(value):
                if not value:
                    return 0
                try:
                    # Try RFC 2822/RSS style
                    dt = email_utils.parsedate_to_datetime(value)
                    if dt is None:
                        raise ValueError('unparsed')
                    if dt.tzinfo is None:
                        dt = dt.replace(tzinfo=timezone.utc)
                    return int(dt.timestamp())
                except Exception:
                    try:
                        # Try ISO 8601 (Atom)
                        s = value.replace('Z', '+00:00')
                        dt = datetime.fromisoformat(s)
                        if dt.tzinfo is None:
                            dt = dt.replace(tzinfo=timezone.utc)
                        return int(dt.timestamp())
                    except Exception:
                        return 0

            items.sort(key=lambda it: _parse_date(it.get('pubDate')), reverse=True)

            return jsonify({'items': items, 'source': feed_url}), 200
        except Exception as e:
            # One last fallback: allow insecure TLS if explicitly needed (source is our own site)
            try:
                r = requests.get(feed_url, headers={
                    'User-Agent': 'Mozilla/5.0 (compatible; RemalehProtect/1.0)',
                    'Accept': 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5'
                }, timeout=10, verify=False)
                r.raise_for_status()
                data = r.content
                # If we got here, reuse the same parsing logic by re-entering the loop body
                root = ET.fromstring(data)
                items = []
                ns = {
                    'atom': 'http://www.w3.org/2005/Atom',
                    'dc': 'http://purl.org/dc/elements/1.1/',
                    'media': 'http://search.yahoo.com/mrss/',
                    'content': 'http://purl.org/rss/1.0/modules/content/'
                }
                channel = root.find('channel') if root is not None else None
                entries = channel.findall('item') if channel is not None else root.findall('{http://www.w3.org/2005/Atom}entry')
                def text_or_none(el):
                    return el.text.strip() if el is not None and el.text else None
                def strip_html(text):
                    if not text:
                        return None
                    no_tags = re.sub(r'<[^>]+>', '', text)
                    return html_lib.unescape(no_tags).strip()
                def extract_image(item_el):
                    thumb = item_el.find('media:thumbnail', ns)
                    if thumb is not None and thumb.attrib.get('url'):
                        return thumb.attrib.get('url')
                    media_content = item_el.find('media:content', ns)
                    if media_content is not None and media_content.attrib.get('url'):
                        url = media_content.attrib.get('url')
                        m_type = media_content.attrib.get('type', '')
                        if not m_type or m_type.startswith('image/'):
                            return url
                    enclosure = item_el.find('enclosure')
                    if enclosure is not None:
                        url = enclosure.attrib.get('url')
                        m_type = enclosure.attrib.get('type', '')
                        if url and (not m_type or m_type.startswith('image/')):
                            return url
                    desc_html = text_or_none(item_el.find('description')) or text_or_none(item_el.find('content:encoded', ns))
                    if not desc_html:
                        atom_summary = item_el.find('atom:summary', ns)
                        if atom_summary is not None and atom_summary.text:
                            desc_html = atom_summary.text
                        atom_content = item_el.find('atom:content', ns)
                        if not desc_html and atom_content is not None and atom_content.text:
                            desc_html = atom_content.text
                    if desc_html:
                        m = re.search(r'<img[^>]+src=["']([^"']+)["']', desc_html, re.IGNORECASE)
                        if m:
                            return m.group(1)
                    return None
                def extract_categories(item_el):
                    cats = []
                    for c in item_el.findall('category'):
                        t = text_or_none(c)
                        if t:
                            cats.append(t)
                    for c in item_el.findall('atom:category', ns):
                        term = c.attrib.get('term')
                        if term:
                            cats.append(term)
                    return cats
                for item in entries[:limit]:
                    title_el = item.find('title') or item.find('{http://www.w3.org/2005/Atom}title')
                    link_el = item.find('link') or item.find('{http://www.w3.org/2005/Atom}link')
                    date_el = (
                        item.find('pubDate') or
                        item.find('{http://www.w3.org/2005/Atom}updated') or
                        item.find('{http://www.w3.org/2005/Atom}published') or
                        item.find('dc:date', ns)
                    )
                    title = title_el.text.strip() if title_el is not None and title_el.text else ''
                    link = ''
                    if link_el is not None:
                        link = (link_el.text or '').strip()
                        href = link_el.attrib.get('href')
                        if href:
                            link = href.strip()
                    pub_date = date_el.text.strip() if date_el is not None and date_el.text else None
                    desc_html = text_or_none(item.find('description')) or text_or_none(item.find('content:encoded', ns)) or text_or_none(item.find('atom:summary', ns)) or text_or_none(item.find('atom:content', ns))
                    excerpt = strip_html(desc_html) if desc_html else None
                    if excerpt and len(excerpt) > 240:
                        excerpt = excerpt[:237].rstrip() + '...'
                    author = text_or_none(item.find('dc:creator', ns))
                    if not author:
                        atom_author = item.find('atom:author', ns)
                        if atom_author is not None:
                            author = text_or_none(atom_author.find('atom:name', ns)) or text_or_none(atom_author.find('name'))
                    categories = extract_categories(item)
                    image = extract_image(item)
                    items.append({
                        'title': title,
                        'link': link,
                        'pubDate': pub_date,
                        'excerpt': excerpt,
                        'author': author,
                        'categories': categories,
                        'image': image
                    })
                def _parse_date(value):
                    if not value:
                        return 0
                    try:
                        dt = email_utils.parsedate_to_datetime(value)
                        if dt is None:
                            raise ValueError('unparsed')
                        if dt.tzinfo is None:
                            dt = dt.replace(tzinfo=timezone.utc)
                        return int(dt.timestamp())
                    except Exception:
                        try:
                            s = value.replace('Z', '+00:00')
                            dt = datetime.fromisoformat(s)
                            if dt.tzinfo is None:
                                dt = dt.replace(tzinfo=timezone.utc)
                            return int(dt.timestamp())
                        except Exception:
                            return 0
                items.sort(key=lambda it: _parse_date(it.get('pubDate')), reverse=True)
                return jsonify({'items': items, 'source': feed_url + ' (insecure)'}), 200
            except Exception as e2:
                last_error = f"{e}; insecure_fallback={e2}"
                continue
    return jsonify({'items': [], 'error': last_error or 'feed_unavailable', 'source': 'none'}), 200

@public_bp.route('/rss-proxy', methods=['GET'])
def rss_proxy():
    """Lightweight server-side proxy for RSS/XML to avoid frontend TLS/CORS issues.
    Only allows remaleh.com.au domains.
    """
    feed_url = request.args.get('url') or 'https://www.remaleh.com.au/blog/blog-feed.xml'
    try:
        parsed = urlparse(feed_url)
        host = (parsed.hostname or '').lower()
        if not host.endswith('remaleh.com.au'):
            return jsonify({'error': 'forbidden_domain'}), 403
        # Fetch with requests; allow slight leniency on TLS if needed
        try:
            r = requests.get(feed_url, headers={'User-Agent': 'RemalehProtect/1.0'}, timeout=10)
            r.raise_for_status()
            data = r.content
        except Exception:
            r = requests.get(feed_url, headers={'User-Agent': 'RemalehProtect/1.0'}, timeout=10, verify=False)
            r.raise_for_status()
            data = r.content
        return Response(data, mimetype='application/rss+xml')
    except Exception as e:
        return jsonify({'error': str(e)}), 502


