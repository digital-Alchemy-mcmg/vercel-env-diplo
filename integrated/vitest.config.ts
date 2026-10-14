import { defineConfig } from 'vitest/config';
import { pinnedPlugin } from './pinned-source';
export default defineConfig({plugins:[pinnedPlugin()],test:{include:['tests/**/*.test.ts']}});
