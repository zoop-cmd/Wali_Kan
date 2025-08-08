from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import os
import json
from datetime import datetime
from src.routes.scraper import extract_product_info
import time

admin_bp = Blueprint('admin', __name__)

# File to store product data
PRODUCTS_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'products.json')

def ensure_data_directory():
    """Ensure the data directory exists"""
    data_dir = os.path.dirname(PRODUCTS_FILE)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)

def load_products():
    """Load products from JSON file"""
    ensure_data_directory()
    if os.path.exists(PRODUCTS_FILE):
        try:
            with open(PRODUCTS_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    return []

def save_products(products):
    """Save products to JSON file"""
    ensure_data_directory()
    try:
        with open(PRODUCTS_FILE, 'w') as f:
            json.dump(products, f, indent=2)
        return True
    except IOError:
        return False

@admin_bp.route('/upload-products-file', methods=['POST'])
@cross_origin()
def upload_products_file():
    """
    Admin endpoint to upload products from a text file
    Expects a file upload with 'file' field containing URLs (one per line)
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.endswith('.txt'):
            return jsonify({'error': 'Only .txt files are allowed'}), 400
        
        # Read file content
        content = file.read().decode('utf-8')
        urls = [line.strip() for line in content.split('\n') if line.strip()]
        
        if not urls:
            return jsonify({'error': 'No URLs found in file'}), 400
        
        # Scrape product information
        products = []
        for url in urls:
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
            
            product_info = extract_product_info(url)
            product_info['uploaded_at'] = datetime.now().isoformat()
            products.append(product_info)
            
            # Add small delay to be respectful to servers
            time.sleep(0.5)
        
        # Load existing products and add new ones
        existing_products = load_products()
        all_products = existing_products + products
        
        # Save updated products
        if save_products(all_products):
            return jsonify({
                'message': f'Successfully uploaded {len(products)} products',
                'products_added': len(products),
                'total_products': len(all_products)
            })
        else:
            return jsonify({'error': 'Failed to save products'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/upload-products-urls', methods=['POST'])
@cross_origin()
def upload_products_urls():
    """
    Admin endpoint to upload products from a list of URLs
    Expects JSON with 'urls' array
    """
    try:
        data = request.get_json()
        urls = data.get('urls', [])
        
        if not urls:
            return jsonify({'error': 'No URLs provided'}), 400
        
        # Scrape product information
        products = []
        for url in urls:
            if not url.strip():
                continue
                
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
            
            product_info = extract_product_info(url)
            product_info['uploaded_at'] = datetime.now().isoformat()
            products.append(product_info)
            
            # Add small delay to be respectful to servers
            time.sleep(0.5)
        
        # Load existing products and add new ones
        existing_products = load_products()
        all_products = existing_products + products
        
        # Save updated products
        if save_products(all_products):
            return jsonify({
                'message': f'Successfully uploaded {len(products)} products',
                'products_added': len(products),
                'total_products': len(all_products)
            })
        else:
            return jsonify({'error': 'Failed to save products'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/products', methods=['GET'])
@cross_origin()
def get_products():
    """Get all products for display in the app"""
    try:
        products = load_products()
        return jsonify({'products': products})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/clear-products', methods=['DELETE'])
@cross_origin()
def clear_products():
    """Admin endpoint to clear all products"""
    try:
        if save_products([]):
            return jsonify({'message': 'All products cleared successfully'})
        else:
            return jsonify({'error': 'Failed to clear products'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin-help', methods=['GET'])
@cross_origin()
def admin_help():
    """Provide help information for admin endpoints"""
    help_info = {
        'admin_endpoints': {
            'upload_file': {
                'method': 'POST',
                'endpoint': '/api/admin/upload-products-file',
                'description': 'Upload products from a .txt file',
                'usage': 'curl -X POST -F "file=@products.txt" http://your-domain/api/admin/upload-products-file'
            },
            'upload_urls': {
                'method': 'POST',
                'endpoint': '/api/admin/upload-products-urls',
                'description': 'Upload products from JSON array of URLs',
                'usage': 'curl -X POST -H "Content-Type: application/json" -d \'{"urls":["https://example.com/product1","https://example.com/product2"]}\' http://your-domain/api/admin/upload-products-urls'
            },
            'get_products': {
                'method': 'GET',
                'endpoint': '/api/admin/products',
                'description': 'Get all current products'
            },
            'clear_products': {
                'method': 'DELETE',
                'endpoint': '/api/admin/clear-products',
                'description': 'Clear all products'
            }
        },
        'file_format': {
            'description': 'Text file should contain one URL per line',
            'example': 'https://www.amazon.com/product1\nhttps://www.ebay.com/product2\nhttps://www.etsy.com/product3'
        }
    }
    return jsonify(help_info)

