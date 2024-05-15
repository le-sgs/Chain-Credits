import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TradingPage.css';  // Assuming your CSS is in this file

const TradeHistory = () => {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTradeHistory = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/trading-history');
                setTrades(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching trade history:', error);
                setLoading(false);
            }
        };

        fetchTradeHistory();
    }, []);

    return (
        <div className="trade-history-container">
            <h3>Trade History</h3>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="table table-fixed">
                    <thead>
                        <tr>
                            <th>Price</th>
                            <th>Volume</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.map((trade, index) => (
                            <tr key={index}>
                                <td>{trade.pricePerCredit}</td>
                                <td>{trade.quantity}</td>
                                <td>{new Date(trade.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TradeHistory;
