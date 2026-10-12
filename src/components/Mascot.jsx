import React from 'react';

// BLUEAT's pixel mascot; "#" is a filled pixel.
const PIXELS = [
    '..######..',
    '.########.',
    '###.##.###',
    '###.##.###',
    '##########',
    '##########',
    '##########',
    '.##....##.',
];
const EYES = [[3, 2], [6, 2]];
const SCALE = 6;

const Mascot = ({ className = '' }) => {
    const width = PIXELS[0].length;
    const height = PIXELS.length;
    return (
        <svg
            aria-hidden="true"
            className={className}
            width={width * SCALE}
            height={height * SCALE}
            viewBox={`0 0 ${width} ${height}`}
            shapeRendering="crispEdges"
        >
            {PIXELS.flatMap((row, y) => [...row].map((cell, x) => (
                cell === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" /> : null
            )))}
            {EYES.map(([x, y]) => (
                <rect key={`lid-${x}`} className="mascot-lid" x={x} y={y} width="1" height="2" fill="currentColor" />
            ))}
        </svg>
    );
};

export default Mascot;
