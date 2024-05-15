import React from 'react';
import './Modal.css';

const Modal = ({ show, onClose }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h4 className="modal-title">Activity Guidelines</h4>
                </div>
                <div className="modal-body">
                    <p>Activities are evaluated based on their expected environmental impact. Below are the guidelines to help you estimate the impact level:</p>
                    <ul>
                        <li><strong>Low Impact (1-10):</strong> Activities such as recycling small quantities of waste or local community clean-ups.</li>
                        <li><strong>Moderate Impact (11-50):</strong> Initiatives like planting trees or small-scale renewable energy installations.</li>
                        <li><strong>High Impact (51 and above):</strong> Large-scale environmental projects such as significant land restoration or major renewable energy projects.</li>
                    </ul>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="button">Close</button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
