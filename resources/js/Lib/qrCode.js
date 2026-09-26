/**
 * QR code generator minimal (tanpa dependensi eksternal).
 *
 * Dipakai untuk menampilkan QRIS dari ID pemesanan. Implementasi ini adalah
 * port ringkas dari algoritma Nayuki "QR Code generator" (MIT License) yang
 * disederhanakan untuk kebutuhan RentGo: 1 QR, mode byte, koreksi error
 * level M, versi 1-10 (cukup untuk payload QRIS ~200 karakter).
 */

/* ------------------------------------------------------------------ */
/* Galois field arithmetic (GF(256)) untuk Reed-Solomon                */
/* ------------------------------------------------------------------ */

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);

(() => {
    let x = 1;
    for (let i = 0; i < 255; i++) {
        EXP[i] = x;
        LOG[x] = i;
        x <<= 1;
        if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();

const gfMul = (a, b) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);

function reedSolomonComputeDivisor(degree) {
    const result = new Uint8Array(degree);
    result[degree - 1] = 1;
    let root = 1;
    for (let i = 0; i < degree; i++) {
        for (let j = 0; j < result.length; j++) {
            result[j] = gfMul(result[j], root);
            if (j + 1 < result.length) result[j] ^= result[j + 1];
        }
        root = gfMul(root, 0x02);
    }
    return result;
}

function reedSolomonComputeRemainder(data, divisor) {
    const result = new Uint8Array(divisor.length);
    for (const b of data) {
        const factor = b ^ result[0];
        result.copyWithin(0, 1);
        result[result.length - 1] = 0;
        for (let i = 0; i < result.length; i++) {
            result[i] ^= gfMul(divisor[i], factor);
        }
    }
    return result;
}

/* ------------------------------------------------------------------ */
/* Tabel kapasitas: [versi][level] → data codewords & blok              */
/* Level yang dipakai: M (indeks 1 dari L, M, Q, H)                     */
/* ------------------------------------------------------------------ */

// [dataCodewords, eccCodewordsPerBlock, numBlocks]
const ECC_TABLE_M = {
    1: [16, 10, 1],
    2: [28, 16, 1],
    3: [44, 26, 1],
    4: [64, 18, 2],
    5: [86, 24, 2],
    6: [108, 16, 4],
    7: [124, 18, 4],
    8: [154, 22, 4],
    9: [182, 22, 5],
    10: [216, 26, 5],
};

const ALIGNMENT_POSITIONS = {
    1: [],
    2: [6, 18],
    3: [6, 22],
    4: [6, 26],
    5: [6, 30],
    6: [6, 34],
    7: [6, 22, 38],
    8: [6, 24, 42],
    9: [6, 26, 46],
    10: [6, 28, 50],
};

/* ------------------------------------------------------------------ */
/* Bit buffer                                                          */
/* ------------------------------------------------------------------ */

function toUtf8Bytes(text) {
    if (typeof TextEncoder !== "undefined")
        return Array.from(new TextEncoder().encode(text));
    return Array.from(unescape(encodeURIComponent(text))).map((c) =>
        c.charCodeAt(0),
    );
}

class BitBuffer {
    constructor() {
        this.bits = [];
    }

    append(value, length) {
        for (let i = length - 1; i >= 0; i--) {
            this.bits.push((value >>> i) & 1);
        }
    }

    get length() {
        return this.bits.length;
    }
}

/* ------------------------------------------------------------------ */
/* Encoding                                                            */
/* ------------------------------------------------------------------ */

function encodeToCodewords(text) {
    const bytes = toUtf8Bytes(text);

    // Pilih versi terkecil yang muat (mode byte: 4 bit mode + 8/16 bit count).
    let version = 0;
    let dataCapacityBits = 0;

    for (let v = 1; v <= 10; v++) {
        const [dataCodewords] = ECC_TABLE_M[v];
        const countBits = v <= 9 ? 8 : 16;
        const needed = 4 + countBits + bytes.length * 8;
        if (needed <= dataCodewords * 8) {
            version = v;
            dataCapacityBits = dataCodewords * 8;
            break;
        }
    }

    if (!version) {
        throw new Error(
            "Payload QR terlalu panjang untuk didukung (maks versi 10).",
        );
    }

    const buffer = new BitBuffer();
    buffer.append(0b0100, 4); // mode byte
    buffer.append(bytes.length, version <= 9 ? 8 : 16);

    for (const b of bytes) buffer.append(b, 8);

    // Terminator + padding sampai kapasitas data penuh.
    buffer.append(0, Math.min(4, dataCapacityBits - buffer.length));
    buffer.append(0, (8 - (buffer.length % 8)) % 8);

    let pad = 0xec;
    while (buffer.length < dataCapacityBits) {
        buffer.append(pad, 8);
        pad = pad === 0xec ? 0x11 : 0xec;
    }

    // Kelompokkan ke byte.
    const dataCodewords = [];
    for (let i = 0; i < buffer.length; i += 8) {
        let byte = 0;
        for (let j = 0; j < 8; j++) byte = (byte << 1) | buffer.bits[i + j];
        dataCodewords.push(byte);
    }

    return { version, dataCodewords };
}

function addEccAndInterleave(version, dataCodewords) {
    const [totalData, eccPerBlock, numBlocks] = ECC_TABLE_M[version];

    const totalCodewords = totalData + eccPerBlock * numBlocks;
    const numShortBlocks = numBlocks - (totalCodewords % numBlocks);
    const shortBlockDataLen =
        Math.floor(totalCodewords / numBlocks) - eccPerBlock;

    const divisor = reedSolomonComputeDivisor(eccPerBlock);

    const blocks = [];
    let k = 0;
    for (let i = 0; i < numBlocks; i++) {
        const dataLen = shortBlockDataLen + (i < numShortBlocks ? 0 : 1);
        const data = dataCodewords.slice(k, k + dataLen);
        k += dataLen;
        const ecc = reedSolomonComputeRemainder(data, divisor);
        blocks.push({ data, ecc });
    }

    const result = [];
    const maxDataLen = shortBlockDataLen + 1;

    for (let i = 0; i < maxDataLen; i++) {
        for (const block of blocks) {
            if (i < block.data.length) result.push(block.data[i]);
        }
    }
    for (let i = 0; i < eccPerBlock; i++) {
        for (const block of blocks) result.push(block.ecc[i]);
    }

    return result;
}

/* ------------------------------------------------------------------ */
/* Matrix construction                                                 */
/* ------------------------------------------------------------------ */

function createMatrix(version, codewords) {
    const size = version * 4 + 17;
    const modules = Array.from({ length: size }, () =>
        new Array(size).fill(false),
    );
    const isFunction = Array.from({ length: size }, () =>
        new Array(size).fill(false),
    );

    const setFunctionModule = (x, y, isDark) => {
        if (x < 0 || y < 0 || x >= size || y >= size) return;
        modules[y][x] = isDark;
        isFunction[y][x] = true;
    };

    // Finder patterns + separator
    const drawFinder = (cx, cy) => {
        for (let dy = -4; dy <= 4; dy++) {
            for (let dx = -4; dx <= 4; dx++) {
                const dist = Math.max(Math.abs(dx), Math.abs(dy));
                setFunctionModule(cx + dx, cy + dy, dist !== 2 && dist !== 4);
            }
        }
    };
    drawFinder(3, 3);
    drawFinder(size - 4, 3);
    drawFinder(3, size - 4);

    // Timing patterns
    for (let i = 0; i < size; i++) {
        setFunctionModule(6, i, i % 2 === 0);
        setFunctionModule(i, 6, i % 2 === 0);
    }

    // Alignment patterns
    const positions = ALIGNMENT_POSITIONS[version] || [];
    for (const y of positions) {
        for (const x of positions) {
            // Lewati yang bertabrakan dengan finder.
            if (
                (x === 6 && y === 6) ||
                (x === 6 && y === size - 7) ||
                (x === size - 7 && y === 6)
            )
                continue;
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    setFunctionModule(
                        x + dx,
                        y + dy,
                        Math.max(Math.abs(dx), Math.abs(dy)) !== 1,
                    );
                }
            }
        }
    }

    // Reserve format info
    for (let i = 0; i < 9; i++) {
        setFunctionModule(i, 8, false);
        setFunctionModule(8, i, false);
    }
    for (let i = 0; i < 8; i++) {
        setFunctionModule(size - 1 - i, 8, false);
        setFunctionModule(8, size - 1 - i, false);
    }
    setFunctionModule(8, size - 8, true); // dark module

    // Data placement (zigzag dari kanan bawah)
    let bitIndex = 0;
    const totalBits = codewords.length * 8;

    for (let right = size - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5; // lewati kolom timing
        for (let vert = 0; vert < size; vert++) {
            for (let j = 0; j < 2; j++) {
                const x = right - j;
                const upward = ((right + 1) & 2) === 0;
                const y = upward ? size - 1 - vert : vert;

                if (!isFunction[y][x] && bitIndex < totalBits) {
                    modules[y][x] =
                        ((codewords[bitIndex >>> 3] >>> (7 - (bitIndex & 7))) &
                            1) ===
                        1;
                    bitIndex++;
                }
            }
        }
    }

    // Mask 0: (x + y) % 2 === 0
    const maskFn = (x, y) => (x + y) % 2 === 0;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!isFunction[y][x] && maskFn(x, y))
                modules[y][x] = !modules[y][x];
        }
    }

    // Format info: level M (00) + mask 0
    const formatBits = 0b0000; // level M + mask pattern 0, sudah ter-ECC
    drawFormatBits(modules, size, formatBits);

    return modules;
}

