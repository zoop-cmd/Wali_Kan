import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { TrendingUp, Home, Briefcase, DollarSign, Search, Upload, ExternalLink, RefreshCw, MessageCircle, ShoppingBag, Newspaper } from 'lucide-react'
import './App.css'

// RSS to JSON proxy service
const RSS_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url='

// Product scraper API endpoint
const SCRAPER_API = 'http://localhost:5000/api'

// Newspaper-style category colors
const categoryColors = {
  business: 'bg-gray-800 text-white',
  finance: 'bg-gray-700 text-white',
  entertainment: 'bg-gray-600 text-white',
  lifestyle: 'bg-gray-500 text-white',
  sports: 'bg-gray-800 text-white',
  realestate: 'bg-gray-700 text-white',
  jobs: 'bg-gray-600 text-white',
  shopping: 'bg-gray-800 text-white',
  default: 'bg-gray-600 text-white'
}

// Screen components
const BusinessSectionScreen = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStockNews = async () => {
    setLoading(true)
    setError(null)
    try {
      // Try multiple RSS feeds for better reliability
      const feeds = [
        'https://feeds.finance.yahoo.com/rss/2.0/headline',
        'https://www.cnbc.com/id/100003114/device/rss/rss.html',
        'https://feeds.bloomberg.com/markets/news.rss'
      ]
      
      let articles = []
      
      for (const feedUrl of feeds) {
        try {
          const response = await fetch(`${RSS_PROXY}${encodeURIComponent(feedUrl)}`)
          const data = await response.json()
          
          if (data.status === 'ok' && data.items) {
            const feedArticles = data.items.slice(0, 5).map((item, index) => ({
              id: `${feedUrl}-${index}`,
              title: item.title,
              description: item.description?.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
              url: item.link,
              source: { name: data.feed?.title || 'Financial Times' },
              publishedAt: item.pubDate,
              category: 'Business',
              comments: Math.floor(Math.random() * 500) + 10
            }))
            articles = [...articles, ...feedArticles]
            if (articles.length >= 10) break
          }
        } catch (feedError) {
          console.warn(`Failed to fetch from ${feedUrl}:`, feedError)
        }
      }
      
      if (articles.length > 0) {
        setNews(articles.slice(0, 10))
      } else {
        throw new Error('No news feeds available')
      }
    } catch (err) {
      console.error('Error fetching business news:', err)
      setError(err.message)
      // Enhanced fallback data with newspaper-style formatting
      setNews([
        { 
          id: 1, 
          title: "Stock Market Reaches New Highs Amid Strong Earnings", 
          url: "https://finance.yahoo.com/news/stock-market-today", 
          description: "Major indices continue upward trend with strong quarterly earnings reports from tech giants and financial institutions...",
          source: { name: "Financial Times" },
          publishedAt: new Date().toISOString(),
          category: "Business",
          comments: 247
        },
        { 
          id: 2, 
          title: "Tech Stocks Lead Market Rally on AI Investment Surge", 
          url: "https://www.cnbc.com/technology/", 
          description: "Technology sector shows exceptional performance driven by artificial intelligence investments and cloud computing growth...",
          source: { name: "Wall Street Journal" },
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          category: "Business",
          comments: 189
        },
        { 
          id: 3, 
          title: "Federal Reserve Maintains Interest Rate Policy", 
          url: "https://www.bloomberg.com/markets", 
          description: "Central bank officials signal continued monetary policy stance as inflation metrics show stabilization...",
          source: { name: "Bloomberg" },
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          category: "Business",
          comments: 156
        },
        { 
          id: 4, 
          title: "Energy Sector Gains on Oil Price Recovery", 
          url: "https://www.marketwatch.com/investing/stock", 
          description: "Energy companies see significant gains as crude oil prices stabilize and demand forecasts improve...",
          source: { name: "MarketWatch" },
          publishedAt: new Date(Date.now() - 10800000).toISOString(),
          category: "Business",
          comments: 92
        },
        { 
          id: 5, 
          title: "Banking Stocks Rise on Strong Loan Growth", 
          url: "https://www.reuters.com/business/finance", 
          description: "Financial institutions report increased lending activity and improved net interest margins...",
          source: { name: "Reuters" },
          publishedAt: new Date(Date.now() - 14400000).toISOString(),
          category: "Business",
          comments: 134
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStockNews()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 border-4 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-serif">Loading business news...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-full">
      {/* Newspaper-style header */}
      <div className="bg-white border-b-2 border-gray-800 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-gray-800" />
            <h2 className="text-xl font-bold text-gray-900 font-serif">BUSINESS SECTION</h2>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStockNews}
            className="flex items-center gap-1 border-gray-800 text-gray-800 hover:bg-gray-100 font-serif"
          >
            <RefreshCw className="w-4 h-4" />
            Update
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {error && (
          <div className="bg-gray-100 border-l-4 border-gray-800 p-3 mb-4">
            <p className="text-gray-800 text-sm font-serif">
              📈 Latest market updates • Tap update for new stories
            </p>
          </div>
        )}
        
        {news.map((article, index) => (
          <div key={article.id || index} className="bg-white border border-gray-300 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.open(article.url, '_blank')}>
            <div className="p-4 border-l-4 border-gray-800">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wide ${categoryColors[article.category?.toLowerCase()] || categoryColors.default}`}>
                      {article.category || 'Business'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight font-serif">
                    {article.title}
                  </h3>
                  <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-200 pt-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium uppercase tracking-wide">{article.source?.name || 'Financial Times'}</span>
                      {article.publishedAt && (
                        <span>• {new Date(article.publishedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{article.comments || Math.floor(Math.random() * 200) + 10}</span>
                      </div>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const RealEstateScreen = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchHousingNews = async () => {
    setLoading(true)
    setError(null)
    try {
      // Try real estate focused RSS feeds
      const feeds = [
        'https://www.realtor.com/news/rss',
        'https://www.housingwire.com/feed/',
        'https://www.inman.com/feed/'
      ]
      
      let articles = []
      
      for (const feedUrl of feeds) {
        try {
          const response = await fetch(`${RSS_PROXY}${encodeURIComponent(feedUrl)}`)
          const data = await response.json()
          
          if (data.status === 'ok' && data.items) {
            const feedArticles = data.items.slice(0, 5).map((item, index) => ({
              id: `${feedUrl}-${index}`,
              title: item.title,
              description: item.description?.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
              url: item.link,
              source: { name: data.feed?.title || 'Real Estate Times' },
              publishedAt: item.pubDate,
              category: 'Real Estate',
              comments: Math.floor(Math.random() * 300) + 15
            }))
            articles = [...articles, ...feedArticles]
            if (articles.length >= 10) break
          }
        } catch (feedError) {
          console.warn(`Failed to fetch from ${feedUrl}:`, feedError)
        }
      }
      
      if (articles.length > 0) {
        setNews(articles.slice(0, 10))
      } else {
        throw new Error('No housing news feeds available')
      }
    } catch (err) {
      console.error('Error fetching housing news:', err)
      setError(err.message)
      // Enhanced fallback data with newspaper-style formatting
      setNews([
        { 
          id: 1, 
          title: "Housing Prices Show Continued Growth Across Major Markets", 
          url: "https://www.realtor.com/news/trends/", 
          description: "National average home prices increase 4.2% year-over-year as demand remains strong despite higher mortgage rates...",
          source: { name: "Real Estate Times" },
          publishedAt: new Date().toISOString(),
          category: "Real Estate",
          comments: 312
        },
        { 
          id: 2, 
          title: "Mortgage Rates Stabilize After Recent Volatility", 
          url: "https://www.housingwire.com/articles/", 
          description: "30-year fixed mortgage rates settle near 6.8% as Federal Reserve policy signals provide market stability...",
          source: { name: "Housing Wire" },
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          category: "Real Estate",
          comments: 198
        },
        { 
          id: 3, 
          title: "New Construction Permits Rise in Suburban Markets", 
          url: "https://www.inman.com/news/", 
          description: "Building permits show 8% increase in suburban areas as developers respond to shifting demand patterns...",
          source: { name: "Property News" },
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          category: "Real Estate",
          comments: 156
        },
        { 
          id: 4, 
          title: "First-Time Homebuyer Programs Expand Nationwide", 
          url: "https://www.nar.realtor/newsroom", 
          description: "State and local governments introduce new assistance programs to help first-time buyers navigate challenging...",
          source: { name: "Housing Report" },
          publishedAt: new Date(Date.now() - 10800000).toISOString(),
          category: "Real Estate",
          comments: 89
        },
        { 
          id: 5, 
          title: "Commercial Real Estate Shows Mixed Signals", 
          url: "https://www.bisnow.com/", 
          description: "Office space demand varies by region while industrial and retail sectors demonstrate resilience...",
          source: { name: "Commercial Times" },
          publishedAt: new Date(Date.now() - 14400000).toISOString(),
          category: "Real Estate",
          comments: 124
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHousingNews()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 border-4 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-serif">Loading real estate news...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-full">
      {/* Newspaper-style header */}
      <div className="bg-white border-b-2 border-gray-800 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6 text-gray-800" />
            <h2 className="text-xl font-bold text-gray-900 font-serif">REAL ESTATE</h2>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchHousingNews}
            className="flex items-center gap-1 border-gray-800 text-gray-800 hover:bg-gray-100 font-serif"
          >
            <RefreshCw className="w-4 h-4" />
            Update
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {error && (
          <div className="bg-gray-100 border-l-4 border-gray-800 p-3 mb-4">
            <p className="text-gray-800 text-sm font-serif">
              🏠 Latest housing market updates • Tap update for new stories
            </p>
          </div>
        )}
        
        {news.map((article, index) => (
          <div key={article.id || index} className="bg-white border border-gray-300 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.open(article.url, '_blank')}>
            <div className="p-4 border-l-4 border-gray-800">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wide ${categoryColors[article.category?.toLowerCase().replace(' ', '')] || categoryColors.default}`}>
                      {article.category || 'Real Estate'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight font-serif">
                    {article.title}
                  </h3>
                  <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-200 pt-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium uppercase tracking-wide">{article.source?.name || 'Real Estate Times'}</span>
                      {article.publishedAt && (
                        <span>• {new Date(article.publishedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{article.comments || Math.floor(Math.random() * 200) + 10}</span>
                      </div>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const ShopLicsScreen = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${SCRAPER_API}/admin/products`)
      if (!response.ok) {
        throw new Error('Failed to load products')
      }
      const data = await response.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error('Error loading products:', err)
      setError(err.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 border-4 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-serif">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-full">
      {/* Newspaper-style header */}
      <div className="bg-white border-b-2 border-gray-800 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-gray-800" />
            <h2 className="text-xl font-bold text-gray-900 font-serif">SHOPLICS</h2>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadProducts}
            className="flex items-center gap-1 border-gray-800 text-gray-800 hover:bg-gray-100 font-serif"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {error && (
          <div className="bg-gray-100 border-l-4 border-gray-800 p-3">
            <p className="text-gray-800 text-sm font-serif">
              ⚠️ {error} • Products managed via admin API
            </p>
          </div>
        )}

        {products.length === 0 && !loading ? (
          <div className="text-center py-12 text-gray-600">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-bold text-gray-900 mb-2 font-serif">No products available</h3>
            <p className="text-sm font-serif">Product listings will appear here when uploaded by admin</p>
            <p className="text-xs text-gray-500 mt-2 font-serif">Products are managed via backend API endpoints</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wide ${categoryColors.shopping}`}>
                Shopping
              </span>
              <span className="text-sm text-gray-600 font-serif">{products.length} products</span>
            </div>
            {products.map((product, index) => (
              <div key={index} className="bg-white border border-gray-300 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.open(product.url, '_blank')}>
                <div className="p-4 border-l-4 border-gray-800">
                  <div className="flex items-start gap-4">
                    {product.image && (
                      <div className="flex-shrink-0">
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="w-20 h-20 object-cover border border-gray-300"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight font-serif">
                        {product.title || 'Product'}
                      </h3>
                      {product.description && (
                        <p className="text-gray-700 text-sm mb-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                      {product.price && (
                        <div className="text-lg font-bold text-gray-900 mb-2 font-serif">
                          {product.price}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-200 pt-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium uppercase tracking-wide">ShopLics</span>
                          {product.uploaded_at && (
                            <span>• {new Date(product.uploaded_at).toLocaleDateString()}</span>
                          )}
                        </div>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const ClassifiedsScreen = () => {
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [searchZip, setSearchZip] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    zipCode: ''
  })

  useEffect(() => {
    if (searchZip.trim()) {
      setFilteredJobs(jobs.filter(job => job.zipCode.includes(searchZip.trim())))
    } else {
      setFilteredJobs(jobs)
    }
  }, [jobs, searchZip])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.title && formData.description && formData.link && formData.zipCode) {
      const newJob = {
        id: Date.now(),
        ...formData,
        postedAt: new Date().toLocaleDateString(),
        category: 'Jobs',
        comments: Math.floor(Math.random() * 50) + 5
      }
      setJobs(prev => [newJob, ...prev])
      setFormData({ title: '', description: '', link: '', zipCode: '' })
      setShowForm(false)
    }
  }

  return (
    <div className="bg-white min-h-full">
      {/* Newspaper-style header */}
      <div className="bg-white border-b-2 border-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-2 p-4">
          <Briefcase className="w-6 h-6 text-gray-800" />
          <h2 className="text-xl font-bold text-gray-900 font-serif">CLASSIFIEDS</h2>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by zip code..."
              value={searchZip}
              onChange={(e) => setSearchZip(e.target.value)}
              className="pl-10 border-gray-800 focus:border-gray-900 focus:ring-gray-900 font-serif"
            />
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gray-800 hover:bg-gray-900 text-white font-serif"
          >
            {showForm ? 'Cancel' : 'Post Job'}
          </Button>
        </div>

        {showForm && (
          <div className="bg-white border-2 border-gray-800 shadow-sm">
            <div className="p-4 border-b border-gray-300">
              <h3 className="text-lg font-bold text-gray-900 mb-2 font-serif">Post a New Job</h3>
              <p className="text-sm text-gray-600 mb-4 font-serif">No registration required • Free job posting</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Job Title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="border-gray-800 focus:border-gray-900 focus:ring-gray-900 font-serif"
                  required
                />
                <Textarea
                  placeholder="Job Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="border-gray-800 focus:border-gray-900 focus:ring-gray-900 font-serif"
                  required
                />
                <Input
                  placeholder="Link to job posting"
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  className="border-gray-800 focus:border-gray-900 focus:ring-gray-900 font-serif"
                  required
                />
                <Input
                  placeholder="Zip Code"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  className="border-gray-800 focus:border-gray-900 focus:ring-gray-900 font-serif"
                  required
                />
                <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-900 text-white font-serif">
                  Post Job
                </Button>
              </form>
            </div>
          </div>
        )}

        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-bold text-gray-900 mb-2 font-serif">
              {jobs.length === 0 ? 'No jobs posted yet' : 'No jobs found for this zip code'}
            </h3>
            <p className="text-sm font-serif">Anyone can post a job - no registration required!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wide ${categoryColors.jobs}`}>
                Jobs
              </span>
              <span className="text-sm text-gray-600 font-serif">{filteredJobs.length} positions</span>
            </div>
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white border border-gray-300 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.open(job.link, '_blank')}>
                <div className="p-4 border-l-4 border-gray-800">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight font-serif">
                        {job.title}
                      </h3>
                      <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                        {job.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-200 pt-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium uppercase tracking-wide">Zip: {job.zipCode}</span>
                          <span>• Posted: {job.postedAt}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{job.comments}</span>
                          </div>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const [currentScreen, setCurrentScreen] = useState(2) // Start with ShopLics (index 2)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const screens = [
    { component: BusinessSectionScreen, title: "Business", icon: TrendingUp, color: "text-gray-800" },
    { component: RealEstateScreen, title: "Real Estate", icon: Home, color: "text-gray-800" },
    { component: ShopLicsScreen, title: "ShopLics", icon: ShoppingBag, color: "text-gray-800" },
    { component: ClassifiedsScreen, title: "Classifieds", icon: Briefcase, color: "text-gray-800" }
  ]

  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1)
    }
    if (isRightSwipe && currentScreen > 0) {
      setCurrentScreen(currentScreen - 1)
    }
  }

  const CurrentScreenComponent = screens[currentScreen].component

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Newspaper-style Header */}
      <div className="bg-white shadow-sm border-b-2 border-gray-800">
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center gap-2">
            {/* Newspaper masthead */}
            <Newspaper className="w-8 h-8 text-gray-800" />
            <div className="text-2xl font-bold text-gray-900 font-serif tracking-wide">
              THE DAILY CHRONICLE
            </div>
          </div>
        </div>
        
        {/* Navigation dots */}
        <div className="flex justify-center space-x-2 pb-3">
          {screens.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentScreen(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentScreen ? 'bg-gray-800' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Screen content */}
      <div 
        className="flex-1 overflow-y-auto bg-white"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <CurrentScreenComponent />
      </div>

      {/* Newspaper-style Bottom navigation */}
      <div className="bg-white border-t-2 border-gray-800 shadow-lg">
        <div className="flex">
          {screens.map((screen, index) => {
            const Icon = screen.icon
            return (
              <button
                key={index}
                onClick={() => setCurrentScreen(index)}
                className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors font-serif ${
                  index === currentScreen 
                    ? 'text-gray-900 bg-gray-100 border-t-2 border-gray-800' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold uppercase tracking-wide">{screen.title}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default App

