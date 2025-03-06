import { describe, expect, it, vi } from 'vitest';

import { copyToClipboard } from '../src/utils/copyToClipboard';

describe('copyToClipboard', () => {
  // Mock clipboard API
  const mockWriteText = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
    });
  });

  it('should use clipboard API when available', async () => {
    mockWriteText.mockResolvedValueOnce(undefined as any);

    await copyToClipboard('test text');

    expect(mockWriteText).toHaveBeenCalledWith('test text');
  });

  it('should fall back to execCommand when clipboard API fails', async () => {
    mockWriteText.mockRejectedValueOnce(new Error('Clipboard API failed'));

    const mockExecCommand = vi.fn();
    document.execCommand = mockExecCommand;

    const mockAppend = vi.fn();
    document.body.append = mockAppend;

    const mockRemove = vi.fn();
    const mockTextArea = {
      focus: vi.fn(),
      remove: mockRemove,
      select: vi.fn(),
      value: '',
    } as unknown as HTMLTextAreaElement;

    vi.spyOn(document, 'createElement').mockReturnValue(mockTextArea);

    await copyToClipboard('test text');

    expect(mockExecCommand).toHaveBeenCalledWith('copy');
    expect(mockAppend).toHaveBeenCalled();
    expect(mockTextArea.value).toBe('test text');
    expect(mockTextArea.focus).toHaveBeenCalled();
    expect(mockTextArea.select).toHaveBeenCalled();
    expect(mockRemove).toHaveBeenCalled();
  });

  it('should handle empty string', async () => {
    mockWriteText.mockResolvedValueOnce(undefined as any);

    await copyToClipboard('');

    expect(mockWriteText).toHaveBeenCalledWith('');
  });

  it('should handle long text', async () => {
    const longText = 'a'.repeat(1000);
    mockWriteText.mockResolvedValueOnce(undefined as any);

    await copyToClipboard(longText);

    expect(mockWriteText).toHaveBeenCalledWith(longText);
  });

  it('should handle special characters', async () => {
    const specialText = '!@#$%^&*()_+{}[]|\\:;"\'<>,.?/~`';
    mockWriteText.mockResolvedValueOnce(undefined as any);

    await copyToClipboard(specialText);

    expect(mockWriteText).toHaveBeenCalledWith(specialText);
  });
});
