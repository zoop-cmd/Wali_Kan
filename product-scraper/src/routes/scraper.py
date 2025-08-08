from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, urlparse
import time

scraper_bp = Blueprint('scraper', __name__)

def extract_product_info(url):
    """Extract product information from a given URL"""
    try:
        # Add headers to mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
        
        # Make request with timeout
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Initialize result
        product_info = {
            'title': '',
            'description': '',
            'image': '',
            'price': '',
            'url': url
        }
        
        # Extract title - try multiple sources
        title_selectors = [
            'meta[property="og:title"]',
            'meta[name="twitter:title"]',
            'title',
            'h1',
            '.product-title',
            '.product-name',
            '#product-title'
        ]
        
        for selector in title_selectors:
            element = soup.select_one(selector)
            if element:
                if element.name == 'meta':
                    product_info['title'] = element.get('content', '').strip()
                else:
                    product_info['title'] = element.get_text().strip()
                if product_info['title']:
                    break
        
        # Extract description - try multiple sources
        description_selectors = [
            'meta[property="og:description"]',
            'meta[name="twitter:description"]',
            'meta[name="description"]',
            '.product-description',
            '.product-details',
            '.description'
        ]
        
        for selector in description_selectors:
            element = soup.select_one(selector)
            if element:
                if element.name == 'meta':
                    product_info['description'] = element.get('content', '').strip()
                else:
                    product_info['description'] = element.get_text().strip()
                if product_info['description']:
                    # Limit description length
                    if len(product_info['description']) > 200:
                        product_info['description'] = product_info['description'][:200] + '...'
                    break
        
        # Extract image - try multiple sources
        image_selectors = [
            'meta[property="og:image"]',
            'meta[name="twitter:image"]',
            '.product-image img',
            '.main-image img',
            'img[alt*="product"]',
            'img[class*="product"]'
        ]
        
        for selector in image_selectors:
            element = soup.select_one(selector)
            if element:
                if element.name == 'meta':
                    image_url = element.get('content', '').strip()
                else:
                    image_url = element.get('src', '').strip()
                
                if image_url:
                    # Convert relative URLs to absolute
                    if image_url.startswith('//'):
                        image_url = 'https:' + image_url
                    elif image_url.startswith('/'):
                        image_url = urljoin(url, image_url)
                    
                    product_info['image'] = image_url
                    break
        
        # Extract price - try multiple patterns
        price_selectors = [
            '.price',
            '.product-price',
            '.current-price',
            '.sale-price',
            '[class*="price"]',
            '[id*="price"]'
        ]
        
        for selector in price_selectors:
            element = soup.select_one(selector)
            if element:
                price_text = element.get_text().strip()
                # Look for price patterns
                price_match = re.search(r'[\$£€¥][\d,]+\.?\d*', price_text)
                if price_match:
                    product_info['price'] = price_match.group()
                    break
        
        # Fallback: if no title found, use domain name
        if not product_info['title']:
            domain = urlparse(url).netloc
            product_info['title'] = f"Product from {domain}"
        
        # Fallback: if no description found, use title
        if not product_info['description'] and product_info['title']:
            product_info['description'] = f"Check out this product: {product_info['title']}"
        
        return product_info
        
    except requests.RequestException as e:
        return {
            'title': f"Product Link",
            'description': f"Unable to load product details. Click to view on original site.",
            'image': '',
            'price': '',
            'url': url,
            'error': str(e)
        }
    except Exception as e:
        return {
            'title': f"Product Link",
            'description': f"Unable to load product details. Click to view on original site.",
            'image': '',
            'price': '',
            'url': url,
            'error': str(e)
        }

@scraper_bp.route('/scrape-product', methods=['POST'])
@cross_origin()
def scrape_product():
    """Scrape product information from a single URL"""
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Validate URL
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        product_info = extract_product_info(url)
        return jsonify(product_info)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@scraper_bp.route('/scrape-products', methods=['POST'])
@cross_origin()
def scrape_products():
    """Scrape product information from multiple URLs"""
    try:
        data = request.get_json()
        urls = data.get('urls', [])
        
        if not urls:
            return jsonify({'error': 'URLs array is required'}), 400
        
        products = []
        for url in urls:
            if not url.strip():
                continue
                
            # Validate URL
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
            
            product_info = extract_product_info(url)
            products.append(product_info)
            
            # Add small delay to be respectful to servers
            time.sleep(0.5)
        
        return jsonify({'products': products})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@scraper_bp.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'product-scraper'})

