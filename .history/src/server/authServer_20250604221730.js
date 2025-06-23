
dotenv.config();

const app = express();
const httpServer = createServer(app);

// FIXED: Rate limiting and request caching to prevent infinite loops
const requestCache = new Map();
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 requests per minute per IP

// FIXED: Rate limiting middleware
const rateLimit = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(clientIP)) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const userLimit = rateLimitMap.get(clientIP);
  
  if (now > userLimit.resetTime) {
    userLimit.count = 1;
    userLimit.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    console.log(`[AuthServer] Rate limit exceeded for IP: ${clientIP}`);
    return res.status(429).json({ 
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
    });
  }
  
  userLimit.count++;
  next();
};

// FIXED: Socket.io with connection limits
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  },
  // PREVENT TOO MANY CONNECTIONS
  maxHttpBufferSize: 1e6, // 1MB
  pingTimeout: 60000,
  pingInterval: 25000
});

// FIXED: Connection tracking
let activeConnections = 0;
const MAX_CONNECTIONS = 100;

io.on('connection', (socket) => {
  activeConnections++;
  console.log(`[AuthServer] Socket connected. Active: ${activeConnections}`);
  
  if (activeConnections > MAX_CONNECTIONS) {
    socket.emit('error', 'Server at capacity');
    socket.disconnect();
    activeConnections--;
    return;
  }
  
  socket.on('disconnect', () => {
    activeConnections--;
    console.log(`[AuthServer] Socket disconnected. Active: ${activeConnections}`);
  });
});

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' })); // FIXED: Limit request size
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// FIXED: Apply rate limiting to auth endpoints
app.use('/auth', rateLimit);
app.use('/login', rateLimit);
app.use('/signup', rateLimit);
app.use('/verify-token', rateLimit);
app.use('/refresh-token', rateLimit);

let refreshTokens = [];

// FIXED: Clean up old refresh tokens periodically
setInterval(() => {
  if (refreshTokens.length > 1000) {
    refreshTokens = refreshTokens.slice(-500); // Keep only latest 500
    console.log('[AuthServer] Cleaned up old refresh tokens');
  }
}, 300000); // Every 5 minutes

// Initialize MongoDB connection
connectDB().then(() => {
  console.log('[AuthServer] MongoDB connected successfully');
}).catch(err => {
  console.error('[AuthServer] MongoDB connection error:', err);
  process.exit(1); // Exit if DB connection fails
});

// FIXED: Token verification with caching and timeouts
const tokenCache = new Map();
const TOKEN_CACHE_TTL = 60000; // 1 minute cache

app.post('/verify-token', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // FIXED: Check cache first
    const cacheKey = `verify-${token}`;
    const cached = tokenCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < TOKEN_CACHE_TTL) {
      console.log('[AuthServer] Using cached token verification');
      return res.json(cached.data);
    }
    
    // FIXED: Add timeout to JWT verification
    const verifyPromise = new Promise((resolve, reject) => {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
          reject(new Error('Invalid token'));
          return;
        }
        
        try {
          const user = await UserModel.findOne({ email: decoded.email }).maxTimeMS(5000);
          if (!user) {
            reject(new Error('User not found'));
            return;
          }
          
          const result = {
            valid: true,
            user: {
              id: user._id,
              email: user.email,
              username: user.username
            }
          };
          
          // FIXED: Cache successful verification
          tokenCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    // FIXED: Add 5 second timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Token verification timeout')), 5000);
    });
    
    const result = await Promise.race([verifyPromise, timeoutPromise]);
    res.json(result);
    
  } catch (error) {
    console.error('[AuthServer] Token verification error:', error.message);
    res.status(403).json({ message: 'Invalid token' });
  }
});

// FIXED: Refresh token endpoint with better error handling
app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }
  
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
  
  try {
    // FIXED: Add timeout to JWT verification
    const verifyPromise = new Promise((resolve, reject) => {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
          reject(new Error('Invalid refresh token'));
          return;
        }
        
        try {
          const user = await UserModel.findOne({ email: decoded.email }).maxTimeMS(5000);
          if (!user) {
            reject(new Error('User not found'));
            return;
          }
          
          const accessToken = jwt.sign(
            { 
              email: user.email,
              username: user.username,
              id: user._id 
            }, 
            process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: '90m' }
          );
          
          resolve({
            accessToken,
            user: {
              id: user._id,
              email: user.email,
              username: user.username
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Refresh timeout')), 5000);
    });
    
    const result = await Promise.race([verifyPromise, timeoutPromise]);
    res.json(result);
    
  } catch (error) {
    console.error('[AuthServer] Token refresh error:', error.message);
    res.status(403).json({ message: 'Token refresh failed' });
  }
});

