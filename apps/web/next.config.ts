import type { NextConfig } from 'next';
import { resolve } from 'path';

const config: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: resolve(__dirname, '../../'),
};

export default config;
