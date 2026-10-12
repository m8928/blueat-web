// Splits a reply line into plain, **bold** and `code` segments.
export function parseRich(text) {
    const segments = [];
    const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let last = 0;
    let match;
    while ((match = pattern.exec(text))) {
        if (match.index > last) segments.push({ text: text.slice(last, match.index), style: 'plain' });
        const token = match[0];
        segments.push(token.startsWith('**')
            ? { text: token.slice(2, -2), style: 'bold' }
            : { text: token.slice(1, -1), style: 'code' });
        last = match.index + token.length;
    }
    if (last < text.length) segments.push({ text: text.slice(last), style: 'plain' });
    return segments;
}

// Visible character count of a line, used to stream replies.
export function lineLength(line) {
    if (line.cols) return line.cols.reduce((n, col) => n + col.text.length, 0);
    return parseRich(line.text).reduce((n, seg) => n + seg.text.length, 0);
}

export function plainText(line) {
    if (line.cols) return line.cols.map((col) => col.text).join(' ');
    return parseRich(line.text).map((seg) => seg.text).join('');
}