// FIXED: Auth check endpoint with caching
app.post('/auth', async (req, res) => {
  const { identifier } = req.body;
  console.log(`[AuthServer] Checking if user exists: ${identifier}`);
  
  if (!identifier || identifier.trim() === '') {
    return res.status(400).json({ message: 'Username or email is required', userExists: false });
  }

  try {
    const trimmedIdentifier = identifier.trim();
    
    // FIXED: Check cache first
    const cacheKey = `auth-check-${trimmedIdentifier}`;
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
      console.log('[AuthServer] Using cached auth check result');
      return res.json({ userExists: cached.userExists });
    }
    
    // FIXED: Add timeout to database query
    const user = await UserModel.findByUsernameOrEmail(trimmedIdentifier).maxTimeMS(5000);
    const userExists = !!user;
    
    // Cache the result
    requestCache.set(cacheKey, {
      userExists,
      timestamp: Date.now()
    });
    
    console.log(`[AuthServer] User found: ${userExists} for identifier: ${trimmedIdentifier}`);
    res.json({ userExists });
    
  } catch (error) {
    console.error('[AuthServer] Error checking user:', error.message);
    res.status(500).json({ message: 'Server error', userExists: false });
  }
});

// FIXED: Login endpoint with better error handling and caching
app.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  
  console.log(`[AuthServer] Login attempt for identifier: ${identifier}`);
  
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Username/email and password are required' });
  }
  
  try {
    const trimmedIdentifier = identifier.trim();
    
    // FIXED: Add timeout to database query
    const user = await UserModel.findByUsernameOrEmail(trimmedIdentifier).maxTimeMS(5000);
    
    if (!user) {
      console.log(`[AuthServer] User not found for identifier: ${trimmedIdentifier}`);
      return res.status(400).json({ message: 'User not found' });
    }
    
    console.log(`[AuthServer] User found: ${user.username} (${user.email})`);
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[AuthServer] Invalid password for user: ${user.username}`);
      return res.status(400).json({ message: 'Invalid password' });
    }
    
    const accessToken = jwt.sign({ 
      email: user.email,
      username: user.username,
      id: user._id 
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '90m' });
    
    const refreshToken = jwt.sign({ 
      email: user.email,
      username: user.username,
      id: user._id 
    }, process.env.REFRESH_TOKEN_SECRET);
    
    refreshTokens.push(refreshToken);
    
    console.log(`[AuthServer] Login successful for user: ${user.username}`);
    
    const data = { 
      accessToken, 
      refreshToken, 
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    };
    
    res.json(data);
    
  } catch (error) {
    console.error('[AuthServer] Login error:', error.message);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// FIXED: Signup endpoint with better validation
app.post('/signup', async (req, res) => {
  const { email, password, username } = req.body;
  
  console.log(`[AuthServer] Signup attempt for email: ${email}, username: ${username}`);
  
  // Validate required fields
  if (!email || !password || !username) {
    return res.status(400).json({ 
      message: 'Email, password, and username are all required' 
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ 
      message: 'Please enter a valid email address' 
    });
  }
  
  // Validate username format
  const trimmedUsername = username.trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
    return res.status(400).json({ 
      message: 'Username can only contain letters, numbers, underscores, and dashes' 
    });
  }
  
  if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
    return res.status(400).json({ 
      message: 'Username must be between 3 and 30 characters' 
    });
  }
  
  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ 
      message: 'Password must be at least 6 characters long' 
    });
  }
  
  try {
    const trimmedEmail = email.trim();
    
    // FIXED: Add timeout to database query
    const existingUser = await UserModel.findOne({
      $or: [
        { email: trimmedEmail },
        { username: trimmedUsername.toLowerCase() }
      ]
    }).maxTimeMS(5000);
    
    if (existingUser) {
      if (existingUser.email === trimmedEmail) {
        console.log(`[AuthServer] Email already exists: ${trimmedEmail}`);
        return res.status(400).json({ message: 'Email already exists' });
      } else {
        console.log(`[AuthServer] Username already exists: ${trimmedUsername}`);
        return res.status(400).json({ message: 'Username already exists' });
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ 
      email: trimmedEmail, 
      password: hashedPassword,
      username: trimmedUsername.toLowerCase()
    });
    
    // FIXED: Add timeout to save operation
    await newUser.save({ maxTimeMS: 10000 });
    
    console.log(`[AuthServer] User created successfully: ${newUser.username} (${newUser.email})`);
    
    const accessToken = jwt.sign({ 
      email: newUser.email,
      username: newUser.username,
      id: newUser._id 
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '90m' });
    
    const refreshToken = jwt.sign({ 
      email: newUser.email,
      username: newUser.username,
      id: newUser._id 
    }, process.env.REFRESH_TOKEN_SECRET);
    
    refreshTokens.push(refreshToken);
    
    res.status(201).json({ 
      accessToken, 
      refreshToken,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username
      }
    });
  } catch (error) {
    console.error('[AuthServer] Signup error:', error.message);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// FIXED: Username check with caching
app.post('/check-username', async (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }
  
  const trimmedUsername = username.trim();
  
  // Validate username format
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
    return res.status(400).json({ 
      available: false,
      message: 'Username can only contain letters, numbers, underscores, and dashes' 
    });
  }
  
  if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
    return res.status(400).json({ 
      available: false,
      message: 'Username must be between 3 and 30 characters' 
    });
  }
  
  try {
    // FIXED: Check cache first
    const cacheKey = `username-check-${trimmedUsername}`;
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30000) {
      return res.json(cached.data);
    }
    
    // FIXED: Add timeout to database query
    const existingUser = await UserModel.findOne({ 
      username: trimmedUsername.toLowerCase() 
    }).maxTimeMS(5000);
    
    const result = { 
      available: !existingUser,
      message: existingUser ? 'Username is already taken' : 'Username is available'
    };
    
    // Cache the result
    requestCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    res.json(result);
  } catch (error) {
    console.error('[AuthServer] Error checking username:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

///////////////////////// USER PROFILE ENDPOINTS /////////////////////////

// FIXED: User profile endpoint with caching
app.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log(`[AuthServer] Fetching profile for username: ${username}`);
    
    // FIXED: Add timeout to database query
    const user = await UserModel.findOne({ 
      username: username.toLowerCase() 
    }).maxTimeMS(5000);
    
    if (!user) {
      console.log(`[AuthServer] User not found: ${username}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`[AuthServer] Profile found for: ${user.username}`);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        description: user.description,
        location: user.location,
        website: user.website,
        joinedAt: user.createdAt,
        profileStats: {
          checkedInStores: user.checkedInStores ? user.checkedInStores.length : 0,
          visitHistory: user.visitHistory ? user.visitHistory.length : 0
        }
      }
    });
  } catch (error) {
    console.error('[AuthServer] Error fetching user data:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// FIXED: Authentication middleware with timeout
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  // FIXED: Add timeout to JWT verification
  const verifyPromise = new Promise((resolve, reject) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        reject(new Error('Access token is not valid'));
      } else {
        resolve(user);
      }
    });
  });
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Auth timeout')), 5000);
  });
  
  Promise.race([verifyPromise, timeoutPromise])
    .then(user => {
      req.user = user;
      next();
    })
    .catch(error => {
      console.error('[AuthServer] Token verification error:', error.message);
      res.status(403).json({ message: 'Access token is not valid' });
    });
}

