import { fileToDataUrl } from './helpers';

describe('fileToDataUrl', () => {
  const createMockFile = (size, type) => {
    const file = new Blob([''], { type });
    Object.defineProperty(file, 'size', {
      get () {
        return size;
      }
    });
    return file;
  };

  beforeEach(() => {
    global.FileReader = jest.fn().mockImplementation(function () {
      this.readAsDataURL = jest.fn().mockImplementation(function (file) {
        this.result = 'data:image/png;base64,encoded_string'; // Mocked result
        this.onload();
      });
      this.onload = jest.fn();
      this.onerror = jest.fn();
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('throws an error for invalid file types', async () => {
    const invalidFile = createMockFile(1024, 'image/gif'); // GIF is not a valid type

    try {
      await fileToDataUrl(invalidFile);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toBe('Provided file is not a png, jpg or jpeg image.');
    }
  });

  it('throws an error for files too large', async () => {
    const largeFile = createMockFile(3 * 1024 * 1024, 'image/jpeg'); // 3MB file

    try {
      await fileToDataUrl(largeFile);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toBe('Image is too big (> 2.5MB).');
    }
  });

  it('returns a data URL for a valid file', async () => {
    const validFile = createMockFile(1024, 'image/jpeg');
    const dataUrl = await fileToDataUrl(validFile);
    expect(dataUrl).toEqual('data:image/png;base64,encoded_string');
  });
});
