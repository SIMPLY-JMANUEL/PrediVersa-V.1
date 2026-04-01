import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';

/**
 * 🧪 FRONTEND TEST: LOGIN LUXE UI
 * Validando el portal de acceso institucional.
 */
describe('Componente Login - Luxe UI', () => {

  it('✨ Debe mostrar el encabezado institucional PrediVersa', () => {
    render(
      <MemoryRouter>
        <Login isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    const title = screen.getByText(/PrediVersa/i);
    expect(title).toBeInTheDocument();
  });

  it('📧 Debe permitir escribir el correo electrónico', () => {
    render(
      <MemoryRouter>
        <Login isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/usuario@prediversa.com/i);
    fireEvent.change(input, { target: { value: 'estudiante@test.com' } });
    
    expect(input.value).toBe('estudiante@test.com');
  });

  it('🔒 Debe tener el botón de acción principal activo', () => {
    render(
      <MemoryRouter>
        <Login isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /Entrar al Sistema/i });
    expect(button).toBeInTheDocument();
  });

});
