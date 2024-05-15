const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {Web3} = require('web3');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const axios = require('axios');


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ port: 3003 });
const port = 3001;
const JWT_SECRET = 'myVerySecretKey_123!@#';
const JWT_SECRET_ADMIN = 'myAdminSecretKey_123@';
app.use('/uploads', express.static('uploads'));

const web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));
const carbonCreditsTradingABI = require('./ABI/CarbonCreditsTrading.json');
const chainCreditsTokenABI = require('./ABI/ChainCreditsToken.json');
const carbonCreditsTradingAddress = '0x31B29631747265a80b44e497f8af2108fe626509';
const chainCreditsTokenAddress = '0xD1713779BC63d59698E363Eebcb59Be8bfD4C44A';
const chainCreditsToken = new web3.eth.Contract(chainCreditsTokenABI, chainCreditsTokenAddress);

mongoose.connect('mongodb://localhost:27017/userGanacheAccounts', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  ganacheAccount: String,
  cctBalance: { type: Number, default: 0 },
  carbonCredits: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

const ActivitySchema = new mongoose.Schema({
  activityDetails: { type: String, required: true },
  expectedImpact: { type: String, required: true },
  supportingDocument: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'pending' },
  adminComment: { type: String, default: '' },
}, { timestamps: true });

const Activity = mongoose.model('Activity', ActivitySchema);

const mintEventSchema = new mongoose.Schema({
  type: { type: String, default: 'mintEvent' },
  from: String,
  to: String,
  amount: String,
  description: String,
  transactionHash: String,
  blockNumber: String,
  timestamp: Date
});

const MintEvent = mongoose.model('MintEvent', mintEventSchema);

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

const Admin = mongoose.model('Admin', adminSchema);

const tradeSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true },
  pricePerCredit: { type: Number, required: true }, // assuming price per credit
  timestamp: { type: Date, default: Date.now }
});

const Trade = mongoose.model('Trade', tradeSchema);





app.use(cors());
app.use(express.json());

// WebSocket Server Handlers
wss.on('connection', async function connection(ws) {
  console.log('A client connected');

  // Fetch all mint events from database
  const events = await MintEvent.find({}).sort({ timestamp: 1 }); // Sort by timestamp if needed
  events.forEach(event => {
      ws.send(JSON.stringify(event));
  });

  ws.on('message', function incoming(message) {
      console.log('received:', message);
  });

  ws.on('close', () => {
      console.log('Client disconnected');
  });

  ws.on('error', function error(err) {
      console.error('WebSocket error:', err);
  });
});




app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Check if the username already exists in the database
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ error: 'Username is already taken. Please choose a different one.' });
  }

  // Generate a Ganache account for the new user
  const accounts = await web3.eth.getAccounts();
  const userAccount = accounts[await User.countDocuments() % accounts.length];
  
  // Create the new user
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = new User({ username, password: hashedPassword, ganacheAccount: userAccount });

  // Save the new user to the database
  try {
    await newUser.save();
    res.json({ message: 'User registered successfully.', account: userAccount });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'An error occurred while registering the user. Please try again later.' });
  }
});

const carbonCreditsTrading = new web3.eth.Contract(carbonCreditsTradingABI, carbonCreditsTradingAddress);


carbonCreditsTrading.events.OrderMatched({
  fromBlock: 'latest'
})
.on('data', async event => {
  const { buyer, seller, quantity, pricePerCredit } = event.returnValues;

  // Convert BigInt to Number safely and convert Wei to Ether
  const quantityNumber = parseInt(quantity.toString());
  const pricePerCreditNumber = parseFloat(web3.utils.fromWei(pricePerCredit.toString(), 'ether'));

  // Fetch user data for buyer and seller
  const buyerUser = await User.findOne({ ganacheAccount: buyer });
  const sellerUser = await User.findOne({ ganacheAccount: seller });

  if (!buyerUser || !sellerUser) {
    console.error("Buyer or seller not found.");
    return; // Exit if any user is not found
  }

  // Check for sufficient balances
  if (buyerUser.cctBalance < quantityNumber * pricePerCreditNumber) {
    console.error("Buyer does not have enough CCT balance.");
    return; // Exit if buyer does not have enough CCT balance
  }

  if (sellerUser.carbonCredits < quantityNumber) {
    console.error("Seller does not have enough carbon credits.");
    return; // Exit if seller does not have enough carbon credits
  }

  // If sufficient balances are confirmed, proceed with creating a trade record and updating balances
  const trade = new Trade({
    buyer: buyerUser._id,
    seller: sellerUser._id,
    quantity: quantityNumber,
    pricePerCredit: pricePerCreditNumber,
    timestamp: new Date()
  });
  await trade.save();

  // Update buyer - increase carbon credits, decrease CCT balance
  buyerUser.carbonCredits += quantityNumber;
  buyerUser.cctBalance -= quantityNumber * pricePerCreditNumber;
  await buyerUser.save();

  // Update seller - decrease carbon credits, increase CCT balance
  sellerUser.carbonCredits -= quantityNumber;
  sellerUser.cctBalance += quantityNumber * pricePerCreditNumber;
  await sellerUser.save();
})
// .on('error', error => {
//   console.error("Error in event listener:", error);
// });


