import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SubmitActivity.css';

const SubmitActivity = () => {
    const [activityDetails, setActivityDetails] = useState('');
    const [expectedImpact, setExpectedImpact] = useState('');
    const [supportingDocument, setSupportingDocument] = useState(null);
    const [showGuidelines, setShowGuidelines] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('activityDetails', activityDetails);
        formData.append('expectedImpact', expectedImpact);
        if (supportingDocument) {
            formData.append('supportingDocument', supportingDocument);
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3001/submit-activity', {
                method: 'POST',
                body: formData,
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const jsonResponse = await response.json();
                console.log('Activity submitted successfully:', jsonResponse);
                alert('Activity submitted successfully');
            } else {
                const jsonResponse = await response.json();
                console.error('Failed to submit activity:', jsonResponse.error);
                alert(`Failed to submit activity: ${jsonResponse.error}`);
            }
        } catch (error) {
            console.error('Failed to submit activity due to an error:', error);
            alert('Failed to submit activity due to an error. Check the console for more details.');
        }
    };

    return (
        <div className="activity-form">
                <div className="col-md-12">
                    <Link to="/user-home" className="btn btn-secondary mb-3">Home</Link> {/* Home button */}
                </div>
            <h2>Submit Carbon Offsetting Activity</h2>

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label htmlFor="activityDetails">Activity Details:</label>
                    <textarea
                        id="activityDetails"
                        value={activityDetails}
                        onChange={(e) => setActivityDetails(e.target.value)}
                        placeholder="Enter precise details about the activity. It needs to match with the supporting documents. (Min. 50 Characters)"
                        required
                    />
                </div>
                <button onClick={() => setShowGuidelines(!showGuidelines)} className="guidelines-button">
                {showGuidelines ? 'Hide Guidelines' : 'Show Guidelines'}
            </button>
            {showGuidelines && (
                <div className="guidelines">
                    <h4>Activity Guidelines</h4>
                    <ul>
                        <li><strong>Low Impact (1-10):</strong> Activities such as recycling small quantities of waste or local community clean-ups.</li>
                        <li><strong>Moderate Impact (11-50):</strong> Initiatives like planting trees or small-scale renewable energy installations.</li>
                        <li><strong>High Impact (51 and above):</strong> Large-scale environmental projects such as significant land restoration or major renewable energy projects.</li>
                    </ul>
                </div>
            )}
                <div className="form-group">
                    <label htmlFor="expectedImpact">Expected Impact:</label>
                    <input
                        id="expectedImpact"
                        type="text"
                        value={expectedImpact}
                        onChange={(e) => setExpectedImpact(e.target.value)}
                        placeholder="Enter a positive integer. Please refer to the activity guidelines."
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="supportingDocument">Supporting Document:</label>
                    <input
                        id="supportingDocument"
                        type="file"
                        onChange={(e) => setSupportingDocument(e.target.files[0])}
                        required
                    />
                </div>
                <button type="submit" className="submit-btn">Submit Activity</button>
            </form>
        </div>
    );
};

export default SubmitActivity;