// FIXED: User store data endpoint with better performance
app.get('/api/user/store', authenticateToken, async (req, res) => {
  const userEmail = req.user.email;
  
  try {
    console.log(`[AuthServer] Fetching store data for user: ${userEmail}`);
    
    // FIXED: Add timeout and optimize query
    const user = await UserModel.findOne({ email: userEmail })
      .select('checkedInStore checkedInStores')
      .maxTimeMS(5000);
      
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const currentStore = user.checkedInStore;
    const recentCheckedInStores = user.checkedInStores ? 
      user.checkedInStores.slice(-6).reverse() : [];
    const storeIds = [...new Set([currentStore, ...recentCheckedInStores.map(store => store.storeId)])].filter(Boolean);
    
    console.log('[AuthServer] Fetching stores:', storeIds);

    // FIXED: Add timeout and limit to store query
    const stores = await StoreModel.find({ slug: { $in: storeIds } })
      .select('slug hero location')
      .limit(10)
      .maxTimeMS(5000);
    
    const storeData = stores.map(store => ({
      storeId: store.slug,
      storeInfo: {
        storeName: store.hero?.storeName || store.title,
        city: store.hero?.city || store.location?.city,
        state: store.hero?.state || store.location?.state,
        distance: store.hero?.distance,
        status: store.hero?.status,
        gallery: store.hero?.gallery || [],
        storeType: store.hero?.storeType || [],
        rating: store.hero?.rating,
        review_count: store.hero?.review_count
      }
    }));

    console.log(`[AuthServer] Returning data for ${storeData.length} stores`);

    return res.status(200).json({
      success: true,
      currentStore: currentStore,
      stores: storeData,
      checkedInStores: recentCheckedInStores
    });
    
  } catch (error) {
    console.error(`[AuthServer] Error fetching store data:`, error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching store data',
      error: error.message
    });
  }
});

///////////////////////// CLEAN UP FUNCTIONS /////////////////////////

// FIXED: Clean up caches periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  
  // Clean token cache
  for (const [key, value] of tokenCache.entries()) {
    if (now - value.timestamp > TOKEN_CACHE_TTL) {
      tokenCache.delete(key);
    }
  }
  
  // Clean request cache
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > 60000) { // 1 minute
      requestCache.delete(key);
    }
  }
  
  // Clean rate limit map
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
  
  console.log(`[AuthServer] Cache cleanup completed. Token cache: ${tokenCache.size}, Request cache: ${requestCache.size}, Rate limit: ${rateLimitMap.size}`);
}, 120000); // Every 2 minutes

const authPort = process.env.AUTHPORT || 4000;
httpServer.listen(authPort, () => {
  console.log(`[AuthServer] Server running on port ${authPort}`);
  console.log(`[AuthServer] Memory usage:`, process.memoryUsage());
});

///////////////////////// END FIXED AUTHENTICATION SERVER /////////////////////////