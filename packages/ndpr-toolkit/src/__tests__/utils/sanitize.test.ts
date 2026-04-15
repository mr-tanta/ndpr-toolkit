import { sanitizeInput } from '../../utils/sanitize';

describe('sanitizeInput', () => {
  describe('basic character escaping', () => {
    it('should escape < to &lt;', () => {
      expect(sanitizeInput('<')).toBe('&lt;');
    });

    it('should escape > to &gt;', () => {
      expect(sanitizeInput('>')).toBe('&gt;');
    });

    it('should escape " to &quot;', () => {
      expect(sanitizeInput('"')).toBe('&quot;');
    });

    it("should escape ' to &#x27;", () => {
      expect(sanitizeInput("'")).toBe('&#x27;');
    });

    it('should escape / to &#x2F;', () => {
      expect(sanitizeInput('/')).toBe('&#x2F;');
    });
  });

  describe('ampersand escaping', () => {
    it('should escape & to &amp;', () => {
      expect(sanitizeInput('&')).toBe('&amp;');
    });
  });

  describe('entity-based XSS prevention', () => {
    it('should escape & in pre-encoded entities so they cannot be decoded as HTML', () => {
      // An attacker might submit already-encoded entities hoping the browser
      // will decode them into executable markup.
      const malicious = '&lt;script&gt;alert(1)&lt;/script&gt;';
      const result = sanitizeInput(malicious);

      // Because & is escaped first, the & in &lt; becomes &amp;, producing &amp;lt;
      expect(result).toBe(
        '&amp;lt;script&amp;gt;alert(1)&amp;lt;&#x2F;script&amp;gt;'
      );

      // Must NOT pass through the raw entities unchanged
      expect(result).not.toContain('&lt;');
      expect(result).not.toContain('&gt;');
    });
  });

  describe('double-encoding correctness', () => {
    it('should encode &amp; in input as &amp;amp;', () => {
      expect(sanitizeInput('&amp;')).toBe('&amp;amp;');
    });

    it('should encode &quot; in input as &amp;quot;', () => {
      expect(sanitizeInput('&quot;')).toBe('&amp;quot;');
    });
  });

  describe('passthrough behaviour', () => {
    it('should return normal text unchanged', () => {
      expect(sanitizeInput('hello world')).toBe('hello world');
    });

    it('should return an empty string unchanged', () => {
      expect(sanitizeInput('')).toBe('');
    });

    it('should not alter numbers', () => {
      expect(sanitizeInput('12345')).toBe('12345');
    });
  });

  describe('mixed content', () => {
    it('should escape all special characters in a mixed string', () => {
      const input = 'Hello <b>world</b> & "friends"';
      const expected =
        'Hello &lt;b&gt;world&lt;&#x2F;b&gt; &amp; &quot;friends&quot;';
      expect(sanitizeInput(input)).toBe(expected);
    });
  });

  describe('replacement ordering', () => {
    it('should escape & before < so that < becomes &lt; (not &amp;lt;)', () => {
      // If & were replaced AFTER <, then the & in the freshly inserted &lt;
      // would be double-escaped to &amp;lt;. The correct ordering avoids this.
      const result = sanitizeInput('<');
      expect(result).toBe('&lt;');
      // This would be the broken result if & replacement came after <
      expect(result).not.toBe('&amp;lt;');
    });

    it('should escape & before > so that > becomes &gt; (not &amp;gt;)', () => {
      const result = sanitizeInput('>');
      expect(result).toBe('&gt;');
      expect(result).not.toBe('&amp;gt;');
    });

    it('should escape & before " so that " becomes &quot; (not &amp;quot;)', () => {
      const result = sanitizeInput('"');
      expect(result).toBe('&quot;');
      expect(result).not.toBe('&amp;quot;');
    });

    it("should escape & before ' so that ' becomes &#x27; (not &amp;#x27;)", () => {
      const result = sanitizeInput("'");
      expect(result).toBe('&#x27;');
      expect(result).not.toBe('&amp;#x27;');
    });

    it('should escape & before / so that / becomes &#x2F; (not &amp;#x2F;)', () => {
      const result = sanitizeInput('/');
      expect(result).toBe('&#x2F;');
      expect(result).not.toBe('&amp;#x2F;');
    });
  });
});
