import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

/**
 * 🧊 VITEST RTL SETUP
 * Sincronización de aserciones de DOM con Jest Matchers.
 */
expect.extend(matchers);

afterEach(() => {
  cleanup();
});
