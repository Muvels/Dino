import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'Dino',
      sourcemap: true,
    }
  ],
  plugins: [
    resolve({
      extensions: ['.js', '.ts']
    }),
    commonjs(),
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          declarationDir: 'dist/types',
        },
        include: ['src/**/*'],
        exclude: ['node_modules'],
      },
      useTsconfigDeclarationDir: true,
    }),
    terser()
  ]
};
