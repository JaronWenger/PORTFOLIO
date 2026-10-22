import React from 'react';
import macBase from '../assets/mac.webp';
import screenMask from '../assets/screen.webp';

const MacBookDisplay = ({ screenshot, alt }) => {
    return (
        <div className="macbook-display">
            <img
                src={macBase}
                alt={alt || "MacBook"}
                className="macbook-base"
                loading="lazy"
            />
            <div
                className="macbook-screen-mask"
                style={{
                    maskImage: `url(${screenMask})`,
                    WebkitMaskImage: `url(${screenMask})`
                }}
            >
                <div className="macbook-screen-content">
                    <img
                        src={screenshot}
                        alt={`${alt} screen`}
                        className="macbook-screen-img"
                        loading="lazy"
                    />
                </div>
            </div>
        </div>
    );
};

export default MacBookDisplay;
