import { createConsultantHandler } from './assistant.js';

Deno.serve(createConsultantHandler({ env: (name: string) => Deno.env.get(name) }));