/** Tulis format information (level + mask) ke matrix. */
function drawFormatBits(modules, size, _bits) {
    // Format string untuk ECC level M (0b00) & mask 0, sudah termasuk BCH.
    const FORMAT = 0b101010000010;

    for (let i = 0; i <= 5; i++) modules[8][i] = ((FORMAT >> i) & 1) === 1;
    modules[8][7] = ((FORMAT >> 6) & 1) === 1;
    modules[8][8] = ((FORMAT >> 7) & 1) === 1;
    modules[7][8] = ((FORMAT >> 8) & 1) === 1;
    for (let i = 9; i < 15; i++) modules[14 - i][8] = ((FORMAT >> i) & 1) === 1;

    for (let i = 0; i < 8; i++)
        modules[size - 1 - i][8] = ((FORMAT >> i) & 1) === 1;
    for (let i = 8; i < 15; i++)
        modules[8][size - 15 + i] = ((FORMAT >> i) & 1) === 1;
    modules[size - 8][8] = true;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Bangun matrix QR (array of array boolean) dari sebuah teks.
 * @param {string} text
 * @returns {boolean[][]}
 */
export function buildQrMatrix(text) {
    const { version, dataCodewords } = encodeToCodewords(text);
    const allCodewords = addEccAndInterleave(version, dataCodewords);
    return createMatrix(version, allCodewords);
}

/**
 * Render QR sebagai SVG string siap pakai (tanpa file/gambar eksternal).
 * @param {string} text
 * @param {{ scale?: number, border?: number, dark?: string, light?: string }} options
 */
export function qrSvgDataUri(text, options = {}) {
    const { scale = 6, border = 4, dark = "#111", light = "#ffffff" } = options;

    const matrix = buildQrMatrix(text);
    const size = matrix.length;
    const dimension = (size + border * 2) * scale;

    let path = "";
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (matrix[y][x]) {
                path += `M${(x + border) * scale},${(y + border) * scale}h${scale}v${scale}h-${scale}z`;
            }
        }
    }

    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${dimension}" height="${dimension}" viewBox="0 0 ${dimension} ${dimension}" shape-rendering="crispEdges">` +
        `<rect width="${dimension}" height="${dimension}" fill="${light}"/>` +
        `<path d="${path}" fill="${dark}"/>` +
        `</svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
