import { defineConfig } from 'vite';
import { pinnedPlugin } from './pinned-source';
export default defineConfig({plugins:[pinnedPlugin()],worker:{plugins:()=>[pinnedPlugin()]},server:{fs:{allow:['..']}},build:{target:'es2022'}});