// .on('error', error => {
//   console.error("Error in event listener:", error);
// });


app.post('/update-balances', async (req, res) => {
  const { username, cctBalance, carbonCredits } = req.body;
  
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.cctBalance = cctBalance;
    user.carbonCredits = carbonCredits;
    await user.save();

    res.json({ message: 'Balances updated successfully', user });
  } catch (error) {
    console.error('Error updating balances:', error);
    res.status(500).json({ error: 'An error occurred while updating balances.' });
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ message: 'Login successful', token });
});

app.post('/fetch-account', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  res.json({ account: user.ganacheAccount });
});



// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).send('Admin not found');
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ id: admin._id }, JWT_SECRET_ADMIN, { expiresIn: '1h' }); // Adjust the secret key
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});



function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), 'myVerySecretKey_123!@#'); // Use the same secret key as in the login route
    req.adminId = decoded.id; // Optionally store admin ID in request for further use
    next(); // Pass control to the next middleware function
  } catch (error) {
    res.status(401).send('Invalid token');
  }
}


// Define the Admin Registration Endpoint
app.post('/api/admin/register', authMiddleware, async (req, res) => {
  // Check if the requesting user is authenticated as an administrator
  const adminId = req.adminId;
  if (!adminId) {
    return res.status(403).json({ error: 'Access denied. Only administrators can register new administrators.' });
  }

  // Extract registration data from request body
  const { username, password } = req.body;

  try {
    // Check if the username already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Username is already taken. Please choose a different one.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin
    const newAdmin = new Admin({
      username,
      password: hashedPassword
    });

    // Save the new admin to the database
    await newAdmin.save();

    res.json({ message: 'Admin registered successfully.' });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ error: 'An error occurred while registering the admin. Please try again later.' });
  }
});



// One-time script to add an admin
async function createAdmin() {
  const hashedPassword = await bcrypt.hash('Sreehari', 10);
  const newAdmin = new Admin({
    username: 'Sreehari',
    password: hashedPassword
  });
  await newAdmin.save();
  console.log('Admin created successfully!');
}

// Uncomment the following line to run the script, then comment it back once done
//createAdmin();




