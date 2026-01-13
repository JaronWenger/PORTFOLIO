import React, { forwardRef } from 'react';
import Odd from './Odd';
import Even from './Even';
import { projects } from './ApplicationConfig';

const Applications = forwardRef(({ animationKey, projectRefs }, ref) => {
    // Reverse to show newest first on site
    const displayProjects = [...projects].reverse();

    return (
        <div className="applications" ref={ref} key={`apps-${animationKey}`}>
            {displayProjects.map((project, displayIndex) => {
                // Original index determines Odd/Even (0=Odd, 1=Even, etc.)
                const originalIndex = projects.length - 1 - displayIndex;
                const Component = originalIndex % 2 === 0 ? Odd : Even;

                return (
                    <Component
                        key={project.title}
                        {...project}
                        projectRef={el => {
                            if (projectRefs?.current) {
                                projectRefs.current[displayIndex] = el;
                            }
                        }}
                    />
                );
            })}
        </div>
    );
});

export default Applications;
