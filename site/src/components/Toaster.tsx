'use client';

import { Toaster as Sonner } from 'sonner';
import type { CSSProperties } from 'react';
import { colors, fonts } from '@/styles/tokens.stylex';
import { Icon } from './Icon';

/*
 * Sonner, skinned with the site tokens: an inverted pill at the bottom centre.
 * StyleX vars resolve to var(--hash) strings, so they work in inline styles too.
 */
export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      theme="system"
      duration={2000}
      visibleToasts={3}
      gap={8}
      offset={{ bottom: 24 }}
      mobileOffset={{ bottom: 'calc(16px + env(safe-area-inset-bottom))' }}
      icons={{
        success: <Icon name="check" size={16} strokeWidth={2} style={{ color: colors.accent }} />,
        error: <Icon name="alert" size={16} style={{ color: colors.accent }} />,
      }}
      style={
        {
          '--normal-bg': colors.ink,
          '--normal-text': colors.bg,
          '--normal-border': 'transparent',
          '--border-radius': '10px',
          '--width': 'max-content',
        } as CSSProperties
      }
      toastOptions={{
        style: {
          fontFamily: fonts.sans,
          fontSize: 14,
          fontWeight: 500,
          paddingBlock: 12,
          paddingInline: 16,
          maxWidth: 'calc(100vw - 32px)',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.35)',
        },
      }}
    />
  );
}
