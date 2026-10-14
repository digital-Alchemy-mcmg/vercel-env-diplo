declare module 'pinned-b:*';
declare module 'b-build:identity' { export const identity:{validator:string;sourceHash:string;dependencyHash:string;buildHash:string}; }
declare module 'mara-a-ui' {export function refreshAUI():void;export function getPipeline():import('../../segment-a/src/core/pipeline').SegmentA;}
