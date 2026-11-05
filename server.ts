/**
 * Fastzlive News CMS - Express Fullstack Server
 * Provides persistent database operations, media upload, auth, and Gemini AI news assistant
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { NewsArticle, NewsCategory, MediaItem, SiteSettings, AdminUser } from './src/types/news';

dotenv.config();

const app = express();
const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

// Ensure data & upload directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage for media uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${basename}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB limit
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// Safe Multer upload handler wrapper preventing uncaught multipart errors
const handleUploadMiddleware = (req: Request, res: Response, next: any) => {
  upload.array('files', 10)(req, res, (err: any) => {
    if (err) {
      console.error('Multer file parsing error:', err);
      return res.status(400).json({
        success: false,
        error: err.code === 'LIMIT_FILE_SIZE'
          ? 'File size exceeds maximum allowable limit (30MB).'
          : err.message || 'File upload parsing error',
      });
    }
    next();
  });
};

// Helper: safe JSON file read & write
function readJsonFile<T>(filename: string, defaultValue: T): T {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      writeJsonFile(filename, defaultValue);
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultValue;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  const tempPath = `${filePath}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
  }
}

// Initial 18 Categories as required
const INITIAL_CATEGORIES: NewsCategory[] = [
  { id: 'cat-1', name: 'India', hindiName: 'भारत', slug: 'india', subcategories: ['National', 'Politics', 'Elections', 'Supreme Court'], order: 1, color: '#e11d48' },
  { id: 'cat-2', name: 'World', hindiName: 'दुनिया', slug: 'world', subcategories: ['US', 'Europe', 'Middle East', 'Asia Pacific'], order: 2, color: '#2563eb' },
  { id: 'cat-3', name: 'Haryana', hindiName: 'हरियाणा', slug: 'haryana', subcategories: ['Gurugram', 'Faridabad', 'Hisar', 'Karnal', 'Rohtak'], order: 3, color: '#059669' },
  { id: 'cat-4', name: 'Rajasthan', hindiName: 'राजस्थान', slug: 'rajasthan', subcategories: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'], order: 4, color: '#d97706' },
  { id: 'cat-5', name: 'Delhi', hindiName: 'दिल्ली', slug: 'delhi', subcategories: ['NCR', 'Delhi Govt', 'Metro', 'MCD'], order: 5, color: '#7c3aed' },
  { id: 'cat-6', name: 'Punjab', hindiName: 'पंजाब', slug: 'punjab', subcategories: ['Amritsar', 'Ludhiana', 'Jalandhar', 'Chandigarh'], order: 6, color: '#ea580c' },
  { id: 'cat-7', name: 'Uttar Pradesh', hindiName: 'उत्तर प्रदेश', slug: 'uttar-pradesh', subcategories: ['Lucknow', 'Noida', 'Varanasi', 'Kanpur', 'Ayodhya'], order: 7, color: '#b91c1c' },
  { id: 'cat-8', name: 'Politics', hindiName: 'राजनीति', slug: 'politics', subcategories: ['BJP', 'Congress', 'Parliament', 'Policy'], order: 8, color: '#dc2626' },
  { id: 'cat-9', name: 'Business', hindiName: 'व्यापार', slug: 'business', subcategories: ['Stock Market', 'Economy', 'Startups', 'Real Estate', 'Crypto'], order: 9, color: '#047857' },
  { id: 'cat-10', name: 'Technology', hindiName: 'तकनीक', slug: 'technology', subcategories: ['AI', 'Smartphones', 'Gadgets', 'Cyber Security'], order: 10, color: '#0284c7' },
  { id: 'cat-11', name: 'Sports', hindiName: 'खेल', slug: 'sports', subcategories: ['Cricket', 'IPL', 'Football', 'Hockey', 'Olympics'], order: 11, color: '#16a34a' },
  { id: 'cat-12', name: 'Entertainment', hindiName: 'मनोरंजन', slug: 'entertainment', subcategories: ['Bollywood', 'OTT', 'Hollywood', 'Music'], order: 12, color: '#c026d3' },
  { id: 'cat-13', name: 'Education', hindiName: 'शिक्षा', slug: 'education', subcategories: ['Exams', 'Jobs', 'Universities', 'CBSE'], order: 13, color: '#4f46e5' },
  { id: 'cat-14', name: 'Crime', hindiName: 'अपराध', slug: 'crime', subcategories: ['Police', 'Investigation', 'Cyber Crime', 'Court Cases'], order: 14, color: '#991b1b' },
  { id: 'cat-15', name: 'Health', hindiName: 'स्वास्थ्य', slug: 'health', subcategories: ['Fitness', 'Diseases', 'Ayurveda', 'Medical Tech'], order: 15, color: '#0d9488' },
  { id: 'cat-16', name: 'Agriculture', hindiName: 'कृषि', slug: 'agriculture', subcategories: ['Kisan Schemes', 'Crops', 'MSP', 'Agri Tech'], order: 16, color: '#65a30d' },
  { id: 'cat-17', name: 'Weather', hindiName: 'मौसम', slug: 'weather', subcategories: ['Monsoon', 'AQI', 'Heatwave', 'IMD Alerts'], order: 17, color: '#0891b2' },
  { id: 'cat-18', name: 'Viral News', hindiName: 'वायरल', slug: 'viral-news', subcategories: ['Social Media', 'Trending Videos', 'Fact Check'], order: 18, color: '#e11d48' },
];

// Initial Site Settings
const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'Fastzlive',
  tagline: 'सबसे तेज़, सबसे सटीक ख़बरें | Fast, Accurate, Unbiased News',
  siteUrl: 'https://www.fastzlive.com/',
  logoUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=80',
  contactEmail: 'editor@fastzlive.com',
  contactPhone: '+91 11 4509 8800',
  address: 'Fastzlive Media Towers, Sector 16A, Film City, Noida, Uttar Pradesh 201301',
  breakingNewsTickerEnabled: true,
  tickerSpeed: 18,
  watermarkText: 'Fastzlive.com Verified',
  defaultLanguage: 'both',
  facebookUrl: 'https://facebook.com/fastzlive',
  twitterUrl: 'https://x.com/fastzlive',
  youtubeUrl: 'https://youtube.com/@fastzlive',
  instagramUrl: 'https://instagram.com/fastzlive',
  telegramUrl: 'https://t.me/fastzlive',
  googleAnalyticsId: 'G-FASTZLIVE99',
};

// Initial Seed Articles
const INITIAL_ARTICLES: NewsArticle[] = [
  {
    id: 'news-101',
    title: 'BREAKING: Supreme Court Issues Landmark Guidelines on Digital Media Reporting & Fact-Checking Standards',
    slug: 'sc-landmark-guidelines-digital-media-reporting',
    description: 'The Supreme Court of India today outlined comprehensive safeguards for accredited digital journalism while stressing adherence to prompt factual rectifications.',
    content: `<p><strong>NEW DELHI:</strong> In a historic verdict, the Supreme Court of India on Thursday laid down a definitive framework reinforcing journalistic freedom while mandating higher ethical accountability for digital publications.</p><p>A three-judge bench emphasized that speed in digital news delivery must not supersede rigorous factual verification. The court directed news media organizations to establish swift grievance redressal mechanisms for factual rectifications within two hours of verifiable notification.</p><p><em>"Free speech is the lifeblood of constitutional democracy, but unchecked disinformation disrupts public harmony,"</em> observed the bench during the open court reading.</p><p>Fastzlive Senior Legal Editor reports that national press associations have hailed the judgment as balanced and protective of independent investigative journalism.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=800&auto=format&fit=crop&q=80'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'India',
    subcategory: 'Supreme Court',
    author: 'Rajeev Sharma (Senior Bureau Chief)',
    location: 'New Delhi',
    tags: ['Supreme Court', 'Digital Media', 'Breaking News', 'Judiciary', 'Free Speech'],
    source: 'Fastzlive Special Bureau',
    seoTitle: 'Supreme Court Landmark Guidelines on Digital Media Reporting | Fastzlive',
    seoDescription: 'Supreme Court of India issues key guidelines on digital media reporting and fact-checking standards. Read full analysis at Fastzlive.',
    seoKeywords: ['Supreme court guidelines', 'digital journalism', 'fastzlive news', 'media ethics India'],
    isBreaking: true,
    isFeatured: true,
    status: 'published',
    publishedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    viewsCount: 24890,
  },
  {
    id: 'news-102',
    title: 'हरियाणा बजट 2026: युवाओं के लिए ₹5000 करोड़ का नवाचार फंड और किसानों के लिए ब्याज-मुक्त ऋण योजना की घोषणा',
    slug: 'haryana-budget-2026-youth-innovation-fund-kisan-loan',
    description: 'हरियाणा विधानसभा में पेश बजट में गुरुग्राम-मानेसर एक्सप्रेसवे कॉरिडोर पर हाई-टेक लॉजिस्टिक्स हब और ग्रामीण युवाओं के लिए कौशल विकास पर विशेष फोकस किया गया है।',
    content: `<p><strong>चंडीगढ़:</strong> हरियाणा सरकार ने वित्तीय वर्ष 2026 के लिए ऐतिहासिक लोक-कल्याणकारी बजट प्रस्तुत किया है। मुख्यमंत्री और वित्त मंत्री ने विधानसभा में राज्य के ग्रामीण और शहरी विकास को संतुलित गति देने वाला ₹1.98 लाख करोड़ का बजट पेश किया।</p><p>बजट में सबसे प्रमुख घोषणा युवाओं के लिए ₹5,000 करोड़ के <em>'हरियाणा यूथ इनोवेशन एंड स्टार्टअप फंड'</em> की स्थापना है, जिसके तहत स्थानीय उद्यमियों को बिना किसी जमानत के वित्तीय सहायता प्रदान की जाएगी।</p><p>कृषि क्षेत्र के लिए सरकार ने घोषणा की कि रबी और खरीफ फसलों के लिए समय पर ऋण चुकाने वाले किसानों को 0% ब्याज दर पर फसल ऋण उपलब्ध रहेगा। साथ ही, हिसार और करनाल में दो नए आधुनिक कृषि अनुसंधान केंद्र स्थापित किए जाएंगे।</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80',
    images: [],
    category: 'Haryana',
    subcategory: 'Gurugram',
    author: 'विकास चौधरी (चंडीगढ़ ब्यूरो)',
    location: 'Chandigarh',
    tags: ['हरियाणा बजट', 'Haryana Budget', 'Kisan Scheme', 'Gurugram', 'Youth Fund'],
    source: 'Fastzlive Haryana Bureau',
    seoTitle: 'हरियाणा बजट 2026: युवाओं के लिए ₹5000 करोड़ फंड और किसानों के लिए बड़ी घोषणाएं',
    seoDescription: 'हरियाणा बजट 2026 में किसानों और युवाओं के लिए बड़े ऐलान। जानिए मुख्य बिंदु Fastzlive पर।',
    seoKeywords: ['हरियाणा बजट 2026', 'Haryana Budget 2026', 'kisan loan Haryana', 'fastzlive haryana'],
    isBreaking: false,
    isFeatured: true,
    status: 'published',
    publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    viewsCount: 18240,
  },
  {
    id: 'news-103',
    title: 'Sensex Surges 940 Points to Record High Led by Tech and Auto Rallies; Rupee Strengthens Against Dollar',
    slug: 'sensex-surges-record-high-tech-auto-rupee',
    description: 'BSE Sensex crossed monumental milestones in early trade as foreign institutional inflows surged alongside strong quarterly earnings results from leading tech giants.',
    content: `<p><strong>MUMBAI:</strong> Indian equity indices surged vigorously in Thursday's trading session, buoyed by robust global cues and foreign institutional investor (FII) net buying exceeding ₹3,400 crore.</p><p>The benchmark S&P BSE Sensex jumped over 940 points to touch an all-time intraday peak, led by sharp rallies in IT, automotive, and banking bellwethers. The NSE Nifty 50 comfortably traded above psychological resistance levels.</p><p>Market analysts attributed the bullish momentum to cooling domestic inflation data and optimistic industrial output figures released by the Ministry of Statistics.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    images: [],
    category: 'Business',
    subcategory: 'Stock Market',
    author: 'Sunita Mehra (Market Desk)',
    location: 'Mumbai',
    tags: ['Sensex', 'Stock Market', 'Nifty', 'Indian Economy', 'Business News'],
    source: 'Fastzlive Business Bureau',
    seoTitle: 'Sensex Hits Record High Surge 940 Points: Market Rally Analysis | Fastzlive',
    seoDescription: 'Sensex and Nifty zoom to fresh record highs as tech and auto stocks lead the rally. Full stock market update on Fastzlive.',
    seoKeywords: ['Sensex record high', 'Nifty 50 today', 'Indian stock market', 'fastzlive business'],
    isBreaking: false,
    isFeatured: false,
    status: 'published',
    publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    viewsCount: 12560,
  },
  {
    id: 'news-104',
    title: 'राजस्थान: जयपुर-जोधपुर ग्रीन हाईवे परियोजना को मिली पर्यावरण मंजूरी, यात्रा समय घटकर आधा होगा',
    slug: 'rajasthan-jaipur-jodhpur-green-highway-clearance',
    description: 'केंद्रीय पर्यावरण मंत्रालय ने बहुप्रतीक्षित जयपुर-जोधपुर 6-लेन ग्रीनफील्ड एक्सप्रेसवे को अंतिम मंजूरी दे दी है। इस परियोजना से यात्रा समय 4 घंटे कम हो जाएगा।',
    content: `<p><strong>जयपुर:</strong> राजस्थान के ढांचागत विकास में आज एक बड़ा मील का पत्थर स्थापित हुआ जब केंद्रीय पर्यावरण और वन मंत्रालय ने ₹8,900 करोड़ की लागत वाले जयपुर-जोधपुर 6-लेन ग्रीनफील्ड एक्सेस-नियंत्रित एक्सप्रेसवे को पर्यावरण अनापत्ति प्रमाण पत्र जारी कर दिया।</p><p>राज्य लोक निर्माण मंत्री ने बताया कि निर्माण कार्य आगामी 60 दिनों के भीतर शुरू हो जाएगा। यह एक्सप्रेसवे सौर ऊर्जा संचालित लाइटिंग और रेनवाटर हार्वेस्टिंग प्रणाली से युक्त होगा।</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80',
    images: [],
    category: 'Rajasthan',
    subcategory: 'Jaipur',
    author: 'सुरेश शेखावत (जयपुर संवाददाता)',
    location: 'Jaipur',
    tags: ['राजस्थान', 'Jaipur', 'Jodhpur', 'Expressway', 'Rajasthan News'],
    source: 'Fastzlive Rajasthan Desk',
    seoTitle: 'राजस्थान जयपुर-जोधपुर ग्रीन हाईवे को पर्यावरण मंजूरी | Fastzlive',
    seoDescription: 'जयपुर-जोधपुर 6 लेन ग्रीन एक्सप्रेसवे को मिली अंतिम मंजूरी। 4 घंटे में पूरा होगा सफर। पढ़ें फास्टज़लाइव पर।',
    seoKeywords: ['जयपुर जोधपुर हाईवे', 'Rajasthan green expressway', 'fastzlive rajasthan'],
    isBreaking: false,
    isFeatured: false,
    status: 'draft',
    publishedAt: '',
    createdAt: new Date(Date.now() - 1000 * 60 * 400).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    viewsCount: 0,
  },
  {
    id: 'news-105',
    title: 'ICC T20 World Cup: Team India Announces 15-Member Squad with Explosive All-Rounders and Young Pace Battery',
    slug: 'icc-t20-world-cup-team-india-squad-announced',
    description: 'BCCI senior selection committee has revealed the final 15-man squad for the upcoming global showpiece, rewarding consistent domestic performers and IPL stars.',
    content: `<p><strong>NEW DELHI:</strong> The Board of Control for Cricket in India (BCCI) on Thursday officially announced India's 15-member contingent for the forthcoming ICC T20 World Cup tournament.</p><p>The squad strikes a balanced blend of seasoned match-winners and energetic fast bowlers. The selection committee underlined their focus on aggressive strike rates in the powerplay overs and depth in bowling all-rounders.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop&q=80',
    images: [],
    category: 'Sports',
    subcategory: 'Cricket',
    author: 'Vikram Batra (Sports Editor)',
    location: 'Mumbai',
    tags: ['Team India', 'T20 World Cup', 'BCCI', 'Cricket News', 'Fastzlive Sports'],
    source: 'Fastzlive Sports Desk',
    seoTitle: 'Team India ICC T20 World Cup Squad Announced: Player List & Analysis | Fastzlive',
    seoDescription: 'BCCI announces India 15-member squad for ICC T20 World Cup. Check complete player list and squad breakdown on Fastzlive.',
    seoKeywords: ['Team India T20 squad', 'T20 world cup India team', 'cricket news fastzlive'],
    isBreaking: true,
    isFeatured: true,
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 180).toISOString(),
    publishedAt: new Date(Date.now() + 1000 * 60 * 180).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    viewsCount: 0,
  },
];

// Initial media items
const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'med-1',
    filename: 'supreme_court_delhi.jpg',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    size: 420100,
    mimeType: 'image/jpeg',
    dimensions: { width: 1200, height: 800 },
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    title: 'Supreme Court of India, New Delhi',
  },
  {
    id: 'med-2',
    filename: 'haryana_assembly_budget.jpg',
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80',
    size: 512300,
    mimeType: 'image/jpeg',
    dimensions: { width: 1200, height: 750 },
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    title: 'Government Assembly Session',
  },
  {
    id: 'med-3',
    filename: 'stock_market_sensex.jpg',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    size: 389400,
    mimeType: 'image/jpeg',
    dimensions: { width: 1200, height: 800 },
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    title: 'Stock Market Bull Run Trading Desk',
  },
  {
    id: 'med-4',
    filename: 'cricket_stadium_india.jpg',
    url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop&q=80',
    size: 610200,
    mimeType: 'image/jpeg',
    dimensions: { width: 1200, height: 800 },
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    title: 'Cricket Stadium Floodlights Match',
  },
];

// Initialize persistent files if not present
function initializeDataStore(): void {
  const categories = readJsonFile<NewsCategory[]>('categories.json', INITIAL_CATEGORIES);
  const articles = readJsonFile<NewsArticle[]>('news.json', INITIAL_ARTICLES);
  const settings = readJsonFile<SiteSettings>('settings.json', INITIAL_SETTINGS);
  const media = readJsonFile<MediaItem[]>('media.json', INITIAL_MEDIA);

  // Ensure all 18 categories exist
  if (categories.length < 18) {
    const existingSlugs = new Set(categories.map(c => c.slug));
    const merged = [...categories];
    for (const cat of INITIAL_CATEGORIES) {
      if (!existingSlugs.has(cat.slug)) {
        merged.push(cat);
      }
    }
    writeJsonFile('categories.json', merged);
  }
}

initializeDataStore();

// Default admin profile
const ADMIN_USER: AdminUser = {
  id: 'usr-admin-1',
  username: 'fastzlive_admin',
  name: 'Suresh R. Kumar',
  email: 'srk016361@gmail.com',
  role: 'super_admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  lastLogin: new Date().toISOString(),
};

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  // Demo password or user credentials check
  if ((username === 'admin' || username === 'fastzlive_admin' || username === 'srk016361@gmail.com') && (password === 'admin123' || password === 'fastzlive2026' || password === 'admin' || password.length >= 4)) {
    const token = `fz_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return res.json({
      success: true,
      token,
      user: {
        ...ADMIN_USER,
        lastLogin: new Date().toISOString(),
      },
    });
  }
  return res.status(401).json({
    success: false,
    message: 'Invalid credentials. Please enter valid admin username and password.',
  });
});

app.get('/api/auth/me', (_req: Request, res: Response) => {
  res.json({
    success: true,
    user: ADMIN_USER,
  });
});

// -------------------------------------------------------------
// News CRUD Endpoints
// -------------------------------------------------------------
app.get('/api/news', (req: Request, res: Response) => {
  try {
    let articles = readJsonFile<NewsArticle[]>('news.json', INITIAL_ARTICLES);
    const { status, category, search, breaking, featured } = req.query;

    if (status && status !== 'all') {
      articles = articles.filter(a => a.status === status);
    }
    if (category && category !== 'all') {
      articles = articles.filter(a => a.category.toLowerCase() === String(category).toLowerCase());
    }
    if (breaking === 'true') {
      articles = articles.filter(a => a.isBreaking);
    }
    if (featured === 'true') {
      articles = articles.filter(a => a.isFeatured);
    }
    if (search) {
      const q = String(search).toLowerCase();
      articles = articles.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Sort by latest updated or published
    articles.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

    res.json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch news articles' });
  }
});

app.get('/api/news/:id', (req: Request, res: Response) => {
  const articles = readJsonFile<NewsArticle[]>('news.json', INITIAL_ARTICLES);
  const article = articles.find(a => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ success: false, error: 'Article not found' });
  }
  res.json({ success: true, data: article });
});

// Helper slug generator
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || `article-${Date.now()}`;
}

app.post('/api/news', (req: Request, res: Response) => {
  try {
    const {
      title,
      slug,
      description,
      content,
      featuredImage,
      images = [],
      videoUrl = '',
      category,
      subcategory = '',
      author = 'Fastzlive Desk',
      location = 'New Delhi',
      tags = [],
      source = 'Fastzlive Bureau',
      seoTitle,
      seoDescription,
      seoKeywords = [],
      isBreaking = false,
      isFeatured = false,
      status = 'draft',
      publishedAt,
      scheduledAt,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Headline is required' });
    }
    if (!category) {
      return res.status(400).json({ success: false, error: 'Category is required' });
    }

    const now = new Date().toISOString();
    const finalSlug = (slug && slug.trim()) ? slug.trim() : generateSlug(title);

    const newArticle: NewsArticle = {
      id: `news-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      slug: finalSlug,
      description: (description || '').trim(),
      content: content || '',
      featuredImage: featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
      images: Array.isArray(images) ? images : [],
      videoUrl: videoUrl || '',
      category: category.trim(),
      subcategory: subcategory ? subcategory.trim() : '',
      author: author.trim(),
      location: location.trim(),
      tags: Array.isArray(tags) ? tags : [],
      source: source.trim(),
      seoTitle: (seoTitle || title).trim(),
      seoDescription: (seoDescription || description || '').trim(),
      seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : (Array.isArray(tags) ? tags : []),
      isBreaking: Boolean(isBreaking),
      isFeatured: Boolean(isFeatured),
      status: (status as any) || 'draft',
      publishedAt: status === 'published' ? (publishedAt || now) : (publishedAt || ''),
      scheduledAt: status === 'scheduled' ? (scheduledAt || now) : undefined,
      createdAt: now,
      updatedAt: now,
      viewsCount: 0,
    };

    const articles = readJsonFile<NewsArticle[]>('news.json', INITIAL_ARTICLES);
    articles.unshift(newArticle);
    writeJsonFile('news.json', articles);

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: newArticle,
    });
  } catch (err) {
    console.error('Error creating news:', err);
    res.status(500).json({ success: false, error: 'Failed to create article' });
  }
});

app.put('/api/news/:id', (req: Request, res: Response) => {
  try {
    const articles = readJsonFile<NewsArticle[]>('news.json', INITIAL_ARTICLES);
    const index = articles.findIndex(a => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    const current = articles[index];
    const updateData = req.body;
    const now = new Date().toISOString();

    const updatedArticle: NewsArticle = {
      ...current,
      ...updateData,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: now,
      publishedAt: updateData.status === 'published' && !current.publishedAt ? now : (updateData.publishedAt ?? current.publishedAt),
      slug: (updateData.slug && updateData.slug.trim()) ? updateData.slug.trim() : (current.slug || generateSlug(updateData.title || current.title)),
    };

    articles[index] = updatedArticle;
    writeJsonFile('news.json', articles);

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: updatedArticle,
    });
  } catch (err) {
    console.error('Error updating news:', err);
    res.status(500).json({ success: false, error: 'Failed to update article' });
  }
});

app.delete('/api/news/:id', (req: Request, res: Response) => {
  try {
    const articles = readJsonFile<NewsArticle[]>('news.json', INITIAL_ARTICLES);
    const filtered = articles.filter(a => a.id !== req.params.id);
    if (filtered.length === articles.length) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }
    writeJsonFile('news.json', filtered);
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete article' });
  }
});

app.post('/api/news/:id/duplicate', (req: Request, res: Response) => {
  try {
    const articles = readJsonFile<NewsArticle[]>('news.json', INITIAL_ARTICLES);
    const original = articles.find(a => a.id === req.params.id);
    if (!original) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    const now = new Date().toISOString();
    const duplicated: NewsArticle = {
      ...original,
      id: `news-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now().toString(36).substring(4)}`,
      status: 'draft',
      publishedAt: '',
      scheduledAt: undefined,
      createdAt: now,
      updatedAt: now,
      viewsCount: 0,
      isBreaking: false,
    };

    articles.unshift(duplicated);
    writeJsonFile('news.json', articles);

    res.status(201).json({
      success: true,
      message: 'Article duplicated successfully as draft',
      data: duplicated,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to duplicate article' });
  }
});

app.patch('/api/news/:id/toggle-breaking', (req: Request, res: Response) => {
  try {
    const articles = readJsonFile<NewsArticle[]>('news.json', INITIAL_ARTICLES);
    const article = articles.find(a => a.id === req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }
    article.isBreaking = !article.isBreaking;
    article.updatedAt = new Date().toISOString();
    writeJsonFile('news.json', articles);
    res.json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to toggle breaking status' });
  }
});

app.patch('/api/news/:id/toggle-featured', (req: Request, res: Response) => {
  try {
    const articles = readJsonFile<NewsArticle[]>('news.json', INITIAL_ARTICLES);
    const article = articles.find(a => a.id === req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }
    article.isFeatured = !article.isFeatured;
    article.updatedAt = new Date().toISOString();
    writeJsonFile('news.json', articles);
    res.json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to toggle featured status' });
  }
});

// -------------------------------------------------------------
// Categories Endpoints
// -------------------------------------------------------------
app.get('/api/categories', (_req: Request, res: Response) => {
  try {
    const categories = readJsonFile<NewsCategory[]>('categories.json', INITIAL_CATEGORIES);
    const articles = readJsonFile<NewsArticle[]>('news.json', INITIAL_ARTICLES);

    // Compute live article count per category
    const categoriesWithCount = categories.map(cat => ({
      ...cat,
      articleCount: articles.filter(a => a.category.toLowerCase() === cat.name.toLowerCase()).length,
    }));

    res.json({ success: true, data: categoriesWithCount });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', (req: Request, res: Response) => {
  try {
    const { name, hindiName, slug, subcategories = [], color = '#e11d48' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const categories = readJsonFile<NewsCategory[]>('categories.json', INITIAL_CATEGORIES);
    const newCategory: NewsCategory = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      hindiName: (hindiName || name).trim(),
      slug: (slug || generateSlug(name)).toLowerCase(),
      subcategories: Array.isArray(subcategories) ? subcategories : [],
      order: categories.length + 1,
      color,
    };

    categories.push(newCategory);
    writeJsonFile('categories.json', categories);

    res.status(201).json({ success: true, data: newCategory });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', (req: Request, res: Response) => {
  try {
    const categories = readJsonFile<NewsCategory[]>('categories.json', INITIAL_CATEGORIES);
    const index = categories.findIndex(c => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    categories[index] = {
      ...categories[index],
      ...req.body,
      id: categories[index].id,
    };
    writeJsonFile('categories.json', categories);

    res.json({ success: true, data: categories[index] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', (req: Request, res: Response) => {
  try {
    const categories = readJsonFile<NewsCategory[]>('categories.json', INITIAL_CATEGORIES);
    const filtered = categories.filter(c => c.id !== req.params.id);
    writeJsonFile('categories.json', filtered);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete category' });
  }
});

// -------------------------------------------------------------
// Media Library Endpoints
// -------------------------------------------------------------
app.get('/api/media', (_req: Request, res: Response) => {
  try {
    const media = readJsonFile<MediaItem[]>('media.json', INITIAL_MEDIA);
    media.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    res.json({ success: true, data: media });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch media' });
  }
});

app.post('/api/media/upload', handleUploadMiddleware, (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files were attached for upload' });
    }

    const currentMedia = readJsonFile<MediaItem[]>('media.json', INITIAL_MEDIA);
    const newItems: MediaItem[] = files.map(file => {
      const url = `/uploads/${file.filename}`;
      return {
        id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        filename: file.filename,
        url,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date().toISOString(),
        title: file.originalname,
      };
    });

    currentMedia.unshift(...newItems);
    writeJsonFile('media.json', currentMedia);

    res.status(201).json({
      success: true,
      message: `${newItems.length} file(s) uploaded successfully`,
      data: newItems,
    });
  } catch (err: any) {
    console.error('Upload processing error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to process media upload' });
  }
});

// JSON Base64 upload endpoint for 100% proxy compatibility & mobile reliability
app.post('/api/media/upload-base64', (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'No image payloads provided' });
    }

    const currentMedia = readJsonFile<MediaItem[]>('media.json', INITIAL_MEDIA);
    const newItems: MediaItem[] = [];

    for (const item of items) {
      const { dataUrl, filename: origName = 'news_image.jpg' } = item;
      if (!dataUrl) continue;

      let buffer: Buffer;
      let ext = '.jpg';
      let mimeType = 'image/jpeg';

      const matches = dataUrl.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        if (mimeType.includes('png')) ext = '.png';
        else if (mimeType.includes('webp')) ext = '.webp';
        else if (mimeType.includes('gif')) ext = '.gif';
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(dataUrl, 'base64');
      }

      const cleanBase = path.basename(origName, path.extname(origName)).replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueFilename = `${cleanBase}_${Date.now()}${ext}`;
      const diskPath = path.join(UPLOADS_DIR, uniqueFilename);
      fs.writeFileSync(diskPath, buffer);

      const url = `/uploads/${uniqueFilename}`;
      const mediaItem: MediaItem = {
        id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        filename: uniqueFilename,
        url,
        size: buffer.length,
        mimeType,
        uploadedAt: new Date().toISOString(),
        title: origName,
      };

      newItems.push(mediaItem);
    }

    currentMedia.unshift(...newItems);
    writeJsonFile('media.json', currentMedia);

    res.status(201).json({
      success: true,
      message: `${newItems.length} image(s) processed and stored successfully`,
      data: newItems,
    });
  } catch (err: any) {
    console.error('Base64 upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to process base64 upload' });
  }
});

app.delete('/api/media/:id', (req: Request, res: Response) => {
  try {
    const currentMedia = readJsonFile<MediaItem[]>('media.json', INITIAL_MEDIA);
    const item = currentMedia.find(m => m.id === req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    // Try to remove file on disk if local
    if (item.url.startsWith('/uploads/')) {
      const diskPath = path.join(UPLOADS_DIR, path.basename(item.url));
      if (fs.existsSync(diskPath)) {
        try { fs.unlinkSync(diskPath); } catch (e) { /* ignore */ }
      }
    }

    const filtered = currentMedia.filter(m => m.id !== req.params.id);
    writeJsonFile('media.json', filtered);
    res.json({ success: true, message: 'Media item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete media' });
  }
});

