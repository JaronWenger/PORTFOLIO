import React from 'react';
import iphoneFrame from '../assets/iPhone.webp';

const IPhoneDisplay = ({ screenshot, alt }) => {
    return (
        <div className="iphone-wrapper">
            <div className="iphone-wrapper-inner">
                <div className="iphone-display">
                    <img
                        src={screenshot}
                        alt={`${alt} screen`}
                        className="iphone-screen-content"
                        loading="lazy"
                    />
                    <img
                        src={iphoneFrame}
                        alt={alt || "iPhone"}
                        className="iphone-frame"
                        loading="lazy"
                    />
                </div>
            </div>
        </div>
    );
};

export default IPhoneDisplay;
