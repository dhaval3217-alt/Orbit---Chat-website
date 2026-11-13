import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SecurityCenterPage } from './SecurityCenterPage.js';

describe('Security Center routes', () => {
  it('renders the shared security center and all scanner entry points', () => {
    render(
      <MemoryRouter initialEntries={['/security']}>
        <Routes>
          <Route path="/security" element={<SecurityCenterPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Threat Detection & Security' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Scan Link/ })).toHaveAttribute('href', '/security/link');
    expect(screen.getByRole('link', { name: /Scan Image/ })).toHaveAttribute('href', '/security/image');
    expect(screen.getByRole('link', { name: /Scan File/ })).toHaveAttribute('href', '/security/file');
    expect(screen.getByRole('link', { name: /Live QR Scanner/ })).toHaveAttribute('href', '/security/qr');
    expect(screen.getByRole('link', { name: /Security Inbox/ })).toHaveAttribute('href', '/security/inbox');
    expect(screen.getByRole('link', { name: /Scan History/ })).toHaveAttribute('href', '/security/history');
  });

  it('opens history from its route using the same security center', () => {
    render(
      <MemoryRouter initialEntries={['/security/history']}>
        <Routes>
          <Route path="/security/:scanner" element={<SecurityCenterPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Threat Detection & Security' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your security reports' })).toBeInTheDocument();
  });

  it('opens the live QR scanner from its scanner route', () => {
    render(
      <MemoryRouter initialEntries={['/security/qr']}>
        <Routes>
          <Route path="/security/:scanner" element={<SecurityCenterPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Live QR Security Scanner' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start camera/i })).toBeInTheDocument();
    expect(screen.getByText('Upload QR Image')).toBeInTheDocument();
  });
});
