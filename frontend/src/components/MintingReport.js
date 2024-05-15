import React, { useState } from 'react';
import './MintingReport.css';


function MintingReport() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [events, setEvents] = useState([]);

    const fetchEvents = async () => {
        const response = await fetch(`http://localhost:3001/api/minting-events?startDate=${startDate}&endDate=${endDate}`);
        const data = await response.json();
        setEvents(data);
    };

    return (
        <div className="minting-report">
            <h2>Minting Report</h2>
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
            />
            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
            />
            <button onClick={fetchEvents}>Fetch Events</button>

            {events.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Amount</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event, index) => (
                            <tr key={index}>
                                <td>{new Date(event.timestamp).toLocaleDateString()}</td>
                                <td>{event.from}</td>
                                <td>{event.to}</td>
                                <td>{event.amount}</td>
                                <td>{event.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No events to display.</p>
            )}
        </div>
    );
}

export default MintingReport;
