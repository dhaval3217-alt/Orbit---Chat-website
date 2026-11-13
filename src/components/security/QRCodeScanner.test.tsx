import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QRCodeScanner } from './QRCodeScanner.js';

describe('QR code scanner', () => {
  it('explains camera permission and exposes the scanner controls', () => {
    render(<QRCodeScanner />);
    expect(screen.getByText('Live QR Security Scanner')).toBeInTheDocument();
    expect(screen.getAllByText(/camera permission/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /start camera/i })).toBeInTheDocument();
    expect(screen.getByText('Upload QR Image')).toBeInTheDocument();
  });
});