// Endpoint to fetch user dashboard data
app.get('/api/user/dashboard', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
      return res.status(403).json({ error: 'Authentication required' });
  }

  try {
      const decoded = jwt.verify(token, JWT_SECRET); // Replace with your actual JWT secret
      const userId = decoded.id;

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Fetch all relevant data
      const activities = await Activity.find({ user: userId }).sort({ createdAt: -1 });
      const mintEvents = await MintEvent.find({ to: user.ganacheAccount }).sort({ timestamp: -1 });

      // Fetch trades where the user is either the buyer or the seller
      const trades = await Trade.find({
        $or: [{ buyer: userId }, { seller: userId }]
      }).populate('buyer seller', 'username').sort({ timestamp: -1 });

      // Detailed analytics for graphs
      const activitiesOverTime = await Activity.aggregate([
          { $match: { user: userId } },
          { $group: {
              _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
              count: { $sum: 1 }
          }}
      ]);

      const tokensMintedOverTime = await MintEvent.aggregate([
          { $match: { to: user.ganacheAccount } },
          { $group: {
              _id: { year: { $year: "$timestamp" }, month: { $month: "$timestamp" } },
              totalMinted: { $sum: { $toDouble: "$amount" } }
          }}
      ]);

      // Placeholder for user settings (to be implemented)
      const userSettings = {
          emailNotifications: true,
          theme: 'dark'
      };

      // Construct the response
      res.json({
          userProfile: {
              username: user.username,
              cctBalance: user.cctBalance,
              carbonCredits: user.carbonCredits
          },
          activities,
          mintEvents,
          activitiesOverTime,
          tokensMintedOverTime,
          trades, // Include trades in the response
          userSettings
      });
  } catch (error) {
      console.error('Error fetching user dashboard data:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});


app.get('/api/latest-news', async (req, res) => {
  const apiKey = 'b1488b1ab5a33d8d883dcc4b7e61e231'; // Your GNews API key
  const url = `https://gnews.io/api/v4/search?q=carbon credits&apikey=${apiKey}`;

  try {
    const response = await axios.get(url);
    res.json(response.data.articles);
  } catch (error) {
    console.error('Error fetching news from GNews:', error.message);
    res.status(500).json({ message: 'Error fetching latest news' });
  }
});



app.post('/submit-activity', upload.single('supportingDocument'), async (req, res) => {
  // Extract the token from the Authorization header
  const token = req.headers.authorization?.split(' ')[1]; // Authorization: Bearer <token>
  if (!token) {
    return res.status(403).json({ error: 'A token is required for authentication' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Once verified, the decoded variable will contain the payload of the JWT,
    // which typically includes the user's ID if that's what you included when signing the token
    const userId = decoded.id;

    // Now you can find the user in your database with this ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
  
  

    // Assuming verification is successful, you can proceed with activity submission
    const { activityDetails, expectedImpact } = req.body;

    // Automated Check 1: Ensure activity details are sufficiently descriptive
    if (!activityDetails || activityDetails.length < 50) {
      return res.status(400).json({ error: 'Activity details are not sufficiently descriptive.' });
    }

    // Automated Check 2: Expected impact must be a positive number
    const impact = Number(expectedImpact);
    if (isNaN(impact) || impact <= 0) {
      return res.status(400).json({ error: 'Expected impact must be a positive number.' });
    }

    // Activity passes the automated checks
    console.log(user);
    const newActivity = new Activity({
      activityDetails,
      expectedImpact: impact,
      user: user._id, // Assuming user is retrieved from token
      status: 'pending', // Default status for manual review
      supportingDocument: req.file ? req.file.path : undefined, // Handle file upload
    });

    await newActivity.save();
    res.json({ message: 'Activity submitted successfully and awaiting review', activityId: newActivity._id });

  } catch (error) {
    console.error('Error processing the activity submission:', error);
    res.status(500).json({ error: 'Failed to submit activity. Please try again.' });
  }
});


app.get('/activities/pending', async (req, res) => {
  try {
      const pendingActivities = await Activity.find({ status: 'pending' }).populate('user', 'username');
      res.json(pendingActivities);
  } catch (error) {
      console.error('Failed to fetch pending activities:', error);
      res.status(500).json({ error: 'An error occurred while fetching pending activities.' });
  }
});


app.post('/activities/approve/:activityId', async (req, res) => {
  const { activityId } = req.params;
  const { revisedImpact, adminComment } = req.body; // Receive the revised impact and admin comment from the request body

  try {
      const activity = await Activity.findById(activityId);
      if (!activity) {
          return res.status(404).json({ error: 'Activity not found.' });
      }

      const user = await User.findById(activity.user);
      if (!user) {
          return res.status(404).json({ error: 'User not found.' });
      }

      // Update the activity with revised impact and admin comment
      activity.expectedImpact = revisedImpact || activity.expectedImpact; // Use revised impact if provided
      activity.adminComment = adminComment || ''; // Store admin comment
      activity.status = 'approved'; // Update status to approved

      const mintAmount = parseInt(activity.expectedImpact) * 10; // Recalculate mint amount based on possibly revised impact
      const mintUnits = web3.utils.toWei(mintAmount.toString(), 'ether'); // Proper conversion to Wei
      const accounts = await web3.eth.getAccounts();

      const receipt = await chainCreditsToken.methods.mint(user.ganacheAccount, mintUnits, activity.activityDetails)
          .send({ from: accounts[0], gas: 5000000 });

      const block = await web3.eth.getBlock(receipt.blockNumber);
      const eventData = {
          type: 'mintEvent',
          from: accounts[0],
          to: user.ganacheAccount,
          amount: web3.utils.fromWei(mintUnits, 'ether').toString(), // Convert amount to string
          description: activity.activityDetails,
          transactionHash: receipt.transactionHash.toString(), // Convert hash to string
          blockNumber: receipt.blockNumber.toString(), // Convert block number to string
          timestamp: new Date(Number(block.timestamp) * 1000).toISOString()
      };

      // Save and broadcast event details
      const newEvent = new MintEvent(eventData);
      await newEvent.save();
      wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(eventData));
          }
      });

      user.cctBalance += mintAmount; // Update user's balance
      await activity.save();
      await user.save();

      res.json({
          message: `Activity approved with revisions and ${mintAmount} CCT tokens minted successfully.`,
          transactionDetails: eventData
      });
  } catch (error) {
      console.error('Failed to approve activity or mint tokens:', error);
      res.status(500).json({ error: 'Failed to approve activity or mint tokens.' });
  }
});




