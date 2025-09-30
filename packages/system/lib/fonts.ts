import { Manrope } from 'next/font/google';
import localFont from 'next/font/local';
import { cn } from './utils';

const ManropeFont = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

const AxiformaRegularFont = localFont({
  src: '../fonts/axiforma-regular.ttf',
  variable: '--font-axiforma-regular',
  weight: '400',
});
const AxiformaMediumFont = localFont({
  src: '../fonts/axiforma-medium.ttf',
  variable: '--font-axiforma-medium',
  weight: '500',
});

export const fonts = cn(
  ManropeFont.variable,
  AxiformaRegularFont.variable,
  AxiformaMediumFont.variable,
  'touch-manipulation overflow-x-hidden font-sans antialiased'
);