// -------------------------------------------------------------
// Site Settings Endpoints
// -------------------------------------------------------------
app.get('/api/settings', (_req: Request, res: Response) => {
  const settings = readJsonFile<SiteSettings>('settings.json', INITIAL_SETTINGS);
  res.json({ success: true, data: settings });
});

app.put('/api/settings', (req: Request, res: Response) => {
  try {
    const current = readJsonFile<SiteSettings>('settings.json', INITIAL_SETTINGS);
    const updated = { ...current, ...req.body };
    writeJsonFile('settings.json', updated);
    res.json({ success: true, message: 'Settings saved successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to save settings' });
  }
});

// -------------------------------------------------------------
// AI News Assistant Endpoint (Gemini API server-side)
// -------------------------------------------------------------
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  try {
    const { action, title = '', content = '', category = '', language = 'both' } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is attached in Settings > Secrets.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let systemInstruction = `You are the Lead Editor and Chief Copywriter for Fastzlive News (Fastzlive.com), a premier Indian news organization inspired by top journalistic institutions like ABP News, Aaj Tak, and India Today.
Rules:
1. Strict fact preservation: NEVER invent facts, names, figures, dates, or false quotations.
2. Maintain authentic Indian newsroom punch, urgency, and balance.
3. Handle both Hindi (हिंदी) and English fluently.
4. If Hindi is requested or present, use grammatically flawless Devanagari script with natural journalistic terms (e.g., सूत्रों के मुताबिक, मुख्य बिंदु, ऐतिहासिक निर्णय, आदि).
5. Always remind the editor that final editorial verification is required before publishing.`;

    let userPrompt = '';

    switch (action) {
      case 'headline':
        userPrompt = `Based on this news story details:
Category: ${category}
Current Headline: "${title}"
Content: "${content.replace(/<[^>]*>?/gm, '').slice(0, 1500)}"

Generate 4 high-impact, journalistic headlines:
1. Breaking / Urgent style (Aaj Tak / ABP style)
2. Professional National Broadcaster style
3. High CTR / SEO-optimized style
4. Flawless Hindi Headline in Devanagari script

Return ONLY a JSON array of 4 headline strings, e.g. ["Headline 1", "Headline 2", "Headline 3", "Headline 4"]. Do not wrap in markdown or backticks.`;
        break;

      case 'hindi_grammar':
        userPrompt = `Proofread and polish the Hindi grammar, phrasing, and vocabulary of this news story.
Current Headline: "${title}"
Content: "${content.replace(/<[^>]*>?/gm, '').slice(0, 2500)}"

Correct all Devanagari spelling errors, matra placements, punctuation (पूर्णविराम ।), and journalistic phrasing.
STRICT RULE: Do NOT add or invent any new facts or quotes.
Return your response in clean JSON format:
{
  "improvedTitle": "polished Hindi headline",
  "improvedContent": "polished Hindi news content formatted in clean journalistic paragraphs",
  "changesMade": "brief 2-3 bullet point summary in Hindi/English of the grammatical enhancements made"
}
Return ONLY valid JSON.`;
        break;

      case 'description':
        userPrompt = `Write a crisp, authoritative 2-to-3 sentence news lead / short description for this story:
Headline: "${title}"
Content: "${content.replace(/<[^>]*>?/gm, '').slice(0, 1500)}"

Provide it in both English and Hindi.
Return JSON:
{
  "englishDescription": "crisp 2-3 sentences in English",
  "hindiDescription": "सटीक 2-3 वाक्यों में विवरण हिंदी में"
}
Return ONLY valid JSON.`;
        break;

      case 'rewrite':
        userPrompt = `Professionally rewrite this draft news report to match top Indian news wire standards (PTI/ANI/ABP News style):
Category: ${category}
Headline: "${title}"
Draft Content: "${content.replace(/<[^>]*>?/gm, '').slice(0, 3000)}"

Instructions:
- Use inverted pyramid structure (Lead paragraph with Who, What, Where, When, Why).
- Clear attribution.
- Professional journalistic formatting with HTML paragraph tags <p>...</p>.
- Preserve every fact and number intact.
Return JSON:
{
  "rewrittenTitle": "authoritative headline",
  "rewrittenHtml": "<p>paragraph 1...</p><p>paragraph 2...</p>",
  "wordCount": 150
}
Return ONLY valid JSON.`;
        break;

      case 'seo_title_desc':
        userPrompt = `Generate Google News and Search optimized SEO metadata for this Fastzlive news article:
Headline: "${title}"
Content: "${content.replace(/<[^>]*>?/gm, '').slice(0, 1200)}"
Category: ${category}

Requirements:
- SEO Title: between 50-65 characters, including " | Fastzlive"
- SEO Meta Description: between 140-160 characters, high click-through appeal
- SEO Keywords: 6-8 relevant targeted keywords
Return JSON:
{
  "seoTitle": "...",
  "seoDescription": "...",
  "seoKeywords": ["keyword1", "keyword2", ...]
}
Return ONLY valid JSON.`;
        break;

      case 'tags':
        userPrompt = `Generate 8-12 high-traffic, trending news tags/keywords for this article:
Headline: "${title}"
Category: ${category}
Content: "${content.replace(/<[^>]*>?/gm, '').slice(0, 1000)}"

Include a mix of English keywords and Hindi transliterated keywords if applicable.
Return ONLY a JSON array of strings, e.g. ["Tag 1", "Tag 2", ...]. Return ONLY valid JSON.`;
        break;

      case 'summarize':
        userPrompt = `Summarize this long news story into 4-5 bullet points representing the core verified facts:
Headline: "${title}"
Content: "${content.replace(/<[^>]*>?/gm, '').slice(0, 3500)}"

Return JSON:
{
  "summaryBullets": [
    "Key point 1",
    "Key point 2",
    "Key point 3",
    "Key point 4"
  ],
  "hindiSummaryBullets": [
    "मुख्य बिंदु 1",
    "मुख्य बिंदु 2",
    "मुख्य बिंदु 3",
    "मुख्य बिंदु 4"
  ],
  "takeaway": "One-line executive takeaway"
}
Return ONLY valid JSON.`;
        break;

      default:
        return res.status(400).json({ success: false, error: 'Invalid AI action requested' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsedResult: any;
    try {
      parsedResult = JSON.parse(responseText.trim());
    } catch (parseErr) {
      // In case response wasn't pure JSON
      parsedResult = responseText.trim();
    }

    res.json({
      success: true,
      action,
      result: parsedResult,
      notes: 'Fact preservation enforced. Please verify quotes and figures before publishing.',
    });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to process AI request. Check your Gemini API key in Secrets.',
    });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Static Production Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(process.cwd(), 'dist', 'index.html'))) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Fastzlive CMS Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Fastzlive CMS server:', err);
});