// Reject an activity
app.post('/activities/reject/:activityId', async (req, res) => {
  const { activityId } = req.params;
  try {
      const activity = await Activity.findById(activityId);
      if (!activity) {
          return res.status(404).json({ error: 'Activity not found.' });
      }

      activity.status = 'rejected';
      await activity.save();
      res.json({ message: 'Activity rejected successfully.' });
  } catch (error) {
      console.error('Failed to reject activity:', error);
      res.status(500).json({ error: 'An error occurred while rejecting the activity.' });
  }
});


const moment = require('moment');

app.get('/api/minting-events', async (req, res) => {
  const { startDate, endDate } = req.query;

  // Ensure the dates are valid before querying
  const start = moment(startDate).isValid() ? new Date(startDate) : null;
  const end = moment(endDate).isValid() ? new Date(endDate) : null;

  // Check if dates are valid
  if (!start || !end) {
    return res.status(400).json({ error: 'Invalid start or end date.' });
  }

  try {
      const events = await MintEvent.find({
          timestamp: {
              $gte: start,
              $lte: end
          }
      }).sort({ timestamp: -1 }); // Sorting by timestamp descending

      res.status(200).json(events);
  } catch (error) {
      console.error("Failed to fetch minting events:", error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/analytics/tokens-minted', async (req, res) => {
  try {
    // Convert amount strings to numbers and sum them up
    const totalTokensMinted = await MintEvent.aggregate([
      {
        $match: { type: 'mintEvent' } // Filter to only include mint events if needed
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: { $toDouble: "$amount" } }
        }
      },
      {
        $project: {
          _id: 0, // Exclude the _id field from the results
          totalAmount: 1 // Include the totalAmount field
        }
      }
    ]);

    if (totalTokensMinted.length > 0) {
      res.json({ totalTokensMinted: totalTokensMinted[0].totalAmount });
    } else {
      res.json({ totalTokensMinted: 0 }); // Return 0 if there are no mint events
    }
  } catch (error) {
    console.error("Failed to fetch total tokens minted:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analytics/total-offset', async (req, res) => {
  try {
    const totalOffset = await Activity.aggregate([
      {
        $match: { status: 'approved' } // Filter to only include approved activities
      },
      {
        $group: {
          _id: null,
          totalImpact: { $sum: { $toDouble: "$expectedImpact" } }
        }
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          totalImpact: 1 // Include the totalImpact field
        }
      }
    ]);

    if (totalOffset.length > 0) {
      res.json({ totalCarbonOffset: totalOffset[0].totalImpact });
    } else {
      res.json({ totalCarbonOffset: 0 }); // Return 0 if there are no approved activities
    }
  } catch (error) {
    console.error("Failed to fetch total carbon offset:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/analytics/total-users', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({ totalUsers: userCount });
  } catch (error) {
    console.error("Failed to fetch total user count:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analytics/total-activities', async (req, res) => {
  try {
    const activityCount = await Activity.countDocuments();
    res.json({ totalActivities: activityCount });
  } catch (error) {
    console.error("Failed to fetch total activity count:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/analytics/activities-by-status', async (req, res) => {
  try {
    const activitiesByStatus = await Activity.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          status: "$_id",
          count: 1
        }
      }
    ]);

    // Transform the array into a status-to-count map
    const statusCount = {};
    activitiesByStatus.forEach(activity => {
      statusCount[activity.status] = activity.count;
    });

    res.json({ activitiesByStatus: statusCount });
  } catch (error) {
    console.error("Failed to fetch activity count by status:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/analytics/activities-over-time', async (req, res) => {
  try {
    const activitiesOverTime = await Activity.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      }
    ]);

    res.json(activitiesOverTime);
  } catch (error) {
    console.error("Failed to fetch activities over time:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/analytics/tokens-minted-over-time', async (req, res) => {
  try {
      const tokensMintedOverTime = await MintEvent.aggregate([
          {
              $group: {
                  _id: {
                      year: { $year: "$timestamp" },
                      month: { $month: "$timestamp" },
                      day: { $dayOfMonth: "$timestamp" }
                  },
                  totalMinted: { $sum: { $toDecimal: "$amount" } }
              }
          },
          {
              $sort: {
                  '_id.year': 1,
                  '_id.month': 1,
                  '_id.day': 1
              }
          }
      ]);

      const formattedData = tokensMintedOverTime.map(item => ({
          date: `${item._id.year}-${item._id.month}-${item._id.day}`,
          totalMinted: parseFloat(item.totalMinted) // Convert string to float if necessary
      }));

      res.json(formattedData);
  } catch (error) {
      console.error("Failed to fetch token minting over time:", error);
      res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/api/analytics/top-offsetters', async (req, res) => {
  try {
    const topOffsetters = await Activity.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: "$user", totalImpact: { $sum: { $toDouble: "$expectedImpact" } } } },
      { $sort: { totalImpact: -1 } },
      { $limit: 10 }
    ])
    .lookup({
      from: 'users', // This should match your collection name for users
      localField: '_id',
      foreignField: '_id',
      as: 'userInfo'
    })
    .unwind('userInfo')
    .project({
      _id: 0,
      username: "$userInfo.username",
      totalImpact: 1
    });

    res.json(topOffsetters);
  } catch (error) {
    console.error("Failed to fetch top offsetters:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/api/analytics/top-token-holders', async (req, res) => {
  try {
    const topTokenHolders = await User.find({})
      .sort({ cctBalance: -1 })
      .limit(10)
      .select({ username: 1, cctBalance: 1 });

    res.json(topTokenHolders);
  } catch (error) {
    console.error("Failed to fetch top token holders:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/analytics/tokens-minted-over-time', async (req, res) => {
  try {
    const tokensMintedOverTime = await MintEvent.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          totalMinted: { $sum: { $toDecimal: "$amount" } } // Ensure amounts are decimals
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      }
    ]);

    const formattedData = tokensMintedOverTime.map(item => ({
      date: `${item._id.year}-${item._id.month}-${item._id.day}`,
      totalMinted: parseFloat(item.totalMinted) // Ensure conversion to float for chart
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Failed to fetch token minting over time:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/api/analytics/activities-over-time', async (req, res) => {
  try {
    const activitiesOverTime = await Activity.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      }
    ]);

    res.json(activitiesOverTime);
  } catch (error) {
    console.error("Failed to fetch activities over time:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Endpoint to fetch the order book
app.get('/api/order-book', async (req, res) => {
  try {
      const buyOrders = await Trade.find({ type: 'buy' }).sort({ price: -1 });
      const sellOrders = await Trade.find({ type: 'sell' }).sort({ price: 1 });
      res.json({ buyOrders, sellOrders });
  } catch (error) {
      console.error('Failed to fetch order book:', error);
      res.status(500).json({ error: 'Failed to fetch order book' });
  }
});

// Endpoint to fetch trading history
app.get('/api/trading-history', async (req, res) => {
  try {
      const trades = await Trade.find().sort({ timestamp: -1 });
      res.json(trades);
  } catch (error) {
      console.error('Failed to fetch trading history:', error);
      res.status(500).json({ error: 'Failed to fetch trading history' });
  }
});



const PDFDocument = require('pdfkit');
app.get('/api/download-report', async (req, res) => {
  try {
    const mintEvents = await MintEvent.find({});
    const activities = await Activity.find({}).populate('user');

    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(pdfData),
        'Content-Type': 'application/pdf',
        'Content-disposition': 'attachment;filename=report.pdf',
      }).end(pdfData);
    });

    // Document Title
    doc.fontSize(25)
       .text('Comprehensive Report', { align: 'center' })
       .moveDown(0.5);

    // Minting Events Section
    doc.fontSize(20).text('Minting Events', { underline: true, align: 'left' })
       .moveDown(0.5);

    mintEvents.forEach(event => {
      doc.fontSize(12).text(`Date: ${event.timestamp.toLocaleDateString()}`, { align: 'left' })
         .text(`Amount: ${event.amount}`, { align: 'left' })
         .text(`To: ${event.to}`, { align: 'left' })
         .text(`From: ${event.from}`, { align: 'left' })
         .text(`Description: ${event.description || 'N/A'}`, { align: 'left' })
         .moveDown(0.5);
    });

    doc.addPage();  // Optionally add a new page for activities

    // Activities Section
    doc.fontSize(20).text('User Activities', { underline: true, align: 'left' })
       .moveDown(0.5);

    activities.forEach(activity => {
      doc.fontSize(12).text(`Activity Detail: ${activity.activityDetails}`, { align: 'left' })
         .text(`Impact: ${activity.expectedImpact}`, { align: 'left' })
         .text(`Status: ${activity.status}`, { align: 'left' })
         .text(`User: ${activity.user.username}`, { align: 'left' })
         .moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    console.error("Failed to generate report:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





//Start the server

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});






