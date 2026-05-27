import React from 'react';
import { render, screen } from '@testing-library/react';
import { NDPRThemeProvider, type NDPRTheme } from '../../../components/theme/NDPRThemeProvider';

describe('NDPRThemeProvider', () => {
  it('renders children', () => {
    render(
      <NDPRThemeProvider>
        <span data-testid="child">hello</span>
      </NDPRThemeProvider>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('hello');
  });

  it('sets CSS variables only for provided theme fields', () => {
    const theme: NDPRTheme = {
      colors: { primary: '22 163 74', primaryHover: '21 128 61' },
      radius: { base: '0.75rem' },
      z: { modal: 10500 },
    };

    const { container } = render(
      <NDPRThemeProvider theme={theme}>
        <span>x</span>
      </NDPRThemeProvider>
    );

    const wrapper = container.firstChild as HTMLElement;
    const styleAttr = wrapper.getAttribute('style') || '';

    expect(styleAttr).toMatch(/--ndpr-primary:\s*22 163 74/);
    expect(styleAttr).toMatch(/--ndpr-primary-hover:\s*21 128 61/);
    expect(styleAttr).toMatch(/--ndpr-radius:\s*0\.75rem/);
    expect(styleAttr).toMatch(/--ndpr-z-modal:\s*10500/);
  });

  it('does not emit variables for unset fields', () => {
    const theme: NDPRTheme = {
      colors: { primary: '22 163 74' },
    };

    const { container } = render(
      <NDPRThemeProvider theme={theme}>
        <span>x</span>
      </NDPRThemeProvider>
    );

    const wrapper = container.firstChild as HTMLElement;
    const styleAttr = wrapper.getAttribute('style') || '';

    expect(styleAttr).toMatch(/--ndpr-primary:/);
    expect(styleAttr).not.toMatch(/--ndpr-primary-hover/);
    expect(styleAttr).not.toMatch(/--ndpr-background/);
    expect(styleAttr).not.toMatch(/--ndpr-radius/);
    expect(styleAttr).not.toMatch(/--ndpr-shadow/);
    expect(styleAttr).not.toMatch(/--ndpr-font-sans/);
  });

  it('renders no inline style attribute when theme is omitted', () => {
    const { container } = render(
      <NDPRThemeProvider>
        <span>x</span>
      </NDPRThemeProvider>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute('style')).toBeNull();
    expect(wrapper.getAttribute('data-ndpr-theme')).toBe('');
  });

  it('sets data-theme="dark" when mode is dark', () => {
    const { container } = render(
      <NDPRThemeProvider theme={{ mode: 'dark' }}>
        <span>x</span>
      </NDPRThemeProvider>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute('data-theme')).toBe('dark');
  });

  it('sets data-theme="light" when mode is light', () => {
    const { container } = render(
      <NDPRThemeProvider theme={{ mode: 'light' }}>
        <span>x</span>
      </NDPRThemeProvider>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute('data-theme')).toBe('light');
  });

  it('produces no style attribute when theme is an empty object', () => {
    const { container } = render(
      <NDPRThemeProvider theme={{}}>
        <span>x</span>
      </NDPRThemeProvider>
    );

    const wrapper = container.firstChild as HTMLElement;
    // No CSS variables are emitted because no fields are set.
    expect(wrapper.getAttribute('style')).toBeNull();
    // data-theme is not set either because mode is undefined.
    expect(wrapper.getAttribute('data-theme')).toBeNull();
  });

  it('applies className to the wrapper', () => {
    const { container } = render(
      <NDPRThemeProvider className="my-app-shell">
        <span>x</span>
      </NDPRThemeProvider>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('my-app-shell');
  });
});
