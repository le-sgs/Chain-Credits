import React, { useEffect, useState } from 'react';
import './ReviewActivities.css'; // Import your CSS file for styles

const ReviewActivities = () => {
    const [pendingActivities, setPendingActivities] = useState([]);
    const [revisionDetails, setRevisionDetails] = useState({});

    useEffect(() => {
        fetchPendingActivities();
    }, []);

    const fetchPendingActivities = async () => {
        const response = await fetch('http://localhost:3001/activities/pending');
        const activities = await response.json();
        setPendingActivities(activities);
    };

    const handleApprove = async (activityId) => {
        const { revisedImpact, adminComment } = revisionDetails[activityId] || {};
        const response = await fetch(`http://localhost:3001/activities/approve/${activityId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ revisedImpact, adminComment })
        });
        const data = await response.json();
        if (response.ok) {
            alert(`Approved! CCT sent from ${data.transactionDetails.from} to ${data.transactionDetails.to} (${data.transactionDetails.amount} tokens).`);
            fetchPendingActivities(); // Refresh the list
        } else {
            alert('Failed to approve: ' + data.error);
        }
    };

    const handleReject = async (activityId) => {
        await fetch(`http://localhost:3001/activities/reject/${activityId}`, { method: 'POST' });
        fetchPendingActivities(); // Refresh the list
    };

    const handleInputChange = (activityId, field, value) => {
        setRevisionDetails(prev => ({
            ...prev,
            [activityId]: {
                ...prev[activityId],
                [field]: value
            }
        }));
    };

    return (
        <div className="review-activities">
            <h2>Pending Activities for Review</h2>
            <ul>
                {pendingActivities.map(activity => (
                    <li key={activity._id} className="activity-item">
                        <p>{activity.activityDetails}</p>
                        <input
                            type="number"
                            placeholder="Revised Impact"
                            className="input revised-impact"
                            value={revisionDetails[activity._id]?.revisedImpact || activity.expectedImpact}
                            onChange={e => handleInputChange(activity._id, 'revisedImpact', e.target.value)}
                        />
                        <textarea
                            placeholder="Comment on revision"
                            className="textarea admin-comment"
                            value={revisionDetails[activity._id]?.adminComment || ''}
                            onChange={e => handleInputChange(activity._id, 'adminComment', e.target.value)}
                        />
                        <button className="button approve" onClick={() => handleApprove(activity._id)}>Approve</button>
                        <button className="button reject" onClick={() => handleReject(activity._id)}>Reject</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ReviewActivities;
