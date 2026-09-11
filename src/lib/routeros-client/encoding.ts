/**
 * RouterOS API uses a variable-length encoding for each "word" (a length
 * prefix followed by that many bytes of UTF-8 data). A "sentence" is a
 * sequence of words terminated by a zero-length word.
 *
 * Length encoding rules (see MikroTik API docs):
 *   len < 0x80        -> 1 byte:  len
 *   len < 0x4000       -> 2 bytes: len | 0x8000
 *   len < 0x200000     -> 3 bytes: len | 0xC00000
 *   len < 0x10000000    -> 4 bytes: len | 0xE0000000
 *   otherwise          -> 5 bytes: 0xF0, then 4-byte big-endian len
 */

export function encodeLength(len: number): Buffer {
  if (len < 0x80) {
    return Buffer.from([len]);
  } else if (len < 0x4000) {
    const buf = Buffer.alloc(2);
    buf.writeUInt16BE((len & 0x3fff) | 0x8000, 0);
    return buf;
  } else if (len < 0x200000) {
    const buf = Buffer.alloc(3);
    buf[0] = ((len >> 16) & 0x1f) | 0xc0;
    buf[1] = (len >> 8) & 0xff;
    buf[2] = len & 0xff;
    return buf;
  } else if (len < 0x10000000) {
    const buf = Buffer.alloc(4);
    buf[0] = ((len >> 24) & 0x0f) | 0xe0;
    buf[1] = (len >> 16) & 0xff;
    buf[2] = (len >> 8) & 0xff;
    buf[3] = len & 0xff;
    return buf;
  } else {
    const buf = Buffer.alloc(5);
    buf[0] = 0xf0;
    buf.writeUInt32BE(len, 1);
    return buf;
  }
}

export function encodeWord(word: string): Buffer {
  const data = Buffer.from(word, "utf8");
  return Buffer.concat([encodeLength(data.length), data]);
}

export function encodeSentence(words: string[]): Buffer {
  const parts = words.map(encodeWord);
  parts.push(Buffer.from([0])); // zero-length terminator word
  return Buffer.concat(parts);
}

/**
 * Incrementally decodes a byte stream into sentences (arrays of strings).
 * Feed raw socket data via push(); consume complete sentences via drain().
 */
export class SentenceDecoder {
  private buffer: Buffer = Buffer.alloc(0);
  private currentWords: string[] = [];

  push(chunk: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, chunk]);
  }

  /** Pulls out every complete sentence currently available in the buffer. */
  drain(): string[][] {
    const sentences: string[][] = [];

    while (true) {
      const result = this.tryReadWord();
      if (result === null) break; // not enough data yet

      const { word, bytesConsumed } = result;
      this.buffer = this.buffer.subarray(bytesConsumed);

      if (word === null) {
        // zero-length word => end of sentence
        sentences.push(this.currentWords);
        this.currentWords = [];
      } else {
        this.currentWords.push(word);
      }
    }

    return sentences;
  }

  private tryReadWord(): { word: string | null; bytesConsumed: number } | null {
    if (this.buffer.length < 1) return null;
    const b0 = this.buffer[0];
    let len: number;
    let headerLen: number;

    if ((b0 & 0x80) === 0x00) {
      len = b0;
      headerLen = 1;
    } else if ((b0 & 0xc0) === 0x80) {
      if (this.buffer.length < 2) return null;
      len = ((b0 & 0x3f) << 8) | this.buffer[1];
      headerLen = 2;
    } else if ((b0 & 0xe0) === 0xc0) {
      if (this.buffer.length < 3) return null;
      len = ((b0 & 0x1f) << 16) | (this.buffer[1] << 8) | this.buffer[2];
      headerLen = 3;
    } else if ((b0 & 0xf0) === 0xe0) {
      if (this.buffer.length < 4) return null;
      len =
        ((b0 & 0x0f) << 24) |
        (this.buffer[1] << 16) |
        (this.buffer[2] << 8) |
        this.buffer[3];
      headerLen = 4;
    } else {
      if (this.buffer.length < 5) return null;
      len = this.buffer.readUInt32BE(1);
      headerLen = 5;
    }

    if (this.buffer.length < headerLen + len) return null; // wait for more data

    if (len === 0) {
      return { word: null, bytesConsumed: headerLen };
    }

    const word = this.buffer
      .subarray(headerLen, headerLen + len)
      .toString("utf8");
    return { word, bytesConsumed: headerLen + len };
  }
}
