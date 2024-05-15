import React, { useState, useEffect } from 'react';
import './MintingEvents.css'; // Ensure you have created this CSS file in the same directory
import { Link } from 'react-router-dom';

function MintingEvents() {
    const [events, setEvents] = useState([]);
    const [visibleDetailIndex, setVisibleDetailIndex] = useState(null); // State to handle visibility of event details

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:3003');
        
        ws.onmessage = (event) => {
            const eventData = JSON.parse(event.data);
            setEvents(prevEvents => [...prevEvents, eventData]);
        };

        ws.onopen = () => console.log("WebSocket connected");
        ws.onerror = error => console.log("WebSocket error: ", error);
        ws.onclose = () => console.log("WebSocket disconnected");

        return () => ws.close(); // Cleanup WebSocket connection when the component unmounts
    }, []);

    const toggleDetails = (index) => {
        setVisibleDetailIndex(visibleDetailIndex === index ? null : index); // Toggle visibility based on index
    };

    return (
        <div className="container">
            <h2>Minting Events</h2>
            <div className="col-md-12">
                    <Link to="/user-home" className="btn btn-secondary mb-3">Home</Link> {/* Home button */}
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Amount</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((event, index) => (
                        <React.Fragment key={index}>
                            <tr>
                                <td>{index + 1}</td>
                                <td>{event.amount} CCT</td>
                                <td>
                                    <button type="button" className="btn btn-info" onClick={() => toggleDetails(index)}>
                                        View Details
                                    </button>
                                </td>
                            </tr>
                            {visibleDetailIndex === index && (
                                <tr>
                                    <td colSpan="3">
                                        <div className="details">
                                            <p><strong>Description:</strong> {event.description}</p>
                                            <p><strong>From:</strong> {'Administrator'}</p>
                                            <p><strong>To:</strong> {event.to}</p>
                                            <p><strong>Transaction Hash:</strong> {event.transactionHash}</p>
                                            <p><strong>Block Number:</strong> {event.blockNumber}</p>
                                            <p><strong>Minted On:</strong> {event.timestamp}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default MintingEvents;
