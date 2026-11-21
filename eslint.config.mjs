import web from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";
const config = [...web, ...typescript, { ignores: [".next/**", "test-results/**", "next-env.d.ts"] }];
export default config;
