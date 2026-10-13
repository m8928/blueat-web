import React from 'react';
import { MASCOT_FORMS, MASCOT_HEIGHT, MASCOT_WIDTH } from '../lib/mascotForms';

// Draws one of the mascot's forms. Keyed by form, so each change remounts the SVG
// and replays the little "poof" in index.css.
const Mascot = ({ form = 'base', scale = 6, className = '' }) => {
    const cells = MASCOT_FORMS[form] ?? MASCOT_FORMS.base;
    return (
        <svg
            key={form}
            aria-hidden="true"
            data-form={form}
            className={`mx-poof ${className}`}
            width={MASCOT_WIDTH * scale}
            height={MASCOT_HEIGHT * scale}
            viewBox={`0 0 ${MASCOT_WIDTH} ${MASCOT_HEIGHT}`}
            shapeRendering="crispEdges"
        >
            {cells.map(({ x, y, fill, className: cls, lid }) => (
                <rect
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    width="1"
                    height="1"
                    fill={fill}
                    className={cls || undefined}
                    style={lid ? { '--lid': lid } : undefined}
                />
            ))}
        </svg>
    );
};

export default Mascot;
