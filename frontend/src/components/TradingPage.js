import React, { useState, useEffect } from 'react';
import getWeb3 from '../getWeb3';
import axios from 'axios';
import CarbonCreditsTradingABI from '../contracts/CarbonCreditsTrading.json';
import ChainCreditsTokenABI from '../contracts/ChainCreditsToken.json';
//import 'bootstrap/dist/css/bootstrap.min.css';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import TradeHistory from './TradeHistory';
import './TradingPage.css';  // Ensure the CSS file is imported
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TradingPage = () => {
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [carbonCreditsTrading, setCarbonCreditsTrading] = useState(null);
    const [chainCreditsToken, setChainCreditsToken] = useState(null);
    const [orderQuantity, setOrderQuantity] = useState('');
    const [pricePerCredit, setPricePerCredit] = useState('');
    const [isBuyOrder, setIsBuyOrder] = useState(true);
    const [walletConnected, setWalletConnected] = useState(false);
    const [buyOrders, setBuyOrders] = useState([]);
    const [sellOrders, setSellOrders] = useState([]);
    const [userOrders, setUserOrders] = useState([]);
    const [cctBalance, setCctBalance] = useState(0);
    const [carbonCredits, setCarbonCredits] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initWeb3AndContracts = async () => {
            try {
                const web3Instance = await getWeb3();
                const accounts = await web3Instance.eth.getAccounts();
                const carbonCreditsTradingInstance = new web3Instance.eth.Contract(
                    CarbonCreditsTradingABI,
                    '0x31B29631747265a80b44e497f8af2108fe626509'
                );
                const chainCreditsTokenInstance = new web3Instance.eth.Contract(
                    ChainCreditsTokenABI,
                    '0xD1713779BC63d59698E363Eebcb59Be8bfD4C44A'
                );

                setWeb3(web3Instance);
                setAccounts(accounts);
                setCarbonCreditsTrading(carbonCreditsTradingInstance);
                setChainCreditsToken(chainCreditsTokenInstance);
                setWalletConnected(accounts && accounts.length > 0);
            } catch (error) {
                alert("Failed to load web3, accounts, or contract. Check console for details.");
                console.error("Initialization error:", error);
            }
        };

        initWeb3AndContracts();
    }, []);


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/user/dashboard', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                const { userProfile } = response.data;
                setCctBalance(userProfile.cctBalance);
                setCarbonCredits(userProfile.carbonCredits);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setLoading(false);
            }
        };
        if (accounts.length > 0) {
            fetchUserData();
        }
    }, [accounts]);


    useEffect(() => {
        fetchOrders();
    }, [carbonCreditsTrading, accounts]);

    const fetchOrders = async () => {
        if (!carbonCreditsTrading || !accounts.length) return;
        const buyOrders = await carbonCreditsTrading.methods.getBuyOrders().call();
        const sellOrders = await carbonCreditsTrading.methods.getSellOrders().call();

        // Combine buy and sell orders and filter out those placed by the logged-in user
        const combinedOrders = [...buyOrders, ...sellOrders];
        const userOrders = combinedOrders.filter((order) => order.institute.toLowerCase() === accounts[0].toLowerCase() && !order.isFulfilled);

        setBuyOrders(buyOrders);
        setSellOrders(sellOrders);
        setUserOrders(userOrders);
    };

    const fetchCCTBalance = async () => {
        if (!web3 || !chainCreditsToken || !accounts.length) return;
        try {
            const balance = await chainCreditsToken.methods.balanceOf(accounts[0]).call();
            const balanceInCCT = web3.utils.fromWei(balance, 'ether');
            console.log(`CCT Balance for account ${accounts[0]}: ${balanceInCCT} CCT`);
        } catch (error) {
            console.error("Error fetching CCT balance:", error);
        }
    };

    useEffect(() => {
        fetchCCTBalance();
    }, [accounts, chainCreditsToken, web3]); 

    const handleApprove = async () => {
        if (!web3 || !accounts.length || !chainCreditsToken) {
            alert("Web3 is not initialized, accounts not loaded, or contract not set.");
            return;
        }
        const tokenAmountWei = web3.utils.toWei(orderQuantity, 'ether');
        try {
            await chainCreditsToken.methods.approve(carbonCreditsTrading._address, tokenAmountWei).send({ from: accounts[0] });
            alert("Token transfer approved! You can now place your order.");
        } catch (error) {
            alert("Approval failed. Check console for details.");
            console.error("Approval error:", error);
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("MetaMask is not installed. Please install it to use this app.");
            return;
        }
        try {
            const web3Instance = await getWeb3();
            const accounts = await web3Instance.eth.getAccounts();
            if (accounts.length > 0) {
                setWeb3(web3Instance);
                setAccounts(accounts);
                setWalletConnected(true);
            } else {
                alert("Please connect to your MetaMask wallet.");
            }
        } catch (error) {
            alert("Failed to connect to MetaMask. Please make sure it is installed and you have allowed access to this app.");
            console.error("Connect wallet error:", error);
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!web3 || !accounts.length || !carbonCreditsTrading) {
            alert("Please connect to MetaMask and try again.");
            return;
        }
        try {
            await carbonCreditsTrading.methods.placeOrder(
                orderQuantity,
                web3.utils.toWei(pricePerCredit, 'ether'),
                isBuyOrder
            ).send({ from: accounts[0] });
            alert("Order placed successfully.");
        } catch (error) {
            alert("Failed to place order. Check console for details.");
            console.error("Order placement error:", error);
        }
    };

    const handleCancelOrder = async (orderId) => {
        // Call the smart contract to cancel the order
        try {
            await carbonCreditsTrading.methods.cancelOrder(orderId).send({ from: accounts[0] });
            alert('Order cancelled successfully.');
    
            // Refresh the orders
            fetchOrders();
        } catch (error) {
            alert('There was an error cancelling the order.');
            console.error(error);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-12">
                    <Link to="/user-home" className="btn btn-secondary mb-3">Home</Link> {/* Home button */}
                </div>
                <div className="col-md-4">
                    <div>
                        <h2>Trading Dashboard</h2>
                        <p>Here you can view your CCT balance, manage your carbon credits, and place or cancel orders. Connect your wallet to get started!</p>
                        <p><strong>CCT Balance:</strong> {cctBalance} CCT</p>
                        <p><strong>Carbon Credits:</strong> {carbonCredits}</p>
                        {!walletConnected ? (
                            <button onClick={connectWallet} className="btn btn-warning">Connect Wallet</button>
                        ) : (
                            <form onSubmit={handlePlaceOrder} className="my-4">
                                <div className="form-group">
                                    <label htmlFor="orderQuantity">Quantity</label>
                                    <input type="number" className="form-control mb-2" id="orderQuantity" value={orderQuantity} onChange={e => setOrderQuantity(e.target.value)} placeholder="Enter quantity of Carbon Credits" required disabled={!walletConnected} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="pricePerCredit">Price Per Credit (in CCT)</label>
                                    <input type="number" className="form-control mb-2" id="pricePerCredit" value={pricePerCredit} onChange={e => setPricePerCredit(e.target.value)} placeholder="Enter price per Carbon Credit" required disabled={!walletConnected} />
                                </div>
                                <button onClick={handleApprove} className="btn btn-primary" disabled={!walletConnected || !orderQuantity}>Approve CCT Spending</button>
                                <div className="form-check mb-2">
                                    <input className="form-check-input" type="radio" name="orderType" id="buyOrder" checked={isBuyOrder} onChange={() => setIsBuyOrder(true)} disabled={!walletConnected} />
                                    <label className="form-check-label" htmlFor="buyOrder">Buy</label>
                                </div>
                                <div className="form-check mb-2">
                                    <input className="form-check-input" type="radio" name="orderType" id="sellOrder" checked={!isBuyOrder} onChange={() => setIsBuyOrder(false)} disabled={!walletConnected} />
                                    <label className="form-check-label" htmlFor="sellOrder">Sell</label>
                                </div>
                                <button type="submit" className="btn btn-primary mb-2" disabled={!walletConnected}>Place Order</button>
                            </form>
                        )}
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="chart">
                        <Line data={{
                            labels: buyOrders.map(order => {
                                const date = new Date(order.timestamp * 1000);
                                return isNaN(date.getTime()) ? 'Time History' : date.toLocaleDateString();
                              }),
                            datasets: [{
                                label: 'Price Per Credit',
                                data: buyOrders.map(order => parseFloat(web3.utils.fromWei(order.pricePerCredit.toString(), 'ether'))),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)'
                            }]
                        }} />
                    </div>
                    <div>
                        <div className="row">
                            <div className="col-md-6">
                                <h3>Buy Orders</h3>
                                <ul className="list-group">
                                    {buyOrders.map((order, index) => (
                                        <li key={index} className="list-group-item">
                                            Quantity: {web3.utils.fromWei(order.quantity.toString(), 'ether')} | 
                                            Price: {web3.utils.fromWei(order.pricePerCredit.toString(), 'ether')} CCT
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="col-md-6">
                                <h3>Sell Orders</h3>
                                <ul className="list-group">
                                    {sellOrders.map((order, index) => (
                                        <li key={index} className="list-group-item">
                                            Quantity: {web3.utils.fromWei(order.quantity.toString(), 'ether')} | 
                                            Price: {web3.utils.fromWei(order.pricePerCredit.toString(), 'ether')} CCT
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <TradeHistory /> {/* Include the TradeHistory component */}
                </div>
            </div>

            {/* Open Orders section */}
            <div className="col-md-12 mt-4">
                <h3>Open Orders</h3>
                <ul className="list-group">
                    {userOrders.map((order, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            Quantity: {web3.utils.fromWei(order.quantity.toString(), 'ether')}
                            | Price: {web3.utils.fromWei(order.pricePerCredit.toString(), 'ether')} CCT
                            <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={order.institute.toLowerCase() !== accounts[0].toLowerCase()}
                            >
                                Cancel
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TradingPage;
